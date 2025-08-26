/* eslint-disable @typescript-eslint/no-explicit-any */
// app/blog/[id]/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Blog } from "@/datas/interfaces";
import { useAuth } from "@/components/AuthContext";


export default function BlogDetailPage() {
    const { isAuthed } = useAuth();

    const params = useParams<{ slug: string }>();
    const router = useRouter();
    const slug = useMemo(
        () => (Array.isArray(params?.slug) ? params.slug[0] : params?.slug) ?? "",
        [params]
    );

    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [working, setWorking] = useState<"delete" | null>(null);
    const alive = useRef(true);

    // Resolve an ID we can use for edit/delete
    const blogId = useMemo<string | null>(
        () => (blog as any)?.id ?? (blog as any)?._id ?? null,
        [blog]
    );

    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    useEffect(() => {
        if (!slug) return;

        const controller = new AbortController();

        async function fetchBlog() {
            setLoading(true);
            setErrorMsg(null);

            const url = `/api/common/blogs/${encodeURIComponent(slug)}`;

            try {
                const res = await fetch(url, { cache: "no-store", signal: controller.signal, credentials: "include", });

                // If request failed (404, 500 etc.)
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
                }

                const json = await res.json(); // ✅ parse JSON properly
                const blogData = json.data;

                if (!alive.current) return;

                if (blogData) {
                    console.log(blogData.html)
                    setBlog(blogData);
                } else {
                    setBlog(null);
                    setErrorMsg("We couldn't find that blog.");
                }
            } catch (err: any) {
                if (!alive.current) return;
                setErrorMsg(err?.message || "Failed to load blog.");
                setBlog(null);
            } finally {
                if (alive.current) setLoading(false);
            }
        }

        fetchBlog();

        return () => controller.abort();
    }, [slug]);


    async function handleDelete() {
        if (!blogId) return alert("Missing blog id");
        if (!isAuthed) return alert("Not authorized to delete this blog");
        if (!confirm("Delete this blog permanently?")) return;

        try {
            setWorking("delete");
            // Optimistic: clear UI immediately
            const previous = blog;
            setBlog(null);

            const res = await fetch(`/api/common/blogs/${encodeURIComponent(blogId)}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                // rollback if failed
                setBlog(previous);
                const msg = (await res.json().catch(() => null))?.message || "Delete failed";
                alert(msg);
                return;
            }
            // success → go back to listing
            router.push("/blogs");
        } catch (e) {
            alert("Delete failed.");
        } finally {
            setWorking(null);
        }
    }

    function handleEdit() {
        if (!blogId) return alert("Missing blog id");
        if (!isAuthed) return alert("Not authorized to edit this blog");

        router.push(`/blogs/update/${encodeURIComponent(blogId)}`);
    }

    if (loading) {
        return (
            <section className="max-w-4xl mx-auto py-10 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
            </section>
        );
    }

    if (!blog) {
        return (
            <section className="max-w-4xl mx-auto py-10 px-4">
                <div className="mb-6">
                    <Link href="/blogs" className="text-sm text-stone-800 hover:underline">
                        ← Back to Blogs
                    </Link>
                </div>
                <h1 className="text-2xl font-semibold">Blog not found</h1>
                {errorMsg && <p className="text-gray-600 mt-2">{errorMsg}</p>}
            </section>
        );
    }

    const coverSrc = blog.coverImage ? `/api/media?url=${encodeURIComponent(blog.coverImage)}` : null;
    const dateText = blog.date ? new Date(blog.date).toLocaleDateString() : "";

    return (
        <section className="relative max-w-4xl mx-auto py-10 px-4">
            {/* Top bar (Back on left, actions on right) */}
            <div className="mb-6 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-sm text-stone-800 hover:underline">
                    ← Back
                </button>

                {
                    isAuthed && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEdit}
                                disabled={!blogId}
                                className="px-3 py-1.5 rounded-md text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60"
                                title="Edit this post"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={!blogId || working === "delete"}
                                className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                                title="Delete this post"
                            >
                                {working === "delete" ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )
                }


            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{blog.title}</h1>

            {/* Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                {dateText && <span>{dateText}</span>}
                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {blog.tags.map((t) => (
                            <span
                                key={t}
                                className="text-xs font-medium text-white bg-stone-800 px-2 py-1 rounded"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Cover */}
            {coverSrc && (
                <div className="mt-6 overflow-hidden rounded-lg">
                    <img src={coverSrc} alt={blog.title} className="w-full h-72 md:h-96 object-cover" />
                </div>
            )}

            {/* Excerpt */}
            {blog.excerpt && <p className="mt-6 text-lg text-gray-700">{blog.excerpt}</p>}

            {/* HTML body */}
            {blog.html && (
                <article
                    className="prose prose-neutral max-w-none mt-6"
                    dangerouslySetInnerHTML={{ __html: blog.html }}
                />
            )}
        </section>
    );
}
