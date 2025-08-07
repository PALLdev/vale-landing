// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";
import { useAuthSession } from "@/hooks/use-auth-session"; // Importar el nuevo hook

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Usar el nuevo hook para gestionar la sesión de autenticación
  const { user, isLoading } = useAuthSession();

  // Cerrar menú cuando la ruta cambia
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success("Sesión cerrada", {
        description: "Has cerrado tu sesión exitosamente.",
      });
      // La redirección es manejada por la Server Action
    } catch (error) {
      console.error(
        "Logout process caught an error (likely a redirect):",
        error
      );
      if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
        toast.error("Error al cerrar sesión", {
          description: "No se pudo cerrar la sesión. Intenta de nuevo.",
        });
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: "#inicio", label: "Inicio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#sobre-mi", label: "Sobre Mí" },
    { href: "#contacto", label: "Contacto" },
  ];

  const isPublicCalendarPage = pathname === "/agendar-consulta";
  const isAdminContentPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isLoginPage = pathname === "/admin/login";
  const isPublicPage = !(isAdminContentPage || isLoginPage);

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isPublicPage && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/admin/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  Admin
                </Link>
                {!isPublicCalendarPage && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    asChild
                  >
                    <Link href="/agendar-consulta">Agendar Consulta</Link>
                  </Button>
                )}
              </>
            )}

            {isAdminContentPage && (
              <div className="flex items-center">
                {
                  isLoading ? (
                    // Muestra un spinner mientras se carga la sesión
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  ) : user ? ( // Muestra el botón si hay un usuario logueado
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cerrando sesión...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </>
                      )}
                    </Button>
                  ) : null // Si no está cargando y no hay usuario, no muestra nada (el middleware redirige)
                }
              </div>
            )}
          </nav>

          {/* Botón de menú móvil */}
          {!isLoginPage && (
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-purple-600 transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}
        </div>

        {/* Navegación móvil - Solo visible cuando el menú está abierto */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <nav className="flex flex-col space-y-4">
              {isPublicPage && (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/admin/login"
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                  {!isPublicCalendarPage && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white mt-4"
                      asChild
                    >
                      <Link
                        href="/agendar-consulta"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Agendar Consulta
                      </Link>
                    </Button>
                  )}
                </>
              )}

              {isAdminContentPage && (
                <div className="flex items-center">
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  ) : user ? (
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                    >
                      {isLoggingOut ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cerrando sesión...
                        </>
                      ) : (
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </>
                      )}
                    </Button>
                  ) : null}
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
