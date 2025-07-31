import { CalendarSystem } from "@/components/Calendar";

export default function AgendarConsulta() {
  return (
    <div className="flex-grow pt-22 pb-14 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Agenda tu{" "}
          <span className="text-purple-600">Consulta Nutricional</span>
        </h1>
        <CalendarSystem />
      </div>
    </div>
  );
}
