/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { detectMode } from "@/utils/detectParam"; // adjust path


import { NextRequest, NextResponse } from "next/server";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

/** Parse "key=value&k2=v2" into URLSearchParams */
function applyQueryString(qs: string, url: URL) {
    for (const pair of qs.split("&")) {
        if (!pair) continue;
        const [k, v = ""] = pair.split("=");
        if (!k) continue;
        url.searchParams.append(decodeURIComponent(k), decodeURIComponent(v));
    }
}

/** Resolve backend URL with method-based admin prefixing and trailing params passthrough */
function resolveTarget(req: NextRequest, parts: string[]) {
    const method = req.method.toUpperCase();
    const preferQuery = req.nextUrl.searchParams.get("ep"); // optional ?ep=blogs/123 or blogs/123?draft=1

    // raw path possibly from catch-all parts or from ?ep=
    let raw = preferQuery ?? parts.join("/");

    // If ep contains its own query string, split it and add to URL later
    let epQuery = "";
    const qIdx = raw.indexOf("?");
    if (qIdx >= 0) {
        epQuery = raw.slice(qIdx + 1);
        raw = raw.slice(0, qIdx);
    }

    // sanitize segments; keep semicolons/commas inside a segment as-is
    const segs = raw
        .split("/")
        .map((s) => s.trim().replace(/^\/+|\/+$/g, ""))
        .filter(Boolean);

    if (segs.length >= 2) {
        const lastIdx = segs.length - 1;
        const param = segs[lastIdx];
        const mode = detectMode(param); // <-- from your utils

        // only add /article when it's a slug and not already present
        if (mode === "slug" && segs[lastIdx - 1] !== "article") {
            segs.splice(lastIdx, 0, "article");
        }
    }

    // avoid /api/api/...
    if (segs[0] === "api") segs.shift();

    // decide base path by method (GET/HEAD public, others admin)
    const isRead = method === "GET" || method === "HEAD";
    const base = isRead ? "/api" : "/api/admin";



    // if client already included "admin" in path, drop it to prevent duplication
    if (!isRead && segs[0] === "admin") segs.shift();

    // build final path; ANY trailing params like "id-foo;bar" remain untouched
    const path = `${base}/${segs.join("/")}`.replace(/\/+$/, "");
    const url = new URL(`${SERVER}${path}`);

    // copy query params from the request, excluding ep itself
    req.nextUrl.searchParams.forEach((v, k) => {
        if (!(k === "ep" && !!preferQuery)) url.searchParams.set(k, v);
    });

    // also apply query string that was embedded inside ep (if any)
    if (epQuery) applyQueryString(epQuery, url);

    return url;
}

/** Forward selected headers to backend (cookies + content-type + authorization) */
function toBackendHeaders(req: NextRequest, extra: HeadersInit = {}): HeadersInit {
    const h: Record<string, string> = {};
    if (extra instanceof Headers) {
        extra.forEach((v, k) => (h[k] = v));
    } else if (Array.isArray(extra)) {
        extra.forEach(([k, v]) => (h[k] = v));
    } else {
        Object.assign(h, extra);
    }

    const cookie = req.headers.get("cookie");
    if (cookie) h.cookie = cookie;

    const ct = req.headers.get("content-type");
    if (ct && !("content-type" in h)) h["content-type"] = ct;

    const auth = req.headers.get("authorization");
    if (auth && !("authorization" in h)) h.authorization = auth;

    return h;
}

/** Core proxy: streams body, forwards Set-Cookie, mirrors status/headers */
async function proxy(req: NextRequest, url: URL) {
    const method = req.method.toUpperCase();
    const hasBody = !["GET", "HEAD"].includes(method);

    const upstream = await fetch(url.toString(), {
        method,
        headers: toBackendHeaders(req),
        body: hasBody ? req.body : undefined, // JSON/multipart/raw passthrough
        // @ts-expect-error Undici extension for streaming request bodies
        duplex: hasBody ? "half" : undefined,
        cache: "no-store",
        credentials: "include",
    });

    const res = new NextResponse(upstream.body, {
        status: upstream.status,
        headers: upstream.headers,
    });

    // Forward all Set-Cookie headers explicitly
    const getSetCookie = (upstream.headers as any).getSetCookie?.bind(upstream.headers);
    const cookieHeaders: string[] =
        (typeof getSetCookie === "function" ? getSetCookie() : []) ||
        (upstream.headers.has("set-cookie")
            ? [upstream.headers.get("set-cookie") as string]
            : []);
    for (const sc of cookieHeaders) res.headers.append("set-cookie", sc);

    return res;
}

type Params = { parts: string[] };
type Ctx = { params: Promise<Params> }; // <- important

// ---- Unified handler used by all HTTP methods ----
async function handle(req: NextRequest, ctx: Ctx) {
    const url = resolveTarget(req, (await ctx.params).parts);
    return proxy(req, url);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
