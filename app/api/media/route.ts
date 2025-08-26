// app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const SERVER =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "http://localhost:5000";

function extToContentType(ext: string) {
    switch (ext) {
        case ".png": return "image/png";
        case ".jpg":
        case ".jpeg": return "image/jpeg";
        case ".webp": return "image/webp";
        case ".gif": return "image/gif";
        default: return "application/octet-stream";
    }
}

export async function GET(req: NextRequest) {
    let urlParam = req.nextUrl.searchParams.get("url") || "";
    if (!urlParam) return new NextResponse("Missing url", { status: 400 });

    // Normalize accidental "https:/example" -> "https://example"
    urlParam = urlParam.replace(/^(https?):\/(?!\/)/i, "$1://");

    // Decide target URL:
    // - If param is full http(s) URL, use it as-is.
    // - Else, hit your server's /upload/<param>
    const isHttp = /^https?:\/\//i.test(urlParam);
    const target = isHttp
        ? urlParam
        : `${SERVER.replace(/\/$/, "")}/upload/${encodeURIComponent(urlParam)}`;


    try {
        const upstream = await fetch(target, { cache: "no-store", credentials: "include", });
        if (!upstream.ok || !upstream.body) {
            return new NextResponse("Upstream fetch failed", { status: upstream.status || 502 });
        }

        const headers = new Headers(upstream.headers);
        headers.set("Cache-Control", "public, max-age=0");

        // Ensure a content-type if missing
        if (!headers.get("Content-Type")) {
            const ext = path.extname(new URL(target).pathname).toLowerCase();
            headers.set("Content-Type", extToContentType(ext));
        }

        return new NextResponse(upstream.body, { status: 200, headers });
    } catch (e) {
        return new NextResponse("Proxy error", { status: 502 });
    }
}
