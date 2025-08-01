"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Añadir useEffect para cerrar el menú cuando la ruta cambia
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [pathname]);

  const navItems = [
    { href: "#inicio", label: "Inicio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#sobre-mi", label: "Sobre Mí" },
    { href: "#contacto", label: "Contacto" },
  ];

  const isCalendarPage = pathname === "/agendar-consulta";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Siempre visible */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-purple-900">
                Nutrición<span className="text-purple-600">Pro</span>
              </h1>
            </Link>
          </div>

          {/* Navegación y CTA - Ocultos en la página de calendario */}
          {!isCalendarPage && (
            <>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* CTA Button (desktop) */}
              <div className="hidden md:block">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/agendar-consulta">Agendar Consulta</Link>
                </Button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-purple-600 transition-colors"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Navigation - Oculto en la página de calendario */}
        {isMenuOpen && !isCalendarPage && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                asChild
              >
                <Link href="/agendar-consulta">Agendar Consulta</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
