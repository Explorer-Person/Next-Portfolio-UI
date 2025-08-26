"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { ready, isAuthed } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (ready && !isAuthed) router.replace("/login");
    }, [ready, isAuthed, router]);

    if (!ready) return <div className="min-h-screen grid place-items-center">Checking authorization…</div>;
    if (!isAuthed) return null;

    return <>{children}</>;
}
