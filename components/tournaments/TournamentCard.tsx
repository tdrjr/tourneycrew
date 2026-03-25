import Link from "next/link";
import { MapPin, Calendar, Users } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatTournamentDates, SPORT_EMOJI, SPORT_COLORS, SPORT_LABELS } from "@/lib/utils";
import type { Tournament } from "@/types";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament: t }: TournamentCardProps) {
  return (
    <Link href={`/tournaments/${t.id}`}>
      <Card hover className="h-full flex flex-col">
        <CardHeader>
          {/* Sport badge */}
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${SPORT_COLORS[t.sport]}`}>
              {SPORT_EMOJI[t.sport]} {SPORT_LABELS[t.sport]}
            </span>
            {t.registration_open && (
              <Badge variant="success">Open</Badge>
            )}
          </div>

          <h2 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
            {t.name}
          </h2>
        </CardHeader>

        <CardBody className="flex-1 flex flex-col justify-between">
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="line-clamp-1">{t.venue_name}, {t.city}, {t.state}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 text-gray-400" />
              <span>{formatTournamentDates(t.start_date, t.end_date)}</span>
            </div>
            {t.age_groups.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span className="line-clamp-1">{t.age_groups.join(" · ")}</span>
              </div>
            )}
          </div>

          {t.ai_summary && (
            <p className="mt-3 text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {t.ai_summary}
            </p>
          )}

          <div className="mt-4 text-brand-600 text-sm font-medium hover:text-brand-700">
            View tips & info →
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
