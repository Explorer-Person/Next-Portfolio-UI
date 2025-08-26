/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/refresh/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export async function POST(req: Request) {
    try {
        const cookieHeader = req.headers.get("cookie") ?? "";

        const upstream = await fetch(`${SERVER}/api/auth/check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
            },
            cache: "no-store",
            credentials: "include", // send httpOnly refresh cookie
        });

        let data: any = {};
        try { data = await upstream.json(); } catch { }

        const res = NextResponse.json(data?.message ? data : { ok: upstream.ok, ...data }, { status: upstream.status });

        const getSetCookie = (upstream.headers as any).getSetCookie?.bind(upstream.headers);
        if (getSetCookie) {
            for (const c of getSetCookie()) res.headers.append("set-cookie", c);
        } else {
            const sc = upstream.headers.get("set-cookie");
            if (sc) res.headers.set("set-cookie", sc);
        }

        return res;
    } catch (e: any) {
        return NextResponse.json({ ok: false, message: "Refresh proxy failed", details: String(e?.message || e) }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true });
}
