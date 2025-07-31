"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Importar usePathname

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Obtener la ruta actual

  const navItems = [
    { href: "#inicio", label: "Inicio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#sobre-mi", label: "Sobre Mí" },
    { href: "#contacto", label: "Contacto" },
  ];

  // Determinar si estamos en la página del calendario
  const isCalendarPage = pathname === "/calendar";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-purple-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-purple-900">
                Nutrición<span className="text-purple-600">Pro</span>
              </h1>
            </Link>
          </div>

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

          {/* CTA Button (conditionally rendered) */}
          {!isCalendarPage && ( // Solo mostrar si NO estamos en la página del calendario
            <div className="hidden md:block">
              {" "}
              {/* Mantener hidden md:block para desktop */}
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                asChild
              >
                <Link href="/calendar">Agendar Consulta</Link>
              </Button>
            </div>
          )}

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
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
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
              {!isCalendarPage && ( // Solo mostrar en el menú móvil si NO estamos en la página del calendario
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                  asChild
                >
                  <Link href="/calendar">Agendar Consulta</Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
