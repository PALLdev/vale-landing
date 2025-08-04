// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const response = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set({ name, value, ...options })
                        response.cookies.set({ name, value, ...options })
                    })
                },
            },
        },
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")
    const isLoginPage = request.nextUrl.pathname === "/admin/login"

    // Case 1: User is on an admin route (e.g., /admin, /admin/some-subpage) but NOT the login page
    // and is NOT authenticated. Redirect to login.
    if (isAdminRoute && !isLoginPage && !session) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/admin/login"
        redirectUrl.searchParams.set(`redirectedFrom`, request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Case 2: User is on the login page (/admin/login) and IS authenticated. Redirect to admin dashboard.
    if (isLoginPage && session) {
        return NextResponse.redirect(new URL("/admin", request.url))
    }

    // For all other cases (e.g., authenticated on admin route, unauthenticated on login page,
    // unauthenticated on public route), allow the request to proceed.
    return response
}

export const config = {
    matcher: ["/admin/:path*"], // Match all paths under /admin, including /admin/login
}
