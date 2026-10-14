"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { useDict, useLocalizedHref } from "@/components/locale-provider";

export function MissionCTA() {
  const { sections } = useDict();
  const lhref = useLocalizedHref();
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/img/ops-airfield.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(5,36,82,0.85) 0%,rgba(8,54,114,0.8) 55%,rgba(13,74,155,0.85) 100%)" }} />
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(45,140,255,0.5), transparent)" }} aria-hidden />
      </div>

      <div className="section-pad relative mx-auto max-w-[1400px] py-24 sm:py-32">
        <Reveal className="text-center">
          <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.3em] text-[#7CC4FF]">{sections.missionCtaKicker}</p>
          <h2 className="font-display mx-auto max-w-[600px] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-white">
            {sections.missionCtaTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-[480px] text-[16px] leading-relaxed text-slate-300/80">
            {sections.missionCtaBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={lhref("/contact#charter")}
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#0078FF] px-8 py-4 text-[15px] font-semibold tracking-wide text-white shadow-[0_8px_30px_-8px_rgba(45,140,255,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3D9BFF]"
            >
              {sections.missionCtaPrimary}
              <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link
              href={lhref("/contact")}
              className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-8 py-4 text-[15px] font-semibold tracking-wide text-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10"
            >
              {sections.missionCtaSecondary}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
