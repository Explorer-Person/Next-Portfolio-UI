/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// 👉 add the cookies you care about here
const COOKIES_TO_CLEAR = ["auth", "refresh", "sid"]; // adjust to your names

export async function POST(req: Request) {
    try {
        // 1) Forward the user's cookies to the backend (so it knows which session to invalidate)
        const cookieHeader = req.headers.get("cookie") ?? "";

        // 2) Call backend logout
        const upstream = await fetch(`${SERVER}/api/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
            },
            credentials: "include", // receive Set-Cookie from upstream
        });

        // 3) Body (optional)
        let upstreamData: any = {};
        try { upstreamData = await upstream.json(); } catch { /* ignore non-JSON */ }

        // 4) Build response
        const res = NextResponse.json(
            upstream.ok
                ? upstreamData
                : { error: upstreamData?.error || `Backend error (${upstream.status})`, details: upstreamData },
            { status: upstream.ok ? 200 : upstream.status }
        );

        // 5) Forward any Set-Cookie from upstream (in case backend already clears/rotates)
        const getSetCookie = (upstream.headers as any).getSetCookie?.bind(upstream.headers);
        const cookieHeaders: string[] =
            (typeof getSetCookie === "function" ? getSetCookie() : []) ||
            (upstream.headers.has("set-cookie")
                ? [upstream.headers.get("set-cookie") as string]
                : []);
        for (const sc of cookieHeaders) res.headers.append("set-cookie", sc);

        // 6) Explicitly clear our cookies as a belt-and-suspenders step
        //    Must match path/domain used when setting them. If you used host-only cookies,
        //    omit domain. If you used "__Host-" prefix, you must include Secure and Path=/.
        if (upstream.ok) {
            const isProd = process.env.NODE_ENV === "production";
            for (const name of COOKIES_TO_CLEAR) {
                // Using the NextResponse cookies API:
                res.cookies.set(name, "", {
                    path: "/",
                    maxAge: 0,               // Max-Age=0 deletes
                    httpOnly: true,          // match your original flags
                    secure: isProd,          // true in prod; required for "__Host-" / "__Secure-" cookies
                    sameSite: "lax",
                    // domain: "your-domain.com", // uncomment if you originally set a Domain
                });

                // If you prefer raw header style instead (equivalent):
                // res.headers.append("set-cookie", `${name}=; Max-Age=0; Path=/; SameSite=Lax${isProd ? "; Secure" : ""}; HttpOnly`);
            }
        }

        return res;
    } catch (e: any) {
        return NextResponse.json(
            { error: "Auth proxy failed", message: String(e?.message || e) },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ ok: true });
}
