"use client";
// app/layout.tsx
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { cookies } from "next/headers";
import { useEffect, useState } from "react";

/* ========================= HEADER ========================= */
export function Navbar() {
    const { isAuthed } = useAuth();
    const [open, setOpen] = useState(false);

    // lock body scroll when sheet is open
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    // close on ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Logout failed");
            window.location.href = "/";
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <header className="bg-[var(--header-footer)] sticky top-0 z-50 w-full shadow-lg backdrop-blur">
            <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
                {/* Mobile: Hamburger (top-sheet trigger) */}
                <button
                    aria-label="Open menu"
                    className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-black/5 active:scale-[.98]"
                    onClick={() => setOpen(true)}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Brand (always visible) */}
                <Link href="/" className="inline-flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                </Link>

                {/* Desktop Nav (hidden on mobile) */}
                <nav className="ml-6 hidden md:flex items-center gap-1">
                    <NavItem href="/aboutme" label="ABOUT ME" />
                    <NavItem href="/projects" label="PROJECTS" />
                    <NavItem href="/blogs" label="BLOGS" />
                    <NavItem href="/contributions" label="CONTRIBUTIONS" />
                </nav>

                {/* Right actions */}
                {isAuthed ? (
                    <form action="/api/auth/logout" method="post" className="ml-auto">
                        <button
                            className="group inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-medium text-black/90 border border-white/15 bg-black/80 backdrop-blur shadow-sm transition-all hover:bg-black/65 hover:border-white/25 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </form>
                ) : <div className="ml-auto md:ml-0" />}

                {/* ===== Mobile Top Sheet ===== */}

                {/* Overlay (blurred + fade) */}
                <div
                    className={`fixed inset-0 z-[60] transition-opacity duration-300
            ${open ? "opacity-100" : "pointer-events-none opacity-0"}
            bg-white/40 backdrop-blur-sm`}
                    onClick={() => setOpen(false)}
                />

                {/* Top Sheet (slides from top to bottom) */}
                <aside
                    className={`fixed left-0 right-0 top-0 z-[61]
            bg-[var(--header-footer)] shadow-xl border-b border-white/5
            transition-transform duration-300 ease-out
            ${open ? "translate-y-0" : "-translate-y-full"}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation"
                >
                    <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
                        <Link href="/" className="inline-flex items-center gap-2" onClick={() => setOpen(false)}>
                            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                        </Link>
                        <button
                            aria-label="Close menu"
                            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/5"
                            onClick={() => setOpen(false)}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Sheet content */}
                    <nav className="p-2 max-h-[85vh] overflow-y-auto">
                        <MobileLink href="/aboutme" onClick={() => setOpen(false)}>ABOUT ME</MobileLink>
                        <MobileLink href="/projects" onClick={() => setOpen(false)}>PROJECTS</MobileLink>
                        <MobileLink href="/blogs" onClick={() => setOpen(false)}>BLOGS</MobileLink>
                        <MobileLink href="/contributions" onClick={() => setOpen(false)}>CONTRIBUTIONS</MobileLink>

                        {isAuthed && (
                            <button
                                onClick={(e) => { logout(e as never); setOpen(false); }}
                                className="mt-3 w-full rounded-xl px-4 py-2 text-sm font-medium text-black bg-white/80 hover:bg-white/70 transition"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </aside>
            </div>
        </header>
    );
}

/* --- Helpers --- */
function NavItem({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="rounded-lg px-3 py-1.5 text-sm  text-stone-800 hover:bg-black/5 transition"
        >
            {label}
        </Link>
    );
}

function MobileLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block w-full rounded-xl px-3.5 py-2 text-[15px] font-semibold text-stone-800 hover:bg-black/5 active:scale-[.99] transition"
        >
            {children}
        </Link>
    );
}


/* ========================= FOOTER ========================= */
export function Footer() {
    return (
        <footer className="mt-16 w-full bg-[var(--header-footer)] shadow-lg text-stone-800">
            <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-8 md:py-10
                    flex flex-col md:flex-row items-center md:items-start
                    gap-6 md:gap-8 md:gap-x-10">
                {/* Left: Name + Role */}
                <div className="w-full md:w-[50%] text-center md:text-left">
                    <div className="text-lg font-semibold">Fatih Etlik</div>
                    <p className="mt-2 text-sm text-stone-800 leading-relaxed">
                        Web Developer and Network
                        <br className="hidden sm:block" /> Specialist
                    </p>
                </div>

                {/* Center: Footer Nav */}
                <div className="w-full md:w-[100%] md:text-center text-base sm:text-lg flex justify-center">
                    <ul className="flex flex-wrap items-center justify-center
                        gap-x-6 sm:gap-x-10 gap-y-2 w-full text-stone-800">
                        <li><Link className="hover:text-stone-600 transition" href="/">Home</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/about">About</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/projects">Projects</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/contact">Contact</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/blogs">Blogs</Link></li>
                    </ul>
                </div>

                {/* Right: Copyright */}
                <div className="w-full md:w-[60%] text-center md:text-right
                    text-stone-600 text-xs sm:text-sm md:self-center">
                    © {new Date().getFullYear()} Fatih Etlik. All rights reserved.
                </div>
            </div>
        </footer>

    );
}
