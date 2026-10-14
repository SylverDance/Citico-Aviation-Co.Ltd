"use client";

import Link from "next/link";
import { Reveal, SectionHead } from "@/components/ui";
import { DynIcon, IconArrow } from "@/components/icons";
import { useDict, useLocalizedHref } from "@/components/locale-provider";

export function CoreCapabilities() {
  const { capabilities, sections, ui } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section className="section-pad mx-auto max-w-[1400px] py-20 sm:py-28">
      <SectionHead
        kicker={sections.capabilitiesKicker}
        title={<>{sections.capabilitiesTitle.lead} <span className="text-gradient">{sections.capabilitiesTitle.accent}</span></>}
      />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap, i) => (
          <Reveal key={cap.title} delay={i * 0.08}>
            <Link
              href={lhref(cap.href)}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-citico-500/40 hover:shadow-[0_20px_45px_-18px_rgba(0,90,200,0.30)] dark:border-white/10 dark:bg-navy-800/60"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-citico-100 bg-citico-50 text-citico-700 transition-colors group-hover:border-citico-500/40 group-hover:bg-citico-500 group-hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-citico-300">
                <DynIcon name={cap.icon} className="h-7 w-7" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold text-navy-900 transition-colors group-hover:text-citico-700 dark:text-white dark:group-hover:text-citico-300">
                {cap.title}
              </h3>
              <p className="mt-3 flex-1 text-[14px] leading-relaxed text-navy-700/70 dark:text-slate-400">
                {cap.body}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-citico-700 dark:text-citico-300">
                {ui.learnMore}
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
