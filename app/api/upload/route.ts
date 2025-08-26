/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);
        const filenameParam = url.searchParams.get("filename") ?? undefined;

        const form = await req.formData();
        const incoming = (form.get("file") ?? form.get("image")) as File | null;
        if (!(incoming instanceof File)) {
            return NextResponse.json({ error: "Missing file ('file' or 'image')." }, { status: 400 });
        }

        const name = (filenameParam || incoming.name || "upload.bin").replace(/[^\w.\-]/g, "_");
        const forward = new File([incoming], name, { type: incoming.type });

        const outbound = new FormData();
        outbound.append("file", forward, name);

        for (const [k, v] of form.entries()) {
            if (k === "file" || k === "image") continue;
            outbound.append(k, v as string | Blob);
        }

        const backendURL = new URL(`${SERVER}/api/admin/upload`);
        if (filenameParam) backendURL.searchParams.set("filename", name);

        console.log("Proxy →", backendURL.toString(), "name:", name);

        const cookieHeader = req.headers.get("cookie") ?? "";

        const upstream = await fetch(backendURL.toString(), { 
            method: "POST", 
            body: outbound, 
            headers: {
                ...(cookieHeader ? { cookie: cookieHeader } : {}),
            },
            cache: "no-store",
            credentials: "include" 
        });

        let data: any = {};
        try { data = await upstream.json(); } catch { }
        if (!upstream.ok) {
            return NextResponse.json(
                { error: data?.error || `Backend error (${upstream.status})`, details: data },
                { status: upstream.status }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        return NextResponse.json({ error: "Upload proxy failed", message: String(e?.message || e) }, { status: 500 });
    }
}
