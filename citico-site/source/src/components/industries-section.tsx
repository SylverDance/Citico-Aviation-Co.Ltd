"use client";

import { Reveal, SectionHead } from "@/components/ui";
import { DynIcon } from "@/components/icons";
import { useDict } from "@/components/locale-provider";

export function IndustriesSection() {
  const { industries, sections } = useDict();
  return (
    <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-32">
      <SectionHead
        kicker={sections.industriesKicker}
        title={<>{sections.industriesTitle.lead} <span className="text-gradient">{sections.industriesTitle.accent}</span></>}
        sub={sections.industriesSub}
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {industries.map((ind, i) => (
          <Reveal key={ind.title} delay={i * 0.08}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-navy-900/8 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card dark:border-white/10 dark:bg-navy-800/60">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-citico-500 to-citico-700 text-white">
                <DynIcon name={ind.icon} className="h-7 w-7" />
              </span>
              <h3 className="font-display mt-5 text-xl font-bold text-navy-900 dark:text-white">{ind.title}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-navy-700/70 dark:text-slate-400">{ind.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
