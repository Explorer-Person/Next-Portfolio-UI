"use client";

import { Project } from "@/datas/interfaces";
import { projectsData } from "@/datas/jsons";
import { v4 as uuidv4 } from 'uuid';


import React, { useEffect, useState } from "react";
import { nameChanger } from "@/utils/upload";

// ---- Helpers ----
const API = process.env.NEXT_PUBLIC_SERVER_URL;
const kebab = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

interface PageProps {
    mode: "create" | "update";
}

// ---- Page Component ----
export default function ProjectsEditorComponent({ mode }: Readonly<PageProps>) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [id, setId] = useState("");
    const [editing, setEditing] = useState<Project | null>(
        projectsData.projects[0] ?? null
    );
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [tagsInput, setTagsInput] = useState((editing?.tags ?? []).join(", "));

    useEffect(() => {
        setErrors({})
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return; // SSR guard

        let id = localStorage.getItem("projectId");
        setId(id as string);
        if (!id) {
            id = uuidv4();
            localStorage.setItem("projectId", id);
            setId(id);
        }
    }, []);

    // load list
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/common/projects/`, { method: "GET" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                const list: Project[] = Array.isArray(data?.projects) ? data.projects : Array.isArray(data) ? data : [];
                setProjects(list);
            } catch (e) {
                console.error("Failed to load projects", e);
            }
        })();
    }, []);



    const startEdit = (p: Project) => setEditing({
        id: String(p._id),
        fk: String(p.fk ?? ""),
        title: p.title ?? "",
        slug: p.slug ?? "",
        description: p.description ?? "",
        coverImage: p.coverImage ?? "",
        medias: Array.isArray(p.medias) ? p.medias.map(String) : [],
        gitLink: p.gitLink ?? "",
        prodLink: p.prodLink ?? "",
        tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
        priority: typeof p.priority === "number" ? p.priority : undefined,
    });

    const cancelEdit = () => setEditing(null);



    const save = async () => {
        if (!editing) return;

        const cachedId = localStorage.getItem("projectId");
        const payload: Project = {
            id: cachedId as string,
            fk: editing.fk,
            title: editing.title,
            slug: editing.slug || undefined,
            description: editing.description || undefined,
            coverImage: editing.coverImage || undefined,
            medias: editing.medias && editing.medias.length ? editing.medias : undefined,
            gitLink: editing.gitLink || undefined,
            prodLink: editing.prodLink || undefined,
            tags: editing.tags && editing.tags.length ? editing.tags : undefined,
            priority: typeof editing.priority === "number" ? editing.priority : undefined,
        };


        setBusy(true);
        try {
            const isEdit = mode;
            const url = isEdit === "update"
                ? `/api/common/projects/${encodeURIComponent(payload.id)}`
                : `/api/common/projects`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            if (!res.ok) throw new Error(await res.text());

            // refresh list (optimistic)
            setProjects((prev) => {
                const others = prev.filter((x) => x.id !== payload.id);
                return [...others, payload].sort((a, b) => (a.priority ?? 1e9) - (b.priority ?? 1e9));
            });
            setEditing(null);
            ["projectId", "projectEditing"].forEach(key => localStorage.removeItem(key));
            window.location.assign("/projects")
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this project?")) return;
        try {
            const res = await fetch(`/api/common/projects/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include", });
            if (!res.ok) throw new Error(await res.text());
            setProjects((prev) => prev.filter((x) => x.id !== id));
            if (editing?.id === id) setEditing(null);
        } catch (e) {
            console.error("Delete failed", e);
        }
    };




    const appendUnique = (xs: string[] = [], x: string) =>
        xs.includes(x) ? xs : [...xs, x];

    // --- Drop-in upload (images & videos)
    const upload = async (file: File, field: "cover" | "media") => {

        const desiredName = nameChanger(file, field);
        const fd = new FormData();
        // backend/proxy expects the key "image" even for videos (blob is fine)

        fd.append("file", file);  // <-- single canonical key

        // use the proxy; it forwards to your backend /api/project/upload
        const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
            method: "POST",
            credentials: "include",
            body: fd,
        });
        const savedName = String(desiredName);

        // single, safe state update
        setEditing(p => {
            if (!p) return p;
            if (field === "cover") return { ...p, coverImage: savedName };
            return { ...p, medias: appendUnique(p.medias, savedName) };
        });



        type UploadResponse = { fileName?: string; url?: string; error?: string };
        const data: UploadResponse = await res.json().catch(() => ({}));

        if (!res.ok || !data?.fileName) {
            throw new Error(data?.error || `Upload failed (${res.status})`);
        }

    };

    useEffect(() => {
        const cachedRes = getCache();
        if (cachedRes) {
            const id = localStorage.getItem("projectId")
            cachedRes["id"] = id;
            setEditing(cachedRes);
        }
    }, []);


    const removeMediaAt = (idx: number) => setEditing((p) => {
        if (!p) return p;
        const next = [...(p.medias ?? [])];
        next.splice(idx, 1);
        return { ...p, medias: next };
    });

    const cacheInputs = () => {
        localStorage.setItem("projectEditing", JSON.stringify(editing))
    }
    const getCache = () => {
        const cachedString = localStorage.getItem("projectEditing");
        const cachedRes = JSON.parse(cachedString as string);
        return cachedRes
    }

    // ---- UI ----
    return (
        <div className="max-w-6xl mx-auto py-8 text-white">

            {/* Editor panel */}
            {editing && (
                <section className="mb-8 rounded-xl bg-[var(--layout-item-bg)]/70 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            value={id}
                            disabled
                            onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                            placeholder="id (string)"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                        />
                        <input
                            value={editing.fk}
                            onChange={(e) => setEditing({ ...editing, fk: e.target.value })}
                            placeholder="fk (string)"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                        />
                    </div>
                    {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id}</p>}
                    {errors.fk && <p className="text-red-400 text-sm">{errors.fk}</p>}

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            value={editing.title}
                            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                            placeholder="Title *"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                        />
                        <div className="flex gap-2">
                            <input
                                value={editing.slug ?? ""}
                                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                                placeholder="Slug"
                                className="h-10 flex-1 rounded bg-black/25 px-3 placeholder-white/50"
                            />
                            <button onClick={() => setEditing((p) => ({ ...p!, slug: kebab(p!.title) }))} className="px-3 rounded bg-white/10 hover:bg-white/20">
                                Auto
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={editing.description ?? ""}
                        onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                        placeholder="Description"
                        className="mt-3 min-h-[120px] w-full rounded bg-black/25 px-3 py-2 placeholder-white/50"
                    />

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="url"
                            value={editing.gitLink ?? ""}
                            onChange={(e) => setEditing({ ...editing, gitLink: e.target.value })}
                            placeholder="GitHub URL"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                        />
                        <input
                            type="url"
                            value={editing.prodLink ?? ""}
                            onChange={(e) => setEditing({ ...editing, prodLink: e.target.value })}
                            placeholder="Production URL"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50"
                        />
                    </div>
                    {(errors.gitLink || errors.prodLink) && (
                        <p className="text-red-400 text-sm mt-1">{errors.gitLink || errors.prodLink}</p>
                    )}

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
                        <input
                            type="number"
                            value={editing.priority ?? ""}
                            onChange={(e) => setEditing({ ...editing, priority: e.target.value === "" ? undefined : Number(e.target.value) })}
                            placeholder="Priority"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50 md:col-span-2"
                        />

                        {/* Tags input (comma separated) */}
                        <input
                            value={tagsInput}
                            onChange={(e) => {
                                setTagsInput(e.target.value);
                                setEditing({
                                    ...editing,
                                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                });
                            }}
                            placeholder="tags, comma, separated"
                            className="h-10 rounded bg-black/25 px-3 placeholder-white/50 md:col-span-4"
                        />
                    </div>

                    {/* Tag pills */}
                    {editing.tags && editing.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {editing.tags.map((t, i) => (
                                <span key={`${t}-${i}`} className="px-2 py-0.5 rounded-full bg-white/10 text-xs">{t}</span>
                            ))}
                        </div>
                    )}

                    {/* Cover + Medias */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        <div>
                            <label className="block text-sm mb-1 opacity-80">Cover Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const f = e.currentTarget.files?.[0];
                                    if (!f) return;
                                    try { await upload(f, "cover"); } catch (e) { console.error(e); }
                                }}
                                className="h-10 rounded bg-black/25 px-3 py-1 w-full"
                            />
                            {editing.coverImage && (
                                <img className="mt-2 max-h-44 rounded object-cover" src={`/api/media?url=${editing.coverImage}`} alt="cover-img" />
                            )}
                        </div>

                        <div>
                            <label className="block text-sm mb-1 opacity-80">Medias (images/videos)</label>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={async (e) => {
                                    const files = Array.from(e.currentTarget.files ?? []);
                                    for (const f of files) {
                                        try { await upload(f, "media"); } catch (e) { console.error(e); }
                                    }
                                    e.currentTarget.value = "";
                                }}
                                className="h-10 rounded bg-black/25 px-3 py-1 w-full"
                            />
                            {editing.medias && editing.medias.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {editing.medias.map((m, idx) => (
                                        <div key={`${m}-${idx}`} className="relative group">
                                            {/\.(mp4|webm|ogg)$/i.test(m)
                                                ? <video
                                                    src={`/api/media?url=${m}`}
                                                    className='mt-2 max-h-44 rounded object-cover'
                                                />
                                                : <img className="mt-2 max-h-44 rounded object-cover" src={`/api/media?url=${m}`} alt={`media-img-${m}`} />}
                                            <button
                                                onClick={() => removeMediaAt(idx)}
                                                className="absolute top-1 right-1 text-xs bg-red-600 px-2 py-0.5 rounded hidden group-hover:block"
                                                aria-label="Remove media"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center justify-end gap-2">
                        <button onClick={cancelEdit} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700">Cancel</button>
                        <button
                            onClick={cacheInputs}
                            className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-300 text-black"
                        >
                            Cache Inputs
                        </button>
                        <button onClick={save} disabled={busy} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{busy ? "Saving..." : "Save Project"}</button>
                    </div>
                </section>
            )}

            {/* List grid */}
            <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects
                    .slice()
                    .sort((a, b) => (a.priority ?? 1e9) - (b.priority ?? 1e9))
                    .map((p) => (
                        <article key={p.id} className="rounded-xl overflow-hidden bg-[var(--layout-item-bg)] shadow-lg">
                            <div className="relative h-40 bg-black/20">
                                {p.coverImage ? (
                                    <img
                                        src={`${API}/upload/project/${p.coverImage}`}
                                        alt={p.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => {
                                            const fallback = p.coverImage!.startsWith("http") ? p.coverImage! : `https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/${p.coverImage}`;
                                            (e.currentTarget as HTMLImageElement).src = fallback;
                                        }}
                                    />
                                ) : (
                                    <div className="absolute inset-0 grid place-items-center text-white/50">No cover</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{p.title}</h3>
                                {p.description && <p className="mt-1 text-sm text-white/70 line-clamp-3">{p.description}</p>}
                                {p.tags && p.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {p.tags.map((t, i) => (
                                            <span key={`${t}-${i}`} className="px-2 py-0.5 rounded-full bg-white/10 text-xs">{t}</span>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex gap-2 text-xs text-white/70">
                                        {p.gitLink && <a href={p.gitLink} target="_blank" className="underline">Git</a>}
                                        {p.prodLink && <a href={p.prodLink} target="_blank" className="underline">Live</a>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => startEdit(p)} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Edit</button>
                                        <button onClick={() => remove(p.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
            </section>
        </div>
    );
}
