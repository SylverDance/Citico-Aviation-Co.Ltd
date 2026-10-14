"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CiticoLogo } from "@/components/ui";
import { IconMenu, IconPhone, IconX } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { stripLocale } from "@/lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { nav, header } = useDict();
  const lhref = useLocalizedHref();
  const current = stripLocale(pathname || "/");

  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    return base === "/" ? current === "/" : current.startsWith(base);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-[0_6px_30px_-12px_rgba(0,30,70,0.28)]">
      {/* ─── Institutional Regulatory Compliance Strip (P0 Trust) ─── */}
      <div className="bg-[#051c38] px-3 py-1.5 text-[11px] font-semibold text-slate-200 sm:px-6">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 font-bold tracking-wider text-[#7CC4FF]">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              SSCAA AOC: SSCAA/AOC/019-R
            </span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span className="hidden font-medium text-slate-300 sm:inline">ICAO: CTC</span>
            <span className="hidden text-white/30 sm:inline">|</span>
            <span className="hidden text-slate-300 md:inline">24/7 Juba Airport Operations Desk (HJJJ / JUB)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 sm:gap-4">
            <span className="hidden lg:inline text-white/80 font-medium">⚡ 15-Min Response SLA</span>
            <a
              href="tel:+211924016167"
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#7CC4FF] transition-colors"
            >
              <IconPhone className="h-3 w-3 text-emerald-400" />
              <span>Ops Hotline: +211 924 016 167</span>
            </a>
          </div>
        </div>
      </div>

      <div className="section-pad mx-auto flex h-[64px] max-w-[1400px] items-center justify-between gap-4 sm:h-[70px]">
        {/* Brand: the official logo, original colors, unmodified, transparent background. */}
        <Link href={lhref("/")} aria-label={header.brandAria} className="relative z-10 flex shrink-0 items-center">
          <motion.span
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="inline-flex h-[40px] items-center sm:h-[48px]"
          >
            <CiticoLogo className="h-full w-auto" priority />
          </motion.span>
        </Link>

        {/* Desktop nav — Citico brand blue on white */}
        <motion.nav
          aria-label={header.primaryNavAria}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
          className="hidden items-center gap-0.5 xl:flex"
        >
          {nav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={lhref(item.href)}
                aria-current={active ? "page" : undefined}
                className={`group relative rounded-full px-4 py-2.5 text-[14.5px] font-semibold tracking-wide transition-all duration-300 hover:-translate-y-0.5 ${
                  active ? "text-[#004ea8]" : "text-[#004ea8]/85 hover:text-[#0078FF]"
                }`}
              >
                {item.label}
                {/* hover pill */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#0078FF]/0 transition-colors duration-300 group-hover:bg-[#0078FF]/8"
                />
                {/* active/hover underline */}
                <span
                  aria-hidden
                  className={`absolute inset-x-4 bottom-1 h-[2.5px] rounded-full bg-gradient-to-r from-[#0078FF] to-[#7CC4FF] transition-all duration-300 ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </motion.nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <LanguageSwitcher />
          </div>
          <a
            href={header.phoneHref}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-[13px] font-semibold text-[#004ea8]/85 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0078FF]/8 hover:text-[#0078FF] lg:flex"
            aria-label={header.callAria}
          >
            <IconPhone className="h-4 w-4" />
            <span className="hidden xl:inline">{header.phoneLabel}</span>
          </a>
          <Link
            href={lhref("/rfq")}
            className="hidden items-center rounded-full bg-[#0078FF] px-6 py-2.5 text-[13.5px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,120,255,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#004ea8] hover:shadow-[0_12px_30px_-8px_rgba(0,78,168,0.6)] md:inline-flex"
          >
            {header.requestCharter}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? header.closeMenu : header.openMenu}
            aria-expanded={open}
            className="rounded-full p-2 text-[#004ea8] transition-colors hover:bg-[#0078FF]/10 xl:hidden"
          >
            {open ? <IconX className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* brand accent line under the bar */}
      <div
        className="h-[3px] w-full bg-gradient-to-r from-[#004ea8] via-[#0078FF] to-[#7CC4FF] opacity-90"
        aria-hidden
      />

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label={header.mobileNavAria}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-t border-navy-900/8 bg-white xl:hidden"
          >
            <div className="section-pad flex flex-col gap-1 py-5">
              {nav.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04 }}
                  >
                    <Link
                      href={lhref(item.href)}
                      className={`block rounded-lg px-4 py-3 text-[15px] font-semibold transition-colors ${
                        active
                          ? "bg-[#0078FF]/10 text-[#004ea8]"
                          : "text-[#004ea8]/85 hover:bg-[#0078FF]/8 hover:text-[#0078FF]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <div className="my-2 h-px bg-navy-900/10" aria-hidden />
              <div className="mt-3 flex flex-col gap-2">
                <LanguageSwitcher variant="mobile" />
                <Link
                  href={lhref("/contact#charter")}
                  className="rounded-full bg-[#0078FF] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,120,255,0.65)]"
                >
                  {header.requestCharter}
                </Link>
                <a
                  href={header.phoneHref}
                  className="rounded-full border border-[#004ea8]/20 px-5 py-3 text-center text-sm font-semibold text-[#004ea8]"
                >
                  {header.phoneLabel}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
