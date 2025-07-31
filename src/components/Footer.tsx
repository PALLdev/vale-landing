import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              Nutrición<span className="text-prim-lighter">Pro</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Transformando vidas a través de una nutrición personalizada y
              basada en evidencia científica.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Enlaces Rápidos</h4>
            <nav className="flex flex-col space-y-2">
              <a
                href="#inicio"
                className="text-gray-400 hover:text-prim-lighter transition-colors"
              >
                Inicio
              </a>
              <a
                href="#servicios"
                className="text-gray-400 hover:text-prim-lighter transition-colors"
              >
                Servicios
              </a>
              <a
                href="#sobre-mi"
                className="text-gray-400 hover:text-prim-lighter transition-colors"
              >
                Sobre Mí
              </a>
              <a
                href="#contacto"
                className="text-gray-400 hover:text-prim-lighter transition-colors"
              >
                Contacto
              </a>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contacto</h4>
            <div className="space-y-2 text-gray-400">
              <p>valeska@nutricionpro.cl</p>
              <p>+56 9 1234 5678</p>
              <p>Concepción, Chile</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            © {currentYear} NutriciónPro. Hecho con{" "}
            <Heart className="w-4 h-4 text-red-400 fill-current" /> por PALLdev
          </p>
        </div>
      </div>
    </footer>
  );
}
