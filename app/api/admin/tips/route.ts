import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { moderateTip } from "@/lib/claude/moderate";
import { z } from "zod";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

const ActionSchema = z.object({
  tipId: z.string().uuid(),
  action: z.enum(["approved", "rejected", "remoderate"]),
});

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  return ADMIN_EMAILS.includes(user.email || "");
}

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tipId, action } = parsed.data;
  const supabase = serviceClient();

  if (action === "remoderate") {
    const { data: tip } = await supabase
      .from("family_tips")
      .select("title, body, category")
      .eq("id", tipId)
      .single();

    if (!tip) return NextResponse.json({ error: "Tip not found" }, { status: 404 });

    const result = await moderateTip(tip.title, tip.body, tip.category);
    const newStatus = result.approved ? "approved" : "rejected";

    await supabase
      .from("family_tips")
      .update({ status: newStatus, ai_score: result.score, ai_moderated: true })
      .eq("id", tipId);

    return NextResponse.json({ status: newStatus, ai_score: result.score });
  }

  // approve or reject
  const { error } = await supabase
    .from("family_tips")
    .update({ status: action })
    .eq("id", tipId);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true, status: action });
}
