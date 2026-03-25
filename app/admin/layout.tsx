import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, MessageSquare, Trophy, Settings } from "lucide-react";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/tips", label: "Pending Tips", icon: MessageSquare },
  { href: "/admin/tournaments", label: "Tournaments", icon: Trophy },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/admin");

  // Simple email-based admin gate (configure ADMIN_EMAILS env var)
  const isAdmin = ADMIN_EMAILS.length === 0
    ? false
    : ADMIN_EMAILS.includes(user.email || "");

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Admin
            </p>
            <nav className="space-y-0.5">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
