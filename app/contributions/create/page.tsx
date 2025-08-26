/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AuthGate from "@/components/AuthGate";
import { Contribution } from "@/datas/interfaces";
/*
 * Contributions Editor – create & edit
 * Uses your URLs EXACTLY as provided.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// ---- Helpers ----
const kebab = (s: string) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const isFullUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);
const isUploadPath = (u?: string) => !!u && u.startsWith("/upload/");
const resolveCover = (v?: string) => {
    if (!v) return "";
    if (isFullUrl(v) || isUploadPath(v)) return v;
    // treat as stored filename under your static uploads (LEAVE AS YOU WROTE)
    return `/upload/contribution/${v}`;
};

// ---- Local Action type & empties ----
type ContributionAction = { id: string; fk: string; label: string; href: string };

const emptyDoc = (): Contribution => ({
    id: "",
    fk: "",
    title: "",
    slug: "",
    excerpt: "",
    coverImage: "",
    href: "",
    priority: undefined,
});

const emptyAction = (): ContributionAction => ({
    id: "",
    fk: "",
    label: "",
    href: "",
});

type Errors = Partial<Record<"id" | "fk" | "title" | "label" | "href", string>>;

// ---- Page Component ----

export default function ContributionsEditorPage() {
    return(
        <AuthGate>
            <ContributionsEditorComponent />
        </AuthGate>
    )
}

function ContributionsEditorComponent() {
    // tabs
    const [tab, setTab] = useState<"docs" | "actions">("docs");

    // data
    const [docs, setDocs] = useState<Contribution[]>([]);
    const [actions, setActions] = useState<ContributionAction[]>([]);

    // editing states
    const [editingDoc, setEditingDoc] = useState<Contribution>({
        ...emptyDoc(),
        id: uuidv4(),
    });
    const [editingAction, setEditingAction] = useState<ContributionAction | null>(null);

    // ui
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    useEffect(() => {
        setErrors({})
    }, []);

    // file input + local preview
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    // ---- Fetch all (KEEP YOUR URL) ----
    const getAll = async () => {
        try {
            const res = await fetch(`/api/common/contribution/`, { method: "GET", cache: "no-store", credentials: "include", });
            const json: {
                contributions?: { docs?: Contribution[]; actions?: ContributionAction[] };
            } = await res.json();

            setDocs(Array.isArray(json?.contributions?.docs) ? json!.contributions!.docs : []);
            setActions(
                Array.isArray(json?.contributions?.actions) ? json!.contributions!.actions! : []
            );
        } catch (e) {
            console.error("Fetch contributions failed", e);
            setDocs([]);
            setActions([]);
        }
    };

    useEffect(() => {
        getAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Upload cover image (KEEP YOUR URL) ----
    async function uploadImg(file: File): Promise<string> {
        const ext = file.name.split(".").pop() || "png";
        const base = editingDoc.title
            ? kebab(editingDoc.title)
            : kebab(file.name.replace(/\.[^.]+$/, ""));
        const desiredName = `contributions-${base}-${Date.now()}.${ext}`;

        const fd = new FormData();
        fd.append("file", file);
        fd.append("filename", desiredName);

        const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
            method: "POST",
            body: fd,
            credentials: "include",
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);

        const json = await res.json();
        // returns filename (we keep it as you intended)
        return json?.fileName || json?.data?.fileName || desiredName;
    }

    // ---- Save Doc (KEEP YOUR URLS) ----
    const saveDoc = async () => {
        const payload: Contribution = {
            ...editingDoc,
            id: editingDoc.id || uuidv4(),
            fk: editingDoc.fk ?? "",
            title: editingDoc.title.trim(),
            slug: (editingDoc.slug ?? "").trim(),
            excerpt: (editingDoc.excerpt ?? "").trim(),
            coverImage: (editingDoc.coverImage ?? "").trim(),
            href: (editingDoc.href ?? "").trim(),
            priority:
                typeof editingDoc.priority === "number"
                    ? editingDoc.priority
                    : editingDoc.priority === undefined ||
                        editingDoc.priority === null ||
                        (editingDoc.priority as any) === ""
                        ? undefined
                        : Number(editingDoc.priority),
        };

        setBusy(true);
        try {
            const exists = docs.some((d) => d.id === payload.id);
            const url = exists
                ? `/api/common/contributions/${encodeURIComponent(payload.id)}`
                : `/api/common/contributions`;
            const method = exists ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            const json = await res.json();
            if (!res.ok || json?.ok === false) {
                console.error(json);
                return;
            }

            await getAll();
            setEditingDoc({ ...emptyDoc(), id: uuidv4() });
            setFilePreview(null);
            if (fileRef.current) fileRef.current.value = "";
        } catch (err) {
            console.error("Save doc failed", err);
        } finally {
            setBusy(false);
        }
    };

    // ---- Delete Doc (KEEP YOUR URL) ----
    const deleteDoc = async (id: string) => {
        if (!id) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/common/contributions/${encodeURIComponent(id)}`, {
                method: "DELETE",
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok || json?.ok === false) {
                console.error(json);
            }
            await getAll();
            if (editingDoc.id === id) {
                setEditingDoc({ ...emptyDoc(), id: uuidv4() });
                setFilePreview(null);
                if (fileRef.current) fileRef.current.value = "";
            }
        } catch (err) {
            console.error("Delete doc failed", err);
        } finally {
            setBusy(false);
        }
    };

    // ---- Save Action (KEEP YOUR URLS) ----
    const saveAction = async () => {
        if (!editingAction) return;
        const payload: ContributionAction = {
            ...editingAction,
            id: editingAction.id || uuidv4(),
            fk: editingAction.fk ?? "",
            label: editingAction.label.trim(),
            href: editingAction.href.trim(),
        };

        setBusy(true);
        try {
            const exists = actions.some((a) => a.id === payload.id);
            const url = exists
                ? `/api/common/contributions/${encodeURIComponent(payload.id)}`
                : `/api/common/contributions`;
            const method = exists ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            const json = await res.json();
            if (!res.ok || json?.ok === false) {
                console.error(json);
                return;
            }
            await getAll();
            setEditingAction(null);
        } catch (err) {
            console.error("Save action failed", err);
        } finally {
            setBusy(false);
        }
    };

    // ---- Delete Action (KEEP YOUR URL) ----
    const deleteAction = async (id: string) => {
        if (!id) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/common/contributions/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (!res.ok || json?.ok === false) {
                console.error(json);
            }
            await getAll();
            if (editingAction?.id === id) setEditingAction(null);
        } catch (err) {
            console.error("Delete action failed", err);
        } finally {
            setBusy(false);
        }
    };

    // ---- Preview src (fixes your preview not showing) ----
    const editorPreviewSrc = useMemo(() => {
        // show local object preview immediately after pick
        if (filePreview) return filePreview;
        // fallback to saved value
        return resolveCover(editingDoc.coverImage);
    }, [filePreview, editingDoc.coverImage]);

    // cleanup object URLs
    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
        };
    }, [filePreview]);

    return (
        <div className="max-w-6xl mx-auto py-8 text-white">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl md:text-4xl font-semibold">Contributions Editor</h1>
                <div className="inline-flex rounded-xl overflow-hidden border border-white/10">
                    <button
                        onClick={() => setTab("docs")}
                        className={`px-4 py-2 ${tab === "docs" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                    >
                        Documents
                    </button>
                    <button
                        onClick={() => setTab("actions")}
                        className={`px-4 py-2 ${tab === "actions" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                    >
                        Quick Actions
                    </button>
                </div>
            </div>

            {/* ---- DOCS TAB ---- */}
            {tab === "docs" && (
                <section className="space-y-6">
                    {/* Editor */}
                    <div className="rounded-xl bg-[var(--layout-item-bg)]/90 p-4">
                        <h2 className="text-lg font-semibold mb-3">Create / Edit Document</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                value={editingDoc.id}
                                onChange={(e) => setEditingDoc({ ...editingDoc, id: e.target.value })}
                                placeholder="id (string)"
                                className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                            />
                            <input
                                value={editingDoc.fk}
                                onChange={(e) => setEditingDoc({ ...editingDoc, fk: e.target.value })}
                                placeholder="fk (string)"
                                className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                            />
                        </div>
                        {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id}</p>}
                        {errors.fk && <p className="text-red-400 text-sm">{errors.fk}</p>}

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="grid gap-1">
                                <input
                                    value={editingDoc.title}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                                    placeholder="Title *"
                                    className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                                />
                                <div className="text-xs text-white/50 text-right">
                                    {editingDoc.title.length} chars
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    value={editingDoc.slug ?? ""}
                                    onChange={(e) => setEditingDoc({ ...editingDoc, slug: e.target.value })}
                                    placeholder="Slug"
                                    className="h-10 flex-1 rounded bg-black/25 px-3 placeholder-white/50"
                                />
                                <button
                                    onClick={() => setEditingDoc((p) => ({ ...p, slug: kebab(p.title) }))}
                                    className="px-3 rounded bg-white/10 hover:bg-white/20"
                                >
                                    Auto
                                </button>
                            </div>
                        </div>

                        <div className="mt-3">
                            <textarea
                                value={editingDoc.excerpt ?? ""}
                                onChange={(e) => setEditingDoc({ ...editingDoc, excerpt: e.target.value })}
                                placeholder="Excerpt"
                                className="min-h-[100px] w-full rounded bg-black/25 px-3 py-2 placeholder-white/50"
                            />
                            <div className="text-xs text-white/50 text-right">
                                {(editingDoc.excerpt ?? "").length} chars
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="url"
                                value={editingDoc.href ?? ""}
                                onChange={(e) => setEditingDoc({ ...editingDoc, href: e.target.value })}
                                placeholder="Target URL (optional)"
                                className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                            />
                            <input
                                type="number"
                                value={editingDoc.priority ?? ""}
                                onChange={(e) =>
                                    setEditingDoc({
                                        ...editingDoc,
                                        priority: e.target.value === "" ? undefined : Number(e.target.value),
                                    })
                                }
                                placeholder="Priority"
                                className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                            />
                        </div>

                        {/* Cover image upload */}
                        <div className="mt-3">
                            <label className="block text-sm mb-1 opacity-80">Cover Image</label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const f = e.currentTarget.files?.[0];
                                    if (!f) return;
                                    try {
                                        // local preview NOW
                                        const prev = filePreview;
                                        const nextUrl = URL.createObjectURL(f);
                                        setFilePreview(nextUrl);
                                        if (prev) URL.revokeObjectURL(prev);

                                        // upload and store filename
                                        const name = await uploadImg(f); // returns stored filename
                                        setEditingDoc((p) => ({ ...p, coverImage: name }));
                                    } catch (er) {
                                        console.error(er);
                                    } finally {
                                        // allow picking same file again
                                        if (fileRef.current) fileRef.current.value = "";
                                    }
                                }}
                                className="h-10 rounded bg-black/25 px-3 py-1 w-full"
                            />

                            {/* Live preview (works with both object URL and stored filename) */}
                            {(editorPreviewSrc || editingDoc.coverImage) && (
                                <img
                                    src={editorPreviewSrc || ""}
                                    alt="Doc Cover"
                                    className="mt-2 max-h-44 rounded object-cover"
                                    onError={(e) => {
                                        // fallback to resolved path if object URL fails
                                        const fallback = resolveCover(editingDoc.coverImage);
                                        if (fallback && (e.currentTarget as HTMLImageElement).src !== fallback) {
                                            (e.currentTarget as HTMLImageElement).src = fallback;
                                        }
                                    }}
                                />
                            )}
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-2">
                            <button
                                onClick={saveDoc}
                                disabled={busy}
                                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {busy ? "Saving..." : "Save Document"}
                            </button>
                        </div>
                    </div>

                    {/* Docs list */}
                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {docs
                            .slice()
                            .sort((a, b) => (a.priority ?? 1e9) - (b.priority ?? 1e9))
                            .map((d) => (
                                <article key={d.id} className="rounded-xl overflow-hidden bg-[var(--layout-item-bg)] shadow-lg">
                                    <div className="relative h-40 bg-black/20">
                                        {d.coverImage ? (
                                            <img
                                                src={resolveCover(d.coverImage)}
                                                alt={d.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 grid place-items-center text-white/50">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold">{d.title}</h3>
                                        {d.excerpt && (
                                            <p className="mt-1 text-sm text-white/70 line-clamp-3">{d.excerpt}</p>
                                        )}
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex gap-2 text-xs text-white/70">
                                                {d.href && (
                                                    <a href={d.href} target="_blank" className="underline">
                                                        Link
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingDoc({ ...d });
                                                        setFilePreview(null); // reset local preview when loading existing doc
                                                        if (fileRef.current) fileRef.current.value = "";
                                                    }}
                                                    className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteDoc(d.id)}
                                                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                    </section>
                </section>
            )}

            {/* ---- ACTIONS TAB ---- */}
            {tab === "actions" && (
                <section className="space-y-6">
                    {/* Action editor */}
                    <div className="rounded-xl bg-[var(--layout-item-bg)]/70 p-4">
                        <h2 className="text-lg font-semibold mb-3">Create / Edit Action</h2>
                        {editingAction == null && (
                            <button
                                onClick={() =>
                                    setEditingAction({
                                        ...emptyAction(),
                                        id: (crypto as any).randomUUID?.() || String(Date.now()),
                                    })
                                }
                                className="px-4 py-2 rounded bg-white/10 hover:bg-white/20"
                            >
                                New Action
                            </button>
                        )}

                        {editingAction && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <input
                                        value={editingAction.id}
                                        onChange={(e) => setEditingAction({ ...editingAction, id: e.target.value })}
                                        placeholder="id (string)"
                                        className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                                    />
                                    <input
                                        value={editingAction.fk}
                                        onChange={(e) => setEditingAction({ ...editingAction, fk: e.target.value })}
                                        placeholder="fk (string)"
                                        className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                                    />
                                </div>
                                {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id}</p>}
                                {errors.fk && <p className="text-red-400 text-sm">{errors.fk}</p>}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                    <input
                                        value={editingAction.label}
                                        onChange={(e) => setEditingAction({ ...editingAction, label: e.target.value })}
                                        placeholder="Label *"
                                        className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                                    />
                                    <input
                                        type="url"
                                        value={editingAction.href}
                                        onChange={(e) => setEditingAction({ ...editingAction, href: e.target.value })}
                                        placeholder="https://... *"
                                        className="h-10 rounded bg-black/25 px-3 placeholder-white/50 md:col-span-2"
                                    />
                                </div>

                                <div className="mt-5 flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setEditingAction(null)}
                                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveAction}
                                        disabled={busy}
                                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {busy ? "Saving..." : "Save Action"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Actions list */}
                    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {actions.map((a) => (
                            <article
                                key={a.id}
                                className="rounded-xl overflow-hidden bg-[var(--layout-item-bg)] shadow-lg p-4"
                            >
                                <h3 className="text-lg font-semibold">{a.label}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <a
                                        href={a.href}
                                        target="_blank"
                                        className="underline text-xs text-white/70 break-all"
                                    >
                                        {a.href}
                                    </a>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingAction({ ...a })}
                                            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteAction(a.id)}
                                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                </section>
            )}
        </div>
    );
}
