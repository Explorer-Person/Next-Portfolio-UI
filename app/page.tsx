/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ContactsEditor, SocialsEditor } from "./editable";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import ProfileImageEditor, { HeroEditor, TechStackEditor } from "./editable";
import { Blog, Contact, Contribution, Hero, ProfileImage, Project, Qualification, Social, TechStack } from "@/datas/interfaces";
import { fetchData } from "../utils/fetchData";
import { PLATFORM, toHref } from "../utils/icon";
import { title } from "process";


export default function Home() {
  const { isAuthed } = useAuth();
  const [editableBox, setEditableBox] = useState('');
  const changeBoxState = (boxName: string) => {
    if (!isAuthed) return; // block toggling if not logged in
    setEditableBox(boxName);
  };

  return (
    <div className="relative font-sans min-h-screen py-16 text-stone-900 flex flex-col items-center">
      {/* Top Two-Column Grid */}
      <div className="gap-12 w-[90%]">
        <div className="relative mb-18 flex gap-8 h-[450px]">
          <div className="h-full w-[60%]">
            {isAuthed && editableBox === "hero"
              ? <HeroEditor />
              : <HeroBox canEdit={isAuthed} editableBox="hero" changeBoxState={changeBoxState} />}
          </div>

          <div className="relative h-full w-[40%]">
            {isAuthed && editableBox === "profileimage"
              ? <ProfileImageEditor initial={undefined} />
              : <ProfileImageBox canEdit={isAuthed} editableBox="profileimage" changeBoxState={changeBoxState} />}


          </div>
        </div>

        <div className="relative mt-5 flex h-[300px] gap-8 items-center">
          <div className="relative h-full w-full">
            {isAuthed && editableBox === "techstack"
              ? <TechStackEditor editableBox="techstack" changeBoxState={changeBoxState} />
              : <TechStackBox canEdit={isAuthed} editableBox="techstack" changeBoxState={changeBoxState} />}
          </div>

          <div className="relative h-full w-full flex flex-col justify-center">
            <div className="relative h-full">
              <div className="relative h-full">
                {isAuthed && editableBox === "contacts"
                  ? <ContactsEditor editableBox="contacts" changeBoxState={changeBoxState} />
                  : <ContactsBox canEdit={isAuthed} editableBox="contacts" changeBoxState={changeBoxState} />}
                <div className="h-20 absolute bottom-0 text-center w-[100%]">
                  {isAuthed && editableBox === "socials"
                    ? <SocialsEditor editableBox="socials" changeBoxState={changeBoxState} />
                    : editableBox === "contacts" ? <div /> : <SocialsBox canEdit={isAuthed} editableBox="socials" changeBoxState={changeBoxState} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Sections Below */}
      <div className="relative mt-25 space-y-16 flex flex-col gap-12 w-[90%]">
        <div>
          <WhyMeBox />
        </div>
        <div>
          <QualificationsBox canEdit={isAuthed} />
        </div>
        <div>
          <ContributionsBox canEdit={isAuthed} editableBox="contributions" changeBoxState={changeBoxState} />
        </div>
        <div>
          <ProjectsBox canEdit={isAuthed} editableBox="projects" changeBoxState={changeBoxState} />
        </div>
        <div>
          <BlogsBox canEdit={isAuthed} editableBox="blogs" changeBoxState={changeBoxState} />
        </div>
        <div>
          <ContactUs />
        </div>
      </div>
    </div>

  );
}


export type StateProps = {
  editableBox: string;
  changeBoxState: (boxName: string) => void;
  canEdit?: boolean; // optional prop to control editability
};



function HeroBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [heroText, setHeroText] = useState<Hero>();

  useEffect(() => {
    fetchData("hero", setHeroText);
  }, []);

  const heroTexts = {
    title: heroText?.title,
    desc: heroText?.desc,
  }

  return (
    <section className="relative bg-[url('/heroback.webp')] p-10 rounded-xl shadow-lg text-center lg:text-left h-full">
      {/* Floating Edit Button */}
      {
        canEdit && (
          <button
            onClick={() => changeBoxState(editableBox)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 transition"
          >
            ✏️ Edit Hero
          </button>
        )
      }

      <h1 className="text-2xl md:text-5xl mb-20 font-boldleading-snug">
        {heroTexts.title}
      </h1>
      <p className="mt-4 text-sm md:text-xl leading-relaxed">
        {heroTexts.desc}
      </p>
    </section>
  );
}




function TechStackBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData("techStack", setTechStack);
  }, []);

  // --- Accurate overflow check
  const measure = () => {
    const el = gridRef.current;
    if (!el) return;
    // scrollHeight includes hidden content; clientHeight is the visible height (with max-h)
    const overflow = el.scrollHeight - el.clientHeight > 1;
    setCanExpand(overflow);
  };

  // Measure after techStack changes, after DOM paints
  useLayoutEffect(() => {
    // next frame => styles (max-h classes) are applied
    const raf = requestAnimationFrame(() => {
      measure();

      // if there are images, wait for last one (images can change height)
      const el = gridRef.current;
      if (!el) return;

      const imgs = Array.from(el.querySelectorAll("img"));
      if (imgs.length === 0) return;

      let pending = 0;
      const done = () => {
        pending--;
        if (pending <= 0) measure();
      };

      imgs.forEach((img) => {
        // Already loaded
        if ((img as HTMLImageElement).complete) return;
        pending++;
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });

      // If none pending, nothing happens; if some pending, measure() will run at the end.
    });

    return () => cancelAnimationFrame(raf);
  }, [techStack, expanded]); // re-check also when user toggles expanded

  // Recalculate on resize and grid size changes
  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    let ro: ResizeObserver | undefined;
    if ("ResizeObserver" in window && gridRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(gridRef.current);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
    };
  }, []);

  return (
    <section className="group relative h-full isolate bg-[url('/techback.jpg')] p-6 rounded-xl shadow-lg text-center overflow-hidden">
      {/* Floating Edit Button */}
      {canEdit && (
        <button
          onClick={() => changeBoxState(editableBox)}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
        >
          ✏️ Edit Tech Stack
        </button>
      )}

      <h2 className="text-2xl md:text-5xl font-semibold text-white">Tech Stack</h2>

      {/* Pills */}
      <div
        ref={gridRef}
        className={[
          "relative z-0 mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-hidden",
          expanded ? "max-h-[999px] pb-7" : "max-h-[140px] sm:max-h-[164px] pb-7",
        ].join(" ")}
      >
        {techStack.map((s) => (
          <div
            key={s.name}
            className="mx-auto inline-flex h-10 sm:h-20 w-28 sm:w-[180px] items-center justify-center rounded-full border-2 border-white/80 text-white/90 transition hover:border-white hover:bg-white/5"
          >
            <div className="relative mx-auto inline-flex items-center justify-center rounded-full text-white/90">
              <span className="mr-2 inline-flex h-8 w-8 overflow-hidden rounded flex items-center justify-center">
                <img
                  src={`/api/media?url=${s.icon}`}
                  alt={`${s.name} icon`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </span>
              <div>
                <div className="mt-2 text-xl tracking-wide">{s.name}</div>
                <div className="text-md sm:text-md text-white/70">{s.level}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom solid block (only when collapsed AND overflow exists) */}
      {!expanded && canExpand && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[var(--background)] z-30" />
      )}

      {/* Fade effect (only when collapsed AND overflow exists) */}
      {!expanded && canExpand && (
        <div className="pointer-events-none absolute inset-x-0 bottom-7 h-16 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/95 to-transparent z-40" />
      )}

      {/* More / Show less (only if overflow exists) */}
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="absolute inset-x-0 bottom-0 h-7 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-[var(--background)] text-black text-xs font-medium cursor-pointer transition-all duration-200 z-40"
        >
          {expanded ? "Show less" : "More"}
        </button>
      )}
    </section>
  );
}



function ProfileImageBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [profileImage, setProfileImage] = useState<ProfileImage>();

  useEffect(() => {
    fetchData("profileImage", setProfileImage); // ✅ await the promise
  }, []);

  return (
    <section className="relative rounded-xl overflow-hidden shadow-lg h-full w-full bg-[var(--layout-item-bg)]">
      <img
        src={`/api/media?url=${profileImage?.src}`} // Replace with your actual image path
        alt="Fatih Etlik"
        className="object-cover w-full h-full"
      />

      {/* Floating Badge */}
      {
        canEdit && (
          <button
            onClick={() => changeBoxState(editableBox)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Profile Image
          </button>
        )
      }

    </section>
  );
}





function SocialsBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [socials, setSocials] = useState<Social[]>();

  useEffect(() => {
    fetchData("socials", setSocials); // unchanged
  }, []);

  return (
    <section className="relative flex flex-wrap gap-3 justify-center bg-transparent">
      {/* Floating Edit Badge */}
      {canEdit && (
        <button
          onClick={() => changeBoxState(editableBox)}
          className="absolute right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 rounded-full text-sm font-medium backdrop-blur-sm transition"
        >
          ✏️ Edit Socials
        </button>
      )}

      {socials?.map((s, idx) => {
        const { Icon } = PLATFORM[s.platform as unknown as keyof typeof PLATFORM] || PLATFORM.website;
        const href = s.url || toHref(s, s.platform as unknown as keyof typeof PLATFORM);

        return (
          <a
            key={s.id ?? `${s.platform}-${idx}`}
            href={href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.platform}
            title={s.platform}
            className="bg-stone-600 p-3 rounded-md text-stone-50 hover:bg-stone-700 hover:text-white transition inline-flex"
          >
            <Icon size={28} />
          </a>
        );
      })}

      {/* Optional: simple placeholders while loading */}
      {(!socials || socials.length === 0) && (
        <>
          <span className="bg-[var(--layout-item-bg)] p-3 rounded-md w-10 h-10 animate-pulse" />
          <span className="bg-[var(--layout-item-bg)] p-3 rounded-md w-10 h-10 animate-pulse" />
          <span className="bg-[var(--layout-item-bg)] p-3 rounded-md w-10 h-10 animate-pulse" />
        </>
      )}
    </section>
  );
}



function ContactsBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [contacts, setContacts] = useState<Contact[]>();

  useEffect(() => {
    fetchData("contacts", setContacts); // ✅ await the promise
  }, []);



  return (
    <section className="relative h-full bg-[url('/addressback.jpeg')] p-6 px-30 space-y-8 pb-8 rounded-xl shadow-lg text-center">
      {/* Floating Edit Badge */}
      {
        canEdit && (
          <button
            onClick={() => changeBoxState(editableBox)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Contacts
          </button>
        )
      }

      {/* Editable Box */}


      <h2 className="text-5xl font-semibold">Fatih Etlik</h2>

      {contacts?.map((item) => {
        // prefer explicit platform, then icon; fallback to "website"
        const { Icon } = PLATFORM[item.label.toLowerCase() as unknown as keyof typeof PLATFORM] || PLATFORM.website;

        return (
          <div
            key={item.id ?? `${item.label}-${item.value}`}
            className="flex items-center justify-center gap-4"
          >
            <Icon size={28} />
            <span className="text-lg break-all">{item.value}</span>
          </div>
        );
      })}


    </section>
  );
}

function QualificationsBox({ canEdit }: { canEdit?: boolean }) {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchData("qualifications", setQualifications); // ✅ await the promise
  }, []);


  const certs = qualifications.filter((el) => el.type === "cert");
  const edus = qualifications.filter((el) => el.type === "edu");

  const toUpdate = (id: string) => {
    router.push(`/qualifications/update/${id}`)
  }
  const toDelete = async (id: string) => {
    const res = await fetch(`/api/qualifications/delete/${id}`, {
      method: "DELETE"
    });

    const data = await res.json(); // optional, if your API returns confirmation
    console.log(data);

    setQualifications(prev => prev.filter(q => q.id !== id));
  };


  return (
    <section className="relative h-full bg-[url('/qualback.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-white/70" aria-hidden="true" />
      <div className="relative w-[100%] overflow-hidden rounded-2xl shadow-lg">
        {/* Floating Edit Badge */}
        {
          canEdit && (
            <button
              onClick={() => router.push("/qualifications/create")}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
            >
              ✏️ Add Qualification
            </button>
          )
        }

        {/* Title */}
        <h2 className="px-6 pt-8 text-center text-2xl md:text-5xl font-semibold text-black">
          Certifications & Education
        </h2>

        {/* Content */}
        <div className="grid gap-8 px-6 pb-10 pt-12 md:flex md:gap-12 md:px-12">
          {/* Left — Certifications */}
          <div className="flex w-[100%] flex-col items-center gap-6 md:justify-self-end">
            {certs.map((item) => (
              <div key={item.title} className="flex items-center justify-center w-[100%] gap-4">
                <div className="grid relative group h-14 w-14 place-items-center rounded-xl bg-black/90 shadow">
                  <div className="absolute top-0 right-5 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      className="px-2 py-1 text-xs rounded bg-black/80 hover:bg-black text-stone-200 shadow"
                      onClick={() => toUpdate(item._id as string)}
                    >
                      ✏️
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-rose-500/80 hover:bg-rose-600 text-white shadow"
                      onClick={() => toDelete(item._id as string)}
                    >
                      🗑️
                    </button>
                  </div>
                  {item.logo ? (
                    <Image
                      src={`/api/media?url=${item.logo}`}
                      alt={item.org as string}
                      width={56}
                      height={56}
                      className="object-contain p-1"
                    />
                  ) : (
                    <BadgeIcon />
                  )}
                </div>

                <div className="text-black">
                  <div className="text-base md:text-lg font-semibold leading-tight">
                    {item.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm text-black/80">
                    <span>{item.org}</span>
                    <span>•</span>
                    <span>{item.year}</span>
                    {item.url && (
                      <Link
                        href={item.url}
                        className="group inline-flex items-center gap-1 text-black/90 hover:text-black"
                      >
                        View More <ArrowSm />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Right — Education */}
          <div className="flex w-[75%] shadow-lg bg-white/50 rounded-xl py-3 flex-col items-center gap-6 md:justify-self-start">
            {edus.map((item) => (
              <div key={item.title} className="flex w-[100%] justify-center items-center gap-4">
                <div className="relative group h-14 w-14 rounded-full bg-white/95 shadow">

                  {
                    canEdit && (
                      <div className="absolute top-0 right-5 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          className="px-2 py-1 text-xs rounded bg-black/80 hover:bg-black text-stone-200 shadow"
                          onClick={() => toUpdate(item._id as string)}
                        >
                          ✏️
                        </button>
                        <button
                          className="px-2 py-1 text-xs rounded bg-rose-500/80 hover:bg-rose-600 text-white shadow"
                          onClick={() => toDelete(item._id as string)}
                        >
                          🗑️
                        </button>
                      </div>
                    )
                  }

                  {item.logo ? (
                    <Image src={`/api/media?url=${item.logo}`} alt={item.org as string} fill className="object-contain p-1" />
                  ) : (
                    <Image src="/placeholder.png" alt="" fill className="object-contain p-1" />
                  )}
                </div>

                <div className="text-black">
                  <div className="text-base md:text-lg font-semibold leading-tight">
                    {item.title}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs md:text-sm text-black/80">
                    <span>{item.org}</span>
                    <span>•</span>
                    <span>{item.year}</span>
                    {item.url && (
                      <Link
                        href={item.url}
                        className="group inline-flex items-center gap-1 text-black/90 hover:text-black"
                      >
                        View More <ArrowSm />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}




/* ===================== CONTRIBUTIONS ===================== */
// keep your existing imports for Link/Image/Icons/CircleLink/ArrowSm/GitHubMark


type ActionLink = {
  id: string;
  href: string;
};

function ContributionsBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const router = useRouter();
  const [contributions, setContributions] = useState<Contribution[]>(); // keep as you have

  useEffect(() => {
    fetchData("contributions", setContributions);
  }, []);

  // --- helpers (inline or move out) ---
  const normalizeContributions = (raw: any): Contribution[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.contributions)) return raw.contributions; // dataset shape
    if (raw && Array.isArray(raw.docs)) return raw.docs;                   // just-in-case
    return [];
  };

  // normalize -> filter priority === 100 -> (optional) sort by priority desc then title
  const visible = normalizeContributions(contributions as any)
    .filter(c => Number(c?.priority ?? 0) === 100)
    .sort((a, b) => (Number(b?.priority ?? 0) - Number(a?.priority ?? 0)) || String(a?.title).localeCompare(String(b?.title)));

  const actions: ActionLink[] = [
    { id: "a1", href: "#" },
    { id: "a2", href: "#" },
    { id: "a3", href: "#" },
  ];

  return (
    <section className="w-full">
      <div className="relative px-6 md:px-10 overflow-hidden rounded-2xl bg-[var(--contributions-bg)] shadow-lg ring-1 ring-white/10">
        {canEdit && (
          <button
            onClick={() => router.push("/contributions/create")}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Contributions
          </button>
        )}

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div className="space-y-6 text-center md:text-left md:flex md:gap-x-18">
            <div className="space-y-5">
              <h3 className="text-3xl md:text-5xl font-semibold text-white">
                Contributions
                <br /> &amp; Open Source
              </h3>
              <div className="flex justify-center md:justify-start gap-5">
                {actions.map((a) => (
                  <CircleLink key={a.id} href={a.href} label="View More">
                    <ArrowSm />
                  </CircleLink>
                ))}
              </div>
            </div>
            <div className="mx-auto md:mx-0 w-48 h-48 grid place-items-center rounded-full bg-white/15">
              <GitHubMark className="h-20 w-20 text-white/90" />
            </div>
          </div>

          {/* Right - Cards */}
          <div className="grid sm:grid-cols-2 gap-6 my-5">
            {visible.map((doc) => (
              <a
                key={doc.id ?? doc.slug ?? doc.href}
                href={doc.href}
                className="
    group relative rounded-xl overflow-hidden bg-white/95
    shadow-md ring-1 ring-black/5
    transition-all duration-300 ease-out
    hover:-translate-y-1 hover:shadow-2xl hover:ring-black/10
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
    focus-visible:ring-offset-2 focus-visible:ring-offset-white
  "
              >
                <img
                  src={`/api/media?url=${doc.coverImage}`}
                  alt={doc.title}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-stone-800">{doc.title}</h4>
                  <p className="mt-2 text-sm text-stone-600 line-clamp-3">{doc.excerpt}</p>
                </div>
              </a>
            ))}
            {/* Optional empty state when nothing has priority 100 */}
            {visible.length === 0 && (
              <div className="col-span-full text-center text-white/70">
                No contributions with priority 100.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}




/* ===================== Small SVG helpers ===================== */
function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8 text-[var(--layout-item-bg)]">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" />
      <path
        d="M8 12l3 3 5-6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ArrowSm() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-6.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      fill="currentColor"
    >
      <path d="M12.293 5.293a1 1 0 011.414 0l3.999 4a1 1 0 010 1.414l-4 4a1 1 0 11-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" />
    </svg>
  );
}

function GitHubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.1-.75.09-.73.09-.73 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.32 3.52 1.01.11-.79.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.14 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.63.24 2.84.12 3.14.78.84 1.24 1.92 1.24 3.22 0 4.6-2.82 5.61-5.5 5.91.43.38.82 1.12.82 2.26v3.35c0 .32.22.7.82.58A12 12 0 0012 .5z"
      />
    </svg>
  );
}

function CircleLink({
  href,
  label,
  children,
  size = 14 // default in rems → 14 * 4px = 56px
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`grid h-${size} w-${size} place-items-center rounded-full bg-white/10 text-white hover:bg-white/15 transition`}
    >
      {children}
    </Link>
  );
}

function ProjectsBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>();

  useEffect(() => {
    fetchData("projects", setProjects); // ✅ await the promise
  }, []);

  return (
    <section className="w-full">
      <div className="relative container mx-auto px-6">
        {/* Floating Edit Badge */}
        {
          canEdit && (
            <button
              onClick={() => router.push("/projects/create")}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/40 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
            >
              ✏️ Edit Projects
            </button>)
        }


        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-semibold mb-12 text-[var(--heading-color)]">
          Latest Projects
        </h2>

        {/* Grid */}
        <div className="grid flex gap-8 place-items-center">
          {projects?.map((project) => (
            <div
              key={project.title}
              onClick={() => router.push(`/projects?id=${project._id}`)}
              className="
              w-[50%]
      group relative overflow-hidden cursor-pointer rounded-lg shadow-lg
      transition-transform duration-300 hover:scale-[1.02]
    "
            >
              {/* Görsel */}
              <img
                src={project.coverImage}
                alt={project.title}
                className="w-full h-56 object-cover md:h-64"   // veya: "w-full aspect-[16/9] object-cover"
              />

              {/* Hover overlay */}
              <div
                className="
        pointer-events-none absolute inset-0
        flex flex-col items-center justify-center
        bg-black/55 opacity-0 transition-opacity duration-300
        group-hover:opacity-100
      "
              >
                <h3 className="text-lg font-bold text-white text-center px-4">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function BlogsBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [blogs, setBlogs] = useState<Blog[]>();

  useEffect(() => {
    fetchData("blogs", setBlogs); // ✅ await the promise
  }, []);

  return (
    <section className="w-full">
      <div className="relative rounded-2xl  ring-1 ring-white/10 px-6 sm:px-10 lg:px-14 py-12">
        {/* Floating Edit Badge */}
        {
          canEdit && (
            <button
              onClick={() => window.location.assign("/blogs/create")}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/40 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
            >
              ✏️ Edit Blogs
            </button>)
        }



        <h2 className="text-center text-2xl md:text-5xl font-semibold text-black">
          Blog &amp; Insights
        </h2>

        <div className="mt-10 gap-10 flex place-items-center">
          {blogs?.map((p) => (
            <article key={p.id} className="
    group relative w-64 h-[400px] sm:w-[30%]
    overflow-hidden rounded-2xl bg-stone-800
    shadow-lg ring-1 ring-white/10
    transition-all duration-300 ease-out
    hover:-translate-y-1 hover:shadow-2xl hover:ring-white/20
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
  ">
              {/* image tile */}
              <div className="relative sm:h-[50%] rounded-xl overflow-hidden shadow-lg">
                <img
                  src={`/api/media?url=${p.coverImage}`}
                  alt={p.title}
                  className="object-cover"
                  sizes="(max-width: 768px) 288px, 320px"
                />
              </div>

              {/* white content box */}
              <div className="mt-3 h-[50%] rounded-xl bg-white/95 shadow p-4 text-center">
                <h3 className="text-2xl font-semibold text-stone-900">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-snug text-stone-600 line-clamp-3">
                  {p.excerpt}
                </p>
                <Link
                  href={`/blogs/${p.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-stone-800 hover:text-stone-950"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section >
  );
}


function ContactUs() {
  return (
    <section className="w-full">
      <div className="mx-auto w-[90%] max-w-6xl grid gap-12 md:grid-cols-2 items-start">
        {/* Left copy */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-semibold text-black">
            Contact With<br className="hidden md:block" /> Us
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-800 max-w-md mx-auto md:mx-0">
            Have a project in mind or just want to connect? Reach out anytime—
            I’m always open to new opportunities, collaborations, or a quick chat
            about tech. Let’s build something great together!
          </p>
        </div>

        {/* Right form card */}
        <div className="rounded-xl border border-white/30 bg-white/40 backdrop-blur px-5 py-6 shadow-sm">
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-stone-800 mb-1">Name</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-800 mb-1">Surname</label>
              <input
                type="text"
                placeholder="Surname"
                className="w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-800 mb-1">Email</label>
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-800 mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Write your message..."
                className="w-full rounded-md border border-stone-300 bg-white/90 px-3 py-2 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500/40 focus:border-stone-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full h-9 rounded-md bg-stone-800 text-white font-medium hover:opacity-95 active:opacity-90 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}


function WhyMeBox() {
  const srcs = ["/serviceback1.jpg", "/serviceback2.avif", "/serviceback3.jpg"]; // ensure real extensions
  const titles = [
    "Maximum Availability",
    "Qualified Business",
    "Profitable Business Logic",
  ];

  const descriptions = [
    // 1) Maximum Availability
    "Built for 99.9%+ uptime with autoscaling, health checks, and zero-downtime deploys. I design resilient services, add observability from day one, and harden the stack so traffic spikes or failures never become customer problems.",

    // 2) Qualified Business
    "Process-driven delivery with clear SLAs, documented workflows, and secure coding standards. From backlog grooming to release notes, I keep work transparent, compliant, and traceable—so your team and stakeholders always know what’s shipped and why.",

    // 3) Profitable Business Logic
    "I turn features into ROI with cost-aware architecture and measurable KPIs. Think smarter queries, caching, and lean flows that shorten time-to-value, reduce cloud spend, and grow revenue—without adding operational drag.",
  ];
  const [item, setItem] = React.useState(0);

  const clickHandler = () => setItem((i) => (i + 1) % srcs.length);

  return (
    <section className="w-full">
      <div
        onClick={clickHandler}
        className="relative mx-auto w-full h-[420px] overflow-hidden rounded-2xl shadow-lg group
                    motion-reduce:animate-none"
      >
        {/* Background image — remounts on every click via 'key' */}
        <img
          key={srcs[item]}
          src={srcs[item]}
          crossOrigin="anonymous"
          alt="Services background"
          className="absolute inset-0 h-full w-full object-cover
                      animate-[imgFade_600ms_ease-out_both]"
        />

        {/* Soft black shading that also fades each swap */}
        <div
          key={`shade-${srcs[item]}`}
          className="pointer-events-none absolute inset-0
                      animate-[shadeIn_700ms_ease-out_100ms_both]
                      bg-black"
        />

        {/* Bottom-centered content */}
        <div className="absolute bottom-6 left-1/2 w-[92%] max-w-3xl -translate-x-1/2 text-center">
          <div className="rounded-xl bg-black/60 px-6 py-5 backdrop-blur-sm ring-1 ring-white/10 group-hover:bg-black/80 transition-colors">
            <h2 className="text-3xl md:text-5xl font-semibold text-white">{titles[item]}</h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-white/90">
              {descriptions[item]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
