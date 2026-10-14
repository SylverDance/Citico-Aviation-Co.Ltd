"use client";

import Link from "next/link";
import { Reveal, SectionHead } from "@/components/ui";
import { PageHero, NextCta } from "@/components/detail";
import { IconArrow, IconShield } from "@/components/icons";
import { corridors, type FlightCorridor } from "@/lib/content";
import { localizeHref, type Locale } from "@/lib/i18n";

export function CorridorView({
  corridor,
  locale,
}: {
  corridor: FlightCorridor;
  locale: Locale;
}) {
  const lhref = (path: string) => localizeHref(path, locale);
  const otherCorridors = corridors.filter((c) => c.slug !== corridor.slug);

  const rfqDeepLink = `/rfq?origin=${encodeURIComponent(
    `${corridor.origin} (${corridor.originIata})`
  )}&dest=${encodeURIComponent(
    `${corridor.destination} (${corridor.destIata})`
  )}&mission=cargo`;

  return (
    <>
      <PageHero
        kicker="Scheduled & On-Demand Aviation Corridor"
        title={corridor.title}
        sub={`${corridor.distanceNm} NM corridor connecting ${corridor.origin} (${corridor.originIata}) with ${corridor.destination} (${corridor.destIata}). Fast clearance, payload optimization, and 24/7 ops desk.`}
        image="/img/ops-airfield.jpg"
        breadcrumbLabel="Corridors"
        basePath={locale === "ar" ? "/ar" : ""}
        breadcrumb={[
          { href: lhref("/"), label: "Home" },
          { href: lhref("/services/charter-flights"), label: "Charters & Routes" },
          { href: lhref(`/routes/${corridor.slug}`), label: `${corridor.originIata} - ${corridor.destIata}` },
        ]}
      />

      <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main Corridor Intelligence */}
          <div className="space-y-10">
            {/* Quick Metrics Bar */}
            <Reveal>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-3xl border border-navy-900/8 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5 shadow-sm">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Distance
                  </span>
                  <span className="mt-1 block font-display text-2xl font-bold text-navy-950 dark:text-white">
                    {corridor.distanceNm} <span className="text-sm font-normal text-slate-400">NM</span>
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Flight Time
                  </span>
                  <span className="mt-1 block font-display text-2xl font-bold text-citico-700 dark:text-citico-400">
                    {corridor.flightTimeTurboprop}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Runway Surface
                  </span>
                  <span className="mt-1 block text-sm font-bold text-navy-900 dark:text-white">
                    {corridor.runwayType}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Max Payload
                  </span>
                  <span className="mt-1 block font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {corridor.typicalPayloadKg.toLocaleString()} <span className="text-sm font-normal">kg</span>
                  </span>
                </div>
              </div>
            </Reveal>

            {/* Operational Briefing */}
            <Reveal delay={0.06}>
              <div className="rounded-3xl border border-navy-900/8 bg-white/70 p-8 dark:border-white/10 dark:bg-white/5 space-y-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-navy-950 dark:text-white">
                    Operational Flight Profile
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {corridor.operationalSummary}
                  </p>
                </div>

                <div className="border-t border-navy-900/8 dark:border-white/10 pt-6">
                  <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
                    Humanitarian & Logistics Relevance
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {corridor.humanitarianSignificance}
                  </p>
                </div>

                <div className="border-t border-navy-900/8 dark:border-white/10 pt-6">
                  <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
                    Meteorological Hazards & Dispatch Protocol
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {corridor.weatherAndHazards}
                  </p>
                </div>

                <div className="border-t border-navy-900/8 dark:border-white/10 pt-6">
                  <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
                    Ground Handling & Security Protocol
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {corridor.handlingAvailable}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Aircraft Options for this Corridor */}
            <Reveal delay={0.08}>
              <div>
                <SectionHead
                  align="left"
                  kicker="Fleet Match"
                  title="Approved Aircraft Roster for this Route"
                  sub="Aircraft configured and cleared for destination airstrip dimensions and unpaved criteria."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {corridor.recommendedAircraft.map((plane) => (
                    <div
                      key={plane}
                      className="rounded-2xl border border-navy-900/8 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-citico-700 dark:text-citico-400">
                        <IconShield className="h-4 w-4" />
                        <span>AOC Certified Route Type</span>
                      </div>
                      <p className="mt-2 font-display text-base font-bold text-navy-950 dark:text-white">
                        {plane}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Pre-cleared on {corridor.originIata} ↔ {corridor.destIata} with dedicated ramp coordination.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <Reveal delay={0.1}>
              <div className="rounded-3xl bg-gradient-to-br from-citico-900 to-navy-950 p-7 text-white shadow-xl shadow-citico-950/20">
                <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Instant Dispatch
                </span>
                <h3 className="mt-3 font-display text-2xl font-bold leading-tight">
                  Charter Flight on this Corridor
                </h3>
                <p className="mt-2 text-xs text-citico-100/75 leading-relaxed">
                  Lock in slot times, aircraft positioning, and ground handling for your passenger rotation or cargo mission.
                </p>

                <div className="mt-6 space-y-3">
                  <Link
                    href={rfqDeepLink}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-citico-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-citico-400"
                  >
                    <span>Request Corridor RFQ</span>
                    <span>→</span>
                  </Link>

                  <a
                    href={`https://wa.me/211924016167?text=${encodeURIComponent(
                      `URGENT CORRIDOR INQUIRY: ${corridor.title} (${corridor.originIata}-${corridor.destIata})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500"
                  >
                    <span>WhatsApp 24/7 Operations</span>
                  </a>

                  <a
                    href="tel:+211924016167"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-5 py-3 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <span>Call Duty Desk: +211 924 016 167</span>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Other Corridor Links */}
            <Reveal delay={0.12}>
              <div className="rounded-3xl border border-navy-900/8 bg-white/70 p-6 dark:border-white/10 dark:bg-white/5">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Other Active Air Corridors
                </h4>
                <div className="mt-4 space-y-3">
                  {otherCorridors.map((c) => (
                    <Link
                      key={c.slug}
                      href={lhref(`/routes/${c.slug}`)}
                      className="group flex items-center justify-between rounded-xl p-2.5 transition hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <div>
                        <span className="block text-xs font-bold text-navy-950 dark:text-white group-hover:text-citico-600">
                          {c.originIata} → {c.destIata} ({c.destination})
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          {c.flightTimeTurboprop} · {c.distanceNm} NM
                        </span>
                      </div>
                      <IconArrow className="h-4 w-4 text-slate-400 group-hover:text-citico-600 group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <NextCta
        href={rfqDeepLink}
        label={`Ready to mobilize a mission to ${corridor.destination}?`}
        sub="Our 24/7 dispatch desk coordinates permits, fuel, and ramp handling directly."
        ctaLabel="Open Flight RFQ"
      />
    </>
  );
}
