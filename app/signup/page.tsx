"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignupForm } from "@/datas/interfaces/signup.interface";
import {v4 as uuidv4} from "uuid"


type SignupErrors = Partial<Record<keyof SignupForm | "form", string>>;

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = React.useState<SignupForm>({
        id: uuidv4(),
        fk: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: true,
    });
    const [showPw, setShowPw] = React.useState(false);
    const [showPw2, setShowPw2] = React.useState(false);
    const [errors, setErrors] = React.useState<SignupErrors>({});
    const [loading, setLoading] = React.useState(false);

    function validate(f: SignupForm): SignupErrors {
        const e: SignupErrors = {};
        if (!f.username.trim()) e.username = "Name is required.";
        if (!emailOk(f.email)) e.email = "Enter a valid email.";
        if (f.password.length < 8) e.password = "Min 8 characters.";
        if (f.password !== f.confirmPassword)
            e.confirmPassword = "Passwords do not match.";
        if (!f.acceptTerms) e.acceptTerms = "Please accept the terms.";
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
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });
            const data = await res.json();

            if (!res.ok || data?.ok === false) {
                setErrors({ form: data?.message || "Signup failed." });
            } else {
                // router.push("/");
                console.log(res.ok)
            }
        } catch {
            setErrors({ form: "Network error. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-slate-50 to-white p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
                <p className="mt-1 text-sm text-slate-500">Join us in a minute</p>

                {errors.form && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {errors.form}
                    </div>
                )}

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Name
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none ring-0 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                            placeholder="Jane Doe"
                            aria-invalid={!!errors.username}
                            aria-describedby="name-error"
                        />
                        {errors.username && (
                            <p id="name-error" className="mt-1 text-xs text-red-600">
                                {errors.username}
                            </p>
                        )}
                    </div>

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

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Confirm password
                        </label>
                        <div className="relative">
                            <input
                                type={showPw2 ? "text" : "password"}
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                                }
                                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 text-slate-900 outline-none ring-0 focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                placeholder="••••••••"
                                aria-invalid={!!errors.confirmPassword}
                                aria-describedby="confirm-error"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw2((s) => !s)}
                                className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                                aria-label={showPw2 ? "Hide password" : "Show password"}
                            >
                                {showPw2 ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p id="confirm-error" className="mt-1 text-xs text-red-600">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.acceptTerms}
                            onChange={(e) =>
                                setForm((p) => ({ ...p, acceptTerms: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                        />
                        I accept the terms & privacy policy.
                    </label>
                    {errors.acceptTerms && (
                        <p className="text-xs text-red-600">{errors.acceptTerms}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-slate-900 underline-offset-2 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
