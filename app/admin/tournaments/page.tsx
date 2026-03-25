import { createClient as createServiceClient } from "@supabase/supabase-js";
import Link from "next/link";
import { MapPin, Calendar, ExternalLink } from "lucide-react";
import { formatTournamentDates, SPORT_EMOJI, SPORT_LABELS } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Tournaments – Admin" };

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminTournamentsPage() {
  const supabase = serviceClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, name, sport, city, state, start_date, end_date, source_platform, registration_open, teams_count, created_at")
    .order("start_date", { ascending: false })
    .limit(200);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <span className="text-sm text-gray-500">{tournaments?.length || 0} total</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tournament</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Teams</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tournaments?.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/tournaments/${t.id}`} className="font-medium text-gray-900 hover:text-brand-600 flex items-center gap-1.5">
                    {SPORT_EMOJI[t.sport as keyof typeof SPORT_EMOJI]} {t.name}
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </Link>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {t.city}, {t.state}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatTournamentDates(t.start_date, t.end_date)}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {t.source_platform ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 capitalize">
                      {t.source_platform}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">manual</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                  {t.teams_count || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!tournaments?.length && (
          <div className="text-center py-12 text-gray-400">No tournaments found.</div>
        )}
      </div>
    </div>
  );
}
