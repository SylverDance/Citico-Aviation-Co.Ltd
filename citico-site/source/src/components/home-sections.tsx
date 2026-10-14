"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Btn, Counter, OverlayImage, Reveal, SectionHead } from "@/components/ui";
import { DynIcon, IconArrow, IconCheck, IconClock, IconMail, IconMapPin, IconPhone, IconPlus, IconShield } from "@/components/icons";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n";

/* ================= WHO WE ARE ================= */
export function WhoWeAreSection() {
  const { whoWeAre, sections } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section id="who-we-are" className="section-pad relative mx-auto max-w-[1400px] py-24 sm:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHead
            align="left"
            kicker={whoWeAre.kicker}
            title={
              <>
                {sections.whoWeAreTitle.lead} <span className="text-gradient">{sections.whoWeAreTitle.accent}</span>
              </>
            }
          />
          <Reveal delay={0.1}>
            <div className="mt-6 space-y-5 text-[15.5px] leading-relaxed text-navy-700/80 dark:text-slate-300/80">
              {whoWeAre.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {whoWeAre.highlights.map((h) => (
                <div
                  key={h.title}
                  className="group rounded-2xl border border-navy-900/8 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-citico-500/40 hover:shadow-card dark:border-white/10 dark:bg-white/5"
                >
                  <h3 className="font-display text-sm font-bold text-citico-700 dark:text-citico-300">{h.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy-700/70 dark:text-slate-400">{h.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9">
              <Btn href={lhref("/about")} variant="outline">
                {sections.whoWeAreCta}
              </Btn>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="relative">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <OverlayImage
                src="/img/ops-airfield.jpg"
                alt="CITICO cargo operations on a remote airstrip"
                className="aspect-[3/4] rounded-3xl"
                sizes="(min-width:1024px) 25vw, 50vw"
              />
              <div className="mt-10 grid gap-4">
                <OverlayImage
                  src="/img/ops-mission.jpg"
                  alt="Humanitarian mission loading in South Sudan"
                  className="aspect-square rounded-3xl"
                  sizes="(min-width:1024px) 25vw, 50vw"
                />
                <div className="dust-overlay relative overflow-hidden rounded-3xl bg-gradient-to-br from-citico-800 to-citico-950 p-6 text-white">
                  <p className="font-display text-4xl font-bold">
                    <Counter value={2012} />
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-citico-200">{sections.establishedLabel}</p>
                  <p className="mt-4 text-[13px] leading-relaxed text-slate-300/90">
                    {sections.zeroIncidents}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-3 rounded-2xl glass px-6 py-4 shadow-card sm:flex">
              <IconShield className="h-8 w-8 text-citico-600 dark:text-citico-300" />
              <div>
                <p className="text-sm font-bold text-navy-900 dark:text-white">{sections.zeroBadgeTitle}</p>
                <p className="text-xs text-navy-700/60 dark:text-slate-400">{sections.zeroBadgeSub}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= MISSION / VISION / VALUES ================= */
export function MissionVisionSection() {
  const { missionVision, sections } = useDict();
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(180deg,#0d4a9b 0%,#083672 45%,#052452 100%)" }}>
      <div className="grid-lines absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute -right-40 top-0 h-[480px] w-[480px] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(45,140,255,0.55), transparent)" }}
        aria-hidden
      />
      <div
        className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #7CC4FF, transparent)" }}
        aria-hidden
      />
      <div className="section-pad relative mx-auto max-w-[1400px]">
        <SectionHead
          dark
          kicker={sections.missionKicker}
          title={
            <>
              {sections.missionTitle.lead} <span className="text-gradient">{sections.missionTitle.accent}</span>
            </>
          }
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {[
            { t: sections.missionCardTitle, b: missionVision.mission, i: "target" },
            { t: sections.visionCardTitle, b: missionVision.vision, i: "spark" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-colors duration-300 hover:border-citico-400/40 sm:p-10">
                <DynIcon name={c.i} className="h-9 w-9 text-citico-300" />
                <h3 className="font-display mt-5 text-xl font-bold text-white">{c.t}</h3>
                <p className="mt-3 leading-relaxed text-slate-300/85">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {missionVision.values.map((v, i) => (
            <Reveal key={v.title} delay={0.1 + i * 0.07}>
              <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-citico-500/50 hover:bg-white/[0.07]">
                <div className="flex items-center justify-between">
                  <DynIcon name={v.icon} className="h-7 w-7 text-citico-400" />
                  <span className="font-display text-xs font-bold text-white/25">0{i + 1}</span>
                </div>
                <h3 className="font-display mt-4 text-lg font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-slate-400">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= SERVICES ================= */
export function ServicesSection() {
  const { services, sections, ui } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section id="services" className="section-pad mx-auto max-w-[1400px] scroll-mt-20 py-24 sm:py-32">
      <SectionHead
        kicker={sections.servicesKicker}
        title={
          <>
            {sections.servicesTitle.lead} <span className="text-gradient">{sections.servicesTitle.accent}</span>
          </>
        }
        sub={sections.servicesSub}
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal key={s.slug} delay={(i % 3) * 0.08}>
            <Link
              href={lhref(`/services/${s.slug}`)}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/8 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card dark:border-white/10 dark:bg-navy-800/60"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
                <div className="absolute bottom-3 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-citico-700 shadow-lg backdrop-blur dark:bg-citico-500 dark:text-white">
                  <DynIcon name={s.icon} className="h-5.5 w-5.5" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold text-navy-900 transition-colors group-hover:text-citico-700 dark:text-white dark:group-hover:text-citico-300">
                  {s.title}
                </h3>
                <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-navy-700/70 dark:text-slate-400">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-citico-700 dark:text-citico-300">
                  {ui.learnMore}
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}

        {/* CTA tile */}
        <Reveal delay={0.16}>
          <div className="dust-overlay relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-citico-700 via-citico-800 to-citico-950 p-7 text-white">
            <div className="grid-lines absolute inset-0 opacity-20" aria-hidden />
            <div className="relative">
              <h3 className="font-display text-2xl font-bold leading-snug">
                {sections.servicesCtaTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-citico-100/85">
                {sections.servicesCtaBody}
              </p>
            </div>
            <Link
              href={lhref("/contact#charter")}
              className="group relative mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-all hover:-translate-y-0.5"
            >
              {sections.servicesCtaButton}
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= FLEET — Procurement-Grade Aircraft Presentation ================= */
export function FleetSection() {
  const { fleet, sections, pages } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section id="fleet" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 opacity-[0.18]">
        <Image src="/img/ops-sky.jpg" alt="" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0a3d80 0%,rgba(6,44,96,0.88) 45%,#052452 100%)" }} aria-hidden />
      <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(45,140,255,0.5), transparent)" }} aria-hidden />
      <div className="section-pad relative mx-auto max-w-[1400px]">
        <SectionHead
          dark
          kicker="AIR OPERATOR FLEET & CAPACITIES"
          title={<>{sections.fleetTitle.lead} <span className="text-gradient">{sections.fleetTitle.accent}</span></>}
          sub="Asset-backed, SSCAA-registered aircraft configured for remote unpaved airstrips, heavy humanitarian cargo, and emergency dispatch."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.08}>
              <Link
                href={lhref(`/fleet/${a.slug}`)}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur transition-all duration-300 hover:-translate-y-1.5 hover:border-white/30 hover:shadow-[0_20px_50px_-15px_rgba(0,120,255,0.3)]"
              >
                {/* Aircraft image + Badges */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={a.image}
                    alt={a.model}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/30 to-transparent" />
                  
                  {/* Top Status & Reg Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Ramp Ready (JUB)
                    </span>
                    <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-200 backdrop-blur-sm border border-white/10">
                      Reg: {a.registration || a.tailNumbers?.[0]}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#7CC4FF]">{a.role}</p>
                    <h3 className="font-display text-2xl font-bold text-white">{a.model}</h3>
                  </div>
                </div>

                {/* Procurement Technical Matrix */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-white/[0.05] p-3 border border-white/5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Max Payload</p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-white">{a.payload}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Operational Range</p>
                      <p className="mt-0.5 text-[13.5px] font-extrabold text-white">{a.range}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">MTOW</p>
                      <p className="mt-0.5 text-[12.5px] font-bold text-slate-200">{a.mtow || "Certified"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Runway Surface</p>
                      <p className="mt-0.5 text-[12.5px] font-bold text-emerald-400">
                        {a.unpavedCertified ? "Unpaved / STOL" : "Paved Only"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[12.5px] leading-relaxed text-slate-300/80">
                    {a.blurb}
                  </p>

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                    <span className="text-[12px] font-bold text-[#7CC4FF] inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                      View LOPA & Load Sheet
                      <IconArrow className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Fleet: {a.count} Airframes
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= LOGISTICS ================= */
export function LogisticsSection() {
  const { logistics, sections } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section id="logistics" className="section-pad mx-auto max-w-[1400px] scroll-mt-20 py-24 sm:py-32">
      <SectionHead
        kicker={sections.logisticsKicker}
        title={
          <>
            {sections.logisticsTitle.lead}{" "}
            <span className="text-gradient">{sections.logisticsTitle.accent}</span>
          </>
        }
        sub={logistics.intro}
      />

      {/* animated flow */}
      <Reveal className="relative mt-14">
        <div className="relative overflow-hidden rounded-3xl border border-navy-900/8 bg-white/70 p-7 dark:border-white/10 dark:bg-navy-800/50 sm:p-10">
          <div className="grid-lines absolute inset-0 opacity-60 dark:opacity-30" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {logistics.modes.map((m, i) => (
              <div key={m.key} className="contents">
                <Reveal delay={i * 0.15}>
                  <div className="group flex flex-col items-center text-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-citico-500/25 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-citico-600 to-citico-900 text-white shadow-glow-blue">
                        <DynIcon name={m.icon} className="h-7 w-7" />
                      </div>
                      <span className="absolute -right-2 -top-2 rounded-full bg-citico-600 px-2 py-0.5 text-[12px] font-bold text-white">
                        {m.key}
                      </span>
                    </div>
                    <h3 className="font-display mt-4 text-lg font-bold text-navy-900 dark:text-white">{m.title}</h3>
                    <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-navy-700/70 dark:text-slate-400">{m.body}</p>
                  </div>
                </Reveal>
                {i < logistics.modes.length - 1 && (
                  <div className="hidden lg:block" aria-hidden>
                    <svg width="110" height="40" viewBox="0 0 110 40" fill="none" className="text-citico-500 dark:text-citico-400">
                      <path
                        d="M4 30 C 35 30, 45 8, 78 8"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="6 6"
                        className="animate-dash"
                      />
                      <path d="M74 2l10 6-10 6" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* route line (mobile) */}
          <div className="relative mt-8 h-px w-full bg-gradient-to-r from-transparent via-citico-500/50 to-transparent lg:hidden" aria-hidden />

          <Reveal delay={0.3}>
            <div className="relative mt-9 flex items-start gap-4 rounded-2xl border border-citico-500/25 bg-citico-50/70 p-5 dark:bg-citico-900/25">
              <IconCheck className="mt-0.5 h-5.5 w-5.5 shrink-0 text-citico-600 dark:text-citico-300" />
              <p className="text-sm leading-relaxed text-navy-800/85 dark:text-slate-300/90">
                <strong className="font-semibold text-navy-900 dark:text-white">{sections.multimodalLabel}</strong>
                {logistics.advantage}
              </p>
            </div>
          </Reveal>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-8 flex justify-center">
          <Btn href={lhref("/logistics")}>{sections.logisticsCta}</Btn>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= WHY CITICO ================= */
export function WhySection() {
  const { whyCitico, sections } = useDict();
  return (
    <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-28">
      <SectionHead        kicker={sections.whyKicker}
        title={<>{sections.whyTitle.lead} <span className="text-gradient">{sections.whyTitle.accent}</span></>}
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {whyCitico.map((w, i) => (
          <Reveal key={w.title} delay={i * 0.08}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-navy-900/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card dark:border-white/10 dark:bg-navy-800/60">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-citico-700 to-citico-900 text-white">
                <DynIcon name={w.icon} className="h-6 w-6" />
              </span>
              <h3 className="font-display mt-5 text-lg font-bold text-navy-900 dark:text-white">{w.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-navy-700/70 dark:text-slate-400">{w.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= LEADERSHIP ================= */
// Executive-grade implementation lives in components/leadership.tsx
export { LeadershipSection } from "@/components/leadership";

/* ================= SAFETY — Major dedicated section ================= */
export function SafetySection() {
  const { safety, sections } = useDict();
  return (
    <section id="safety" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0">
        <Image src="/img/ops-ground.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.16]" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#0a3d80 0%,rgba(7,44,94,0.9) 45%,#052452 100%)" }} />
      </div>
      <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(closest-side, #7CC4FF, transparent)" }} aria-hidden />
      <div className="section-pad relative mx-auto max-w-[1400px]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          {/* Left: image + headline */}
          <div>
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl">
                <Image
                  src="/img/ops-airfield.jpg"
                  alt="CITICO aircraft operations"
                  width={800}
                  height={500}
                  className="w-full rounded-3xl object-cover"
                  sizes="(min-width:1024px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041c40]/90 via-[#063a78]/30 to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <figure className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-7 backdrop-blur">
                <blockquote className="text-[14.5px] leading-relaxed text-slate-300/90">“{safety.quote.text}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <span className="font-semibold text-white">{safety.quote.author}</span>
                  <span className="text-slate-400"> — {safety.quote.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* Right: headline + operational areas */}
          <div>
            <SectionHead
              dark
              align="left"
              kicker={sections.safetyKicker}
              title={<>{sections.safetyTitle.lead} <span className="text-gradient">{sections.safetyTitle.accent}</span></>}
              sub={safety.sub}
            />
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {safety.points.map((p, i) => (
                <Reveal key={p.title} delay={0.1 + i * 0.07}>
                  <div className="group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-all duration-300 hover:border-citico-500/40 hover:bg-white/[0.07]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-citico-600 to-citico-800 text-white">
                      <DynIcon name={p.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-[14px] font-bold text-white">{p.title}</h3>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-slate-400">{p.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= PARTNERS ================= */
export function PartnersSection() {
  const { partners, sections } = useDict();
  const items = [...partners, ...partners];
  return (
    <section className="section-pad mx-auto max-w-[1400px] py-20 sm:py-24">
      <SectionHead
        kicker={sections.partnersKicker}
        title={
          <>
            {sections.partnersTitle.lead} <span className="text-gradient">{sections.partnersTitle.accent}</span>
          </>
        }
        sub={sections.partnersSub}
      />
      <Reveal className="relative mt-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" aria-hidden />
        <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
          <div className="flex w-max animate-marquee gap-4 pr-4 hover:[animation-play-state:paused]">
            {items.map((p, i) => (
              <div
                key={`${p.name}-${i}`}
                className="flex min-w-[210px] items-center justify-center gap-3 rounded-2xl border border-navy-900/8 bg-white/80 px-7 py-5 transition-colors hover:border-citico-500/40 dark:border-white/10 dark:bg-white/[0.05]"
              >
                {"logo" in p && p.logo ? (
                  <Image src={p.logo} alt={p.name} width={64} height={34} className="h-8 w-auto object-contain opacity-80 dark:invert dark:opacity-90" />
                ) : (
                  <span className="font-display text-base font-bold tracking-wide text-navy-800/85 dark:text-slate-200/90">{p.name}</span>
                )}
                <span className="hidden text-[12px] text-navy-700/50 dark:text-slate-500 xl:block">{p.note}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ================= CONTACT ================= */
export function ContactSection() {
  const { company, sections } = useDict();
  const [mapLoaded, setMapLoaded] = useState(false);
  return (
    <section id="contact" className="section-pad mx-auto max-w-[1400px] scroll-mt-20 pb-24 pt-4 sm:pb-32">
      <div className="overflow-hidden rounded-[2rem] border border-navy-900/8 bg-white/70 dark:border-white/10 dark:bg-navy-800/50">
        <div className="grid lg:grid-cols-2">
          <div className="p-8 sm:p-12">
            <SectionHead
              align="left"
              kicker={sections.contactKicker}
              title={
                <>
                  {sections.contactTitle.lead} <span className="text-gradient">{sections.contactTitle.accent}</span>
                </>
              }
              sub={sections.contactSub}
            />
            <div className="mt-9 space-y-6">
              <Reveal className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/15 dark:text-citico-300">
                  <IconMapPin className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">{sections.contactHeadOffice}</h3>
                  <p className="mt-1 text-[14px] text-navy-700/75 dark:text-slate-400">{company.hq}</p>
                </div>
              </Reveal>
              <Reveal delay={0.05} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/15 dark:text-citico-300">
                  <IconPhone className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">{sections.contactPhone}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-navy-700/75 dark:text-slate-400">
                    {company.phones.map((p) => (
                      <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block transition-colors hover:text-citico-700 dark:hover:text-citico-300">
                        {p}
                      </a>
                    ))}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/15 dark:text-citico-300">
                  <IconMail className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">{sections.contactEmail}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-navy-700/75 dark:text-slate-400">
                    <a href={`mailto:${company.email}`} className="block transition-colors hover:text-citico-700 dark:hover:text-citico-300">
                      {company.email}
                    </a>
                    <a href={`mailto:${company.businessEmail}`} className="block transition-colors hover:text-citico-700 dark:hover:text-citico-300">
                      {company.businessEmail}
                    </a>
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.15} className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/15 dark:text-citico-300">
                  <IconClock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 dark:text-white">{sections.contactDesk}</h3>
                  <p className="mt-1 text-[14px] text-navy-700/75 dark:text-slate-400">{sections.contactDeskBody}</p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* map — click-to-load so the iframe never blocks first paint */}
          <div className="relative min-h-[340px] lg:min-h-full">
            {mapLoaded ? (
            <iframe
              title={sections.mapTitle}
              src="https://www.openstreetmap.org/export/embed.html?bbox=31.565%2C4.845%2C31.605%2C4.885&layer=mapnik&marker=4.865%2C31.585"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            ) : (
              <button
                type="button"
                onClick={() => setMapLoaded(true)}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#e8f1fb] to-[#d3e5f7] text-[#004ea8] transition-colors hover:from-[#d9e9fa] hover:to-[#c2daf2]"
                aria-label={sections.mapAria}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#004ea8] text-white shadow-[0_10px_30px_-10px_rgba(0,78,168,0.6)] transition-transform duration-300 group-hover:scale-110">
                  <IconMapPin className="h-6 w-6" />
                </span>
                <span className="text-[13px] font-bold uppercase tracking-[0.14em]">{sections.mapButton}</span>
                <span className="text-[12px] text-[#004ea8]/70">{sections.mapButtonSub}</span>
              </button>
            )}
            <div className="pointer-events-none absolute inset-0 lg:bg-gradient-to-r lg:from-white/25 lg:to-transparent dark:lg:from-navy-950/30" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
