"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n";
import { IconArrow, IconJet, IconClock } from "@/components/icons";

gsap.registerPlugin(ScrollTrigger);

/* ─── rAF detection: if dead, skip entrance animations so nothing is stuck invisible ─── */
function useRafWorking() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    let fired = false;
    const id = requestAnimationFrame(() => { fired = true; });
    const t = setTimeout(() => { if (!fired) setOk(false); cancelAnimationFrame(id); }, 800);
    return () => { cancelAnimationFrame(id); clearTimeout(t); };
  }, []);
  return ok;
}

/* Animated counter — renders the real final value as the SSR/initial default.
   This means even on slow connections or with JS blocked, users see "13+" not "0".
   When JS runs and the element enters the viewport, the counter animates from 0
   up to the target value as before. */
function CountUp({ value, suffix = "", display: displayLabel }: { value: number; suffix?: string; display?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // Default to the real final value — SSR-safe, no flash of "0" on load
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!inView) return;
    const dur = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    // Brief delay to allow entrance animation to complete before counter starts
    const timeout = setTimeout(() => { raf = requestAnimationFrame(tick); }, 200);
    return () => { cancelAnimationFrame(raf); clearTimeout(timeout); };
  }, [inView, value]);
  // Use displayLabel override if provided (e.g. "24/7" instead of computed "24")
  return <span ref={ref}>{displayLabel ?? display}{suffix}</span>;
}

export function Hero() {
  const { heroSlides, heroTrust, hero } = useDict();
  const lhref = useLocalizedHref();
  const root = useRef<HTMLElement>(null);
  const imgWrap = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [destinationInput, setDestinationInput] = useState("Malakal");
  const [scrolledPast, setScrolledPast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafWorking = useRafWorking();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const rafMouse = useRef(0);
  const mouseTarget = useRef({ x: 0, y: 0 });

  /* Respect prefers-reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Mouse parallax — smoothed lerp, max ±12px x / ±8px y */
  useEffect(() => {
    if (reducedMotion || !rafWorking) return;
    const onMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseTarget.current = { x: nx * -12, y: ny * -8 };
    };
    const tick = () => {
      setMouse((m) => ({
        x: m.x + (mouseTarget.current.x - m.x) * 0.06,
        y: m.y + (mouseTarget.current.y - m.y) * 0.06,
      }));
      rafMouse.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafMouse.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(rafMouse.current); };
  }, [reducedMotion]);

  /* Carousel auto-advance */
  useEffect(() => {
    const iv = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 7000);
    return () => clearInterval(iv);
  }, []);

  /* GSAP parallax + aircraft float */
  useEffect(() => {
    if (reducedMotion || !rafWorking) return;
    const ctx = gsap.context(() => {
      /* Never scale below 1 — a <1 scale shrinks the photo inside the fixed hero
         box and exposes the background as empty bands on the left/right edges. */
      gsap.fromTo(".hero-zoom", { scale: 1.12 }, { scale: 1.06, duration: 3, ease: "power2.out" });
      gsap.to(".hero-float", {
        y: -8, rotate: -0.3, duration: 10, ease: "sine.inOut", repeat: -1, yoyo: true,
      });
      if (imgWrap.current) {
        gsap.to(imgWrap.current, {
          y: -40, ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [reducedMotion, rafWorking]);

  /* Floating mobile CTA */
  useEffect(() => {
    const check = () => setScrolledPast(window.scrollY > window.innerHeight * 0.85);
    check();
    window.addEventListener("scroll", check, { passive: true });
    const iv = setInterval(check, 300);
    return () => { window.removeEventListener("scroll", check); clearInterval(iv); };
  }, []);

  /* Pre-cropped masters so the frame is filled edge-to-edge at every aspect ratio:
     desktop = 2:1 panorama (tail → nose → boarding stairs), tablet = portrait,
     mobile = portrait crop. These are written as an explicit <picture> rather than
     getImageProps because production ships as a static export with no Next.js image
     optimizer — and the three files are already the exact crops the layout wants. */
  const heroAlt =
    "CITICO Aviation cargo aircraft being loaded on the tarmac at sunrise";
  const heroDeskSrc = "/img/hero-tarmac.webp";
  const heroTabSrc = "/img/hero-tarmac-tablet.webp";
  const heroMobSrc = "/img/hero-tarmac-mobile.webp";

  const currentSlide = heroSlides[slide];
  const countStats = hero.countStats;

  return (
    <>
      <section
        ref={root}
        className={`relative flex min-h-[calc(100svh-71px)] max-h-[880px] flex-col justify-center overflow-hidden bg-[#0a1628] pt-[71px] sm:pt-[79px] ${
          rafWorking ? "" : "no-raf-fallback"
        }`}
      >
        {/* ─── Aircraft image — right focal point, mouse parallax ─── */}
        {/* The image fills the whole frame edge-to-edge and is held above scale 1, so
            the parallax, tilt and scroll drift never expose the background as
            empty bands on the left/right of the hero. */}
        <div
          ref={imgWrap}
          className="hero-float absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(${mouse.x}px, ${mouse.y}px, 0)`, transition: "transform 0.1s linear" }}
        >
          <div className="hero-zoom absolute inset-0">
            <picture>
              <source media="(max-width: 639px)" srcSet={heroMobSrc} />
              <source media="(min-width: 640px) and (max-width: 1100px)" srcSet={heroTabSrc} />
              <img
                src={heroDeskSrc}
                alt={heroAlt}
                width={1920}
                height={960}
                fetchPriority="high"
                decoding="async"
                className="h-full w-full scale-[1.06] object-cover object-[56%_45%]"
              />
            </picture>
          </div>
        </div>

        {/* ─── Layered modern gradient background (brand blues, royal blue, sky highlights) ─── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,28,59,0.10) 0%, rgba(7,28,59,0.05) 30%, rgba(8,60,130,0.12) 68%, rgba(7,45,95,0.38) 84%, rgba(5,22,48,0.62) 100%)",
          }}
        />
        {/* Top-to-bottom deep navy to transparent — softens the sky behind the nav */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,28,59,0.48) 0%, rgba(7,28,59,0.20) 22%, rgba(8,45,95,0.05) 45%, rgba(8,60,130,0.00) 70%)",
          }}
        />
        {/* Sky-blue glow from far right (behind aircraft) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse 60%_45% at 85%_40%,rgba(45,140,255,0.08),transparent_65%)]" />
        {/* Under-text scrim — text side only (mirrored automatically in RTL via CSS) */}
        <div className="hero-text-scrim absolute inset-0" />
        {/* Bottom vignette for widget readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/55 via-transparent to-transparent" />

        {/* ─── Cinematic atmosphere layers ─── */}
        {!reducedMotion && (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 will-change-transform"
              animate={{ x: ["0%", "-3%"] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "radial-gradient(ellipse 55% 28% at 75% 65%, rgba(255,255,255,0.04), transparent 70%), radial-gradient(ellipse 40% 20% at 58% 78%, rgba(255,220,170,0.035), transparent 70%)",
                backgroundSize: "160% 160%",
              }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 will-change-transform"
              animate={{ x: ["-40%", "40%"], opacity: [0, 0.4, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
              style={{
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,214,150,0.08) 48%, rgba(255,235,200,0.12) 52%, rgba(255,214,150,0.08) 56%, transparent 64%)",
                mixBlendMode: "soft-light",
              }}
            />
          </>
        )}

        {/* ─── Hero Content — premium spacing ─── */}
        <div className="section-pad relative z-10 mx-auto w-full max-w-[1400px] py-10 sm:py-14 lg:py-16">
          <div className="max-w-full sm:max-w-[min(700px,62vw)] lg:max-w-[min(780px,58vw)]">

            {/* Eyebrow — small aviation label */}
            <motion.p
              initial={rafWorking ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mb-4 inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-[0.32em] text-[#7CC4FF] sm:text-[12.5px]"
            >
              <span className="inline-block h-[2px] w-9 bg-gradient-to-r from-[#7CC4FF] to-[#5aabff] opacity-70" aria-hidden />
              {hero.eyebrow}
            </motion.p>

            {/* ─── Headline — massive 2-line with accent ─── */}
            <div className="relative min-h-[clamp(4.4rem,9vw,8rem)]">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={slide}
                  initial={rafWorking ? { opacity: 0, y: 20 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display leading-[1.02] tracking-[-0.02em] text-white"
                >
                  <span className="block text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.08]">
                    {currentSlide.headline[0]}
                  </span>
                  <span className="block text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-[1.08] bg-gradient-to-r from-[#7CC4FF] via-[#5aabff] to-[#3D9BFF] bg-clip-text text-transparent">
                    {currentSlide.headline[1]}
                  </span>
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* ─── Supporting description ─── */}
            <AnimatePresence mode="wait">
              <motion.p
                key={slide}
                initial={rafWorking ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="hero-subtext mt-4 max-w-[500px] text-[13px] leading-[1.65] text-white/85 sm:text-[14.5px]"
              >
                {currentSlide.subtext}
              </motion.p>
            </AnimatePresence>

            {/* ─── Trust indicators — clean horizontal row ─── */}
            <motion.div
              initial={rafWorking ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="hero-trust mt-6 flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {heroTrust.map((t, i) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/90 sm:text-[12.5px]">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0 text-[#7CC4FF]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 8.5l3.5 3.5L13 4.5" />
                  </svg>
                  {t}
                  {i < heroTrust.length - 1 && <span className="ml-4 hidden h-3 w-px bg-white/20 sm:block" aria-hidden />}
                </span>
              ))}
            </motion.div>

            {/* ─── CTA buttons ─── */}
            {/* ─── High-Conversion Dual CTA Protocol (P0 Revenue Protection) ─── */}
            <motion.div
              initial={rafWorking ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <Link
                  href={lhref("/rfq")}
                  className="group inline-flex items-center gap-3 rounded-full bg-[#0078FF] px-8 py-4 text-[14px] font-bold tracking-wide text-white shadow-[0_12px_36px_-6px_rgba(0,120,255,0.65)] transition-all duration-300 hover:bg-[#3D9BFF] hover:shadow-[0_16px_44px_-6px_rgba(0,120,255,0.8)]"
                >
                  <IconJet className="h-4.5 w-4.5" />
                  <span>Request Mission Flight Quote (RFQ)</span>
                  <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                <a
                  href="tel:+211924016167"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/35 bg-white/10 px-6 py-4 text-[13.5px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-[#7CC4FF] hover:bg-white/20"
                >
                  <IconClock className="h-4 w-4 text-[#7CC4FF]" />
                  <span>Call Juba Duty Desk: +211 924 016 167</span>
                </a>
              </motion.div>
            </motion.div>

            {/* SLA Guarantee Sub-bar */}
            <div className="mt-3.5 flex items-center gap-2 text-[12px] font-medium text-slate-300/90">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span>⚡ Direct operations response within 15 minutes. Ramp launch clearance within 120 minutes.</span>
            </div>
          </div>

          {/* ─── Enterprise Mission Dispatcher (Step 1 of Aviation RFQ) ─── */}
          <motion.div
            initial={rafWorking ? { y: 20, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="hero-widget mt-8 max-w-full sm:max-w-[min(620px,65vw)]"
          >
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_-24px_rgba(0,15,40,0.7)] ring-1 ring-black/10">
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-100/90 px-4 py-2.5 sm:px-6">
                <span className="text-[12px] font-bold uppercase tracking-wider text-navy-950 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0078FF]" />
                  Enterprise Flight Dispatcher
                </span>
                <span className="text-[11px] font-semibold text-slate-500">Juba Base (HJJJ / JUB)</span>
              </div>
              <div className="bg-[#004ea8] p-4 sm:p-5">
                <div className="grid gap-3 sm:grid-cols-[1.1fr_1.1fr_auto] sm:items-end">
                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wider text-white/80">Mission Corridor</label>
                    <select
                      value={destinationInput}
                      onChange={(e) => setDestinationInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-navy-900 shadow-sm focus:border-[#7CC4FF] focus:outline-none"
                    >
                      <option value="Malakal">Juba (JUB) → Malakal Airport (MAK)</option>
                      <option value="Bentiu">Juba (JUB) → Bentiu Airstrip (BNT)</option>
                      <option value="Wau">Juba (JUB) → Wau Airport (WUU)</option>
                      <option value="Bor">Juba (JUB) → Bor Airstrip (BOR)</option>
                      <option value="Rumbek">Juba (JUB) → Rumbek (RBX)</option>
                      <option value="Pibor">Juba (JUB) → Pibor Deep-Field (PBO)</option>
                      <option value="Entebbe">Juba (JUB) ⇄ Entebbe (EBB)</option>
                      <option value="Nairobi">Juba (JUB) ⇄ Nairobi JKIA (NBO)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-bold uppercase tracking-wider text-white/80">Target Payload / Aircraft</label>
                    <select
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-navy-900 shadow-sm focus:border-[#7CC4FF] focus:outline-none"
                    >
                      <option value="an26">Antonov AN-26 (5.5T STOL Ramp)</option>
                      <option value="an74">Antonov AN-74 (10T Heavy Jet)</option>
                      <option value="b737">Boeing 737-300F (18T Palletized)</option>
                      <option value="f27">Fokker F27-500 (Combi 50 Pax)</option>
                      <option value="mi8">Mil Mi-8T (Utility Rotary)</option>
                      <option value="any">Auto-Match Best Airframe</option>
                    </select>
                  </div>
                  <Link
                    href={`${lhref("/rfq")}?mission=cargo&from=Juba&to=${encodeURIComponent(destinationInput || "Malakal")}`}
                    className="inline-flex items-center justify-center rounded-lg bg-[#7CC4FF] px-6 py-2 text-[13px] font-extrabold text-navy-950 shadow-sm transition-all hover:bg-white hover:shadow-md"
                  >
                    Configure RFQ →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Stats row ─── */}
          <motion.div
            initial={rafWorking ? { y: 14, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="hero-stats mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-2"
          >
            {countStats.map((s) => (
              <div key={s.label} className="flex items-baseline gap-2">
                <span className="font-display text-[18px] font-extrabold text-white sm:text-[22px]">
                  <CountUp
                    value={s.value}
                    suffix={s.suffix}
                  />
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">{s.label}</span>
              </div>
            ))}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[18px] font-extrabold text-white sm:text-[22px]">{hero.regionalLabel}</span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/60">{hero.networkLabel}</span>
            </div>
          </motion.div>

          {/* ─── Carousel dots ─── */}
          <div          className="hero-dots mt-5 flex items-center gap-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === slide ? "w-6 bg-[#5aabff]" : "w-1.5 bg-white/25 hover:bg-white/40"
                }`}
                aria-label={fmt(hero.slideAria, { n: i + 1 })}
              />
            ))}
          </div>
        </div>

        {/* ─── Scroll Indicator ─── */}
        <div className="hero-scroll pointer-events-none absolute bottom-4 end-6 hidden items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.3em] text-white/35 md:flex">
          {hero.scroll}
          <span className="relative block h-9 w-px overflow-hidden bg-white/15">
            <span className="absolute inset-x-0 top-0 h-3.5 animate-[scrolldown_1.8s_ease-in-out_infinite] bg-white/50" aria-hidden />
          </span>
          <style>{`
            @keyframes scrolldown{0%{transform:translateY(-100%)}60%,100%{transform:translateY(260%)}}
            .no-raf-fallback [style*="opacity: 0"],
            .no-raf-fallback [style*="opacity:0"] {
              opacity: 1 !important;
              transform: none !important;
            }
          `}</style>
        </div>
      </section>

      {/* ─── Floating Mobile CTA ─── */}
      <div
        className={`fixed bottom-5 left-4 right-4 z-40 transition-all duration-500 md:hidden ${
          scrolledPast ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href={lhref("/contact#charter")}
          className="flex items-center justify-center gap-2 rounded-full bg-[#0078FF] px-5 py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_30px_-4px_rgba(0,120,255,0.60)]"
        >
          {hero.floatingCta}
        </Link>
      </div>
    </>
  );
}
