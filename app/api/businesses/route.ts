import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const tournamentId = searchParams.get("tournamentId");
  const category = searchParams.get("category");

  try {
    const supabase = await createClient();

    let query = supabase
      .from("local_businesses")
      .select("*")
      .order("rating", { ascending: false })
      .limit(20);

    if (tournamentId) {
      query = query.or(`tournament_id.eq.${tournamentId},tournament_id.is.null`);
    }
    if (city)     query = query.ilike("city", `%${city}%`);
    if (state)    query = query.eq("state", state);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/businesses error:", err);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}
