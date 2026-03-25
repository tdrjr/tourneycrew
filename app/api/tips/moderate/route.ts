/**
 * POST /api/tips/moderate
 *
 * Admin-only endpoint to manually trigger AI re-moderation of a pending tip.
 * Requires ADMIN_SECRET header.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { moderateTip } from "@/lib/claude/moderate";
import { z } from "zod";

const Schema = z.object({ tipId: z.string().uuid() });

export async function POST(request: NextRequest) {
  // Auth check
  const adminSecret = request.headers.get("x-admin-secret");
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "tipId required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: tip, error: fetchErr } = await supabase
    .from("family_tips")
    .select("id, title, body, category")
    .eq("id", parsed.data.tipId)
    .single();

  if (fetchErr || !tip) {
    return NextResponse.json({ error: "Tip not found" }, { status: 404 });
  }

  const result = await moderateTip(tip.title, tip.body, tip.category);

  await supabase
    .from("family_tips")
    .update({
      status:       result.approved ? "approved" : "rejected",
      ai_moderated: true,
      ai_score:     result.score,
    })
    .eq("id", tip.id);

  return NextResponse.json({ result });
}
