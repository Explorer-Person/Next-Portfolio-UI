"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

type LoginErrors = Partial<Record<keyof LoginForm | "form", string>>;

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = React.useState<LoginForm>({
        email: "",
        password: "",
        remember: true,
    });
    const [showPw, setShowPw] = React.useState(false);
    const [errors, setErrors] = React.useState<LoginErrors>({});
    const [loading, setLoading] = React.useState(false);

    function validate(f: LoginForm): LoginErrors {
        const e: LoginErrors = {};
        if (!emailOk(f.email)) e.email = "Enter a valid email.";
        if (f.password.length < 6) e.password = "Password must be at least 6 chars.";
        return e;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const v = validate(form);
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);
        setErrors({});
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include", // send httpOnly cookies
            });
            const data = await res.json();

            if (!res.ok || data?.ok === false) {
                setErrors({ form: data?.message || "Login failed." });
            } else {
                router.push("/");
                console.log("Login successful, redirecting...");
            }
        } catch (err) {
            setErrors({ form: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-slate-50 to-white p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>

                {errors.form && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errors.form}
                    </div>
                )}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-0 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                            placeholder="you@example.com"
                            aria-invalid={!!errors.email}
                            aria-describedby="email-error"
                        />
                        {errors.email && (
                            <p id="email-error" className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                value={form.password}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, password: e.target.value }))
                                }
                                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-900 outline-none ring-0 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                placeholder="••••••••"
                                aria-invalid={!!errors.password}
                                aria-describedby="password-error"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw((s) => !s)}
                                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                                aria-label={showPw ? "Hide password" : "Show password"}
                            >
                                {showPw ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="mt-1 text-xs text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.remember}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, remember: e.target.checked }))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                            />
                            Remember me
                        </label>

                        <Link
                            href="/forgot-password"
                            className="text-sm text-slate-700 underline-offset-2 hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-medium text-slate-900 underline-offset-2 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}
