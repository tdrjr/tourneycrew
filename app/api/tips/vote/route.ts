import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { z } from "zod";

const VoteSchema = z.object({
  tipId: z.string().uuid(),
});

const SESSION_COOKIE = "tc_voter_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

async function getOrCreateSession(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<string> {
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  return crypto.randomUUID();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = VoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tipId } = parsed.data;
  const cookieStore = await cookies();
  const session = await getOrCreateSession(cookieStore);

  try {
    const supabase = await createClient();

    // Check if already voted
    const { data: existing } = await supabase
      .from("tip_votes")
      .select("id")
      .eq("tip_id", tipId)
      .eq("voter_session", session)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }

    // Insert vote — DB trigger handles incrementing upvotes
    const { error } = await supabase
      .from("tip_votes")
      .insert({ tip_id: tipId, voter_session: session });

    if (error) throw error;

    const response = NextResponse.json({ success: true }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error("POST /api/tips/vote error:", err);
    return NextResponse.json({ error: "Failed to record vote" }, { status: 500 });
  }
}

// Allow un-voting
export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tipId = searchParams.get("tipId");

  if (!tipId) {
    return NextResponse.json({ error: "tipId required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return NextResponse.json({ error: "No session found" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("tip_votes")
      .delete()
      .eq("tip_id", tipId)
      .eq("voter_session", session);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/tips/vote error:", err);
    return NextResponse.json({ error: "Failed to remove vote" }, { status: 500 });
  }
}
