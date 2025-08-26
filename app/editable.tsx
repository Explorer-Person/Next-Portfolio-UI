/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Contact, ContactsDataset, Hero, ProfileImage, ProfileImageDataset, Social, SocialsDataset, TechStack, TechStacksDataset } from "@/datas/interfaces";
import { useEffect, useMemo, useRef, useState } from "react";

// Drop this anywhere in your page (e.g., under your Hero component) to render
// a single edit box that contains one input (title) and one textarea (description).
// No header/paragraph preview is shown here — it's ONLY the editable box.
//
// Tailwind-only. Minimal, clean, and ready to wire to your admin mode later.

export function HeroEditor() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");

    async function handleSubmit() {
        const payload = {
            id: uuidv4(),
            fk: "",
            title: title,
            desc: desc
        }
        const res = await fetch("/api/common/hero", {
            body: JSON.stringify(payload),
            method: "POST",
            headers: { "Content-Type": "application/json" },
        })

        const json = await res.json();
        const saved: Hero = json?.data;

        setTitle(saved.title as string);
        setDesc(saved.desc as string);

        window.location.reload();
    }

    return (
        <div className="relative h-full overflow-y-auto w-full max-w-3xl mx-auto">
            <div className="rounded-2xl shadow-xl bg-[var(--layout-item-bg)]/80 backdrop-blur p-6 md:p-8 border border-white/10">
                <div className="grid gap-6">
                    {/* Title input */}
                    <div className="grid gap-2">
                        <label htmlFor="hero-title" className="text-sm font-medium text-stone-200">
                            Hero Title
                        </label>
                        <input
                            id="hero-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Web Developer & Network Expert Crafting Digital Solutions"
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30"
                        />
                        <div className="text-xs text-stone-400 text-right">{title.length} chars</div>
                    </div>

                    {/* Description textarea */}
                    <div className="grid gap-2">
                        <label htmlFor="hero-desc" className="text-sm font-medium text-stone-200">
                            Hero Description
                        </label>
                        <textarea
                            id="hero-desc"
                            rows={6}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder={
                                "With a passion for innovative web development and a solid foundation in networking, I design and build robust digital solutions..."
                            }
                            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 resize-y"
                        />
                        <div className="text-xs text-stone-400 text-right">{desc.length} chars</div>
                    </div>

                    {/* Action row (optional now — can be wired later) */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setTitle("");
                                setDesc("");
                            }}
                            className="px-4 py-2 rounded-xl border border-white/10 text-stone-200 hover:bg-white/5 active:scale-[.99] transition"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium active:scale-[.99] transition"
                        >
                            Save (placeholder)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}




// ---- Props for the editor
type ProfileImageEditorProps = {
    initial?: ProfileImageDataset;                // current values
    onSave?: (next: ProfileImageDataset) => void; // wire to API later
    onCancel?: () => void;                        // e.g., changeBoxState("")
    // Optional: keep parity with your toggle controller
    changeBoxState?: (name: string) => void;
    editableBox?: string;
};

export default function ProfileImageEditor({
    initial,
    onSave,
    onCancel,
    changeBoxState,
    editableBox,
}: ProfileImageEditorProps) {
    // ===== form state =====
    const [form, setForm] = useState<ProfileImageDataset>(() => ({
        profileImage: {
            src: initial?.profileImage?.src ?? "",
            alt: initial?.profileImage?.alt ?? "",
            width: initial?.profileImage?.width ?? 600,
            height: initial?.profileImage?.height ?? 400,
            className: initial?.profileImage?.className ?? "",
            id: initial?.profileImage?.id ?? "1",
            fk: initial?.profileImage?.fk ?? "",
            _id: (initial?.profileImage as any)?._id, // keep if present
        },
    }));

    // ===== list / refetch (getAll) =====
    // For a single profile image, we'll just re-fetch the current dataset.
    const getCurrent = async () => {
        try {
            const res = await fetch("/api/common/profileImage", {
                method: "GET",
                cache: "no-store",
            });
            const json = await res.json();
            const data: ProfileImageDataset | null =
                json?.data && json.data.profileImage ? json.data : null;

            if (data?.profileImage) {
                setForm({
                    profileImage: {
                        ...data.profileImage,
                        id: data.profileImage.id ?? "1",
                        fk: data.profileImage.fk ?? "",
                    },
                });
            }
        } catch (e) {
            console.error("Fetch profile image failed", e);
        }
    };

    useEffect(() => {
        getCurrent(); // initial sync
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ===== local file selection (preview only) =====
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const previewSrc = useMemo(() => {
        if (file) return URL.createObjectURL(file);
        return form.profileImage.src || "";
    }, [file, form.profileImage.src]);

    const handleChange =
        <K extends keyof ProfileImage>(key: K) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const v =
                    key === "width" || key === "height"
                        ? Number(e.target.value || 0)
                        : (e.target.value as unknown);
                setForm((prev) => ({
                    profileImage: { ...prev.profileImage, [key]: v },
                }));
            };

    const resetToInitial = () => {
        if (initial?.profileImage) {
            setForm({ profileImage: { ...initial.profileImage } });
        } else {
            setForm({
                profileImage: {
                    src: "",
                    alt: "",
                    width: 600,
                    height: 400,
                    className: "",
                    id: "1",
                    fk: "",
                },
            });
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onPickFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "cover" | "media" | "logo" | "icon" | "profile" // pass field type from caller
    ) => {
        const f = e.target.files?.[0];
        if (!f) return;

        const fd = new FormData();
        fd.append("file", f);

        try {
            const desiredName = nameChanger(f, field);

            const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            const json = await res.json();
            const uploadedName = json?.data?.fileName || desiredName;

            // ✅ update inside profileImage, not root
            setForm((prev) => ({
                profileImage: {
                    ...prev.profileImage,
                    src: uploadedName, // store the filename, backend will normalize
                },
            }));
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            // clear file input so user can re-select same file if needed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ===== handleSubmit (save -> getCurrent) =====
    const save = async () => {
        const payload: ProfileImage = {
            // ensure id determinism (or use uuid if you prefer)
            id: uuidv4(),
            fk: form.profileImage.fk || "",
            src: (form.profileImage.src || "").trim(),
            alt: (form.profileImage.alt || "").trim(),
            width: Number(form.profileImage.width || 0),
            height: Number(form.profileImage.height || 0),
            className: form.profileImage.className || "",
            ...(form.profileImage._id ? { _id: form.profileImage._id } : {}),
        };

        try {
            const res = await fetch("/api/common/profileImage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            const saved: ProfileImageDataset = json?.data ?? payload;

            // Refetch (getAll equivalent)
            await getCurrent();

            // bubble up to parent if needed
            onSave?.(saved);

            // close the editor if you follow that UX
            if (editableBox === "profileimage" && changeBoxState) changeBoxState("");
        } catch (e) {
            console.error("Save failed", e);
        }
    };

    const char = (s?: string) => (s ? s.length : 0);

    return (
        <section className="relative h-full overflow-y-auto rounded-2xl bg-[var(--layout-item-bg)] shadow-lg ring-1 ring-white/10 p-6 sm:p-8 text-white">
            {/* Close badge */}
            {changeBoxState && editableBox && (
                <button
                    onClick={() => changeBoxState("")}
                    className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
                >
                    ✖ Close
                </button>
            )}

            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Profile Image</h2>

            {/* URL input */}
            <label className="block text-sm font-medium mb-2">Image URL or Stored Filename</label>
            <div className="relative">
                <input
                    type="text"
                    placeholder="e.g. me.jpg (stored) or https://example.com/me.jpg"
                    value={form.profileImage.src}
                    onChange={handleChange("src")}
                    className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-white/30 outline-none px-4 py-3 text-white placeholder:text-white/50"
                />
                <span className="absolute right-3 bottom-2 text-xs text-white/60">
                    {char(form.profileImage.src)} chars
                </span>
            </div>

            {/* OR divider */}
            <div className="my-5 flex items-center gap-3 text-white/60">
                <span className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-wider">or</span>
                <span className="h-px flex-1 bg-white/10" />
            </div>

            {/* File picker + tiny preview */}
            <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickFile(e, "profile")}
                        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white hover:file:bg-white/20 transition"
                    />
                    {file && (
                        <button
                            type="button"
                            onClick={clearFile}
                            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Mini thumb */}
                <div className="justify-self-end">
                    <div className="h-16 w-16 rounded-lg overflow-hidden ring-1 ring-white/15 bg-white/5 grid place-items-center">
                        {previewSrc ? (
                            <img src={`/api/media?url=${previewSrc}`} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-[10px] text-white/50 px-1 text-center">No preview</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Alt */}
            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Alt text</label>
                <div className="relative">
                    <input
                        type="text"
                        value={form.profileImage.alt ?? ""}
                        onChange={handleChange("alt")}
                        placeholder="e.g., Fatih Etlik portrait"
                        className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-white/30 outline-none px-4 py-3 text-white placeholder:text-white/50"
                    />
                    <span className="absolute right-3 bottom-2 text-xs text-white/60">
                        {char(form.profileImage.alt)}
                    </span>
                </div>
            </div>

            {/* Size */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Width (px)</label>
                    <input
                        type="number"
                        min={0}
                        value={form.profileImage.width ?? 0}
                        onChange={handleChange("width")}
                        className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-white/30 outline-none px-4 py-3 text-white placeholder:text-white/50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Height (px)</label>
                    <input
                        type="number"
                        min={0}
                        value={form.profileImage.height ?? 0}
                        onChange={handleChange("height")}
                        className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-white/30 outline-none px-4 py-3 text-white placeholder:text-white/50"
                    />
                </div>
            </div>

            {/* className */}
            <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Extra className</label>
                <div className="relative">
                    <input
                        type="text"
                        value={form.profileImage.className ?? ""}
                        onChange={handleChange("className")}
                        placeholder="object-cover rounded-xl"
                        className="w-full rounded-xl bg-white/5 border border-white/15 focus:border-white/30 outline-none px-4 py-3 text-white placeholder:text-white/50"
                    />
                    <span className="absolute right-3 bottom-2 text-xs text-white/60">
                        {char(form.profileImage.className)}
                    </span>
                </div>
            </div>

            {/* Live large preview */}
            <div className="mt-8">
                <label className="block text-sm font-medium mb-3">Live Preview</label>
                <div className="rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="relative w-full max-w-xl aspect-[3/2] mx-auto">
                        {previewSrc ? (
                            <img
                                src={`/api/media?url=${previewSrc}`}
                                alt={form.profileImage.alt || "Profile preview"}
                                className={`h-full w-full object-cover ${form.profileImage.className ?? ""}`}
                            />
                        ) : (
                            <div className="grid place-items-center h-full text-white/40 text-sm">
                                No image selected
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap gap-3 justify-end">
                <button
                    type="button"
                    onClick={resetToInitial}
                    className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                >
                    Reset
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="button"
                    onClick={save}
                    className="px-5 py-2 rounded-xl bg-white text-stone-900 hover:bg-stone-200 transition font-medium"
                >
                    Save
                </button>
            </div>
        </section>
    );
}

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert", "CCNA-level"];
import { v4 as uuidv4 } from "uuid";
import { nameChanger } from "../utils/upload";

type TechStackProps = {
    editableBox: string;
    changeBoxState: (k: string) => void;
    initial?: { data?: TechStack[] };
};


export function TechStackEditor({ editableBox, changeBoxState, initial }: Readonly<TechStackProps>) {
    // ====== Local list (grid source) ======
    const [items, setItems] = useState<TechStack[]>(() => initial?.data ?? []);

    // ====== Editor form state ======
    type FormState = TechStack & { iconFile?: File | null };
    const [form, setForm] = useState<FormState>({
        name: "",
        icon: "",
        level: "",
        id: "",
        fk: "",
        priority: undefined,
        iconFile: null
    });

    const getAll = async () => {
        const res = await fetch("/api/common/techStack", {
            method: "GET"
        });
        const response = await res.json();

        setItems(response.data)
    }

    useEffect(() => {
        getAll();
    }, [])

    // currently edited item id (null => create)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [mode, setMode] = useState<string>("create");

    // ====== Mode derived from editingId ======

    // ====== Ensure a client id in localStorage for new rows ======
    useEffect(() => {
        if (!localStorage.getItem("techStackId")) {
            localStorage.setItem("techStackId", uuidv4());
        }
    }, []);

    // ====== If you want to fetch latest from your front API on mount ======
    useEffect(() => {
        // if server sent initial, keep; otherwise fetch
        if (initial?.data?.length) return;
        void refresh();
    }, []);

    async function refresh() {
        try {
            const res = await fetch("/api/common/techStack", { method: "GET" });
            const json = await res.json();
            // assume { ok, data } shape; adjust if different
            setItems(Array.isArray(json?.data) ? json.data : []);
        } catch (e) {
            console.error("Fetch tech stacks failed", e);
        }
    }

    // ====== Helpers ======
    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const keyOf = (s: Partial<TechStack>) => (s as any)?._id ?? s.id ?? "";

    const resetInputs = () => {
        setForm({
            name: "",
            icon: "",
            level: "",
            id: "",
            fk: "",
            priority: undefined,
            iconFile: null
        });
        // next create will use a new local id
        localStorage.setItem("techStackId", uuidv4());
        localStorage.removeItem("techStackEditing");
    };

    const beginEdit = (s: TechStack) => {
        setMode("update");
        localStorage.setItem("techStackEditing", JSON.stringify(s));
        localStorage.setItem("techStackId", s._id as string);
        console.log(s.icon)
        setForm(s);

    };

    const remove = async (s: TechStack) => {
        try {
            const k = keyOf(s);
            if (!k) return;
            await fetch(`/api/common/socials/${encodeURIComponent(k)}`, { method: "DELETE" });
            setItems(prev => prev.filter(x => keyOf(x) !== k));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    // ====== Create/Update (conditional FormData only if file chosen) ======
    const handleSubmit = async () => {
        const persistedId = localStorage.getItem("techStackId");

        // build payload fields (id for create if empty)
        const base: TechStack = {
            id: mode === "create" ? uuidv4() : persistedId as string,
            fk: form.fk || "",
            name: form.name.trim(),
            level: form.level || "",
            icon: form.icon || "",
            priority: typeof form.priority === "number" ? form.priority : undefined
        };

        const url = mode === "create"
            ? "/api/common/techStack"
            : `/api/common/techStack/${encodeURIComponent(base.id)}`;
        const method = mode === "create" ? "POST" : "PUT";

        try {

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(base)
            });


            const json = await res.json();
            // assume backend returns the saved doc as json.data
            const saved: TechStack = json?.data ?? base;

            if (mode === "create") {
                setItems(prev => {
                    const exists = prev.some(p => p.id === saved._id);
                    return exists ? prev.map(p => (p.id === saved._id ? saved : p)) : [saved, ...prev];
                });
                // prepare for next create
            } else {
                setItems(prev => prev.map(p => (p.id === saved._id ? saved : p)));
            }

            resetInputs();
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            localStorage.removeItem("techStackId")
            localStorage.removeItem("techStackEditing")
        }
    };


    const onPickFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "cover" | "media" | "logo" | "icon" // pass field type from caller
    ) => {
        const f = e.target.files?.[0];
        if (!f) return;


        const fd = new FormData();
        fd.append("file", f);

        try {
            const desiredName = nameChanger(f, field);

            const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            const json = await res.json();
            const uploadedName = json?.data?.fileName || desiredName;

            // update your form (logo example)
            setForm(prev => ({
                ...prev,
                icon: uploadedName,
            }));
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    // ====== Visibility ======
    const showEditorRow = editableBox === "techstack";

    // ====== Sorted list for grid ======
    const sorted = useMemo(() => {
        const copy = [...items];
        copy.sort((a, b) => {
            const ap = typeof a.priority === "number" ? a.priority : -Infinity;
            const bp = typeof b.priority === "number" ? b.priority : -Infinity;
            if (ap !== bp) return bp - ap;
            return a.name.localeCompare(b.name);
        });
        return copy;
    }, [items]);

    // ====== JSX (unchanged HTML/styling, only handlers/values wired) ======
    return (
        <section className="group relative h-full overflow-y-auto isolate bg-[var(--layout-item-bg)] p-6 rounded-xl shadow-lg text-center overflow-hidden">
            <button
                onClick={() => changeBoxState("techstack")}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-sm transition"
            >
                ✏️ Edit
            </button>

            <h2 className="text-2xl md:text-5xl font-semibold text-white">Tech Stack</h2>

            {showEditorRow && (
                <div className="mt-6 flex flex-col lg:flex-row lg:flex-wrap lg:flex-start gap-3 items-stretch lg:items-end justify-center">
                    <div className="min-w-[220px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Name *</label>
                        <input
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g., Redux"
                            className="w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 py-2 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="min-w-[220px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Level</label>
                        <select
                            value={form.level}
                            onChange={(e) => set("level", e.target.value)}
                            className="w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 py-2 text-white"
                        >
                            <option value="" className="text-stone-900">— optional —</option>
                            {LEVELS.map(l => (
                                <option key={l} value={l} className="text-stone-900">{l}</option>
                            ))}
                        </select>
                    </div>

                    <div className="min-w-[220px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Icon URL</label>
                        <input
                            value={undefined as any} // keep DOM controlled-by-file input (avoid React warning)
                            type="file"
                            onChange={(e) => onPickFile(e, "icon")}
                            placeholder="https://…/icon.png"
                            className="w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 py-2 text-white placeholder:text-white/50"
                        />
                        {form.icon && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={`/api/media?url=${form.icon}`}
                                    alt="Preview"
                                    className="h-8 w-8 rounded object-cover border border-white/20"
                                />
                                <span className="text-xs text-white/70 truncate">{form.iconFile?.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="min-w-[140px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Priority</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={typeof form.priority === "number" ? form.priority : ("" as any)}
                            onChange={(e) => set("priority", e.target.value === "" ? undefined : Number(e.target.value))}
                            placeholder="e.g., 100"
                            className="w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 py-2 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex gap-2 justify-center lg:justify-start">
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition font-medium"
                        >
                            {mode === "update" ? "Save" : "Add"}
                        </button>
                        {mode === "update" && (
                            <button
                                onClick={resetInputs}
                                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sorted.length === 0 ? (
                    <div className="col-span-full rounded-lg border border-dashed border-white/20 bg-white/5 text-white/60 py-8">
                        No skills yet {showEditorRow ? "— add your first one above." : ""}
                    </div>
                ) : (
                    sorted.map((s) => (
                        <div
                            key={s.id || s.name}
                            className="relative mx-auto inline-flex h-12 w-36 sm:w-40 items-center justify-center rounded-full border-2 border-white/80 text-white/90"
                        >
                            {s.icon ? (
                                <span className="mr-2 inline-flex h-4 w-4 overflow-hidden rounded">
                                    <img src={s.icon} alt="" className="h-full w-full object-cover" />
                                </span>
                            ) : null}

                            <div className="leading-tight text-center">
                                <div className="font-medium tracking-wide">{s.name}</div>
                                {s.level && (
                                    <div className="text-[11px] sm:text-xs text-white/70">{s.level}</div>
                                )}
                            </div>

                            {showEditorRow && (
                                <div className="absolute -top-2 -right-2 flex gap-1">
                                    <button
                                        onClick={() => beginEdit(s)}
                                        className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.preventDefault(); remove(s); }}
                                        className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}

type SocialsProps = {
    editableBox: string;
    changeBoxState: (name: string) => void;
    initial?: Social;   // optional initial dataset
};

export function SocialsEditor({ editableBox, changeBoxState, initial }: SocialsProps) {
    // ====== Local list (grid source) ======
    const [items, setItems] = useState<Social[]>(() => {
        // support initial being undefined, a single Social, or an array
        if (!initial) return [];
        if (Array.isArray(initial)) return initial;
        if (Array.isArray((initial as any).data)) return (initial as any).data;
        return [];
    });

    // keep fk optional since you use it in state even if Social doesn't define it
    type FormState = Social & { fk?: string };

    // ====== Editor form state ======
    const [form, setForm] = useState<FormState>({
        platform: "",
        icon: "",
        url: "",
        size: undefined,
        priority: undefined,
        id: "",
        fk: "",
    });

    const getAll = async () => {
        const res = await fetch("/api/common/socials", { method: "GET" });
        const response = await res.json();
        setItems(response.data);
    };

    useEffect(() => {
        getAll();
    }, []);

    // currently edited item id (null => create)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [mode, setMode] = useState<string>("create");

    // ====== Ensure a client id in localStorage for new rows ======
    useEffect(() => {
        if (!localStorage.getItem("socialsId")) {
            localStorage.setItem("socialsId", uuidv4());
        }
    }, []);


    // ====== Helpers ======
    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const keyOf = (s: Partial<Social>) => (s as any)?._id ?? s.id ?? "";

    const resetInputs = () => {
        setForm({
            platform: "",
            url: "",
            icon: "",
            id: "",
            fk: "",
            size: undefined,
            priority: undefined,
        });
        localStorage.setItem("socialsId", uuidv4());
        localStorage.removeItem("socialsEditing");
        setMode("create");
        setEditingId(null);
    };

    const beginEdit = (s: Social) => {
        setMode("update");
        localStorage.setItem("socialsEditing", JSON.stringify(s));
        localStorage.setItem("socialsId", s._id as string);
        console.log(s.icon)
        setForm(s);
    };

    const remove = async (s: Social) => {
        try {
            const k = keyOf(s);
            if (!k) return;
            await fetch(`/api/common/socials/${encodeURIComponent(k)}`, { method: "DELETE" });
            setItems(prev => prev.filter(x => keyOf(x) !== k));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    // ====== Create/Update (JSON) ======
    const handleSubmit = async () => {
        const persistedId = localStorage.getItem("socialsId");
        const idForUpdate = editingId || keyOf(form) || "";

        const base: Social & { fk?: string } = {
            id: mode === "create" ? (uuidv4()) : (persistedId as string) || idForUpdate,
            fk: form.fk || "",
            platform: form.platform.trim(),
            url: (form.url || "").trim(),
            icon: form.icon || "",
            size: typeof form.size === "number" ? form.size : undefined,
            priority: typeof form.priority === "number" ? form.priority : undefined,
        };

        const url = mode === "create"
            ? "/api/common/socials"
            : `/api/common/socials/${encodeURIComponent(base.id as string)}`;
        const method = mode === "create" ? "POST" : "PUT";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(base),
            });

            const json = await res.json();
            const saved: Social = json?.data;

            setItems(prev => {
                const list = Array.isArray(prev) ? prev : [];       // guard
                const savedId = (saved as any)._id ?? saved.id;     // support _id or id
                return [...list.filter(p => ((p as any)._id ?? p.id) !== savedId), saved];
            });

            resetInputs();
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            localStorage.removeItem("socialsId");
            localStorage.removeItem("socialsEditing");
        }
    };

    const [file, setFile] = useState<File | null>(null);

    const onPickFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "cover" | "media" | "logo" | "icon"
    ) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setFile(f);

        const fd = new FormData();
        fd.append("file", f);

        try {
            const desiredName = nameChanger(f, field);
            const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            const json = await res.json();
            const uploadedName = json?.data?.fileName || desiredName;

            setForm(prev => ({ ...prev, icon: uploadedName }));
        } catch (err) {
            console.error("Upload error:", err);
        }
    };

    // local safe URL check (avoid runtime if isUrl isn’t globally defined)
    const isHttpUrl = (v?: string) => !!v && /^https?:\/\//i.test(v);

    // ====== Visibility ======
    const showEditorRow = editableBox === "socials";

    // ====== Sorted list for grid ======
    const sorted = useMemo(() => {
        if (!Array.isArray(items)) return [];
        const copy = [...items];
        copy.sort((a, b) => {
            const ap = a.priority ?? -Infinity;
            const bp = b.priority ?? -Infinity;
            if (ap !== bp) return bp - ap;
            return a.platform.localeCompare(b.platform);
        });
        return copy;
    }, [items]);

    return (
        <section className="relative h-35 overflow-y-auto flex flex-col items-center bg-[var(--layout-item-bg)] p-10 border rounded">
            <button
                onClick={() => changeBoxState("socials")}
                className="absolute -top-7 right-0 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
            >
                ✏️ Edit Socials
            </button>

            <h2 className="sr-only">Socials</h2>

            {showEditorRow && (
                <div className="w-full mt-4 flex flex-wrap items-end justify-center gap-3">
                    <div className="flex-1 min-w-[180px] max-w-[240px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Platform *</label>
                        <input
                            value={form.platform}
                            onChange={(e) => set("platform", e.target.value)}
                            placeholder="LinkedIn"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-1 min-w-[240px] max-w-[360px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Icon</label>
                        <input
                            type="file"
                            value={undefined as any}
                            onChange={(e) => onPickFile(e, "icon")}
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                        {form.icon && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={`/api/media?url=${form.icon}`}
                                    alt="Preview"
                                    className="h-8 w-8 rounded object-cover border border-white/20"
                                />
                                <span className="text-xs text-white/70 truncate">{form.icon}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-[2] min-w-[260px] max-w-[520px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Profile URL *</label>
                        <input
                            value={form.url}
                            onChange={(e) => set("url", e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-1 min-w-[110px] max-w-[140px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Priority</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={form.priority ?? ""}
                            onChange={(e) => set("priority", e.target.value === "" ? undefined as any : Number(e.target.value))}
                            placeholder="e.g., 100"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-none">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmit}
                                className="h-10 px-4 rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition font-medium"
                            >
                                {mode === "update" ? "Save" : "Add"}
                            </button>
                            {mode === "update" && (
                                <button
                                    onClick={resetInputs}
                                    className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {items?.length === 0 ? (
                    <div className="w-full max-w-3xl rounded-lg border border-dashed border-white/20 bg-white/5 text-white/60 py-6 text-center">
                        No socials yet {showEditorRow ? "— add your first one above." : ""}
                    </div>
                ) : (
                    sorted.map((s, idx) => {
                        const box = Math.max(40, s.size ?? 60);
                        return (
                            <a
                                key={`${s.platform}-${idx}`}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative grid place-items-center rounded-md hover:scale-[1.02] transition"
                                style={{ width: box + 8, height: box + 8 }}
                            >
                                <div
                                    className="h-full w-full rounded-md bg-[var(--layout-item-bg)] shadow p-2 grid place-items-center"
                                    title={s.platform}
                                >
                                    {isHttpUrl(s.icon) ? (
                                        <img
                                            src={s.icon}
                                            alt={s.platform}
                                            className="h-full w-full object-contain"
                                            style={{ filter: "invert(1) brightness(2) contrast(0.8)" }}
                                        />
                                    ) : (
                                        <span className="text-white font-semibold" style={{ fontSize: box * 0.38 }}>
                                            {s.platform?.[0]?.toUpperCase() ?? "?"}
                                        </span>
                                    )}
                                </div>

                                {showEditorRow && (
                                    <div className="absolute -top-2 -right-2 flex gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); beginEdit(s); }}
                                            className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); remove(s); }}
                                            className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                            title="Delete"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                            </a>
                        );
                    })
                )}
            </div>
        </section>
    );
}



type ContactsProps = {
    editableBox: string;
    changeBoxState: (name: string) => void;
    initial?: Contact;
};



export function ContactsEditor({
    editableBox,
    changeBoxState,
    initial,
}: ContactsProps) {
    // ====== Local list (grid source) ======
    const [items, setItems] = useState<Contact[]>(() => {
        // support initial being undefined, an array, or an object with data/contacts
        if (!initial) return [];
        if (Array.isArray(initial)) return initial as Contact[];
        if (Array.isArray((initial as any).data)) return (initial as any).data as Contact[];
        if (Array.isArray((initial as any).contacts)) return (initial as any).contacts as Contact[];
        return [];
    });

    // keep fk optional since you may include it in state even if not on Contact
    type FormState = Contact & { fk?: string };

    // ====== Editor form state ======
    const [form, setForm] = useState<FormState>({
        label: "",
        value: "",
        icon: "",
        priority: "",
        id: "",
        fk: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [mode, setMode] = useState<string>("create");

    // ====== Ensure a client id in localStorage for new rows ======
    useEffect(() => {
        if (!localStorage.getItem("contactsId")) {
            localStorage.setItem("contactsId", uuidv4());
        }
    }, []);

    // ====== Fetch all on mount ======
    const getAll = async () => {
        try {
            const res = await fetch("/api/common/contacts", { method: "GET", cache: "no-store" });
            const json = await res.json();
            setItems(Array.isArray(json?.data) ? json.data : []);
        } catch (e) {
            console.error("Fetch contacts failed", e);
            setItems([]);
        }
    };

    useEffect(() => {
        getAll();
    }, []);

    // ====== Helpers ======
    const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
        setForm(prev => ({ ...prev, [k]: v }));

    const keyOf = (s: Partial<Contact>) => (s as any)?._id ?? s.id ?? "";

    const resetInputs = () => {
        setForm({
            label: "",
            value: "",
            icon: "",
            priority: "",
            id: "",
            fk: "",
        });
        localStorage.setItem("contactsId", uuidv4());
        localStorage.removeItem("contactsEditing");
        setMode("create");
        setEditingId(null);
    };

    const beginEdit = (s: Contact) => {
        setMode("update");
        const k = keyOf(s);
        if (k) {
            localStorage.setItem("contactsId", k);
        }
        localStorage.setItem("contactsEditing", JSON.stringify(s));
        setEditingId(k || null);
        setForm({
            label: s.label,
            value: s.value,
            icon: s.icon ?? "",
            priority: s.priority ?? "",
            id: s.id ?? "",
            fk: (s as any).fk ?? "",
            // keep _id if present (silent)
            ...(("_id" in (s as any)) ? { _id: (s as any)._id } as any : {}),
        } as any);
    };

    const remove = async (s: Contact) => {
        try {
            const k = keyOf(s);
            if (!k) return;
            await fetch(`/api/common/contacts/${encodeURIComponent(k)}`, { method: "DELETE" });
            setItems(prev => prev.filter(x => ((x as any)._id ?? x.id) !== k));
            // if we were editing this one, reset
            if (editingId === k) resetInputs();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    // ====== Create/Update (JSON) ======
    const handleSubmit = async () => {
        const persistedId = localStorage.getItem("contactsId");
        const idForUpdate = editingId || keyOf(form) || "";

        const base: Contact & { fk?: string } = {
            id: mode === "create" ? uuidv4() : (persistedId as string) || idForUpdate,
            fk: form.fk || "",
            label: form.label.trim(),
            value: form.value.trim(),
            icon: form.icon || "",
            // priority is a string in your interface; keep as-is (trim optional)
            priority: (form.priority ?? "").toString().trim(),
        };

        const url = mode === "create"
            ? "/api/common/contacts"
            : `/api/common/contacts/${encodeURIComponent(base.id as string)}`;
        const method = mode === "create" ? "POST" : "PUT";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(base),
            });

            const json = await res.json();
            const saved: Contact = json?.data ?? base;

            // simple replace-or-append (id/_id-safe)
            setItems(prev => {
                const list = Array.isArray(prev) ? prev : [];
                const savedId = (saved as any)._id ?? saved.id;
                return [...list.filter(p => ((p as any)._id ?? p.id) !== savedId), saved];
            });

            resetInputs();
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            localStorage.removeItem("contactsId");
            localStorage.removeItem("contactsEditing");
        }
    };

    // ====== icon upload (optional; sets form.icon) ======
    const [file, setFile] = useState<File | null>(null);

    const onPickFile = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "icon"
    ) => {
        const f = e.target.files?.[0];
        if (!f) return;

        setFile(f);

        const fd = new FormData();
        fd.append("file", f);

        try {
            // if you have a global helper like nameChanger(f, field), use it.
            const desiredName = `${(form.label || "contact")
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "")}-${Date.now()}.${f.name.split(".").pop() || "png"}`;

            const res = await fetch(`/api/upload?filename=${encodeURIComponent(desiredName)}`, {
                method: "POST",
                body: fd,
            });

            if (!res.ok) throw new Error(`Upload failed (${res.status})`);

            const json = await res.json();
            const uploadedName = json?.data?.fileName || desiredName;

            setForm(prev => ({ ...prev, icon: uploadedName }));
        } catch (err) {
            console.error("Upload error:", err);
        } finally {
            (e.target as HTMLInputElement).value = "";
        }
    };

    // ====== Visibility ======
    const showEditorRow = editableBox === "contacts";

    // ====== Render copy ======
    const contacts = useMemo(() => (Array.isArray(items) ? [...items] : []), [items]);

    return (
        <section className="relative h-full w-200 overflow-y-auto bg-[var(--layout-item-bg)] p-6 px-30 space-y-8 pb-8 rounded-xl shadow-lg text-center text-white">
            <button
                onClick={() => changeBoxState("contacts")}
                className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
            >
                ✏️ Edit
            </button>

            <h2 className="text-5xl font-semibold">Fatih Etlik</h2>

            {showEditorRow && (
                <div className="mt-2 flex flex-wrap items-end justify-center gap-3 gap-y-4">
                    <div className="flex-1 w-full">
                        <label className="block text-left text-white/80 text-sm mb-1">Label *</label>
                        <input
                            value={form.label}
                            onChange={(e) => set("label", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="Phone / Email / Location"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-[2] min-w-[260px] max-w-[520px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Value *</label>
                        <input
                            value={form.value}
                            onChange={(e) => set("value", e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            placeholder="+90 531 496 31 69 / fatihe307@gmail.com / Istanbul, Türkiye"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-1 min-w-[220px] max-w-[360px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Icon (optional)</label>
                        <input
                            type="file"
                            value={undefined as any}
                            onChange={(e) => onPickFile(e, "icon")}
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                        {form.icon && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={`/api/media?url=${form.icon}`}
                                    alt="Preview"
                                    className="h-8 w-8 rounded object-cover border border-white/20"
                                />
                                <span className="text-xs text-white/70 truncate">{form.icon}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-[110px] max-w-[180px]">
                        <label className="block text-left text-white/80 text-sm mb-1">Priority (optional)</label>
                        <input
                            value={form.priority ?? ""}
                            onChange={(e) => set("priority", e.target.value)}
                            placeholder="e.g., 100"
                            className="h-10 w-full rounded-lg bg-white/10 border border-white/15 focus:border-white/30 outline-none px-3 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="flex-none">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSubmit}
                                className="h-10 px-4 rounded-lg bg-white text-stone-900 hover:bg-stone-200 transition font-medium"
                            >
                                {mode === "update" ? "Save" : "Add"}
                            </button>
                            {mode === "update" && (
                                <button
                                    onClick={resetInputs}
                                    className="h-10 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-2 space-y-6">
                {contacts.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-white/20 bg-white/5 text-white/60 py-6">
                        No contacts yet {showEditorRow ? "— add your first one above." : ""}
                    </div>
                ) : (
                    contacts.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="relative flex gap-x-5 justify-center md:justify-start">
                            {item.icon ? (
                                <span className="hidden sm:inline-flex h-6 w-6 mt-1">
                                    <img src={item.icon} alt="" className="h-6 w-6 object-contain invert" />
                                </span>
                            ) : null}

                            <p className="mt-0 flex gap-x-5">
                                <span className="font-medium text-2xl">{item.label}</span>
                                <span className="text-stone-300 text-xl">{item.value}</span>
                            </p>

                            {showEditorRow && (
                                <div className="absolute -top-2 -right-2 flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => beginEdit(item)}
                                        className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(item)}
                                        className="h-6 w-6 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xs"
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}