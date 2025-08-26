/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Qualification, QualificationType } from "@/datas/interfaces";
import { v4 as uuidv4 } from 'uuid'


export default function CreateQualificationComponent({ mode }: Readonly<{ mode: string }>) {
    const [form, setForm] = useState<Qualification>({
        type: "cert",
        title: "",
        org: "",
        year: "",
        url: "",
        priority: 0,
        id: "",
        fk: "",
        logo: "",
    });

    useEffect(() => {
        const id = localStorage.getItem("qualificationsId");
        if (!id) {
            localStorage.setItem("qualificationsId", uuidv4());
        }
    }, [])

    // file & preview
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const preview = useMemo(
        () => (file ? URL.createObjectURL(file) : undefined),
        [file]
    );

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const set = <K extends keyof Qualification>(k: K, v: Qualification[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    // util for naming
    const nameChanger = (file: File, field: string) => {
        const ext = file.type.split("/")[1]?.toLowerCase() || file.name.split(".").pop() || "bin";
        const safeExt = ext === "jpeg" ? "jpg" : ext;
        return `${field}-${Date.now()}.${safeExt}`;
    };

    const onPickFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "cover" | "media" | "logo" // pass field type from caller
    ) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setFile(f); // keep preview

        const fd = new FormData();
        fd.append("file", f);

        try {
            const desiredName = nameChanger(f, field);

            const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
                method: "POST",
                body: fd,
                credentials: "include",
            });

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            const json = await res.json();
            const uploadedName = json?.data?.fileName || desiredName;

            // update your form (logo example)
            setForm(prev => ({
                ...prev,
                logo: uploadedName,
            }));
        } catch (err) {
            console.error("Upload error:", err);
        }
    };
    const getCache = () => {
        const data = localStorage.getItem("qualificationsEditing");
        if (!data) return;

        try {
            const parsed = JSON.parse(data); // turn string into object

            // Map parsed object onto your form state
            setForm({
                type: parsed.type ?? "cert",
                title: parsed.title ?? "",
                org: parsed.org ?? "",
                year: parsed.year ?? "",
                url: parsed.url ?? "",
                priority: parsed.priority ?? 0,
                id: parsed._id ?? "",   // notice: your cache has _id, not id
                fk: parsed.fk ?? "",
                logo: parsed.logo ?? "",
            });
        } catch (err) {
            console.error("Failed to parse cached qualification:", err);
        }
    };

    useEffect(() => {
        if (mode === "update") {
            getCache();
        }
    }, [])


    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validate = () => {
        if (!form.title.trim()) return "Title is required.";
        if (!form.type) return "Type is required.";
        // optional: year sanity (<= 4 chars, digits)
        if (form.year && !/^\d{1,4}$/.test(form.year)) return "Year should be up to 4 digits.";
        if (form.url && !/^https?:\/\//i.test(form.url)) return "URL should start with http(s)://";
        return null;
        // logo file is optional here — your API can enforce if needed
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setMessage({ type: "err", text: err });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        const id = localStorage.getItem("qualificationsId");

        console.log(id)

        try {
            // Build plain JSON payload
            const payload = {
                type: form.type,
                title: form.title.trim(),
                org: form.org?.trim() || "",
                year: form.year?.trim() || "",
                url: form.url?.trim() || "",
                priority: typeof form.priority === "number" ? form.priority : 0,
                fk: form.fk,
                id: id,
                logo: form.logo, // already uploaded, now just the name or url
            };

            let url = "/api/common/qualifications";
            let method: "POST" | "PUT" = "POST";

            if (mode === "update") {
                url = `/api/common/qualifications/${id}`; // use id or _id
                method = "PUT";
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
                
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }

            const txt = mode === "update" ? "Qualification Updated." : "Qualification created.";

            setMessage({ type: "ok", text: txt });
            // reset
            setForm({
                type: "cert",
                title: "",
                org: "",
                year: "",
                url: "",
                priority: undefined,
                id: "",
                fk: "",
                logo: "",
            });
            clearFile();
        } catch (e: any) {
            setMessage({
                type: "err",
                text: e?.message ?? "Failed to create qualification.",
            });
        } finally {
            setSubmitting(false);
            if (mode === "update") {
                localStorage.removeItem("qualificationsEditing");
                window.location.reload();
            } else {
                localStorage.setItem("qualificationsId", uuidv4())
            }

        }
    };


    return (
        <main className="min-h-[70vh] py-12 px-6 flex justify-center">
            <div className="w-full max-w-3xl rounded-2xl bg-[var(--layout-item-bg)] shadow-lg ring-1 ring-white/10 p-6 sm:p-8 text-white">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl sm:text-3xl font-semibold">Create Qualification</h1>
                    <Link
                        href="/qualifications"
                        className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md"
                    >
                        ← Back
                    </Link>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-6">
                    {/* Type */}
                    <div className="grid sm:grid-cols-3 gap-3 sm:items-center">
                        <label className="text-sm text-white/80">Type *</label>
                        <div className="sm:col-span-2 flex gap-3">
                            {(["cert", "edu"] as QualificationType[]).map(t => (
                                <label key={t} className="inline-flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value={t}
                                        checked={form.type === t}
                                        onChange={() => set("type", t)}
                                        className="accent-white"
                                    />
                                    <span className="capitalize">{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm text-white/80 mb-1">Title *</label>
                        <input
                            type="text"
                            placeholder={form.type === "cert" ? "Node.js Knowledge Expertise" : "Management Information Systems"}
                            value={form.title}
                            onChange={e => set("title", e.target.value)}
                            className="w-full h-11 rounded-xl bg-white/10 border border-white/15 focus:border-white/30 outline-none px-4 text-white placeholder:text-white/50"
                        />
                    </div>

                    {/* Org + Year */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/80 mb-1">Organization</label>
                            <input
                                type="text"
                                placeholder="Coursera / Istanbul Uni."
                                value={form.org ?? ""}
                                onChange={e => set("org", e.target.value)}
                                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 focus:border-white/30 outline-none px-4 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/80 mb-1">Year</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder="2024"
                                value={form.year ?? ""}
                                onChange={e => set("year", e.target.value)}
                                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 focus:border-white/30 outline-none px-4 text-white placeholder:text-white/50"
                            />
                        </div>
                    </div>

                    {/* URL + Priority */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/80 mb-1">URL</label>
                            <input
                                type="url"
                                placeholder="https://coursera.org/..."
                                value={form.url ?? ""}
                                onChange={e => set("url", e.target.value)}
                                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 focus:border-white/30 outline-none px-4 text-white placeholder:text-white/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-white/80 mb-1">Priority</label>
                            <input
                                type="number"
                                inputMode="numeric"
                                placeholder="e.g., 100"
                                value={form.priority ?? ""}
                                onChange={e => set("priority", e.target.value === "" ? undefined : Number(e.target.value))}
                                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 focus:border-white/30 outline-none px-4 text-white placeholder:text-white/50"
                            />
                        </div>
                    </div>

                    {/* Logo file + preview */}
                    <div>
                        <label className="block text-sm text-white/80 mb-1">Logo (file)</label>
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => onPickFile(e, "logo")}
                                className="block text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/20 transition"
                            />
                            {file && (
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
                                >
                                    Remove
                                </button>
                            )}
                            <div className="h-16 w-16 rounded-lg overflow-hidden ring-1 ring-white/15 bg-white/5 grid place-items-center">
                                {preview || form.logo !== "" ? (
                                    <img src={preview || form.logo} alt="Preview" className="h-full w-full object-contain" />
                                ) : (
                                    <span className="text-[10px] text-white/60 px-1 text-center">No preview</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="pt-2 flex gap-3 justify-end">
                        <button
                            type="reset"
                            onClick={() => {
                                setForm({ type: "cert", title: "", org: "", year: "", url: "", priority: undefined, id: "", fk: "" });
                                clearFile();
                                setMessage(null);
                            }}
                            className="h-11 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="h-11 px-6 rounded-xl bg-white text-stone-900 hover:bg-stone-200 transition font-medium disabled:opacity-60"
                        >
                            {submitting ? "Saving…" : "Create"}
                        </button>
                    </div>

                    {message && (
                        <div
                            className={`mt-2 rounded-lg px-4 py-2 text-sm ${message.type === "ok" ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}
