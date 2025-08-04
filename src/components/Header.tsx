// src/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getClientSupabase } from "@/lib/supabase/client";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getClientSupabase();

  // Check auth status on mount and on auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => {
      authListener.unsubscribe();
    };
  }, [supabase]);

  // Close menu when route changes
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
      router.push("/admin/login");
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

  const isCalendarPage = pathname === "/agendar-consulta";
  const isAdminContentPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isLoginPage = pathname === "/admin/login";
  const isPublicPage = !(isCalendarPage || isAdminContentPage || isLoginPage);

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
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  href="/admin/login"
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  Admin
                </Link>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  asChild
                >
                  <Link href="/agendar-consulta">Agendar Consulta</Link>
                </Button>
              </>
            )}

            {isAdminContentPage && isLoggedIn && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Cerrar Sesión
              </Button>
            )}

            {/* On login page, no extra links needed in header */}
            {/* On calendar page, no extra "Agendar Consulta" button needed */}
          </nav>

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

        {/* Mobile Navigation - Only visible when menu is open */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <nav className="flex flex-col space-y-4">
              {isPublicPage && (
                <>
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
                  <Link
                    href="/admin/login"
                    className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
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
                </>
              )}

              {isAdminContentPage && isLoggedIn && (
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  {isLoggingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Cerrar Sesión
                </Button>
              )}

              {/* On login page, no extra links needed in header */}
              {/* On calendar page, no extra "Agendar Consulta" button needed */}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
