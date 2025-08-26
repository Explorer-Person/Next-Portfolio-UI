/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { ListNode, ListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot, LexicalEditor } from "lexical";
import { v4 as uuidv4 } from "uuid"

import { Blog, BlogContent } from "@/datas/interfaces/blogs.interface";
import { ImageNode } from "@/components/nodes/ImageNode";
import { Toolbar } from "@/components/Toolbar";

const theme = {
    heading: {
        h1: "text-3xl font-bold mt-4 mb-2",
        h2: "text-2xl font-semibold mt-4 mb-2",
        h3: "text-xl font-medium mt-4 mb-2",
    },
};

function onError(error: unknown) {
    console.error(error);
}

type MetaState = {
    id: string;
    fk: string;
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    coverImage: string;
    medias: string[];
    tags: string[];
    href: string;
    priority?: number;
};

type LexNode = { type: string; src?: string; children?: LexNode[] };

const extractImageNamesFromContent = (contentJSON: BlogContent): string[] => {
    const out: string[] = [];
    const walk = (n: LexNode) => {
        if (n.type === "image" && n.src) {
            const parts = n.src.split("/");
            out.push(parts[parts.length - 1]);
        }
        n.children?.forEach(walk);
    };
    contentJSON.root?.children?.forEach((c) => walk(c as LexNode));
    return out;
};

function MyOnChangePlugin({ onChange }: { onChange: (t: string) => void }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        const unregister = editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => onChange($getRoot().getTextContent()));
        });
        return unregister;
    }, [editor, onChange]);
    return null;
}

function EditorRefPlugin({ editorRef }: { editorRef: React.RefObject<LexicalEditor | null> }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        editorRef.current = editor;
    }, [editor, editorRef]);
    return null;
}

export default function Editor({ initialData, mode }: Readonly<{ initialData?: Blog; mode?: "create" | "update" }>) {
    const editorRef = useRef<LexicalEditor | null>(null);
    const [showMetaModal, setShowMetaModal] = useState(false);
    const [meta, setMeta] = useState<MetaState>({
        id: "",
        fk: "",
        title: "",
        slug: "",
        excerpt: "",
        date: "",
        coverImage: "",
        medias: [],
        tags: [],
        href: "",
        priority: 0
    });
    const [tagsInput, setTagsInput] = useState((meta.tags ?? []).join(", "));

    // Local ID for drafts
    useEffect(() => {
        if (!meta.id) {
            const localId = localStorage.getItem("blogId") ?? uuidv4();
            localStorage.setItem("blogId", localId);
            setMeta((p) => ({ ...p, id: localId }));
        }
    }, []);

    // Edit mode hydration
    useEffect(() => {
        if (mode === "update" && initialData) {
            setMeta({
                id: initialData._id as string,
                fk: initialData.fk ?? "",
                title: initialData.title ?? "",
                slug: initialData.slug ?? "",
                excerpt: initialData.excerpt ?? "",
                date: initialData.date?.slice(0, 10) ?? "",
                coverImage: initialData.coverImage ?? "",
                medias: initialData.medias ?? [],
                href: initialData.href ?? "",
                tags: initialData.tags ?? [],
                priority: initialData.priority,
            });
            console.log(initialData._id)
            localStorage.setItem("blogsEditing", JSON.stringify(initialData));

            if (initialData.jsonModel) {
                const parsed = JSON.parse(initialData.jsonModel);
                editorRef.current?.update(() => {
                    const state = editorRef.current!.parseEditorState(JSON.stringify(parsed.html));
                    editorRef.current!.setEditorState(state);
                });
            }
        }
    }, [mode, initialData]);


    const handleCoverUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include", });
        const data = await res.json();
        if (res.ok && data?.fileName) {
            setMeta((p) => ({ ...p, coverImage: data.fileName }));
        } else {
            console.error("Upload failed", data);
        }
    };

    function getCurrentEditorContent(editorRef: React.RefObject<LexicalEditor | null>) {
        const editor = editorRef.current;
        if (!editor) return { html: "", json: null as any };

        const json = editor.getEditorState().toJSON();

        let html = "";
        editor.getEditorState().read(() => {
            html = $generateHtmlFromNodes(editor, null);
        });

        return { html, json };
    }

    function saveBlogToCache(meta: any, content: any) {
        const medias = extractImageNamesFromContent(content.json)
        const blogData = {
            id: meta?.id || "",
            fk: meta?.fk || "",
            title: meta?.title || "",
            slug: meta?.slug || "",
            excerpt: meta?.excerpt || "",
            date: meta?.date || "",
            coverImage: meta?.coverImage || "",
            medias: medias,
            html: content.html || "",
            jsonModel: content.json || "",
            tags: meta?.tags || [],
            href: meta?.href || "",
            priority: meta?.priority || 0,
        };

        try {
            localStorage.setItem("blogsEditing", JSON.stringify(blogData));
            console.log("Blog saved to localStorage:", blogData);
        } catch (err) {
            console.error("Failed to save to localStorage", err);
        }
    }

    // Load cached blog data from localStorage on mount
    useEffect(() => {
        const cached = localStorage.getItem("blogsEditing");
        if (!cached) return;

        try {
            const parsed = JSON.parse(cached);
            // Hydrate meta (only if there’s something saved)
            setMeta((prev) => ({
                ...prev,
                title: parsed.title || "",
                slug: parsed.slug || "",
                excerpt: parsed.excerpt || "",
                coverImage: parsed.coverImage || "",
                medias: parsed.medias || [],
                tags: parsed.tags || [],
                href: parsed.href || "",
                priority: parsed.priority || 0,
            }));

            let parsedContent;

            if (typeof parsed.jsonModel === "string") {
                try {
                    parsedContent = JSON.parse(parsed.jsonModel);
                } catch (err) {
                    console.error("Invalid JSON string:", parsed.jsonModel);
                    throw err;
                }
            } else {
                parsedContent = parsed.jsonModel;
            }

            console.log(parsedContent.content);
            const selectedContent = parsedContent.id ? parsedContent.content : parsedContent;

            // Hydrate editor content from JSON if available
            if (parsed.jsonModel && editorRef.current) {
                editorRef.current.update(() => {
                    const state = editorRef.current!.parseEditorState(JSON.stringify(selectedContent));
                    editorRef.current!.setEditorState(state);
                });
            }
        } catch (err) {
            console.error("Failed to parse cached blog data:", err);
        }
    }, []);

    function unwrapProxied(srcs: string[]): string[] {
        if (!Array.isArray(srcs)) return [];

        const finalData: string[] = [];

        for (const src of srcs) {
            const match = src.match(/media\?url=([^&]+)/);
            if (match) {
                try {
                    finalData.push(decodeURIComponent(match[1])); // decoded Cloudinary URL
                } catch {
                    finalData.push(match[1]); // fallback
                }
            } else {
                // not proxied → keep original
                finalData.push(src);
            }
        }

        return finalData;
    }




    const handleSubmit = async () => {
        if (!editorRef.current) return;

        const jsonContent = editorRef.current.getEditorState().toJSON();
        let html = "";
        editorRef.current.getEditorState().read(() => {
            html = $generateHtmlFromNodes(editorRef.current!, null);
        });


        const medias = extractImageNamesFromContent(jsonContent as unknown as BlogContent);
        const sanitizedMedias = unwrapProxied(medias);


        const blogData: Blog = {
            id: meta.id,
            fk: meta.fk,
            title: meta.title,
            slug: meta.slug || undefined,
            excerpt: meta.excerpt || undefined,
            html: html,
            jsonModel: JSON.stringify(jsonContent),
            coverImage: meta.coverImage || undefined,
            medias: sanitizedMedias,
            tags: meta.tags,
            href: meta.href,
            priority: meta.priority,
            date: "",
        };

        const url =
            mode === "update"
                ? `/api/common/blogs/${encodeURIComponent(meta.id)}`
                : `/api/common/blogs`;

        const res = await fetch(url, {
            method: mode === "update" ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(blogData),
            credentials: "include",
        });

        if (res.ok) {
            localStorage.removeItem("blogId");
            localStorage.removeItem("blogsEditing");
            window.location.href = "/blogs";
            console.log("success post")
        } else {
            console.error(await res.text());
        }
    };

    return (
        <LexicalComposer initialConfig={{ namespace: "MyEditor", theme, onError, nodes: [HeadingNode, QuoteNode, CodeNode, ListNode, ListItemNode, ImageNode] }}>

            <div className="max-w-3xl mt-10 ml-25">
                <Toolbar />
            </div>
            <div className="w-full mx-auto mt-6">
                <RichTextPlugin contentEditable={<ContentEditable className="border p-4 min-h-[300px] rounded-md" />} placeholder={<div className="text-gray-400">Start writing...</div>} ErrorBoundary={LexicalErrorBoundary} />
                <HistoryPlugin />
                <AutoFocusPlugin />
                <MyOnChangePlugin onChange={() => { }} />
                <EditorRefPlugin editorRef={editorRef} />

                {/* Meta Modal */}
                {showMetaModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                            <input value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="Title" className="border p-2 w-full mb-2" />
                            <input value={meta.slug} onChange={(e) => setMeta({ ...meta, slug: e.target.value })} placeholder="Slug" className="border p-2 w-full mb-2" />
                            <input value={meta.excerpt} onChange={(e) => setMeta({ ...meta, excerpt: e.target.value })} placeholder="Excerpt" className="border p-2 w-full mb-2" />
                            <input type="number" value={meta.priority} onChange={(e) => setMeta({ ...meta, priority: Number(e.target.value) })} className="border p-2 w-full mb-2" />

                            <div className="flex">
                                {/* Tags input (comma separated) */}
                                <input
                                    value={tagsInput}
                                    onChange={(e) => {
                                        setTagsInput(e.target.value);
                                        setMeta({
                                            ...meta,
                                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                        });
                                    }}
                                    placeholder="tags, comma, separated"
                                    className="border p-2 w-full mb-2 bg-black/25"
                                />
                                <input value={meta.href} onChange={(e) => setMeta({ ...meta, href: e.target.value })} type="text" placeholder="href" className="border p-2 w-full mb-2 bg-black/10" />
                            </div>



                            {/* Tag pills */}
                            {meta.tags && meta.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {meta.tags.map((t, i) => (
                                        <span key={`${t}-${i}`} className="px-2 py-0.5 rounded-full bg-white/10 text-xs">{t}</span>
                                    ))}
                                </div>
                            )}

                            <input type="file" accept="image/*" onChange={(e) => e.target.files && handleCoverUpload(e.target.files[0])} />
                            {meta.coverImage && (
                                <img
                                    src={`/api/media?url=${encodeURIComponent(meta.coverImage)}`}
                                    alt="Cover"
                                    className="mt-2 max-h-40"
                                />

                            )}

                            <div className="mt-4 flex justify-end gap-2">
                                <button onClick={() => setShowMetaModal(false)} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
                                <button onClick={() => {
                                    const content = getCurrentEditorContent(editorRef);
                                    saveBlogToCache(meta, content); // cache’e yaz
                                }} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={() => setShowMetaModal(true)} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">Add Meta Info</button>
                <button onClick={handleSubmit} className="mt-4 px-4 py-2 ml-5  bg-blue-600 text-white rounded">Save Blog</button>
            </div>
        </LexicalComposer>
    );
}
