/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export async function POST(req: Request) {
    try {
        // 1) Read incoming JSON safely
        const ct = req.headers.get("content-type") || "";
        const bodyObj =
            ct.includes("application/json")
                ? await req.json()
                : JSON.parse((await req.text()) || "{}");

        // 2) Forward to backend
        const backendURL = `${SERVER}/api/auth/login`;
        const upstream = await fetch(backendURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // allows node to receive cookies from upstream
            body: JSON.stringify(bodyObj),
        });

        // Debug
        console.log(
            "NEXT /api/auth/login upstream set-cookie =",
            upstream.headers.get("set-cookie"),
        );

        // 3) Mirror body
        let upstreamData: any = {};
        try {
            upstreamData = await upstream.json();
        } catch {
            /* non-JSON body; leave as {} */
        }

        // 4) Build a NextResponse and FORWARD **ALL** Set-Cookie headers
        const res = NextResponse.json(
            upstream.ok
                ? upstreamData
                : { error: upstreamData?.error || `Backend error (${upstream.status})`, details: upstreamData },
            { status: upstream.ok ? 200 : upstream.status },
        );

        // Next.js adds a convenience method in the Web Headers polyfill:
        // getSetCookie() returns an array; get("set-cookie") returns the first/combined one.
        const getSetCookie = (upstream.headers as any).getSetCookie?.bind(upstream.headers);
        const cookieHeaders: string[] =
            (typeof getSetCookie === "function" ? getSetCookie() : []) ||
            // fallback for environments without getSetCookie()
            (upstream.headers.has("set-cookie")
                ? [upstream.headers.get("set-cookie") as string].filter(Boolean)
                : []);

        for (const sc of cookieHeaders) {
            // Must append (not set) to keep multiple cookies
            res.headers.append("set-cookie", sc);
        }

        return res;
    } catch (e: any) {
        return NextResponse.json(
            { error: "Auth proxy failed", message: String(e?.message || e) },
            { status: 500 },
        );
    }
}

export async function GET() {
    return NextResponse.json({ ok: true });
}
