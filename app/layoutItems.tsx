"use client";
// app/layout.tsx
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { cookies } from "next/headers";

/* ========================= HEADER ========================= */
export function Navbar() {
    const { isAuthed } = useAuth();

    const logout = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include", // send httpOnly cookies
            }); 
            if (!res.ok) throw new Error("Logout failed");
            console.log("Logout successful, redirecting...");
            window.location.href = "/"; // redirect to login page
        } catch (err) {
            console.error("Logout error:", err);
        }
    }
    return (
        <header className={`bg-[var(--header-footer)] sticky top-0 z-50 w-full shadow-lg backdrop-blur`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                {/* Brand */}
                <Link
                    href="/"
                    className="font-ssNamemibold text-2xl tracking-wide text-stone-800"
                >
                    Fatih Etlik
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-1">
                    <NavItem href="/projects" label="PROJECTS" />
                    <NavItem href="/blogs" label="BLOGS" />
                    <NavItem href="/contributions" label="CONTRIBUTIONS" />
                    {isAuthed ? (
                        <form action="/api/auth/logout" method="post">
                            <button
                                className="
                                    group inline-flex items-center gap-2
                                    rounded-xl px-3.5 py-1.5 text-sm font-medium
                                    text-white/90 border border-white/15 bg-black/80 backdrop-blur
                                    shadow-sm transition-all
                                    hover:bg-black/65 hover:border-white/25
                                    active:scale-[.98]
                                    focus:outline-none focus:ring-2 focus:ring-emerald-400/60
                                "
                                onClick={logout}
                            >
                                {/* <LogOut className='h-4 w-4 opacity-80 group-hover:opacity-100' /> */}
                                Logout
                            </button>
                        </form>
                    ) : null}

                </nav>
            </div>
        </header>
    );
}

export function NavItem({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-800 hover:text-stone-700 hover:bg-white/10 transition"
        >
            {label}
        </Link>
    );
}

/* ========================= FOOTER ========================= */
export function Footer() {
    return (
        <footer className="mt-16 w-[100%] bg-[var(--header-footer)] shadow-lg text-stone-800">
            <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-10 flex gap-8 gap-x-10">
                {/* Left: Name + Role */}
                <div className="w-[50%]">
                    <div className="text-lg font-semibold">Fatih Etlik</div>
                    <p className="mt-2 text-sm text-stone-800 leading-relaxed">
                        Web Developer and Network
                        <br className="hidden sm:block" /> Specialist
                    </p>
                </div>

                {/* Center: Footer Nav */}
                <div className="md:text-center text-xl flex justify-center w-[100%]">
                    <ul className="flex flex-wrap items-center gap-x-10 gap-y-2 md:justify-center text-stone-800 w-[100%]">
                        <li><Link className="hover:text-stone-600 transition" href="/">Home</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/about">About</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/projects">Projects</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/contact">Contact</Link></li>
                        <li><Link className="hover:text-stone-600 transition" href="/blogs">Blogs</Link></li>
                    </ul>
                </div>

                {/* Right: Copyright */}
                <div className="md:text-right text-stone-600 text-sm self-center w-[60%]">
                    © {new Date().getFullYear()} Fatih Etlik. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
