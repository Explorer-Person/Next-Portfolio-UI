// normalize “fancy dashes” → hyphen-minus
function normalizeId(s: string) {
    return s
        .trim()
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-"); // hyphens/en-dash/em-dash/minus
}

const isHex24 = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);
const isNumeric = (s: string) => /^[0-9]+$/.test(s);
const isUUIDStrict = (s: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
// very tolerant UUID-like check: 8-4-4-4-12 hex-ish
const isUUIDLoose = (s: string) => {
    const parts = s.split("-");
    if (parts.length !== 5) return false;
    const lens = [8, 4, 4, 4, 12];
    return parts.every((p, i) => p.length === lens[i] && /^[0-9a-f]+$/i.test(p));
};

type Mode = "id" | "slug";

export function detectMode(raw: string, forced?: Mode): Mode {
    if (forced) return forced;
    const s = normalizeId(raw);
    if (isHex24(s) || isNumeric(s) || isUUIDStrict(s) || isUUIDLoose(s)) return "id";
    return "slug";
}