import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const QuerySchema = z.object({
  sport:     z.enum(["volleyball","basketball","soccer","baseball"]).optional(),
  state:     z.string().optional(),
  city:      z.string().optional(),
  q:         z.string().optional(),
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  page:      z.coerce.number().int().positive().default(1),
  pageSize:  z.coerce.number().int().positive().max(50).default(12),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.flatten() }, { status: 400 });
  }

  const { sport, state, city, q, startDate, endDate, page, pageSize } = parsed.data;

  try {
    const supabase = await createClient();

    let query = supabase
      .from("tournaments")
      .select("*", { count: "exact" })
      .order("start_date", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (sport)     query = query.eq("sport", sport);
    if (state)     query = query.eq("state", state);
    if (city)      query = query.ilike("city", `%${city}%`);
    if (q)         query = query.ilike("name", `%${q}%`);
    if (startDate) query = query.gte("start_date", startDate);
    if (endDate)   query = query.lte("end_date", endDate);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data,
      count: count || 0,
      page,
      pageSize,
    });
  } catch (err) {
    console.error("GET /api/tournaments error:", err);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}
