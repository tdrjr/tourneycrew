import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your free TourneyCrew account.",
};

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  // Redirect if already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(next || "/");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 mb-4">
            <Trophy className="w-7 h-7 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join TourneyCrew</h1>
          <p className="text-gray-500 mt-1">Free forever — help families find great tournaments</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <AuthForm mode="signup" next={next} />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href={`/auth/login${next ? `?next=${next}` : ""}`} className="text-brand-600 font-medium hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
