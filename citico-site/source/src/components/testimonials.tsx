"use client";

import Image from "next/image";
import { Reveal, SectionHead } from "@/components/ui";
import { IconCheck, IconShield } from "@/components/icons";
import { useDict } from "@/components/locale-provider";

export function TestimonialsSection() {
  const { testimonials, caseStudies, partners } = useDict();

  // Find verified testimonial (MSF / Auday Hikmat)
  const verifiedTestimonial = testimonials.find((t) => t.verified) || testimonials[0];

  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-50/50 dark:bg-navy-950/40">
      {/* Background accents */}
      <div
        className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-citico-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#0078FF]/10 blur-3xl"
        aria-hidden
      />

      <div className="section-pad relative mx-auto max-w-[1400px]">
        {/* Section Header */}
        <SectionHead
          kicker="Operational Credibility & Verification"
          title={
            <>
              Trusted by Leading <span className="text-gradient">Humanitarian & Industry Partners</span>
            </>
          }
          sub="Verified mission performance, NGO coordination, and rapid-response flight operations across South Sudan and the region."
        />

        {/* Featured Testimonial — Verified Primary Quote */}
        {verifiedTestimonial && (
          <Reveal className="mt-14">
            <div className="relative overflow-hidden rounded-3xl border border-citico-500/30 bg-gradient-to-br from-white via-white/95 to-citico-50/40 p-8 shadow-xl dark:border-citico-500/25 dark:from-navy-900/90 dark:via-navy-900/80 dark:to-navy-950 sm:p-12">
              {/* Top badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-900/8 pb-6 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Verified Operational Testimonial
                  </span>
                </div>
                {verifiedTestimonial.logo && (
                  <div className="relative h-10 w-28 grayscale transition-all hover:grayscale-0">
                    <Image
                      src={verifiedTestimonial.logo}
                      alt={verifiedTestimonial.org}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Quote body */}
              <blockquote className="mt-8">
                <p className="font-display text-lg font-medium leading-relaxed text-navy-900 dark:text-white sm:text-2xl sm:leading-relaxed">
                  “{verifiedTestimonial.quote}”
                </p>
              </blockquote>

              {/* Attribution */}
              <div className="mt-8 flex items-center justify-between gap-6 pt-4">
                <div>
                  <p className="font-display text-base font-bold text-navy-900 dark:text-white sm:text-lg">
                    {verifiedTestimonial.author}
                  </p>
                  <p className="text-sm font-medium text-citico-600 dark:text-citico-400">
                    {verifiedTestimonial.role} —{" "}
                    <span className="text-navy-700/70 dark:text-slate-400">{verifiedTestimonial.org}</span>
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-citico-500/20 bg-citico-500/5 px-4 py-1.5 text-[12px] font-semibold text-citico-700 dark:border-citico-400/20 dark:bg-citico-400/10 dark:text-citico-300">
                  <IconShield className="h-3.5 w-3.5" />
                  Direct Partner Review
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Operational Case Studies Grid */}
        <div className="mt-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11.5px] font-bold uppercase tracking-[0.25em] text-[#0078FF]">
                Field Case Studies
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold text-navy-900 dark:text-white">
                Proven Track Record in Complex Environments
              </h3>
            </div>
            <p className="max-w-md text-sm text-navy-700/70 dark:text-slate-400">
              Documented field deployments demonstrating rapid response, zero incident performance, and specialized remote airstrip access.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {caseStudies.map((cs, i) => (
              <Reveal key={cs.heading} delay={i * 0.08}>
                <div className="group flex h-full flex-col justify-between rounded-2xl border border-navy-900/8 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citico-500/40 hover:shadow-card dark:border-white/10 dark:bg-navy-900/50">
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-citico-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
                        {cs.kicker}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <IconCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>

                    <h4 className="mt-4 font-display text-base font-bold text-navy-900 transition-colors group-hover:text-citico-600 dark:text-white dark:group-hover:text-citico-400">
                      {cs.heading}
                    </h4>

                    <p className="mt-3 text-[13.5px] leading-relaxed text-navy-700/75 dark:text-slate-300/80">
                      {cs.body}
                    </p>
                  </div>

                  {/* Tags footer */}
                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-navy-900/6 pt-4 dark:border-white/8">
                    {cs.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-white/5 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Partners Strip */}
        <Reveal delay={0.2} className="mt-16">
          <div className="rounded-2xl border border-navy-900/8 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Operations & Humanitarian Stakeholders Served
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {partners.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-navy-900/80 transition-colors hover:text-citico-600 dark:text-white/80 dark:hover:text-citico-400">
                    {p.name}
                  </span>
                  {p.note && (
                    <span className="hidden text-[11px] text-slate-400 sm:inline">
                      • {p.note}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
