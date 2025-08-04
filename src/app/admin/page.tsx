// src/app/admin/page.tsx
import { AdminCalendarPageContent } from "@/components/admin/admin-page-content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminCalendarPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login"); // Corrected redirect path to the new login page location
  }

  return (
    <div className="flex-grow pt-22 pb-14 bg-gradient-to-br from-purple-50 via-white to-indigo-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AdminCalendarPageContent />
      </div>
    </div>
  );
}
