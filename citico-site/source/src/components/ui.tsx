"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/* Detect "in view" without IntersectionObserver — deterministic in every
   environment (embedded webviews, battery-saver browsers, etc). */
function useInViewSafe<T extends HTMLElement>(margin = 60) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let done = false;
    const check = () => {
      if (done) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh - margin && r.bottom > margin) {
        done = true;
        setInView(true);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        clearInterval(iv);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(check);
    };
    // safety poll in case scroll events never fire
    const iv = setInterval(check, 700);
    const stop = setTimeout(() => clearInterval(iv), 20000);
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      clearInterval(iv);
      clearTimeout(stop);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [margin]);
  return { ref, inView };
}

/* ---------------- Logo ----------------
   The official CITICO Aviation logo — used EXACTLY as provided, everywhere.
   One asset, original blue/red colors, true transparent background.
   No theme variants, no filters, no color animation — requirement: the logo
   renders in its official colors from the first paint in light AND dark mode. */
export function CiticoLogo({
  className = "",
  priority = false,
}: {
  className?: string;
  white?: boolean;
  priority?: boolean;
  fadeIn?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        filter: "none",
        mixBlendMode: "normal",
        opacity: 1,
      }}
      className={className}
    >
      <Image
        src="/img/logo.png"
        alt="CITICO Aviation Co. Ltd"
        width={820}
        height={579}
        priority={priority}
        className="!h-full !w-auto"
        sizes="260px"
      />
    </span>
  );
}

/* ---------------- Buttons ---------------- */
type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost" | "white";
  className?: string;
  external?: boolean;
};

export function Btn({ href, children, variant = "primary", className = "", external }: BtnProps) {
  const styles: Record<string, string> = {
    primary:
      "bg-citico-700 text-white hover:bg-citico-600 shadow-[0_10px_30px_-12px_rgba(12,12,120,0.55)] dark:bg-citico-500 dark:hover:bg-citico-400 dark:text-white",
    outline:
      "border border-citico-800/25 dark:border-white/25 text-citico-900 dark:text-white hover:border-citico-600 hover:bg-citico-50/60 dark:hover:bg-white/10",
    ghost: "text-citico-900 dark:text-white hover:bg-citico-900/5 dark:hover:bg-white/10",
    white: "bg-white text-navy-900 hover:bg-citico-100 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]",
  };
  const cls = `group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${styles[variant]} ${className}`;
  const inner = (
    <>
      {children}
      <span
        className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
        aria-hidden
      >
        →
      </span>
    </>
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionHead({
  kicker,
  title,
  sub,
  align = "center",
  dark = false,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  return (
    <Reveal className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`mb-3 text-xs font-bold uppercase tracking-[0.28em] ${dark ? "text-citico-300" : "text-citico-600"}`}>{kicker}</p>
      <h2
        className={`font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.75rem] ${
          dark ? "text-white" : "text-navy-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
      {sub ? <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? "text-slate-300/85" : "text-navy-700/70 dark:text-slate-300/75"}`}>{sub}</p> : null}
    </Reveal>
  );
}

/* ---------------- Reveal on scroll ---------------- */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const { ref, inView } = useInViewSafe<HTMLDivElement>();
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.6, 0.35, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Animated counter ---------------- */
export function Counter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const { ref, inView } = useInViewSafe<HTMLSpanElement>(40);
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 22 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString("en-US"));
    });
    return unsub;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------------- Image with dark overlay ---------------- */
export function OverlayImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  );
}
