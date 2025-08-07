// src/hooks/use-auth-session.ts
import { useState, useEffect } from "react";
import { getClientSupabase } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation"; // Importar usePathname

/**
 * Custom hook to manage Supabase authentication session on the client side.
 * Provides the current user and a loading state.
 */
export function useAuthSession() {
    // user: undefined = cargando, null = no logueado, User = logueado
    const [user, setUser] = useState<User | null | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = getClientSupabase();
    const pathname = usePathname(); // Obtener la ruta actual

    useEffect(() => {
        let isMounted = true; // Flag para evitar actualizaciones de estado en componentes desmontados

        // Función para obtener la sesión inicial
        const getInitialSession = async () => {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
                setUser(session?.user || null);
                setIsLoading(false);
            }
        };

        getInitialSession(); // Ejecutar al montar el componente y cuando las dependencias cambian

        // Suscribirse a cambios de autenticación
        // CORRECCIÓN AQUÍ: Desestructurar 'subscription' de 'data'
        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                if (isMounted) {
                    console.log("Auth event:", _event, "Session:", session); // Para depuración
                    setUser(session?.user || null);
                    setIsLoading(false); // Asegurarse de que isLoading se desactive en cualquier cambio de auth
                }
            }
        );

        return () => {
            authListener.unsubscribe();
            isMounted = false; // Limpiar al desmontar
        };
    }, [supabase, pathname]); // Mantener pathname como dependencia

    return { user, isLoading };
}
