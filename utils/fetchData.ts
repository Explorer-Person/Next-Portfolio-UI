// fetchData.ts
export type ApiOk<T> = { ok: true; data: T; message?: string };
export type ApiErr = { ok: false; error?: string; message?: string };
export type ApiResp<T> = ApiOk<T> | ApiErr;

export async function fetchData<T>(
    sectionName: string,
    setData: React.Dispatch<React.SetStateAction<T>>,
    signal?: AbortSignal
): Promise<T> {
    const res = await fetch(`/api/common/${sectionName}`, {
        method: "GET",
        signal,
        headers: { Accept: "application/json" },
        credentials: "include",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`GET /api/${sectionName}/get failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as ApiResp<T>;
    if (!("ok" in json) || json.ok !== true) {
        throw new Error((json as ApiErr).error || (json as ApiErr).message || "Unknown API error");
    }

    const raw = json.data; // unknown

    if(json.message)
    console.log(`Fetched":`, json.message, raw);


    const needsFirst = sectionName === "hero" || sectionName === "profileImage";

    let value: T;
    if (needsFirst) {
        if (Array.isArray(raw)) {
            value = (raw[0] as unknown) as T;
        } else {
            throw new Error(`Expected array data for "${sectionName}", got ${typeof raw}`);
        }
    } else {
        value = raw as T;
    }


    setData(value);   // ✅ set once, correctly typed
    return value;         // ✅ set state inside the helper
}
