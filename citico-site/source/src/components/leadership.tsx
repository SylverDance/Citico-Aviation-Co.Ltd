"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui";
import { DynIcon, IconArrow, IconCheck, IconShield, IconX } from "@/components/icons";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n";
import type { Leader } from "@/lib/content";

/* ---------------- Section ---------------- */
export function LeadershipSection() {
  const { leaders, sections } = useDict();
  const [selected, setSelected] = useState<Leader | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section id="leadership" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(180deg,#052452 0%,#0a3d80 55%,#083672 100%)" }}>
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(45,140,255,0.55), transparent)" }} aria-hidden />
      {/* aviation backdrop: route arcs + coordinates grid + world map dots */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="grid-lines absolute inset-0 opacity-25" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.16]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ldRoute" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#2b2fd6" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#5a5ee8" stopOpacity="0.55" />
              <stop offset="1" stopColor="#b51227" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          {/* great-circle style routes converging on Juba */}
          <path d="M-60 620 C 260 300, 520 260, 760 430 S 1180 640, 1520 420" stroke="url(#ldRoute)" strokeWidth="1.6" fill="none" strokeDasharray="7 9" className="animate-dash" />
          <path d="M-40 220 C 300 320, 560 180, 800 380 S 1200 560, 1500 300" stroke="url(#ldRoute)" strokeWidth="1.2" fill="none" strokeDasharray="6 10" className="animate-dash" style={{ animationDuration: "4.6s" }} />
          <path d="M120 900 C 380 620, 640 560, 780 470 S 1120 260, 1420 160" stroke="url(#ldRoute)" strokeWidth="1.2" fill="none" strokeDasharray="6 11" className="animate-dash" style={{ animationDuration: "5.4s" }} />
          {/* waypoint markers */}
          {[
            [760, 430, 4],
            [420, 320, 2.5],
            [1105, 520, 2.5],
            [280, 700, 2],
            [1240, 250, 2],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="#5a5ee8" opacity="0.8" />
              <circle cx={cx} cy={cy} r={r * 3} fill="none" stroke="#5a5ee8" strokeWidth="0.6" opacity="0.35" />
            </g>
          ))}
        </svg>
        {/* brand glows */}
        <div className="absolute -left-40 top-24 h-[420px] w-[420px] rounded-full bg-citico-600/14 blur-3xl" />
        <div className="absolute -right-32 bottom-10 h-[360px] w-[360px] rounded-full bg-citico-600/10 blur-3xl" />
      </div>

      <div className="section-pad relative mx-auto max-w-[1400px]">
        {/* header */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-citico-300">{sections.leadershipKicker}</p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {sections.leadershipTitle.lead} <span className="text-gradient">{sections.leadershipTitle.accent}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-5 text-base italic leading-relaxed text-slate-300/85 sm:text-lg">
              {sections.leadershipIntro}
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mx-auto mt-7 flex items-center justify-center gap-3" aria-hidden>
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-citico-500/80" />
              <IconShield className="h-5 w-5 text-citico-300" />
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-citico-500/80" />
            </div>
          </Reveal>
        </div>

        {/* executive cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {leaders.map((l, i) => (
            <Reveal key={l.slug} delay={i * 0.09}>
              <ProfileCard leader={l} index={i} onOpen={() => setSelected(l)} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-[13px] uppercase tracking-[0.22em] text-slate-400">
            {sections.leadershipQuote}
          </p>
        </Reveal>
      </div>

      {mounted && <ProfileModal leader={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}

/* ---------------- Executive card ---------------- */
function ProfileCard({ leader, index, onOpen }: { leader: Leader; index: number; onOpen: () => void }) {
  const { sections } = useDict();
  return (
    <motion.button
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={fmt(sections.profileCardAria, { name: leader.name, role: leader.role })}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group relative block w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] text-start shadow-card backdrop-blur-md transition-colors duration-300 hover:border-citico-400/45 focus-visible:border-citico-300"
    >
      {/* top aviation accent line */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-citico-600 via-citico-400/70 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />
      {/* uniform executive portrait — identical 4:5 geometry for all */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={leader.photo}
          alt={fmt(sections.profilePortraitAlt, { name: leader.name })}
          fill
          sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
        />
        {/* legibility scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/20 to-navy-950/5" />
        {/* hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center bg-citico-950/45 pb-6 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="inline-flex translate-y-2 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
            {sections.profileViewProfile}
            <IconArrow className="h-4 w-4" />
          </span>
        </div>
        {/* index */}
        <span className="font-display absolute end-4 top-4 text-xs font-bold tracking-widest text-white/40">
          0{index + 1}
        </span>
      </div>

      {/* name plate */}
      <div className="relative p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold leading-snug text-white">{leader.name}</h3>
        <p className="mt-1.5 text-[12px] font-semibold uppercase leading-relaxed tracking-[0.16em] text-citico-300">
          {leader.role}
        </p>
      </div>
    </motion.button>
  );
}

/* ---------------- Profile modal ---------------- */
function ProfileModal({ leader, onClose }: { leader: Leader | null; onClose: () => void }) {
  const { sections } = useDict();
  const lhref = useLocalizedHref();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);

  // Escape + focus management
  useEffect(() => {
    if (!leader) return;
    lastActive.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastActive.current?.focus?.();
    };
  }, [leader, onClose]);

  return (
    <AnimatePresence>
      {leader && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={fmt(sections.profileModalAria, { name: leader.name })}
        >
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 44, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.21, 0.6, 0.35, 1] }}
            className="relative grid max-h-[92svh] w-full max-w-4xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl dark:bg-navy-900 sm:rounded-[2rem] md:grid-cols-[340px_1fr]"
          >
            {/* portrait column */}
            <div className="relative h-72 md:h-auto">
              <Image
                src={leader.photo}
                alt={fmt(sections.profilePortraitAlt, { name: leader.name })}
                fill
                sizes="340px"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-navy-900/40" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
                <h3 className="font-display text-2xl font-bold text-white">{leader.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-citico-200">{leader.role}</p>
              </div>
            </div>

            {/* content column */}
            <div className="relative p-7 sm:p-9">
              {/* desktop name block */}
              <div className="hidden items-start justify-between gap-4 md:flex">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.26em] text-citico-600 dark:text-citico-400">{sections.profileExecutiveLabel}</p>
                  <h3 className="font-display mt-2 text-[1.7rem] font-bold leading-tight text-navy-900 dark:text-white">{leader.name}</h3>
                  <p className="mt-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-citico-700 dark:text-citico-300">{leader.role}</p>
                </div>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label={sections.profileClose}
                  className="rounded-full border border-navy-900/10 p-2.5 text-navy-700 transition-colors hover:bg-navy-900/5 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>

              {/* mobile close */}
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={sections.profileClose}
                className="absolute end-5 top-5 rounded-full bg-white/90 p-2 text-navy-800 shadow-lg md:hidden dark:bg-white/10 dark:text-white"
              >
                <IconX className="h-4.5 w-4.5" />
              </button>

              {/* biography */}
              <p className="mt-6 text-[14.5px] leading-relaxed text-navy-700/85 dark:text-slate-300/90">{leader.bio}</p>

              <div className="mt-7 grid gap-7">
                <ProfileBlock icon="briefcase" title={sections.profileExperience} items={leader.experience} />
                <ProfileBlock icon="badge" title={sections.profileHighlights} items={leader.highlights} />
              </div>

              {/* expertise chips */}
              <div className="mt-8">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-900 dark:text-white">
                  <DynIcon name="spark" className="h-4 w-4 text-citico-600 dark:text-citico-300" />
                  {sections.profileExpertise}
                </h4>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {leader.expertise.map((e) => (
                    <li
                      key={e}
                      className="rounded-full border border-citico-600/25 bg-citico-50 px-3.5 py-1.5 text-[12.5px] font-medium text-citico-800 dark:border-citico-400/25 dark:bg-citico-900/35 dark:text-citico-200"
                    >
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href={lhref("/contact")}
                  className="group inline-flex items-center gap-2 rounded-full bg-citico-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-citico-600 dark:bg-citico-500 dark:hover:bg-citico-400"
                >
                  {sections.profileConnect}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </Link>
                <Link
                  href={lhref("/contact#charter")}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:border-citico-600 dark:border-white/20 dark:text-white"
                >
                  {sections.profileRequestCharter}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- modal content block ---------------- */
function ProfileBlock({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div>
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-900 dark:text-white">
        <DynIcon name={icon === "briefcase" ? "box" : "badge"} className="h-4 w-4 text-citico-600 dark:text-citico-300" />
        {title}
      </h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-navy-700/80 dark:text-slate-300/85">
            <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-citico-600 dark:text-citico-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
