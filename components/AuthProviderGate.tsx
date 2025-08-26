// AuthProviderGate.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { AuthProvider } from "./AuthContext";

export default function AuthProviderGate({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);

    const refresh = useCallback(async () => {
        try {
            let res = await fetch("/api/auth/authorization", {
                method: "POST",
                credentials: "include",
                cache: "no-store",
            });
            if (res.status === 401) {
                const r = await fetch("/api/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                    cache: "no-store",
                });
                if (r.ok) {
                    res = await fetch("/api/auth/authorization", {
                        method: "POST",
                        credentials: "include",
                        cache: "no-store",
                    });
                }
            }
            setIsAuthed(res.ok);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            await refresh();
            if (cancelled) return;
        })();
        return () => { cancelled = true; };
    }, [refresh]);

    const login = useCallback(() => { setIsAuthed(true); setReady(true); }, []);
    const logout = useCallback(() => { setIsAuthed(false); setReady(true); }, []);

    return (
        <AuthProvider value={{ ready, isAuthed, login, logout, refresh }}>
            {children}
        </AuthProvider>
    );
}
