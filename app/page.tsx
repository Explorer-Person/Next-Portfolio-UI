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
import { Blog, Contact, Contribution, Experience, Hero, ProfileImage, Project, Qualification, Social, TechStack } from "@/datas/interfaces";
import { fetchData } from "../utils/fetchData";
import { PLATFORM, toHref } from "../utils/icon";
import { ArrowDown, ArrowUpRight, Star } from "lucide-react";
import { FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";
import { getSectionAnim } from "@/utils/animation";

export default function Home() {
  const { isAuthed } = useAuth();
  const [editableBox, setEditableBox] = useState('');
  const changeBoxState = (boxName: string) => {
    if (!isAuthed) return; // block toggling if not logged in
    setEditableBox(boxName);
  };

  return (
    <div className="relative font-sans min-h-screen text-stone-900 flex flex-col items-center">
      {/* Top Two-Column Grid */}
      <div className="gap-12 w-[100%]">
        <div className="relative flex gap-8 h-[700px]">
          <div className="relative h-full w-[100%]">
            {isAuthed && editableBox === "profileimage"
              ? <ProfileImageEditor initial={undefined} />
              : <ProfileImageBox canEdit={isAuthed} editableBox="profileimage" changeBoxState={changeBoxState} />}

            <div className="h-full absolute top-0 left-10 w-[40%]">
              <ProfileTextBox />
            </div>

          </div>
        </div>


        <div className="h-0.5 w-full h-[650px] bg-[#F3F3F3] flex">
          <div className="h-full w-full relative top-0 left-10">
            {isAuthed && editableBox === "hero"
              ? <HeroEditor />
              : <HeroBox canEdit={isAuthed} editableBox="hero" changeBoxState={changeBoxState} />}
          </div>
        </div>


        {/* <div className="h-full absolute top-0 left-10 w-[40%]">
          {isAuthed && editableBox === "hero"
            ? <HeroEditor />
            : <HeroBox canEdit={isAuthed} editableBox="hero" changeBoxState={changeBoxState} />}
        </div> */}

      </div>

      {/* Full Width Sections Below */}
      <div className="relative flex flex-col w-[100%]">
        <div>
          <ProjectsBox canEdit={isAuthed} editableBox="projects" changeBoxState={changeBoxState} />
        </div>
        <div>
          <ExperiencesBox />
        </div>
        <div>
          <WhyMeBox />
        </div>
        <div className="bg-[#F3F3F3]">
          <div>
            <ContributionsBox canEdit={isAuthed} editableBox="contributions" changeBoxState={changeBoxState} />
          </div>
          <div>
            <BlogsBox canEdit={isAuthed} editableBox="blogs" changeBoxState={changeBoxState} />
          </div>
        </div>
        <div>
          <QualificationsBox canEdit={isAuthed} />
        </div>


        <div className="my-25">
          <ContactUs />
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
    </div>

  );
}


export type StateProps = {
  editableBox: string;
  changeBoxState: (boxName: string) => void;
  canEdit?: boolean; // optional prop to control editability
};



function ProfileTextBox() {


  const profileTexts = {
    title: "HELLO",
    desc: "Welcome to my profile. Here you can explore more about me, my journey, and my work."
  };


  return (
    <section className="relative p-10 text-center lg:text-left h-full">
      <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })} className="flex gap-25 h-full">
        <div className="flex flex-col items-center gap-6 h-full">
          <p className="text-stone-500 font-semibold [writing-mode:vertical-rl] rotate-180">
            Full-Stack Dev.
          </p>

          <span className="w-[2px] h-[50%] flex-1 bg-gray-400"></span>

          <p className="text-stone-500 font-semibold [writing-mode:vertical-rl] rotate-180">
            2025
          </p>
        </div>

        <div>
          <div className="flex gap-15 mb-15">
            <div>
              <p className="text-6xl">+200</p>
              <p className="ml-8">Project Completed</p>
            </div>
            <div>
              <p className="text-6xl">+50</p>
              <p className="ml-8">Startup Raised</p>
            </div>
          </div>


          <h1 className="text-5xl sm:text-7xl md:text-[90px] lg:text-[110px] xl:text-[200px] font-thin tracking-tight leading-[1.1] mb-6">
            {profileTexts.title}
          </h1>


          <p className="flex items-center w-[75%] ml-5 gap-3 text-base md:text-xl text-gray-600 leading-relaxed">
            <span className="block w-10 h-[2px] bg-gray-400"></span>
            {profileTexts.desc}
          </p>

          <div className="mt-20 flex items-center justify-start ml-15 gap-2 text-lg font-medium text-stone-600">
            <span>Scroll Down</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function HeroBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [heroText, setHeroText] = useState<Hero>();

  useEffect(() => {
    fetchData("hero", setHeroText);
  }, []);

  const heroTexts = {
    title: heroText?.title,
    desc: heroText?.desc,
  }

  const parts =
    heroTexts?.desc
      ?.split(/\s*-\s*/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4) || [];

  const p1 = parts[0] ?? heroTexts.desc; // left intro fallback
  const p2 = parts[1] ?? "";
  const p3 = parts[2] ?? "";

  return (
    <section className="relative p-10 text-center lg:text-left items-center justify-center h-full">
      <div className="h-full">
        {/* Main 3-column layout */}
        <div className="flex gap-10 lg:gap-5 h-full">
          {/* LEFT: heading + intro paragraph */}
          <motion.div {...getSectionAnim({ direction: "", delay: 0.2 })} className="order-2 lg:order-1 w-[25%] h-full">
            {canEdit && (
              <button
                onClick={() => changeBoxState(editableBox)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 transition"
              >
                ✏️ Edit Hero
              </button>
            )}

            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              {heroTexts.title}
            </h2>

            <p className="text-gray-600 leading-relaxed w-full">
              {p1}
            </p>

            {/* Big title (optional; keep your original large title below if you want) */}
            <h1 className="sr-only">{heroTexts.title}</h1>

            <div className="mt-10 w-[25%] flex items-center justify-center absolute bottom-15 lg:justify-start gap-2 text-lg font-medium text-stone-600">
              <img src="/trendyarrow.png" alt="" className="rotate-180 w-full scale-x-[-1] ml-15" />
            </div>
          </motion.div>

          {/* MIDDLE: stat card (percent + caption + image) */}
          <motion.div {...getSectionAnim({ direction: "", delay: 0.3 })} className="order-1 lg:order-2 w-[40%] relative h-full">
            <div className="mx-auto max-w-sm rounded-2xl h-full w-[100%] bg-white shadow-md ring-1 ring-black/5 p-8 text-left">
              <div className="flex items-center mb-5 justify-start">
                <FaGlobe className="w-10 h-10 text-stone-600" />
              </div>
              <p className="text-5xl md:text-6xl font-semibold mb-5 tracking-tight">
                {"120%"}
              </p>
              <p className="mt-2 text-gray-500">
                {
                  "Average increase in client engagement in the first 6 months"}
              </p>

              <div className="mt-6 overflow-hidden rounded-xl absolute bottom-10 w-80">
                <img
                  src={"/heromid.jpg"}
                  alt="stat"
                  className="w-full h-56 object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* RIGHT: three bullet paragraphs */}
          <motion.div {...getSectionAnim({ direction: "", delay: 0.4 })} className="order-3 space-y-6 w-[30%] h-full">
            <div className="overflow-hidden rounded-xl relative right-15 mb-15">
              <img
                src={"/heroleft.jpeg"}
                alt="stat"
                className="w-full object-cover"
              />
            </div>
            {[p2, p3]
              .filter(Boolean)
              .map((text, i) => (
                <div key={i} className="flex items-start gap-3 w-[70%] text-left">
                  <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Star className="h-4 w-4" />
                  </span>
                  <p className="text-gray-700 leading-relaxed">{text}</p>
                </div>
              ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}






// ===== Sample JSON data (replace with backend later) =====
const SAMPLE_DATA: Experience[] = [
  {
    id: "exp-1",
    fk: "001",
    company: "Creative Minds",
    location: "New York, USA",
    job: "Senior Product Designer",
    affairs:
      "Innovated designs, New York, Senior Product Designer",
    startDate: "February 2022",
    isPresent: true,
    tags: ["UIUX", "Branding"],
    href: "#",
  },
  {
    id: "exp-2",
    fk: "002",
    company: "Innovative Designs Inc",
    location: "USA",
    job: "Lead UX/UI",
    affairs: "Led UX/UI, San Francisco. Crafting tomorrow's experiences",
    startDate: "January 2020",
    endDate: "February 2022",
    tags: ["UIUX", "Branding"],
    href: "#",
  },
  {
    id: "exp-3",
    fk: "003",
    company: "Visionary Creations Ltd",
    location: "UK",
    job: "Principal Designer",
    affairs: "Principal Designer, Berlin, Crafting tomorrow's experiences",
    startDate: "February 2022",
    isPresent: true,
    tags: ["Branding", "UIUX"],
    href: "#",
  },
  {
    id: "exp-4",
    fk: "004",
    company: "FutureTech",
    location: "Berlin, Germany",
    job: "—",
    affairs:
      "From crafting seamless user experiences to leading strategic product design initiatives, each experience has shaped my approach and strengthened my passion for solving design challenges",
    startDate: "February 2022",
    isPresent: true,
    tags: ["Branding", "UIUX"],
    href: "#",
    medias: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541976076758-347942db1970?q=80&w=1200&auto=format&fit=crop",
    ],
  },
  {
    id: "exp-5",
    fk: "005",
    company: "Expert Designs Inc",
    location: "USA",
    job: "Senior Product Designer",
    affairs: "Innovated designs, New York, Senior Product Designer",
    startDate: "February 2022",
    isPresent: true,
    tags: ["UIUX", "Branding"],
    href: "#",
  },
];

// ===== Pill component =====
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-300/70 px-3 py-1 text-xs text-neutral-700 bg-white/70 backdrop-blur">
      {children}
    </span>
  );
}

// ===== Row component =====
function ExperienceRow({ exp }: { exp: Experience }) {
  const date = `${exp.startDate} \u2013 ${exp.isPresent ? "Present" : exp.endDate ?? ""}`;
  const [active, setActive] = useState(false);

  function handleBoxClick() {
    setActive(!active);
  }

  return (
    <motion.li {...getSectionAnim({ direction: "up", delay: 0.2 })} onClick={handleBoxClick} className="py-10 w-full first:pt-0 last:pb-0">
      <div className="flex w-full gap-25 items-start justify-between">
        <div className={`flex ${active ? 'flex-col' : ''}`}>
          {/* Left: company + date */}
          <div className="col-span-12 md:col-span-4">
            <div className="text-2xl text-neutral-800">
              {exp.company}
              {exp.location ? `, ${exp.location}` : ""}
            </div>
            <div className="mt-1 text-sm text-neutral-500">• {date}</div>
          </div>
          {/* Middle: role + affairs */}
        </div>

        <div className={`text-md text-neutral-500`}>
          {exp.job}
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          {(exp.tags || []).map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
      </div>
      <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })}
        className={`${active ? "flex" : "hidden"} w-full items-start gap-4 mt-4`}
      >
        {/* Media (optional) */}
        {exp.medias?.length ? (
          <div className="flex gap-4 shrink-0">
            {exp.medias.slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`media-${i}`}
                className="h-36 w-56 rounded-xl object-cover shadow-sm"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}

        {/* Middle text: EXPANDS */}
        <div className="flex-1 min-w-0 text-[15px] leading-7 text-neutral-600">
          {exp.affairs || exp.job}
        </div>

        {/* Arrow pinned right */}
        <a
          href={exp.href || "#"}
          aria-label="Open"
          className="shrink-0 ml-auto grid h-20 w-20 place-items-center rounded-full bg-neutral-900 text-white hover:bg-black/80 transition"
        >
          <ArrowUpRight className="h-16 w-16" />
        </a>
      </motion.div>
      <div className="mt-8 h-px w-full bg-neutral-200" />
    </motion.li>
  );
}

// ===== Main component =====
function ExperiencesBox({ data = SAMPLE_DATA }: { data?: Experience[] }) {
  return (
    <section className="w-full py-10 text-neutral-900">
      <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })} className="mx-auto max-w-8xl md:px-25">
        {/* Header */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-6">
            <div className="text-md text-neutral-1000 "><span >⚫</span><span>Experiences</span></div>
            <h1 className="mt-2 text-4xl md:text-5xl leading-tight tracking-tight">
              Explore My Design
              <br />
              Journey
            </h1>
          </div>
          <div className="col-span-12 md:col-span-6 md:pl-6">
            <p className="text-[15px] leading-7 text-neutral-600 md:mt-2">
              Over the past 4+ years, I&apos;ve had the opportunity to work on a wide
              range of design projects, collaborating with diverse teams and
              clients to bring creative visions to life.
            </p>
            <a
              href="#"
              className="mt-3 inline-block text-[15px] font-medium underline underline-offset-4 hover:opacity-80"
            >
              Book A Call ↗
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-15 h-px w-full" />


        {/* List */}
        <ul className="w-full">
          {data.map((exp) => (
            <ExperienceRow key={exp.id} exp={exp} />
          ))}
        </ul>
      </motion.div>
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
    <motion.section {...getSectionAnim({ direction: "up", delay: 0.2 })} className="group relative h-full isolate bg-[url('/techback.jpg')] p-6 rounded-xl shadow-lg text-center overflow-hidden">
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
    </motion.section>
  );
}



function ProfileImageBox({ editableBox, changeBoxState, canEdit }: StateProps) {
  const [profileImage, setProfileImage] = useState<ProfileImage>();

  useEffect(() => {
    fetchData("profileImage", setProfileImage); // ✅ await the promise
  }, []);

  return (
    <motion.section {...getSectionAnim({ direction: "", delay: 1 })} className="relative overflow-hidden shadow-lg h-full w-full">
      <img
        src={`/api/media?url=${profileImage?.src}`} // Replace with your actual image path
        alt="Fatih Etlik"
        className="absolute h-[100%] w-[55%] right-0 bottom-0"
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

    </motion.section>
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
    <motion.section {...getSectionAnim({ direction: "up", delay: 0.2 })} className="relative h-full bg-[url('/addressback.jpeg')] p-6 px-30 space-y-8 pb-8 rounded-xl shadow-lg text-center">
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


    </motion.section>
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
    <motion.section {...getSectionAnim({ direction: "", delay: 0.1 })} className="relative h-full bg-[url('/qualback.jpg')] bg-cover bg-center bg-no-repeat overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-white/80" aria-hidden="true" />
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
    </motion.section>
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
      <div className="relative px-6 md:px-10 overflow-hidden rounded-2xl ring-1 ring-white/10">

        {canEdit && (
          <button
            onClick={() => router.push("/contributions/create")}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/20 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Contributions
          </button>
        )}

        {/* Header chip + title */}
        <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })} className="pt-10 text-center">
          <span className="inline-flex items-center rounded-full bg-white/70 text-stone-700 text-xs px-3 py-1 ring-1 ring-black/10">
            {/* Big dot */}
            <span >⚫</span>

            {/* Text */}
            <span>Contributions</span>
          </span>

          <h2 className="mt-3 text-4xl md:text-6xl font-semibold text-stone-900">
            Latest Works
          </h2>
        </motion.div>

        {/* Cards row */}
        <div className="mx-auto max-w-7xl py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.slice(0, 3).map((doc, index) => (
              <motion.div {...getSectionAnim({ direction: "up", delay: ((1 + index)/10) })} key={doc.id ?? doc.slug ?? doc.href} className="group">
                <a
                  href={doc.href}
                  className="block relative overflow-hidden rounded-xl ring-1 ring-black/5 shadow-md"
                >
                  <img
                    src={`/api/media?url=${doc.coverImage}`}
                    alt={doc.title}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-300" />
                  <div className="pointer-events-none absolute inset-0 flex items-end">
                    <div className="w-full p-4 flex items-center justify-between text-white/95">
                      <span className="text-sm">Website</span>
                      <span className="text-sm truncate max-w-[40%]">
                        {new URL(doc.href || "#", "https://x.y").host.replace(/^www\\./, "")}
                      </span>
                    </div>
                  </div>

                  {/* Center round arrow on hover */}
                  <div className="absolute inset-0 grid place-items-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-stone-900 shadow">
                      {/* lucide-react arrow or your ArrowSm */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M7 7h10v10" /></svg>
                    </span>
                  </div>
                </a>

                {/* Caption under image */}
                <div className="px-1 pt-3">
                  <h3 className="text-sm md:text-base font-medium text-stone-900">
                    {doc.title}
                  </h3>
                  <div className="mt-1 text-[11px] text-stone-500 flex items-center gap-2">
                    <span>For</span>
                    <span className="font-semibold tracking-tight">Squeeze</span>
                  </div>
                </div>
              </motion.div>
            ))}

            {visible.length === 0 && (
              <div className="col-span-full text-center text-white/70">
                No contributions to show yet.
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA row */}
        <div className="pb-10 text-center">
          <span className="text-stone-500">Check out More</span>
          <span className="mx-3">→</span>
          <a
            href={actions?.[0]?.href || "#"}
            className="font-medium underline underline-offset-4 hover:opacity-80"
          >
            View More
          </a>
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [scrollIndex, setScrollIndex] = useState(1);

  useEffect(() => {
    fetchData("projects", setProjects); // ✅ await the promise
  }, []);

  // Scroll to 2nd element by default
  useEffect(() => {
    if (projects && projects.length > 1) {
      setScrollIndex(1); // second item
    }
  }, [projects]);

  // Change positioning based on direction
  const changePositioning = (direction: "left" | "right") => {
    if (!projects.length) return;

    setScrollIndex((prev) => {
      const next =
        direction === "left"
          ? Math.max(0, prev - 1)
          : Math.min(projects.length - 1, prev + 1);
      return next;
    });
  };

  return (
    <section className="w-full bg-[#F3F3F3]">
      <div className="relative container mx-auto px-6">
        {/* Floating Edit Badge */}
        {canEdit && (
          <button
            onClick={() => router.push("/projects/create")}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/40 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Projects
          </button>
        )}

        {/* Title */}
        <h2 className="text-center text-3xl md:text-4xl font-semibold mb-12 text-[var(--heading-color)]">
          Latest Projects
        </h2>

        {/* Buttons */}
        <div className="absolute w-[100%] left-0 top-1/2 -translate-y-1/2 z-10 flex gap-2">
          <motion.button {...getSectionAnim({ direction: "left", delay: 0.1 })}
            onClick={() => changePositioning("left")}
            className="h-10 absolute left-5 w-10 rounded-full bg-black/70 text-white flex items-center justify-center"
          >
            ◀
          </motion.button>
          <motion.button {...getSectionAnim({ direction: "right", delay: 0.1 })}
            onClick={() => changePositioning("right")}
            className="h-10 w-10 absolute right-5 rounded-full bg-black/70 text-white flex items-center justify-center"
          >
            ▶
          </motion.button>
        </div>

        {/* Grid wrapper with translateX */}
        <div className="overflow-hidden w-full">
          <div
            className="flex gap-[10%] transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(calc(23.5% - 65% * ${scrollIndex}))` }}
          >
            {projects?.map((project) => (
              <motion.div {...getSectionAnim({ direction: "", delay: 0.2 })}
                key={project.title}
                onClick={() => router.push(`/projects?id=${project._id}`)}
                className="
                  lg:min-w-[55%] 
                  group cursor-pointer overflow-hidden rounded-xl
                  transition-all duration-300
                "
              >
                {/* Image */}
                <div className="relative h-[65%]">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full aspect-[4/3] h-full object-cover"
                  />
                  {/* Circular hover button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="pointer-events-none flex h-12 w-12 items-center justify-center rounded-full bg-black/80 text-white shadow-lg">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>

                {/* Caption */}
                <div className="bg-[var(--card-bg,#F4F4F3)] px-5 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[35px] font-medium text-stone-900 line-clamp-1">
                      {project.title}
                    </h3>
                    {project.href && (
                      <p className="text-sm text-stone-500 shrink-0">
                        For <span className="font-medium">{project.href}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
      <div className="relative rounded-2xl px-6 sm:px-10 lg:px-14 py-12">
        {/* Edit badge */}
        {canEdit && (
          <button
            onClick={() => window.location.assign("/blogs/create")}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/40 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition"
          >
            ✏️ Edit Blogs
          </button>
        )}

        {/* Header */}
        <motion.div {...getSectionAnim({ direction: "", delay: 0.1 })} className="text-center">
          <span className="inline-flex items-center rounded-full bg-white text-stone-800 text-xs px-3 py-1 ring-1 ring-black/10">
            <span>⚫</span> Blogs
          </span>
          <h2 className="mt-4 text-[38px] md:text-[64px] leading-[1.05] font-semibold text-stone-900">
            Design Insights &amp; Trends
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="mx-auto max-w-7xl mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.slice(0, 3).map((p, index) => (
              <motion.a {...getSectionAnim({ direction: "up", delay: ((index + 1)/10) })}
                key={p.id ?? p.slug ?? p.title}
                href={`/blogs/${p.slug}`}
                className="group block rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Top image (rounded only on top) */}
                <img
                  src={`/api/media?url=${p.coverImage}`}
                  alt={p.title}
                  className="w-full h-64 md:h-72 object-cover rounded-t-2xl"
                  loading="lazy"
                />

                {/* Body */}
                <div className="p-5 rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-black text-white text-[10px] px-3 py-1 tracking-[0.02em]">
                      {(p.tags || "MARKETING").toString().toUpperCase()}
                    </span>
                    <span className="text-[12px] text-stone-800 font-medium">
                      5 min read
                    </span>
                  </div>

                  <h3 className="mt-3 text-[15px] md:text-[17px] leading-6 text-stone-900">
                    {p.title}
                  </h3>
                </div>
              </motion.a>
            ))}

            {(!blogs || blogs.length === 0) && (
              <div className="col-span-full text-center text-stone-600">
                No blogs to show yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


function ContactUs() {
  return (
    <section className="w-full">
      <div className="mx-auto w-[90%] max-w-6xl grid gap-12 md:grid-cols-2 items-start">
        {/* Left copy */}
        <motion.div {...getSectionAnim({ direction: "right", delay: 0.2 })} className="text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-semibold text-black">
            Contact With<br className="hidden md:block" /> Us
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-800 max-w-md mx-auto md:mx-0">
            Have a project in mind or just want to connect? Reach out anytime—
            I’m always open to new opportunities, collaborations, or a quick chat
            about tech. Let’s build something great together!
          </p>
        </motion.div>

        {/* Right form card */}
        <motion.div {...getSectionAnim({ direction: "left", delay: 0.2 })} className="rounded-xl border border-white/30 bg-white/40 backdrop-blur px-5 py-6 shadow-sm">
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
        </motion.div>
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
        className="relative mx-auto mb-15 h-[450px] rounded-xl w-[95%] overflow-hidden shadow-lg group
                    motion-reduce:animate-none"
      >
        {/* Background image — remounts on every click via 'key' */}
        <motion.img {...getSectionAnim({ direction: "", delay: 0.1 })}
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
        <motion.div {...getSectionAnim({ direction: "", delay: 0.3 })} className="absolute w-full h-full text-center">
          <div className="rounded-xl h-full px-[25%] py-[10%]  bg-black/50 px-6 group-hover:bg-black/60 transition-colors">
            <h2 className="text-3xl md:text-5xl font-semibold text-white">{titles[item]}</h2>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-white/90">
              {descriptions[item]}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

