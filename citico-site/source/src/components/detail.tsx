import Image from "next/image";
import Link from "next/link";
import { Reveal, SectionHead } from "@/components/ui";
import { IconArrow } from "@/components/icons";
import { SITE_ORIGIN, absoluteUrl } from "@/lib/site";

export function ServicesJsonLd({
  services,
  basePath = "",
}: {
  services: { slug: string; title: string; short: string; image: string }[];
  basePath?: string;
}) {
  const baseUrl = `${SITE_ORIGIN}${basePath}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "CITICO Aviation Services",
    url: `${baseUrl}/services`,
    itemListElement: services.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.title,
        description: s.short,
        url: `${baseUrl}/services/${s.slug}`,
        /* Photography is served from /img/ for both locales, so it is resolved
           against the origin — not against the locale-scoped baseUrl, which
           produced an /ar/img/… URL that does not exist. */
        image: absoluteUrl(s.image),
        provider: {
          "@type": "Organization",
          name: "CITICO Aviation Co. Ltd",
          url: baseUrl,
        },
        areaServed: "South Sudan",
      },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export function ServiceJsonLd({
  slug,
  title,
  description,
  image,
  basePath = "",
}: {
  slug: string;
  title: string;
  description: string;
  image: string;
  basePath?: string;
}) {
  const baseUrl = `${SITE_ORIGIN}${basePath}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description,
    url: `${baseUrl}/services/${slug}`,
    image: absoluteUrl(image),
    serviceType: title,
    provider: {
      "@type": "Organization",
      name: "CITICO Aviation Co. Ltd",
      url: baseUrl,
    },
    areaServed: "South Sudan",
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

/* The hrefs handed in are already locale-prefixed — they come from
   `localizeHref` — so they are resolved against the origin alone. Adding the
   locale again produced /ar/ar/… on every Arabic page, a URL that 404s and
   would have been reported to search engines as the breadcrumb trail. */
export function BreadcrumbJsonLd({ items }: { items: { href: string; label: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.label,
      item: absoluteUrl(b.href),
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

export function PageHero({
  kicker,
  title,
  sub,
  image,
  breadcrumb,
  breadcrumbLabel = "Breadcrumb",
  basePath = "",
}: {
  kicker: string;
  title: string;
  sub?: string;
  image: string;
  breadcrumb: { href: string; label: string }[];
  breadcrumbLabel?: string;
  basePath?: string;
}) {
  const rtl = basePath.startsWith("/ar");
  return (
    <section className="relative flex min-h-[62svh] items-end overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#052452,#0a3d80)" }} aria-hidden />
      <div className="absolute inset-0">
        <Image src={image} alt={`${title} — CITICO Aviation`} fill priority sizes="100vw" className="object-cover opacity-90" />
        <div
          className="absolute inset-0"
          style={{
            background: rtl
              ? "linear-gradient(270deg,rgba(4,28,64,0.92) 0%,rgba(6,44,96,0.55) 55%,rgba(10,61,128,0.2) 100%)"
              : "linear-gradient(90deg,rgba(4,28,64,0.92) 0%,rgba(6,44,96,0.55) 55%,rgba(10,61,128,0.2) 100%)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(4,28,64,0.85) 0%,transparent 35%,rgba(5,36,82,0.95) 100%)" }} />
      </div>
      <div className="section-pad relative mx-auto w-full max-w-[1400px] pb-14 pt-36">
        <BreadcrumbJsonLd items={breadcrumb} />
        <nav aria-label={breadcrumbLabel} className="mb-5 text-xs font-medium tracking-wide text-slate-300/80">
          <ol className="flex flex-wrap items-center gap-2">
            {breadcrumb.map((b, i) => (
              <li key={b.href} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="inline-block rtl:-scale-x-100">
                    ›
                  </span>
                )}
                {i === breadcrumb.length - 1 ? (
                  <span aria-current="page" className="text-citico-200">
                    {b.label}
                  </span>
                ) : (
                  <Link href={b.href} className="transition-colors hover:text-white">
                    {b.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.32em] text-citico-400">{kicker}</p>
        <h1 className="font-display max-w-3xl text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {sub ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/85 sm:text-lg">{sub}</p> : null}
      </div>
    </section>
  );
}

export function NextCta({
  href,
  label,
  sub,
  ctaLabel = "Get Started",
}: {
  href: string;
  label: string;
  sub?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="section-pad mx-auto max-w-[1400px] pb-24">
      <Reveal>
        <div className="dust-overlay relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-citico-700 via-citico-800 to-citico-950 p-9 text-white sm:p-12">
          <div className="grid-lines absolute inset-0 opacity-20" aria-hidden />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">{label}</h2>
              {sub ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-citico-100/85">{sub}</p> : null}
            </div>
            <Link
              href={href}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-citico-100"
            >
              {ctaLabel}
              <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3.5 sm:grid-cols-2">
      {items.map((f, i) => (
        <Reveal key={f} delay={i * 0.05}>
          <li className="flex items-start gap-3 rounded-2xl border border-navy-900/8 bg-white/70 p-4 text-[14px] leading-relaxed text-navy-800/85 dark:border-white/10 dark:bg-white/5 dark:text-slate-300/90">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-citico-700/10 text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
              <IconArrow className="h-3.5 w-3.5" />
            </span>
            {f}
          </li>
        </Reveal>
      ))}
    </ul>
  );
}

export { SectionHead };
