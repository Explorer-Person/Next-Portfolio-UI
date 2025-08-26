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
                : JSON.parse(await req.text() || "{}");


        // 2) Forward to your backend
        //    NOTE: adjust to the route you actually mounted. We used /api/admin/projects earlier.
        const backendURL = `${SERVER}/api/auth/signup`;

        const upstream = await fetch(backendURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // If you need auth/cookies, forward them explicitly (careful with secrets):
                // "Authorization": req.headers.get("authorization") ?? "",
            },
            body: JSON.stringify(bodyObj),
            credentials: "include", // send httpOnly cookies
        });

        // 3) Mirror backend response
        let upstreamData: any = {};
        try { upstreamData = await upstream.json(); } catch { /* non-JSON body */ }

        if (!upstream.ok) {
            return NextResponse.json(
                {
                    error: upstreamData?.error || `Backend error (${upstream.status})`,
                    details: upstreamData,
                },
                { status: upstream.status }
            );
        }

        return NextResponse.json(upstreamData, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { error: "Project save proxy failed", message: String(e?.message || e) },
            { status: 500 }
        );
    }
}

// Optional: quick GET to verify route is wired
export async function GET() {
    return NextResponse.json({ ok: true });
}
