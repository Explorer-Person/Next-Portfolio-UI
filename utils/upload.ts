/* eslint-disable @typescript-eslint/no-explicit-any */
export async function uploadViaProxy(
    bucket: string,
    file: File,
    opts?: { filename?: string; subdir?: string; extra?: Record<string, string | Blob> }
): Promise<any> {
    const params = new URLSearchParams();
    if (opts?.filename) params.set("filename", opts.filename);
    if (opts?.subdir) params.set("subdir", opts.subdir);

    const fd = new FormData();
    fd.append("image", file);
    if (opts?.extra) {
        for (const [k, v] of Object.entries(opts.extra)) fd.append(k, v);
    }

    const res = await fetch(`/api/upload/${encodeURIComponent(bucket)}?${params.toString()}`, {
        method: "POST",
        body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
    return data;
}


// Helpers
export const nameChanger = (file: File, field: string) => {
    const inferExt = (file: File): string => {
        // Try MIME first, then filename
        const mimeExt = file.type.split("/")[1]?.toLowerCase() || "";
        if (mimeExt) return mimeExt === "jpeg" ? "jpg" : mimeExt;
        const nameExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        return nameExt === "jpeg" ? "jpg" : nameExt;
    };
    // pick a safe, descriptive filename to send to the handler
    const ext = inferExt(file);
    const desiredName = `${field}-${Date.now()}.${ext}`; // e.g., cover-1712782194.jpg / media-....mp4


    return desiredName
}



