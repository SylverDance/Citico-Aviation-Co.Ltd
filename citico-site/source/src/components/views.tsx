import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactClient } from "@/components/contact-client";
import { AviationRfq } from "@/components/aviation-rfq";
import { FeatureList, NextCta, PageHero, ServiceJsonLd, ServicesJsonLd } from "@/components/detail";
import { Hero } from "@/components/hero";
import {
  LogisticsSection,
  MissionVisionSection,
  PartnersSection,
  SafetySection,
  WhoWeAreSection,
  WhySection,
} from "@/components/home-sections";
import { NetworkSection } from "@/components/network-section";
import { TestimonialsSection } from "@/components/testimonials";
import { LeadershipSection } from "@/components/leadership";
import { DynIcon, IconArrow, IconBadge, IconCheck } from "@/components/icons";
import { Counter, Reveal, SectionHead } from "@/components/ui";
import {
  AircraftPartsInteractive,
  FlightPermitsInteractive,
  GroundHandlingInteractive,
  ToursTravelsInteractive,
  HelicopterLiftCalculator,
} from "@/components/service-interactive";
import { getDictionary } from "@/lib/dict";
import { fmt, localizeHref, type Locale } from "@/lib/i18n";

/* ──────────────────────────────────────────────────────────────
   Page views shared by every locale. A view receives the locale,
   resolves its dictionary on the server and renders the same markup
   for English (LTR) and Arabic (RTL). Adding a language = add a
   dictionary + a route folder; these views stay untouched.
   ────────────────────────────────────────────────────────────── */

const basePathOf = (locale: Locale) => (locale === "ar" ? "/ar" : "");

/* ───────────────────────────── Home ───────────────────────────── */
export function HomeView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { company, capabilities, pages } = dict;
  const lhref = (href: string) => localizeHref(href, locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.siteUrl,
    logo: `${company.siteUrl}/img/logo-trim.png`,
    description: company.subTagline,
    foundingDate: String(company.founded),
    email: company.email,
    telephone: company.phones,
    address: {
      "@type": "PostalAddress",
      streetAddress: locale === "ar" ? "مبنى مونتانا، طريق المطار" : "Montana Building, Airport Road",
      addressLocality: locale === "ar" ? "جوبا" : "Juba",
      addressCountry: "SS",
    },
    sameAs: [company.social.facebook, company.social.youtube],
    slogan: company.tagline,
    inLanguage: locale,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── Cinematic hero — fills the first screen ─── */}
      <Hero />

      {/* ─── Brief intro + capability shortcuts (single compact band) ─── */}
      <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.3em] text-[#0078FF]">{pages.home.kicker}</p>
            <h2 className="font-display max-w-xl text-3xl font-bold leading-[1.12] tracking-tight text-navy-900 dark:text-white sm:text-4xl">
              {pages.home.title.lead} <span className="text-gradient">{pages.home.title.accent}</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-700/75 dark:text-slate-400">
              {fmt(pages.home.subTemplate, { subTagline: company.subTagline, founded: company.founded })}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href={lhref("/services")}
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#0078FF] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_10px_36px_-8px_rgba(0,120,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3D9BFF]"
              >
                {pages.home.ctaExplore}
                <IconArrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
              <Link
                href={lhref("/about")}
                className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-6 py-3.5 text-[14px] font-semibold text-[#004ea8] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0078FF]/50 hover:bg-[#0078FF]/5 dark:border-white/20 dark:text-white"
              >
                {pages.home.ctaAbout}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((c) => (
                <Link
                  key={c.title}
                  href={lhref(c.href)}
                  className="group rounded-2xl border border-navy-900/8 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#0078FF]/40 hover:shadow-card dark:border-white/10 dark:bg-white/5"
                >
                  <h3 className="font-display text-[14.5px] font-bold text-navy-900 transition-colors group-hover:text-[#0078FF] dark:text-white">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-700/70 dark:text-slate-400">{c.body}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Interactive Route Network Map ─── */}
      <NetworkSection />

      {/* ─── Operational Credibility, Testimonials & Case Studies ─── */}
      <TestimonialsSection />

      {/* ─── Mission CTA ─── */}
      <NextCta
        href={lhref("/contact")}
        label={dict.sections.missionCtaTitle}
        sub={dict.sections.missionCtaBody}
        ctaLabel={dict.sections.missionCtaPrimary}
      />
    </>
  );
}

/* ─────────────────────────── Services ─────────────────────────── */
export function ServicesView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { services, pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const basePath = basePathOf(locale);

  const coreSlugs = [
    "passenger-services",
    "air-cargo",
    "charter-flights",
    "humanitarian-operations",
    "helicopter-operations",
    "river-cargo-transport",
    "warehousing-ground-support",
  ];
  const coreServices = services.filter((s) => coreSlugs.includes(s.slug));
  const extendedServices = services.filter((s) => !coreSlugs.includes(s.slug));

  function ServiceCard({
    s,
    i,
    extended,
  }: {
    s: (typeof services)[number];
    i: number;
    extended?: boolean;
  }) {
    return (
      <Reveal delay={(i % 3) * 0.08}>
        <Link
          href={lhref(`/services/${s.slug}`)}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/8 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card dark:border-white/10 dark:bg-navy-800/60"
        >
          <div className="relative h-48 overflow-hidden">
            <Image
              src={s.image}
              alt={s.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/20 to-transparent" />
            <div className="absolute bottom-3 start-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-[#0078FF] shadow-lg backdrop-blur">
              <DynIcon name={s.icon} className="h-5.5 w-5.5" />
            </div>
            {extended && (
              <span className="absolute end-3 top-3 rounded-full bg-[#0078FF] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-lg">
                {ui.newBadge}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-display text-lg font-bold text-navy-900 transition-colors group-hover:text-[#0078FF] dark:text-white dark:group-hover:text-[#7CC4FF]">
              {s.title}
            </h3>
            <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-navy-700/70 dark:text-slate-400">{s.short}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#0078FF] dark:text-[#7CC4FF]">
              {ui.learnMore}
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
            </span>
          </div>
        </Link>
      </Reveal>
    );
  }

  return (
    <>
      <ServicesJsonLd services={services} basePath={basePath} />
      <PageHero
        kicker={pages.services.heroKicker}
        title={pages.services.heroTitle}
        sub={pages.services.heroSub}
        image="/img/ops-cargo.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePath}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/services"), label: pages.services.metaTitle },
        ]}
      />

      {/* Section A — core operations */}
      <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-28">
        <SectionHead
          kicker={pages.services.sectionAKicker}
          title={
            <>
              {pages.services.sectionATitle.lead} <span className="text-gradient">{pages.services.sectionATitle.accent}</span>
            </>
          }
          sub={pages.services.sectionASub}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {coreServices.map((s, i) => (
            <ServiceCard key={s.slug} s={s} i={i} />
          ))}
        </div>
      </section>

      {/* Section B — extended & new services */}
      <section className="section-pad mx-auto max-w-[1400px] pb-24 sm:pb-28">
        <SectionHead
          kicker={pages.services.sectionBKicker}
          title={
            <>
              {pages.services.sectionBTitle.lead} <span className="text-gradient">{pages.services.sectionBTitle.accent}</span>
            </>
          }
          sub={pages.services.sectionBSub}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {extendedServices.map((s, i) => (
            <ServiceCard key={s.slug} s={s} i={i} extended />
          ))}
        </div>
      </section>

      <NextCta href={lhref("/contact#charter")} label={pages.services.ctaLabel} sub={pages.services.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ──────────────────────── Service detail ─────────────────────── */
export function ServiceDetailView({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDictionary(locale);
  const { services, pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const basePath = basePathOf(locale);

  const service = services.find((x) => x.slug === slug);
  if (!service) notFound();
  const s = service;
  const others = services.filter((x) => x.slug !== s.slug).slice(0, 3);

  return (
    <>
      <ServiceJsonLd
        slug={s.slug}
        title={s.title}
        description={s.seoDescription ?? s.short}
        image={s.image}
        basePath={basePath}
      />
      <PageHero
        kicker={pages.serviceDetail.kicker}
        title={s.title}
        sub={s.intro}
        image={s.image}
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePath}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/services"), label: pages.services.metaTitle },
          { href: lhref(`/services/${s.slug}`), label: s.title },
        ]}
      />

      <section className="section-pad mx-auto max-w-[1400px] py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionHead align="left" kicker={pages.serviceDetail.deliverKicker} title={pages.serviceDetail.deliverTitle} />
            <Reveal delay={0.08}>
              <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-navy-700/80 dark:text-slate-300/80">{s.intro}</p>
            </Reveal>
            <div className="mt-9">
              <FeatureList items={s.points} />
            </div>
          </div>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl lg:sticky lg:top-28">
              <Image src={s.image} alt={s.title} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-citico-700 dark:bg-citico-500 dark:text-white">
                  <DynIcon name={s.icon} className="h-6 w-6" />
                </span>
                <p className="mt-4 font-display text-xl font-bold text-white">{s.title}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {s.gallery && s.gallery.length > 0 && (
        <section className="section-pad mx-auto max-w-[1400px] pb-16">
          <SectionHead
            align="left"
            kicker={pages.serviceDetail.galleryKicker}
            title={pages.serviceDetail.galleryTitle}
            sub={s.short}
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.gallery.map((g, i) => (
              <Reveal key={g.src} delay={i * 0.08}>
                <figure className="group relative h-64 overflow-hidden rounded-3xl border border-navy-900/8 dark:border-white/10">
                  <Image
                    src={g.src}
                    alt={g.alt}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/15 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <span className="font-display block text-[15px] font-bold text-white">{g.caption}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-white/70">{g.alt}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Specialized Interactive Modules per Service Line */}
      {s.slug === "aircraft-parts" && <AircraftPartsInteractive locale={locale} />}
      {s.slug === "flight-permits" && <FlightPermitsInteractive locale={locale} />}
      {s.slug === "ground-handling" && <GroundHandlingInteractive locale={locale} />}
      {s.slug === "tours-travels" && <ToursTravelsInteractive locale={locale} />}
      {s.slug === "helicopter-operations" && <HelicopterLiftCalculator locale={locale} />}

      {/* related */}
      <section className="section-pad mx-auto max-w-[1400px] pb-8">
        <SectionHead align="left" kicker={pages.serviceDetail.alsoExplore} title={pages.serviceDetail.otherServices} />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {others.map((o, i) => (
            <Reveal key={o.slug} delay={i * 0.07}>
              <Link
                href={lhref(`/services/${o.slug}`)}
                className="group flex h-full items-center gap-4 rounded-2xl border border-navy-900/8 bg-white/70 p-5 transition-all hover:-translate-y-1 hover:border-citico-500/40 dark:border-white/10 dark:bg-white/5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
                  <DynIcon name={o.icon} className="h-5.5 w-5.5" />
                </span>
                <span className="flex-1">
                  <span className="font-display block text-[15px] font-bold text-navy-900 dark:text-white">{o.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-navy-700/60 dark:text-slate-400">{o.short}</span>
                </span>
                <IconArrow className="h-4 w-4 shrink-0 text-citico-600 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 dark:text-citico-300" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <NextCta
        href={lhref("/contact#charter")}
        label={fmt(pages.serviceDetail.ctaLabelTemplate, { service: s.title.toLowerCase() })}
        sub={pages.serviceDetail.ctaSub}
        ctaLabel={ui.getStarted}
      />
    </>
  );
}

/* ─────────────────────────── About ─────────────────────────── */
export function AboutView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const about = pages.about;

  return (
    <>
      <PageHero
        kicker={about.heroKicker}
        title={about.heroTitle}
        sub={about.heroSub}
        image="/img/ops-mission.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/about"), label: about.metaTitle },
        ]}
      />
      <WhoWeAreSection />

      {/* Company history timeline */}
      <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-28">
        <SectionHead
          align="left"
          kicker={about.historyKicker}
          title={
            <>
              {about.historyTitle.lead} <span className="text-gradient">{about.historyTitle.accent}</span>
            </>
          }
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {about.history.map((m, i) => (
            <Reveal key={m.year} delay={i * 0.09}>
              <div className="relative h-full rounded-3xl border border-navy-900/8 bg-white/70 p-7 dark:border-white/10 dark:bg-white/5">
                <span className="font-display text-[13px] font-bold uppercase tracking-[0.22em] text-[#0078FF]">{m.year}</span>
                <h3 className="font-display mt-3 text-lg font-bold text-navy-900 dark:text-white">{m.t}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-navy-700/70 dark:text-slate-400">{m.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MissionVisionSection />

      {/* HSEE */}
      <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-28">
        <SectionHead
          kicker={about.hseeKicker}
          title={
            <>
              {about.hseeTitle.lead} <span className="text-gradient">{about.hseeTitle.accent}</span>
            </>
          }
          sub={about.hseeSub}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {about.hsee.map((h, i) => (
            <Reveal key={h.t} delay={i * 0.07}>
              <div className="h-full rounded-3xl border border-navy-900/8 bg-white/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-citico-500/40 dark:border-white/10 dark:bg-white/5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-citico-600 to-citico-900 text-white">
                  <DynIcon name={h.i} className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-4 text-[15px] font-bold text-navy-900 dark:text-white">{h.t}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-700/70 dark:text-slate-400">{h.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <WhySection />
      <PartnersSection />
      <NextCta href={lhref("/contact")} label={about.ctaLabel} sub={about.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ───────────────────────── Logistics ───────────────────────── */
export function LogisticsView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const logistics = pages.logistics;

  return (
    <>
      <PageHero
        kicker={logistics.heroKicker}
        title={logistics.heroTitle}
        sub={logistics.heroSub}
        image="/img/ops-river.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/logistics"), label: logistics.metaTitle },
        ]}
      />

      <LogisticsSection />

      {/* assets */}
      <section className="section-pad mx-auto max-w-[1400px] pb-24">
        <SectionHead
          kicker={logistics.assetsKicker}
          title={
            <>
              {logistics.assetsTitle.lead} <span className="text-gradient">{logistics.assetsTitle.accent}</span>
            </>
          }
        />
        <Reveal className="mt-12 overflow-x-auto rounded-3xl border border-navy-900/8 dark:border-white/10">
          <table className="w-full min-w-[22rem] text-start text-sm">
            <thead className="bg-citico-800 text-white dark:bg-citico-900">
              <tr>
                {logistics.assetHeaders.map((h) => (
                  <th key={h} className="px-5 py-4 text-start text-[12px] font-bold uppercase tracking-[0.16em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-800/60">
              {logistics.assets.map((a) => (
                <tr key={a.type} className="border-t border-navy-900/6 dark:border-white/8">
                  <td className="px-5 py-4 font-semibold text-navy-900 dark:text-white">{a.type}</td>
                  <td className="px-5 py-4 text-navy-700/80 dark:text-slate-300">{a.qty}</td>
                  <td className="px-5 py-4 text-navy-700/80 dark:text-slate-300">{a.cap}</td>
                  <td className="px-5 py-4 text-navy-700/80 dark:text-slate-300">{a.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {logistics.cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <div className="group overflow-hidden rounded-3xl border border-navy-900/8 bg-white/70 dark:border-white/10 dark:bg-white/5">
                <div className="relative h-44 overflow-hidden">
                  <Image src={c.src} alt={c.t} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-[15px] font-bold text-navy-900 dark:text-white">{c.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-navy-700/70 dark:text-slate-400">{c.b}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <NextCta href={lhref("/contact#charter")} label={logistics.ctaLabel} sub={logistics.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ─────────────────────────── Safety ─────────────────────────── */
export function SafetyView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { pages, stats, safety, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const page = pages.safety;

  return (
    <>
      <PageHero
        kicker={page.heroKicker}
        title={page.heroTitle}
        sub={safety.sub}
        image="/img/ops-ground.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/safety"), label: page.metaTitle },
        ]}
      />

      {/* metrics band */}
      <section className="section-pad mx-auto max-w-[1400px] -mt-2 py-16">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-navy-900/8 bg-navy-900/5 dark:border-white/10 dark:bg-white/10 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white px-6 py-7 dark:bg-navy-900">
                <dd className="font-display text-2xl font-bold text-citico-700 dark:text-citico-300 sm:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </dd>
                <dt className="mt-1 text-[12px] font-medium uppercase tracking-[0.16em] text-navy-700/60 dark:text-slate-400">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <SafetySection />

      {/* compliance */}
      <section className="section-pad mx-auto max-w-[1400px] py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead
              align="left"
              kicker={page.complianceKicker}
              title={
                <>
                  {page.complianceTitle.lead} <span className="text-gradient">{page.complianceTitle.accent}</span>
                </>
              }
            />
            <Reveal delay={0.1}>
              <ul className="mt-8 space-y-4">
                {page.compliance.map((c) => (
                  <li key={c} className="flex items-start gap-3.5 text-[14.5px] leading-relaxed text-navy-800/85 dark:text-slate-300/90">
                    <span className="mt-0.5 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-citico-700/10 text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
                      <IconBadge className="h-4 w-4" />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col justify-center rounded-[2rem] border border-citico-500/20 bg-gradient-to-br from-citico-50 to-white p-9 dark:from-citico-900/25 dark:to-navy-900">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-citico-500 to-citico-700 text-white">
                <IconCheck className="h-6 w-6" />
              </span>
              <p className="font-display mt-6 text-4xl font-bold text-navy-900 dark:text-white">0</p>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-citico-700 dark:text-citico-300">
                {page.zeroLabel}
              </p>
              <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-navy-700/70 dark:text-slate-400">
                {page.zeroBody}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <NextCta href={lhref("/contact")} label={page.ctaLabel} sub={page.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ─────────────────────────── Fleet ─────────────────────────── */
export function FleetView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { fleet, pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const page = pages.fleet;

  return (
    <>
      <PageHero
        kicker={page.heroKicker}
        title={page.heroTitle}
        sub={page.heroSub}
        image="/img/ops-sky.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/fleet"), label: page.metaTitle },
        ]}
      />

      <section className="section-pad mx-auto max-w-[1400px] py-24 sm:py-28">
        <SectionHead
          kicker={page.sectionKicker}
          title={
            <>
              {page.sectionTitle.lead} <span className="text-gradient">{page.sectionTitle.accent}</span>
            </>
          }
          sub={page.sectionSub}
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((a, i) => (
            <Reveal key={a.slug} delay={i * 0.08}>
              <Link
                href={lhref(`/fleet/${a.slug}`)}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-navy-900/8 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card dark:border-white/10 dark:bg-navy-800/60"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={a.image}
                    alt={a.model}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                  <div className="absolute bottom-3 inset-x-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#7CC4FF]">{a.role}</p>
                    <h3 className="font-display text-2xl font-bold text-white">{a.model}</h3>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-500">{page.labelCapacity}</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-navy-900 dark:text-white">{a.payload}</p>
                    </div>
                    <div>
                      <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-500">{page.labelRange}</p>
                      <p className="mt-0.5 text-[13px] font-semibold text-navy-900 dark:text-white">{a.range}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-[#0078FF]/10 px-3 py-1 text-[12px] font-bold text-[#0078FF] dark:bg-[#0078FF]/25 dark:text-[#7CC4FF]">{a.category}</span>
                    <span className="text-[12px] text-slate-500">{fmt(page.labelInFleet, { count: a.count })}</span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#0078FF] dark:text-[#7CC4FF]">
                    {page.viewAircraft}
                    <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <NextCta href={lhref("/contact#charter")} label={page.ctaLabel} sub={page.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ──────────────────────── Fleet detail ──────────────────────── */
export function FleetDetailView({ locale, slug }: { locale: Locale; slug: string }) {
  const dict = getDictionary(locale);
  const { fleet, pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const page = pages.fleetDetail;

  const found = fleet.find((x) => x.slug === slug);
  if (!found) notFound();
  const a = found;
  const others = fleet.filter((x) => x.slug !== a.slug);

  const specs = [
    { k: page.labelPayload, v: a.payload },
    { k: page.labelRange, v: a.range },
    { k: page.labelInFleet, v: fmt(page.inFleetValue, { count: a.count }) },
    { k: page.labelCategory, v: a.category },
  ];

  return (
    <>
      <PageHero
        kicker={a.role}
        title={a.model}
        sub={a.blurb}
        image={a.image}
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/fleet"), label: pages.fleet.metaTitle },
          { href: lhref(`/fleet/${a.slug}`), label: a.model },
        ]}
      />

      <section className="section-pad mx-auto max-w-[1400px] py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl lg:sticky lg:top-28">
              <Image src={a.image} alt={a.model} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
              <div className="absolute bottom-5 start-5 rounded-2xl glass px-5 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-navy-700/70 dark:text-slate-400">{page.labelConfiguration}</p>
                <p className="font-display text-lg font-bold text-navy-900 dark:text-white">{a.payload}</p>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHead align="left" kicker={page.specKicker} title={fmt(page.specTitleTemplate, { category: a.category })} />
            <Reveal delay={0.08}>
              <dl className="mt-8 grid grid-cols-2 gap-4">
                {specs.map((s) => (
                  <div key={s.k} className="rounded-2xl border border-navy-900/8 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
                    <dt className="text-[12px] font-bold uppercase tracking-[0.18em] text-citico-600 dark:text-citico-300">{s.k}</dt>
                    <dd className="font-display mt-1.5 text-lg font-bold text-navy-900 dark:text-white">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <div className="mt-9">
              <FeatureList items={a.features} />
            </div>
          </div>
        </div>
      </section>

      {/* other aircraft */}
      <section className="section-pad mx-auto max-w-[1400px] pb-8">
        <SectionHead align="left" kicker={page.alsoExplore} title={page.restOfFleet} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o, i) => (
            <Reveal key={o.slug} delay={i * 0.06}>
              <Link
                href={lhref(`/fleet/${o.slug}`)}
                className="group block overflow-hidden rounded-2xl border border-navy-900/8 bg-white/70 transition-all hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-white/5"
              >
                <div className="relative h-32 overflow-hidden">
                  <Image src={o.image} alt={o.model} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
                  <span className="absolute bottom-2.5 start-4 rounded-full bg-citico-600/90 px-2.5 py-0.5 text-[12px] font-bold text-white">{o.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[15px] font-bold text-navy-900 dark:text-white">{o.model}</h3>
                  <p className="mt-1 text-xs text-navy-700/60 dark:text-slate-400">
                    {o.payload} · {o.range}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <NextCta
        href={lhref("/contact#charter")}
        label={fmt(page.ctaLabelTemplate, { model: a.model })}
        sub={page.ctaSub}
        ctaLabel={ui.getStarted}
      />
    </>
  );
}

/* ────────────────────────── Leadership ────────────────────────── */
export function LeadershipView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const page = pages.leadership;

  return (
    <>
      <PageHero
        kicker={page.heroKicker}
        title={page.heroTitle}
        sub={page.heroSub}
        image="/img/ops-sky.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/leadership"), label: page.metaTitle },
        ]}
      />

      <div className="pt-4">
        <LeadershipSection />
      </div>

      <section className="section-pad mx-auto max-w-[1400px] pb-8">
        <Reveal>
          <figure className="mx-auto max-w-3xl rounded-[2rem] border border-navy-900/8 bg-white/70 p-9 text-center dark:border-white/10 dark:bg-white/5">
            <blockquote className="font-display text-xl font-bold leading-snug tracking-wide text-navy-900 dark:text-white sm:text-2xl">
              {page.quote}
            </blockquote>
            <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-citico-600 dark:text-citico-300">
              {page.quoteBy}
            </figcaption>
          </figure>
        </Reveal>
      </section>

      <NextCta href={lhref("/contact")} label={page.ctaLabel} sub={page.ctaSub} ctaLabel={ui.getStarted} />
    </>
  );
}

/* ─────────────────────────── Contact ─────────────────────────── */
export function ContactView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { pages, ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);
  const page = pages.contact;

  return (
    <>
      <PageHero
        kicker={page.heroKicker}
        title={page.heroTitle}
        sub={page.heroSub}
        image="/img/ops-airfield.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/contact"), label: page.metaTitle },
        ]}
      />
      <ContactClient />
    </>
  );
}

/* ─────────────────────────── Aviation RFQ ─────────────────────────── */
export function RfqView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { ui } = dict;
  const lhref = (href: string) => localizeHref(href, locale);

  return (
    <>
      <PageHero
        kicker="24/7 Flight Operations Center"
        title="Aviation Request for Quote (RFQ)"
        sub="Instant charter & cargo routing, aircraft payload matching, and verified dispatch to South Sudan & East African operational desks."
        image="/img/ops-cargo.jpg"
        breadcrumbLabel={ui.breadcrumbLabel}
        basePath={basePathOf(locale)}
        breadcrumb={[
          { href: lhref("/"), label: ui.home },
          { href: lhref("/rfq"), label: "Aviation RFQ" },
        ]}
      />
      <section className="section-pad mx-auto max-w-[1200px] py-16 sm:py-20">
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />}>
          <AviationRfq />
        </Suspense>
      </section>
    </>
  );
}

/* ────────────────────────── Not found ────────────────────────── */
export function NotFoundView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { notFound: copy } = dict;
  const lhref = (href: string) => localizeHref(href, locale);

  return (
    <section className="relative flex min-h-[70svh] items-center justify-center overflow-hidden text-center" style={{ background: "linear-gradient(180deg,#0a3d80,#052452)" }}>
      <div className="grid-lines absolute inset-0 opacity-20" aria-hidden />
      <div className="relative px-6">
        <p className="font-display text-[22vw] font-bold leading-none text-white/10 sm:text-[10rem]">404</p>
        <h1 className="font-display -mt-8 text-3xl font-bold text-white sm:-mt-12 sm:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-300/80">{copy.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href={lhref("/")}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-citico-100"
          >
            {copy.home}
          </Link>
          <Link
            href={lhref("/contact")}
            className="rounded-full border border-white/35 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
          >
            {copy.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
