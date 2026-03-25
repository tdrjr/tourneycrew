import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { moderateTip } from "@/lib/claude/moderate";
import { z } from "zod";

const TipSchema = z.object({
  tournamentId: z.string().uuid(),
  category: z.enum(["parking","food","wifi","seating","lodging","general"]),
  title: z.string().min(5).max(100),
  body:  z.string().min(10).max(500),
  displayName: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tournamentId = searchParams.get("tournamentId");

  if (!tournamentId) {
    return NextResponse.json({ error: "tournamentId required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("family_tips")
      .select("*, contributor:contributors(id, display_name, avatar_url)")
      .eq("tournament_id", tournamentId)
      .eq("status", "approved")
      .order("upvotes", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/tips error:", err);
    return NextResponse.json({ error: "Failed to fetch tips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = TipSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid tip data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { tournamentId, category, title, body: tipBody, displayName } = parsed.data;

  try {
    const supabase = await createClient();

    // ── 1. Resolve contributor (auth user or anonymous) ──
    let contributorId: string | null = null;
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Upsert contributor linked to auth user
      const { data: contributor } = await supabase
        .from("contributors")
        .upsert(
          {
            user_id: user.id,
            display_name: displayName || user.user_metadata?.display_name || user.email?.split("@")[0] || "Anonymous",
          },
          { onConflict: "user_id" }
        )
        .select("id")
        .single();
      contributorId = contributor?.id || null;
    } else if (displayName) {
      // Anonymous tip with optional display name
      const { data: contributor } = await supabase
        .from("contributors")
        .insert({ display_name: displayName })
        .select("id")
        .single();
      contributorId = contributor?.id || null;
    }

    // ── 2. Run AI moderation via Claude ──
    let moderationResult = { approved: false, score: 0, reason: "Pending moderation" };
    try {
      moderationResult = await moderateTip(title, tipBody, category);
    } catch (err) {
      console.warn("Moderation failed — defaulting to pending:", err);
    }

    // ── 3. Insert tip ──
    const { data: tip, error } = await supabase
      .from("family_tips")
      .insert({
        tournament_id:  tournamentId,
        contributor_id: contributorId,
        category,
        title,
        body: tipBody,
        status:        moderationResult.approved ? "approved" : "pending",
        ai_moderated:  true,
        ai_score:      moderationResult.score,
      })
      .select()
      .single();

    if (error) throw error;

    // ── 4. Update contributor tip_count ──
    if (contributorId) {
      await supabase.rpc("increment_contributor_tips", { contributor_id: contributorId });
    }

    return NextResponse.json({ data: tip, moderation: moderationResult }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tips error:", err);
    return NextResponse.json({ error: "Failed to submit tip" }, { status: 500 });
  }
}
