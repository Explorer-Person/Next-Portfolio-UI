// utils/socials.ts
import {
    FaFacebook, FaInstagram, FaLinkedin, FaTwitter,
    FaGithub, FaYoutube, FaTelegram, FaGlobe,
    FaEnvelope,
    FaPhoneAlt,
    FaWhatsapp,
    FaMapMarkerAlt
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { SiTiktok } from "react-icons/si";

type Social = {
    id?: string;
    label?: string;
    icon?: string;     // server-stored key ("instagram" | "website" | ...)
    name?: string;
    value?: string;    // username or full URL
    href?: string;
    platform?: string;    // full URL
};

export type Platform =
    | "linkedin" | "instagram" | "facebook" | "twitter" | "github"
    | "youtube" | "telegram" | "website" | "email" | "phone"
    | "whatsapp" | "tiktok" | "location";

export const PLATFORM: Record<Platform, { Icon: IconType }> = {
    linkedin: { Icon: FaLinkedin },
    instagram: { Icon: FaInstagram },
    facebook: { Icon: FaFacebook },
    twitter: { Icon: FaTwitter },   // use FaXTwitter (fa6) if you prefer the X logo
    github: { Icon: FaGithub },
    youtube: { Icon: FaYoutube },
    telegram: { Icon: FaTelegram },
    website: { Icon: FaGlobe },
    email: { Icon: FaEnvelope },
    phone: { Icon: FaPhoneAlt },
    whatsapp: { Icon: FaWhatsapp },
    tiktok: { Icon: SiTiktok },
    location: { Icon: FaMapMarkerAlt },
};



export function toHref(s: Social, p: Platform): string {
    const raw = (s.href || s.value || "").trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    const handle = raw.replace(/^@/, "");
    switch (p) {
        case "instagram": return `https://instagram.com/${handle}`;
        case "linkedin": return `https://linkedin.com/in/${handle}`;
        case "facebook": return `https://facebook.com/${handle}`;
        case "twitter": return `https://x.com/${handle}`;
        case "github": return `https://github.com/${handle}`;
        case "youtube": return `https://youtube.com/${handle}`;
        case "telegram": return `https://t.me/${handle}`;
        default: return raw || "#";
    }
}
