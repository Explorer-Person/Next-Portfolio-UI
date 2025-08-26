import { cookies } from "next/headers";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

export type Session = {
    isAuthed: boolean;
    user?: { id: string; email?: string; role?: string };
};

export async function getSession(): Promise<Session> {
    try {
        const cookieStore = cookies();
        // adjust cookie name to your backend’s auth cookie
        const authCookie = (await cookieStore).get("auth")?.value;
        if (!authCookie) return { isAuthed: false };

        // Ask your backend who this is (or verify JWT locally if you want)
        const r = await fetch(`${SERVER}/api/auth/me`, {
            method: "GET",
            headers: {
                // forward *just* the auth cookie (or all cookies if you prefer)
                cookie: `auth=${authCookie}`,
            },
            cache: "no-store",
        });

        if (!r.ok) return { isAuthed: false };

        const me = await r.json();
        return { isAuthed: true, user: me?.data ?? me?.user ?? undefined };
    } catch {
        return { isAuthed: false };
    }
}
