import { AdminCalendarPageContent } from "@/components/admin/admin-page-content";

export default function AdminCalendarPage() {
  return (
    <div className="flex-grow pt-22 pb-14 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AdminCalendarPageContent />
      </div>
    </div>
  );
}
