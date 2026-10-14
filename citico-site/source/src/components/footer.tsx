"use client";

import { useState } from "react";
import Link from "next/link";
import { CiticoLogo } from "@/components/ui";
import { IconFacebook, IconLinkedIn, IconYouTube } from "@/components/icons";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n";

export function Footer() {
  const [email, setEmail] = useState("");
  const [signedUp, setSignedUp] = useState(false);
  const { company, footerColumns, footer } = useDict();
  const lhref = useLocalizedHref();

  return (
    <footer className="bg-[#004ea8]">
      {/* ─── flydubai-style signup row ─── */}
      <div className="border-b border-white/10">
        <div className="section-pad mx-auto grid max-w-[1400px] gap-10 py-12 lg:grid-cols-2 lg:py-14">
          <div>
            <h3 className="font-display text-[26px] font-bold leading-tight text-white">{footer.signupTitle}</h3>
            <p className="mt-1.5 text-[14.5px] text-white/80">{footer.signupSub}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const address = email.trim();
                if (!address) return;
                setSignedUp(true);
                setEmail("");
              }}
              className="mt-5 flex max-w-[460px] overflow-hidden rounded-xl bg-white shadow-[0_14px_40px_-14px_rgba(0,10,40,0.5)]"
            >
              <label htmlFor="footer-newsletter" className="sr-only">
                {footer.emailLabel}
              </label>
              <input
                id="footer-newsletter"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footer.emailPlaceholder}
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-[14.5px] text-navy-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 bg-[#7CC4FF] px-7 text-[14px] font-bold text-navy-950 transition-colors hover:bg-[#0078FF] hover:text-white"
              >
                {footer.signupButton}
              </button>
            </form>
            <div aria-live="polite">
              {signedUp && (
                <p role="status" className="mt-2.5 text-[13.5px] font-semibold text-[#7CC4FF]">
                  {footer.thanks}
                </p>
              )}
            </div>
          </div>

          {/* Operations desk (no app exists — real contact promo instead) */}
          <div className="lg:justify-self-end lg:text-end">
            <h3 className="font-display text-[26px] font-bold leading-tight text-white">{footer.deskTitle}</h3>
            <p className="mt-1.5 text-[14.5px] text-white/80">{footer.deskSub}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 lg:justify-end">
              <a
                href={`tel:${company.phones[0].replace(/\s/g, "")}`}
                className="inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-[15px] font-bold text-[#004ea8] transition-colors hover:bg-[#7CC4FF] hover:text-navy-950"
              >
                {company.phones[0]}
              </a>
              <Link
                href={lhref("/contact#charter")}
                className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                {footer.requestCharter}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main columns ─── */}
      <div className="section-pad mx-auto max-w-[1400px] py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <CiticoLogo className="h-[54px] w-auto" />
            <p className="mt-4 max-w-[250px] text-[13.5px] leading-relaxed text-white/85">{footer.brandBlurb}</p>
            <p className="mt-4 text-[13px] font-semibold text-[#7CC4FF]">{company.website}</p>
          </div>

          {/* Navigation columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={lhref(link.href)}
                      className="text-[13.5px] text-white/85 transition-colors hover:text-[#7CC4FF]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[12px] font-bold uppercase tracking-[0.2em] text-white">{footer.contactTitle}</h4>
            <div className="space-y-3 text-[13.5px] text-white/85">
              <p>{company.hq}</p>
              <a href={`tel:${company.phones[0].replace(/\s/g, "")}`} className="block transition-colors hover:text-[#7CC4FF]">
                {company.phones[0]}
              </a>
              <a href={`mailto:${company.email}`} className="block transition-colors hover:text-[#7CC4FF]">
                {company.email}
              </a>
              <p className="text-[12.5px] font-semibold text-[#7CC4FF]">{footer.hours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Social row ─── */}
      <div className="border-t border-white/10">
        <div className="section-pad mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6">
          <a
            href={company.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-white/85 transition-colors hover:text-[#7CC4FF]"
          >
            <IconFacebook className="h-[18px] w-[18px]" />
            Facebook
          </a>
          <a
            href={company.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-white/85 transition-colors hover:text-[#7CC4FF]"
          >
            <IconYouTube className="h-[18px] w-[18px]" />
            YouTube
          </a>
          {company.social.linkedin && (
            <a
              href={company.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-[14px] font-semibold text-white/85 transition-colors hover:text-[#7CC4FF]"
            >
              <IconLinkedIn className="h-[18px] w-[18px]" />
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* ─── Policies bar ─── */}
      <div className="border-t border-white/10">
        <div className="section-pad mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 py-5 sm:flex-row">
          <p className="text-[12.5px] text-white/70">
            {fmt(footer.rightsTemplate, { year: new Date().getFullYear(), name: company.name })}
          </p>
          <div className="flex items-center gap-5 text-[12.5px] text-white/70">
            <Link href={lhref("/safety")} className="transition-colors hover:text-white">
              {footer.policies}
            </Link>
            <Link href={lhref("/about")} className="transition-colors hover:text-white">
              {footer.terms}
            </Link>
            <a href={`tel:${company.phones[0].replace(/\s/g, "")}`} className="transition-colors hover:text-white">
              {company.phones[0]}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
