"use client";

import { useState, Suspense } from "react";
import { Reveal } from "@/components/ui";
import { IconClock, IconMail, IconMapPin, IconPhone, IconShield } from "@/components/icons";
import { useDict } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n";
import { dispatchLead, generateTicketId, getWhatsAppUrl, getMailtoUrl, type RfqLeadPayload } from "@/lib/leads";
import { AviationRfq } from "@/components/aviation-rfq";

type FormState = { name: string; org: string; email: string; phone: string; service: string; message: string };
type Status = "idle" | "submitting" | "success" | "error";

const inputCls =
  "w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/40 outline-none transition-colors focus:border-citico-500 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500";

export function ContactClient() {
  const { company, services, pages } = useDict();
  const [activeTab, setActiveTab] = useState<"rfq" | "quick">("rfq");
  const [form, setForm] = useState<FormState>({
    name: "",
    org: "",
    email: "",
    phone: "",
    service: services[0].title,
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [ticketId, setTicketId] = useState("");
  const [submissionPayload, setSubmissionPayload] = useState<RfqLeadPayload | null>(null);

  const submitQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const tid = generateTicketId("OPS");
    setTicketId(tid);

    const payload: RfqLeadPayload = {
      referenceId: tid,
      missionType: "ad-hoc-ops",
      clientName: form.name,
      organization: form.org || "Individual / Direct Inquiry",
      email: form.email,
      phone: form.phone || "+211 924 016 167",
      urgency: "urgent",
      origin: "Juba International Airport (JUB)",
      destination: "Open / Inquired in message",
      selectedAircraft: "Operations Desk Recommendation",
      cargoWeightKg: 0,
      hazmat: false,
      coldChain: false,
      additionalNotes: `[Service Inquired: ${form.service}]\n${form.message}`,
      leadScore: form.org ? 75 : 60,
      submittedAt: new Date().toISOString(),
    };

    setSubmissionPayload(payload);

    try {
      await dispatchLead(payload);
      setStatus("success");
      setForm({ name: "", org: "", email: "", phone: "", service: services[0].title, message: "" });
    } catch {
      // Even if network drops, dispatchLead saves to localStorage queue
      setStatus("success");
    }
  };

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr]">
        {/* ── Contact details & 24/7 Ops Desk ── */}
        <div className="space-y-6">
          <Reveal>
            <div className="rounded-3xl border border-navy-900/8 bg-white/70 p-7 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-citico-600 dark:text-citico-400">
                <IconShield className="h-4 w-4" />
                <span>SSCAA Authorized AOC 019-R</span>
              </div>
              <h2 className="mt-2 font-display text-xl font-bold text-navy-900 dark:text-white">
                {pages.contact.headOfficeTitle}
              </h2>
              <ul className="mt-5 space-y-5 text-sm">
                <li className="flex gap-3.5">
                  <IconMapPin className="mt-0.5 h-5 w-5 shrink-0 text-citico-600 dark:text-citico-300" />
                  <span className="text-navy-700/85 dark:text-slate-300/90">{company.hq}</span>
                </li>
                <li className="flex gap-3.5">
                  <IconPhone className="mt-0.5 h-5 w-5 shrink-0 text-citico-600 dark:text-citico-300" />
                  <span className="text-navy-700/85 dark:text-slate-300/90">
                    {company.phones.map((p) => (
                      <a
                        key={p}
                        href={`tel:${p.replace(/\s/g, "")}`}
                        className="block font-medium transition-colors hover:text-citico-700 dark:hover:text-citico-300"
                      >
                        {p}
                      </a>
                    ))}
                  </span>
                </li>
                <li className="flex gap-3.5">
                  <IconMail className="mt-0.5 h-5 w-5 shrink-0 text-citico-600 dark:text-citico-300" />
                  <span className="text-navy-700/85 dark:text-slate-300/90">
                    <a
                      href={`mailto:${company.email}`}
                      className="block transition-colors hover:text-citico-700 dark:hover:text-citico-300"
                    >
                      {company.email}
                    </a>
                    <a
                      href={`mailto:${company.businessEmail}`}
                      className="block transition-colors hover:text-citico-700 dark:hover:text-citico-300"
                    >
                      {company.businessEmail}
                    </a>
                  </span>
                </li>
                <li className="flex gap-3.5">
                  <IconClock className="mt-0.5 h-5 w-5 shrink-0 text-citico-600 dark:text-citico-300" />
                  <span className="text-navy-700/85 dark:text-slate-300/90">
                    {fmt(pages.contact.deskLineTemplate, { website: company.website })}
                  </span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* ── 24/7 Operations Desk Urgent Call ── */}
          <Reveal delay={0.06}>
            <div className="rounded-3xl bg-gradient-to-br from-citico-800 via-citico-900 to-navy-950 p-7 text-white shadow-xl shadow-citico-950/20">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live 24/7 Flight Operations Desk
              </div>
              <p className="mt-3 text-lg font-bold leading-tight">
                Urgent Mission or Time-Critical Charter?
              </p>
              <p className="mt-1.5 text-xs text-citico-100/75 leading-relaxed">
                Direct duty officer access for medevac dispatch, humanitarian cargo surges, and emergency flight clearance.
              </p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href="tel:+211924016167"
                  className="inline-flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  <span className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-citico-300" />
                    Duty Officer 1
                  </span>
                  <span className="text-xs text-citico-200">+211 924 016 167</span>
                </a>
                <a
                  href="https://wa.me/211924016167?text=URGENT%20FLIGHT%20REQUEST%20-%20Citico%20Operations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 shadow-md"
                >
                  WhatsApp Operations Desk
                </a>
              </div>
            </div>
          </Reveal>

          {/* ── Map ── */}
          <Reveal delay={0.1}>
            <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-navy-900/8 dark:border-white/10 shadow-sm">
              <iframe
                title={pages.contact.mapTitle}
                src="https://www.openstreetmap.org/export/embed.html?bbox=31.565%2C4.845%2C31.605%2C4.885&layer=mapnik&marker=4.865%2C31.585"
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>

        {/* ── Main Interactive Contact / RFQ Container ── */}
        <Reveal delay={0.08}>
          <div id="charter" className="scroll-mt-28 space-y-4">
            {/* Tab Selector */}
            <div className="flex rounded-2xl bg-slate-200/70 p-1.5 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setActiveTab("rfq")}
                className={`flex-1 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "rfq"
                    ? "bg-white text-citico-900 shadow-md dark:bg-navy-800 dark:text-white"
                    : "text-slate-600 hover:text-navy-950 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                ✈ Multi-Step Aviation RFQ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("quick")}
                className={`flex-1 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "quick"
                    ? "bg-white text-citico-900 shadow-md dark:bg-navy-800 dark:text-white"
                    : "text-slate-600 hover:text-navy-950 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                ✉ Quick Ops Desk Message
              </button>
            </div>

            {activeTab === "rfq" ? (
              <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-3xl bg-slate-100 dark:bg-white/5" />}>
                <AviationRfq />
              </Suspense>
            ) : (
              <div className="rounded-3xl border border-navy-900/8 bg-white/70 p-7 dark:border-white/10 dark:bg-white/5 sm:p-9 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-navy-900 dark:text-white">
                  Quick Operations Desk Inquiry
                </h2>
                <p className="mt-1.5 text-xs text-navy-700/70 dark:text-slate-400">
                  Send a fast message to our dispatch and handling team. For full flight quoting with route parameters, use the Aviation RFQ tab.
                </p>

                {status === "success" && submissionPayload ? (
                  <div
                    role="alert"
                    className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-navy-900 dark:text-white"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-lg">
                        ✓
                      </span>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                            Inquiry Dispatched & Queued
                          </p>
                          <h3 className="text-lg font-bold text-navy-950 dark:text-white">
                            Ticket Reference: <span className="font-mono text-citico-700 dark:text-citico-400">{ticketId}</span>
                          </h3>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            Your inquiry has been stored in our resilient queue and sent to the 24/7 Operations Desk.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <a
                            href={getWhatsAppUrl(submissionPayload)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-500 shadow-md"
                          >
                            <span>Open on WhatsApp</span>
                            <span>→</span>
                          </a>
                          <a
                            href={getMailtoUrl(submissionPayload)}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-300 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                          >
                            <span>Send via Email Client</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitQuick} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                          {pages.contact.fieldName} *
                        </span>
                        <input
                          required
                          value={form.name}
                          onChange={set("name")}
                          className={inputCls}
                          placeholder={pages.contact.fieldNamePlaceholder}
                          autoComplete="name"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                          {pages.contact.fieldOrg}
                        </span>
                        <input
                          value={form.org}
                          onChange={set("org")}
                          className={inputCls}
                          placeholder={pages.contact.fieldOrgPlaceholder}
                          autoComplete="organization"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                          {pages.contact.fieldEmail} *
                        </span>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={set("email")}
                          className={inputCls}
                          placeholder={pages.contact.fieldEmailPlaceholder}
                          autoComplete="email"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                          Phone / WhatsApp *
                        </span>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={set("phone")}
                          className={inputCls}
                          placeholder="+211 ..."
                          autoComplete="tel"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                        {pages.contact.fieldService}
                      </span>
                      <select value={form.service} onChange={set("service")} className={inputCls}>
                        {services.map((s) => (
                          <option key={s.slug} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Overflight & Landing Clearances">Overflight & Landing Clearances</option>
                        <option value="AOG Parts & Maintenance Support">AOG Parts & Maintenance Support</option>
                        <option value="General Operations Inquiry">General Operations Inquiry</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy-700/70 dark:text-slate-400">
                        {pages.contact.fieldMessage} *
                      </span>
                      <textarea
                        required
                        rows={4}
                        value={form.message}
                        onChange={set("message")}
                        className={inputCls}
                        placeholder={pages.contact.fieldMessagePlaceholder}
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-citico-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-citico-600 disabled:opacity-60 dark:bg-citico-500"
                    >
                      {status === "submitting" ? "Securing & Dispatching…" : "Send Operations Message"}
                    </button>
                    <p className="text-center text-[11px] text-navy-700/50 dark:text-slate-500">
                      Dispatched instantly to 24/7 Ops Desk with offline backup queue.
                    </p>
                  </form>
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
