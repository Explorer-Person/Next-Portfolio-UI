/* eslint-disable @typescript-eslint/no-explicit-any */
/* app/projects/page.tsx */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";


type Project = {
    _id: string;
    id?: number;
    fk: number;
    title: string;
    slug?: string;
    description?: string;
    coverImage?: string;
    medias?: string[];
    gitLink?: string;
    prodLink?: string;
    tags?: string[];
    priority?: number;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
};

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

function toMediaUrl(nameOrUrl?: string) {
    if (!nameOrUrl) return "";
    const s = String(nameOrUrl);
    if (s.startsWith("http://") || s.startsWith("https://")) return s;
    return `${SERVER}/upload/${s}`; // local filename → serve from /upload
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [selected, setSelected] = useState<Project | null>(null);
    const searchParams = useSearchParams();
    const route = useRouter();

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const res = await fetch(`/api/common/projects`, { method: "GET", });
            if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
            const data = await res.json();
            // support both shapes: { ok, data } or raw array
            const list: Project[] = Array.isArray(data) ? data : data?.data ?? [];
            // (optional) sort by priority desc, then createdAt desc
            list.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
            setProjects(list);
        } catch (e: any) {
            setErr(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ESC closes specialized mode
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setSelected(null);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const proj = projects.find(p => p._id === id || String(p.fk) === id);
            if (proj) setSelected(proj);
        } else {
            setSelected(null);
        }
    }, [projects, searchParams]);

    const extended = useMemo(() => selected === null, [selected]);

    const updateItem = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        window.location.assign(`/projects/update/${value}`)
    }
    const deleteItem = async (e: React.MouseEvent<HTMLButtonElement>) => {
        const value = e.currentTarget.value; // safer than e.target.value

        const res = await fetch(`/api/common/projects/${value}`, {
            method: "DELETE",
            credentials: "include",
        });
        const data = await res.json();

        if (data.ok) {
            // Remove from UI without another fetch
            setProjects(prev => prev.filter(p => p._id !== value));
            setSelected(null);
        } else {
            console.error(data.message || "Failed to delete project");
        }
    };


    return (
        <main className="projects-container min-h-screen">
            <section className="mx-auto max-w-6xl px-4 py-10">
                <header className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
                        <p className="opacity-70">Explore my recent work — click a card to see more.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn" onClick={() => setSelected(null)}>
                            Extended view
                        </button>
                        {selected && (
                            <span className="accent-chip">Specialized: {selected.title}</span>
                        )}
                    </div>
                </header>

                {/* Loading / Error */}
                {loading && (
                    <div className="card p-6 text-sm">
                        Loading projects…
                    </div>
                )}
                {err && (
                    <div className="card p-6">
                        <div className="accent-chip mb-2 inline-block">Error</div>
                        <p>{err}</p>
                    </div>
                )}

                {/* Extended mode (grid) */}
                {!loading && !err && extended && (
                    <div className="flex">
                        {projects.map((p) => (
                            <ProjectCard key={p._id} project={p} onOpen={() => setSelected(p)} />
                        ))}
                    </div>
                )}
            </section>

            {/* Specialized mode (overlay panel) */}
            {selected && (
                <DetailOverlay project={selected} onClose={() => {setSelected(null); route.push("/projects")}} updateItem={updateItem} deleteItem={deleteItem} />
            )}
        </main>
    );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
    const cover = toMediaUrl(project.coverImage);
    return (
        <article
            className="card group relative w-[50%] overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5"
            onClick={onOpen}
            role="button"
            aria-label={`Open ${project.title}`}
        >
            {/* Cover */}
            <div className="relative h-80 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={cover}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.dataset.fallbackApplied !== "true") {
                            img.src = "/fallback-cover.png";
                            img.dataset.fallbackApplied = "true";
                        }
                    }}
                />
                {/* Overlay with title on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[rgba(0,0,0,0.55)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <h3 className="text-lg font-bold text-white">{project.title}</h3>
                </div>
            </div>
        </article>

    );
}

function DetailOverlay({ project, onClose, updateItem, deleteItem }: Readonly<{ project: Project; onClose: () => void ; updateItem: (e: any) => void; deleteItem: (e: any) => void}>) {
    const cover = toMediaUrl(project.coverImage);
    const medias = (project.medias ?? []).map(toMediaUrl);


    return (
        <div
            className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.55)] backdrop-blur-sm flex items-center justify-center"
            aria-modal="true"
            role="dialog"
        >
            <div className="mx-auto mt-10 relative bottom-5  w-[min(100%-1.25rem,1000px)]">
                <div className="card overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                            <h2 className="text-2xl font-extrabold leading-tight">{project.title}</h2>
                            {project.slug && (
                                <div className="opacity-70 text-xs">/{project.slug}</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {Number.isFinite(project.priority) && (
                                <span className="accent-chip">Priority {project.priority}</span>
                            )}
                            <button className="btn" onClick={onClose} aria-label="Close details">Close</button>
                        </div>
                    </div>

                    {/* Media rail */}
                    {/* Media rail */}
                    <div className="px-4 pb-4">
                        <div className="media-rail">
                            {/* Cover first */}
                            {cover && (
                                <div className="relative h-72 w-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/api/media?url=${cover}`}
                                        alt={`${project.title} cover`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            {/* Then extra medias */}
                            {medias.map((m, i) => (
                                <MediaItem
                                    key={i}
                                    src={m}
                                    title={`${project.title} media ${i + 1}`}
                                />
                            ))}
                        </div>
                    </div>


                    {/* Body */}
                    <div className="grid gap-4 px-4 pb-5 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <h3 className="mb-2 text-lg font-bold">About this project</h3>
                            <p className="leading-relaxed opacity-90">
                                {project.description || "No description provided."}
                            </p>
                        </div>
                        <div className="md:col-span-1">
                            <h3 className="mb-2 text-lg font-bold">Links & meta</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.prodLink && (
                                    <a className="btn" href={project.prodLink} target="_blank" rel="noreferrer">Live</a>
                                )}
                                {project.gitLink && (
                                    <a className="btn" href={project.gitLink} target="_blank" rel="noreferrer">GitHub</a>
                                )}
                            </div>

                            {project.tags?.length ? (
                                <>
                                    <h4 className="mt-4 text-sm font-semibold opacity-80">Tags</h4>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {project.tags.map((t, i) => <span key={i} className="tag">#{t}</span>)}
                                    </div>
                                </>
                            ) : null}

                            <div className="mt-4 text-xs opacity-70">
                                <div>FK: {project.fk}</div>
                                {project.createdAt && <div>Created: {new Date(project.createdAt).toLocaleString()}</div>}
                                {project.updatedAt && <div>Updated: {new Date(project.updatedAt).toLocaleString()}</div>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 relative bottom-5 left-5">
                        <button
                            value={project._id}
                            onClick={deleteItem}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition-all duration-200"
                        >
                            Delete
                        </button>

                        <button
                            value={project._id}
                            onClick={updateItem}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all duration-200"
                        >
                            Update
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
}

function MediaItem({ src, title }: { src: string; title: string }) {
    const isVideo = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)$/i.test(src);
    if (isVideo) {
        return (
            <div className="relative h-72 w-full">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                    className="h-full w-full object-cover"
                    src={`/api/media?url=${src}`}
                    controls
                    preload="metadata"
                />
            </div>
        );
    }
    return (
        <div className="relative h-72 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={`/api/media?url=${src}`}
                alt={title}
                className="h-full w-full object-cover"
            />
        </div>
    );
}

