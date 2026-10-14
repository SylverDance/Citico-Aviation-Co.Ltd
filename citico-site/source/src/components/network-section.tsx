"use client";

import { Reveal, SectionHead } from "@/components/ui";
import { RouteMap } from "@/components/route-map";
import { useDict } from "@/components/locale-provider";

export function NetworkSection() {
  const { network, sections } = useDict();

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg,#052452 0%,#083672 50%,#0d4a9b 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(closest-side, rgba(45,140,255,0.55), transparent)",
        }}
        aria-hidden
      />

      <div className="section-pad relative mx-auto max-w-[1400px]">
        <SectionHead
          dark
          kicker={sections.networkKicker}
          title={
            <>
              {sections.networkTitle.lead}{" "}
              <span className="text-gradient">{sections.networkTitle.accent}</span>
            </>
          }
          sub={sections.networkSub}
        />

        {/* Interactive Route Map */}
        <Reveal className="mt-12">
          <RouteMap hideHeader />
        </Reveal>

        {/* Regional Connections & Domestic Network Summary */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Regional Hubs Cards */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#7CC4FF]">
                  Key Regional Connections
                </p>
                <span className="text-[12px] text-white/50">Juba Hub (JUB)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {network.connections.map((dest) => (
                  <div
                    key={dest.code}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3 transition-colors hover:border-citico-400/40 hover:bg-white/[0.08]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0078FF]/30 text-[12px] font-bold text-[#7CC4FF]">
                      {dest.code}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-white">{dest.city}</p>
                      <p className="truncate text-[11px] text-white/50">{dest.country}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Domestic Destinations Tag Cloud */}
          <Reveal delay={0.18}>
            <div className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-sm">
              <div>
                <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.2em] text-[#7CC4FF]">
                  {sections.networkDomestic}
                </p>
                <p className="mb-5 text-[13px] leading-relaxed text-white/60">
                  Reliable fixed-wing and helicopter access to remote state capitals, humanitarian project zones, and unpaved airstrips.
                </p>
                <div className="flex flex-wrap gap-2">
                  {network.domestic.map((city) => (
                    <span
                      key={city}
                      className="rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[12.5px] font-medium text-slate-200 transition-colors hover:border-[#0078FF]/50 hover:bg-[#0078FF]/15"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 text-[12px] text-white/40">
                Operations hub: Juba International Airport (JUB) • 24/7 Flight Operations
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
