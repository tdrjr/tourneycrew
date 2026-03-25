import { createClient as createServiceClient } from "@supabase/supabase-js";
import { AdminTipsList } from "@/components/admin/AdminTipsList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Tips – Admin" };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminTipsPage({ searchParams }: PageProps) {
  const { status = "pending" } = await searchParams;
  const validStatus = ["pending", "approved", "rejected"].includes(status) ? status : "pending";

  const supabase = serviceClient();
  const { data: tips } = await supabase
    .from("family_tips")
    .select(`
      id, category, title, body, upvotes, status, ai_score, ai_moderated, created_at,
      tournament:tournaments(id, name, city, state),
      contributor:contributors(id, display_name)
    `)
    .eq("status", validStatus)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tips</h1>

        {/* Status filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["pending", "approved", "rejected"].map((s) => (
            <a
              key={s}
              href={`/admin/tips?status=${s}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                validStatus === s
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      {tips && tips.length > 0 ? (
        <AdminTipsList tips={tips} />
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">No {validStatus} tips.</p>
        </div>
      )}
    </div>
  );
}
