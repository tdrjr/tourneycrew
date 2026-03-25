import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const city  = searchParams.get("city");
  const sport = searchParams.get("sport");

  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    let query = supabase
      .from("sponsors")
      .select("*")
      .lte("active_from", today)
      .gte("active_until", today)
      .order("tier", { ascending: false }); // gold > silver > bronze

    if (city)  query = query.or(`city_targeting.cs.{${city}},city_targeting.is.null`);
    if (sport) query = query.or(`sport_targeting.cs.{${sport}},sport_targeting.is.null`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/sponsors error:", err);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}
