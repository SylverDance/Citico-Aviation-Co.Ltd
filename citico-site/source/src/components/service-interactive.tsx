"use client";

import { useState, useMemo } from "react";
import { Reveal, SectionHead } from "@/components/ui";
import {
  IconPhone,
  IconArrow,
  IconCheck,
  IconWrench,
  IconPermit,
  IconRotor,
} from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import {
  dispatchLead,
  generateReferenceId,
  formatWhatsAppMessage,
  formatMailtoUrl,
  type RfqLeadPayload,
} from "@/lib/leads";

/* ══════════════════════════════════════════════════════════════════════════════
   1. AIRCRAFT PARTS INTERACTIVE (Searchable catalog + AOG desk quote modal)
   ══════════════════════════════════════════════════════════════════════════════ */

type PartItem = {
  id: string;
  partNumber: string;
  nameEn: string;
  nameAr: string;
  aircraft: string;
  ata: string;
  condition: "New" | "Overhauled" | "Serviceable";
  certification: string;
  locationEn: string;
  locationAr: string;
  leadTimeEn: string;
  leadTimeAr: string;
};

const SAMPLE_PARTS: PartItem[] = [
  {
    id: "p1",
    partNumber: "ST-16M-200",
    nameEn: "TG-16M Auxiliary Power Unit (APU)",
    nameAr: "وحدة الطاقة المساعدة TG-16M (APU)",
    aircraft: "Antonov AN-26",
    ata: "ATA 49 APU",
    condition: "Overhauled",
    certification: "Dual Release / CAA Traceable",
    locationEn: "Juba Hub Stock",
    locationAr: "مخزون مركز جوبا",
    leadTimeEn: "Immediate dispatch",
    leadTimeAr: "إرسال فوري",
  },
  {
    id: "p2",
    partNumber: "GS-24A-01",
    nameEn: "AI-24VT Starter Generator Assembly",
    nameAr: "مجمع مولد الإقلاع AI-24VT",
    aircraft: "Antonov AN-26",
    ata: "ATA 24 Electrical",
    condition: "Serviceable",
    certification: "EASA Form 1 / OEM Log",
    locationEn: "Juba Hub Stock",
    locationAr: "مخزون مركز جوبا",
    leadTimeEn: "Same-day AOG delivery",
    leadTimeAr: "تسليم AOG بنفس اليوم",
  },
  {
    id: "p3",
    partNumber: "KT-157-BRAKE",
    nameEn: "Main Landing Gear Brake Assembly",
    nameAr: "مجمع مكابح معدات الهبوط الرئيسية",
    aircraft: "Antonov AN-26",
    ata: "ATA 32 Landing Gear",
    condition: "New",
    certification: "Factory Certified",
    locationEn: "Regional Hub (Nairobi)",
    locationAr: "المركز الإقليمي (نيروبي)",
    leadTimeEn: "24–48 hours",
    leadTimeAr: "24-48 ساعة",
  },
  {
    id: "p4",
    partNumber: "8A-6311-000",
    nameEn: "Intermediate Tail Gearbox Assembly",
    nameAr: "علبة التروس المتوسطة لذيل الطائرة 8A-6311-000",
    aircraft: "Mil Mi-8T",
    ata: "ATA 63 Rotor Drive",
    condition: "Overhauled",
    certification: "Mil-Spec Dual Traceable",
    locationEn: "Juba Hub Stock",
    locationAr: "مخزون مركز جوبا",
    leadTimeEn: "Immediate dispatch",
    leadTimeAr: "إرسال فوري",
  },
  {
    id: "p5",
    partNumber: "DART-FP-532",
    nameEn: "Rolls-Royce Dart 7 High-Pressure Fuel Pump",
    nameAr: "مضخة وقود الضغط العالي لمحرك Dart 7",
    aircraft: "Fokker F27",
    ata: "ATA 73 Engine Fuel",
    condition: "Overhauled",
    certification: "FAA 8130-3 / Dual",
    locationEn: "Regional Hub (Entebbe)",
    locationAr: "المركز الإقليمي (عنتيبي)",
    leadTimeEn: "24 hours",
    leadTimeAr: "24 ساعة",
  },
  {
    id: "p6",
    partNumber: "CFM-TRA-300",
    nameEn: "CFM56-3 Thrust Reverser Actuator",
    nameAr: "مشغل عاكس الدفع لمحرك CFM56-3",
    aircraft: "Boeing 737-300F",
    ata: "ATA 78 Exhaust/Thrust",
    condition: "Serviceable",
    certification: "EASA Form 1",
    locationEn: "Entebbe Hub",
    locationAr: "مركز عنتيبي",
    leadTimeEn: "24–36 hours",
    leadTimeAr: "24-36 ساعة",
  },
  {
    id: "p7",
    partNumber: "VHF-KY-196B",
    nameEn: "King KY-196B 25kHz/8.33kHz VHF Transceiver",
    nameAr: "جهاز إرسال واستقبال VHF طراز King KY-196B",
    aircraft: "Multi-Fleet",
    ata: "ATA 34 Navigation & Comms",
    condition: "New",
    certification: "FAA 8130-3 / Form 1",
    locationEn: "Juba Hub Stock",
    locationAr: "مخزون مركز جوبا",
    leadTimeEn: "Immediate dispatch",
    leadTimeAr: "إرسال فوري",
  },
  {
    id: "p8",
    partNumber: "D-36-BLEED",
    nameEn: "D-36 Engine High-Stage Bleed Air Valve",
    nameAr: "صمام هواء المحرك عالي الضغط D-36",
    aircraft: "Antonov AN-74",
    ata: "ATA 36 Pneumatic",
    condition: "Overhauled",
    certification: "Factory Release Certificate",
    locationEn: "Regional Hub",
    locationAr: "المركز الإقليمي",
    leadTimeEn: "48 hours",
    leadTimeAr: "48 ساعة",
  },
];

export function AircraftPartsInteractive({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [query, setQuery] = useState("");
  const [selectedFleet, setSelectedFleet] = useState<string>("All");
  const [selectedPart, setSelectedPart] = useState<PartItem | null>(null);
  const [isAog, setIsAog] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTicket, setLastTicket] = useState<RfqLeadPayload | null>(null);
  const [formData, setFormData] = useState({ name: "", org: "", email: "", phone: "", notes: "" });

  const fleets = ["All", "Antonov AN-26", "Antonov AN-74", "Fokker F27", "Boeing 737-300F", "Mil Mi-8T", "Multi-Fleet"];

  const filteredParts = useMemo(() => {
    return SAMPLE_PARTS.filter((part) => {
      const matchFleet = selectedFleet === "All" || part.aircraft === selectedFleet;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        part.partNumber.toLowerCase().includes(q) ||
        part.nameEn.toLowerCase().includes(q) ||
        part.nameAr.includes(q) ||
        part.ata.toLowerCase().includes(q) ||
        part.aircraft.toLowerCase().includes(q);
      return matchFleet && matchQuery;
    });
  }, [selectedFleet, query]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setIsSubmitting(true);

    const ref = generateReferenceId("parts");
    const payload: RfqLeadPayload = {
      referenceId: ref,
      createdAt: new Date().toISOString(),
      missionType: "parts",
      aircraft: selectedPart.aircraft,
      partNumber: selectedPart.partNumber,
      urgency: isAog ? "emergency-aog" : "routine",
      client: {
        name: formData.name,
        organization: formData.org,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.phone,
      },
      notes: `Part: ${selectedPart.nameEn} (ATA: ${selectedPart.ata}, Condition: ${selectedPart.condition}). Notes: ${formData.notes}`,
      leadScore: isAog ? 95 : 75,
    };

    await dispatchLead(payload);
    setLastTicket(payload);
    setIsSubmitting(false);
    setFormSubmitted(true);
  };

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20 border-t border-navy-900/10 dark:border-white/10">
      <SectionHead
        align="left"
        kicker={isAr ? "مكتب قطع الغيار وإدارة AOG" : "AOG Desk & Certified Inventory"}
        title={
          isAr ? (
            <>
              كتالوج القطع الحرجة <span className="text-gradient">واستجابة AOG على مدار 24/7</span>
            </>
          ) : (
            <>
              Critical Parts Catalog & <span className="text-gradient">24/7 AOG Response</span>
            </>
          )
        }
        sub={
          isAr
            ? "ابحث بالرقم التسلسلي أو الطراز. جميع القطع مصحوبة بوثائق EASA / FAA / CAA وتوصيل مباشر بأسطولنا الجوي."
            : "Search by part number, ATA chapter or airframe. Fully traceable components with immediate air-cargo dispatch across East & Central Africa."
        }
      />

      {/* AOG Emergency Banner */}
      <Reveal delay={0.05} className="mt-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-citico-700 to-navy-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <IconWrench className="h-6 w-6 text-yellow-300" />
              </span>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/30 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                  {isAr ? "حالة طارئة لطائرة متوقفة AOG؟" : "Aircraft on Ground (AOG) Urgent?"}
                </span>
                <p className="mt-1 text-base font-bold sm:text-lg">
                  {isAr
                    ? "اتصال مباشر مع مهندس العمليات المناوب فوراً دون انتظار"
                    : "Direct 24/7 hotline with duty airframe & powerplant engineers"}
                </p>
                <p className="text-xs text-slate-200">
                  {isAr
                    ? "إرسال سريع على متن أول رحلة شحن تابعة لسيتيكو إلى جوبا والمحطات الإقليمية."
                    : "Immediate dispatch via our scheduled & charter cargo flights to Juba and field airstrips."}
                </p>
              </div>
            </div>
            <a
              href="tel:+211924016167"
              className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-navy-900 shadow-lg transition-transform hover:scale-105"
            >
              <IconPhone className="h-4 w-4 text-citico-700" />
              <span>+211 924 016 167</span>
            </a>
          </div>
        </div>
      </Reveal>

      {/* Search & Filters */}
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isAr
                ? "ابحث برقم القطعة، أو الوصف، أو ATA (مثال: TG-16M, Brake, ATA 24)..."
                : "Search part #, keyword, ATA (e.g. TG-16M, Brake, Generator)..."
            }
            className="w-full rounded-xl border border-navy-900/15 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/40 shadow-sm outline-none transition focus:border-citico-500 dark:border-white/15 dark:bg-navy-900 dark:text-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute end-3 top-3 text-xs text-navy-700/60 hover:text-navy-900 dark:text-slate-400"
            >
              ✕
            </button>
          )}
        </div>

        {/* Fleet selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {fleets.map((fleet) => (
            <button
              key={fleet}
              onClick={() => setSelectedFleet(fleet)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedFleet === fleet
                  ? "bg-citico-700 text-white shadow-sm dark:bg-citico-500"
                  : "bg-navy-900/5 text-navy-800 hover:bg-navy-900/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {fleet === "All" ? (isAr ? "جميع الطرازات" : "All Fleets") : fleet}
            </button>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredParts.map((part) => (
          <div
            key={part.id}
            className="group flex flex-col justify-between rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-citico-500 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-citico-700 dark:text-citico-300">
                  {part.partNumber}
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {part.condition}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold leading-snug text-navy-900 group-hover:text-citico-700 dark:text-white dark:group-hover:text-citico-300">
                {isAr ? part.nameAr : part.nameEn}
              </h4>
              <p className="mt-1 text-xs text-navy-700/65 dark:text-slate-400">
                {part.aircraft} · {part.ata}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px]">
                <span className="rounded bg-navy-900/5 px-2 py-0.5 text-navy-700 dark:bg-white/10 dark:text-slate-300">
                  🛡️ {part.certification}
                </span>
                <span className="rounded bg-navy-900/5 px-2 py-0.5 text-navy-700 dark:bg-white/10 dark:text-slate-300">
                  📍 {isAr ? part.locationAr : part.locationEn}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-navy-900/5 pt-3 dark:border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{isAr ? "التوفر:" : "Lead:"} {isAr ? part.leadTimeAr : part.leadTimeEn}</span>
                <button
                  onClick={() => {
                    setSelectedPart(part);
                    setFormSubmitted(false);
                  }}
                  className="rounded-lg bg-citico-700/10 px-3 py-1 font-semibold text-citico-700 transition hover:bg-citico-700 hover:text-white dark:bg-citico-500/20 dark:text-citico-300 dark:hover:bg-citico-500 dark:hover:text-white"
                >
                  {isAr ? "طلب تسعير" : "Quote"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParts.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-900/20 p-8 text-center dark:border-white/20">
          <p className="text-sm text-navy-700/70 dark:text-slate-400">
            {isAr
              ? "لم يتم العثور على قطع مطابقة للبحث. يمكن لمكتبنا تأمين أي قطعة مطلوبة عبر شبكة الوكلاء المعتمدين خلال 24 ساعة."
              : "No stock matching your search. Our global sourcing desk can procure and airfreight any OEM/PMA certified component within 24–48 hours."}
          </p>
          <button
            onClick={() => {
              setSelectedPart({
                id: "custom",
                partNumber: query || "Custom Sourcing",
                nameEn: "Custom Airframe / Engine Part Request",
                nameAr: "طلب قطعة هيكل أو محرك مخصصة",
                aircraft: selectedFleet === "All" ? "Any Fleet" : selectedFleet,
                ata: "Sourcing Desk",
                condition: "Serviceable",
                certification: "EASA/FAA Certified",
                locationEn: "Regional Network",
                locationAr: "الشبكة الإقليمية",
                leadTimeEn: "24-48 hrs",
                leadTimeAr: "24-48 ساعة",
              });
              setFormSubmitted(false);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-citico-700 px-4 py-2 text-xs font-semibold text-white dark:bg-citico-500"
          >
            {isAr ? "إرسال طلب استيراد مخصص" : "Submit Custom Part Request"}
          </button>
        </div>
      )}

      {/* Quote Request Modal */}
      {selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl border border-navy-900/15 bg-white p-7 shadow-2xl dark:border-white/15 dark:bg-navy-900">
            <button
              onClick={() => setSelectedPart(null)}
              className="absolute end-5 top-5 rounded-full p-2 text-navy-700/60 hover:bg-navy-900/5 hover:text-navy-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              ✕
            </button>

            {formSubmitted ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <IconCheck className="h-8 w-8" />
                </span>
                {lastTicket && (
                  <span className="mt-4 inline-block rounded-full bg-citico-500/10 px-3 py-1 font-mono text-xs font-bold text-citico-600 dark:text-citico-400">
                    Ticket Ref: #{lastTicket.referenceId}
                  </span>
                )}
                <h3 className="mt-2 text-xl font-bold text-navy-900 dark:text-white">
                  {isAr ? "تم تسجيل طلب القطعة واعتماده في الطابور" : "Part Request Logged & Dispatched"}
                </h3>
                <p className="mt-2 text-xs text-navy-700/75 dark:text-slate-300">
                  {isAr
                    ? `تم تسجيل طلب القطعة (${selectedPart.partNumber}) وإخطار مهندسي الصيانة ومخازن جوبا.`
                    : `Sourcing desk and airframe engineers notified for part #${selectedPart.partNumber}. A traceable log has been registered.`}
                </p>

                {isAog && (
                  <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {isAr
                      ? "⚠️ تم تصنيف الطلب كـ AOG طارئ. يوصى بالمتابعة الفورية عبر واتساب."
                      : "⚠️ AOG Critical Flagged. Immediate direct WhatsApp escalation active below."}
                  </div>
                )}

                {lastTicket && (
                  <div className="mt-5 flex flex-col gap-2">
                    <a
                      href={`https://wa.me/211924016167?text=${formatWhatsAppMessage(lastTicket)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                    >
                      <span>💬</span>
                      <span>{isAr ? "متابعة الطلب مباشرة عبر واتساب المهندس" : "Escalate to Duty Engineer via WhatsApp"}</span>
                    </a>
                    <a
                      href={formatMailtoUrl(lastTicket)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-xs font-bold text-navy-900 transition hover:bg-navy-50 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                    >
                      <span>✉️</span>
                      <span>{isAr ? "إرسال نسخة بريدية رسمية" : "Send Formal Email Copy"}</span>
                    </a>
                  </div>
                )}

                <button
                  onClick={() => setSelectedPart(null)}
                  className="mt-5 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white"
                >
                  {isAr ? "إغلاق النافذة" : "Close Window"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuote}>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-citico-700/10 px-2 py-0.5 text-xs font-bold text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
                    {selectedPart.aircraft}
                  </span>
                  <span className="font-mono text-xs text-slate-500">{selectedPart.partNumber}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-navy-900 dark:text-white">
                  {isAr ? selectedPart.nameAr : selectedPart.nameEn}
                </h3>

                {/* AOG toggle */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600 dark:text-amber-400">⚡</span>
                    <div>
                      <span className="block text-xs font-bold text-amber-900 dark:text-amber-200">
                        {isAr ? "أولوية طائرة متوقفة (AOG Urgency)" : "Aircraft on Ground (AOG Urgency)"}
                      </span>
                      <span className="block text-[11px] text-amber-700/80 dark:text-amber-300/70">
                        {isAr ? "توجيه الطلب كأولوية قصوى على مدار الساعة" : "Flags request for instant priority 24/7 technical call"}
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAog}
                    onChange={(e) => setIsAog(e.target.checked)}
                    className="h-4 w-4 rounded text-citico-600 focus:ring-citico-500"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      type="text"
                      placeholder={isAr ? "الاسم الكامل *" : "Contact Name *"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                    />
                    <input
                      type="text"
                      placeholder={isAr ? "اسم الشركة / شركة الطيران" : "Operator / Airline"}
                      value={formData.org}
                      onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                      className="w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      required
                      type="email"
                      placeholder={isAr ? "البريد الإلكتروني *" : "Email Address *"}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                    />
                    <input
                      required
                      type="tel"
                      placeholder={isAr ? "رقم الهاتف / الواتساب *" : "Phone / WhatsApp *"}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder={
                      isAr
                        ? "ملاحظات إضافية (الكمية المطلوبة، الرقم التسلسلي، موقع الطائرة)..."
                        : "Notes (Quantity required, serial #, tail number, delivery airport)..."
                    }
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPart(null)}
                    className="px-4 py-2 text-sm text-navy-700/70 hover:text-navy-900 dark:text-slate-400"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-citico-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-citico-600 dark:bg-citico-500"
                  >
                    {isAr ? "إرسال طلب التسعير الرسمي" : "Submit Quote Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   2. FLIGHT PERMITS INTERACTIVE (Regional Turnaround Matrix & Clearance Form)
   ══════════════════════════════════════════════════════════════════════════════ */

type CountryPermit = {
  countryEn: string;
  countryAr: string;
  icao: string;
  fir: string;
  overflightLead: string;
  landingLead: string;
  diplomaticClearance: string;
  caaScheduleEn: string;
  caaScheduleAr: string;
};

const COUNTRIES_PERMITS: CountryPermit[] = [
  {
    countryEn: "South Sudan",
    countryAr: "جنوب السودان",
    icao: "HJJJ (Juba)",
    fir: "Juba FIR",
    overflightLead: "12–24h (Expedited 4h)",
    landingLead: "24–48h",
    diplomaticClearance: "48–72h via MOFA",
    caaScheduleEn: "24/7 Operations Desk Coordination",
    caaScheduleAr: "تنسيق مكتبي على مدار 24/7",
  },
  {
    countryEn: "Uganda",
    countryAr: "أوغندا",
    icao: "HUEN (Entebbe)",
    fir: "Entebbe FIR",
    overflightLead: "24h",
    landingLead: "48h",
    diplomaticClearance: "72h",
    caaScheduleEn: "Standard CAA working hours",
    caaScheduleAr: "ساعات عمل هيئة الطيران المدني الرسمية",
  },
  {
    countryEn: "Kenya",
    countryAr: "كينيا",
    icao: "HKJK (Nairobi)",
    fir: "Nairobi FIR",
    overflightLead: "24–48h",
    landingLead: "48h",
    diplomaticClearance: "72h",
    caaScheduleEn: "KCAA e-Permits portal link",
    caaScheduleAr: "بوابة التصاريح الإلكترونية KCAA",
  },
  {
    countryEn: "Democratic Rep. of Congo",
    countryAr: "جمهورية الكونغو الديمقراطية",
    icao: "FZAA (Kinshasa)",
    fir: "Kinshasa FIR",
    overflightLead: "48–72h",
    landingLead: "72h",
    diplomaticClearance: "5 business days",
    caaScheduleEn: "PPR mandatory for East border strips",
    caaScheduleAr: "PPR إلزامي للمدارج الشرقية",
  },
  {
    countryEn: "Ethiopia",
    countryAr: "إثيوبيا",
    icao: "HAAB (Addis Ababa)",
    fir: "Addis Ababa FIR",
    overflightLead: "24–48h",
    landingLead: "48h",
    diplomaticClearance: "72h",
    caaScheduleEn: "Strict routing waypoint conformity",
    caaScheduleAr: "مطابقة دقيقة لنقاط المسار الجوي",
  },
  {
    countryEn: "Central African Republic",
    countryAr: "جمهورية أفريقيا الوسطى",
    icao: "FEFF (Bangui)",
    fir: "Bangui FIR",
    overflightLead: "48h",
    landingLead: "72h",
    diplomaticClearance: "4 business days",
    caaScheduleEn: "Defense ministry clearance required",
    caaScheduleAr: "موافقة وزارة الدفاع مطلوبة",
  },
];

export function FlightPermitsInteractive({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [filterType, setFilterType] = useState<"all" | "overflight" | "landing">("all");
  const [submitted, setSubmitted] = useState(false);
  const [lastPermitTicket, setLastPermitTicket] = useState<RfqLeadPayload | null>(null);
  const [isPermitSubmitting, setIsPermitSubmitting] = useState(false);
  const [permitForm, setPermitForm] = useState({
    callsign: "",
    aircraftType: "",
    route: "",
    dates: "",
    purpose: "Humanitarian Cargo",
    operator: "",
    email: "",
    phone: "",
  });

  const handlePermitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPermitSubmitting(true);

    const ref = generateReferenceId("permits");
    const payload: RfqLeadPayload = {
      referenceId: ref,
      createdAt: new Date().toISOString(),
      missionType: "permits",
      aircraft: permitForm.aircraftType,
      origin: permitForm.route.split("-")[0]?.trim() || "DEP",
      destination: permitForm.route.split("-")[1]?.trim() || "DEST",
      urgency: "critical-24h",
      client: {
        name: permitForm.operator || "Operator Dispatch",
        organization: permitForm.operator || "CAA Client",
        email: permitForm.email,
        phone: permitForm.phone,
        whatsapp: permitForm.phone,
      },
      notes: `Callsign: ${permitForm.callsign}, Route: ${permitForm.route}, Dates: ${permitForm.dates}, Purpose: ${permitForm.purpose}`,
      leadScore: 85,
    };

    await dispatchLead(payload);
    setLastPermitTicket(payload);
    setIsPermitSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20 border-t border-navy-900/10 dark:border-white/10">
      <SectionHead
        align="left"
        kicker={isAr ? "دليل تصاريح العبور والهبوط الإقليمية" : "Regional Permit Matrix & Clearance Desk"}
        title={
          isAr ? (
            <>
              جدول زمن الاستجابة <span className="text-gradient">وطلب التصاريح الرسمية</span>
            </>
          ) : (
            <>
              CAA Turnaround Matrix & <span className="text-gradient">Permit Request Desk</span>
            </>
          )
        }
        sub={
          isAr
            ? "نحن نختصر الإجراءات البيروقراطية في جنوب السودان ودول الجوار. تنسيق متواصل مع سلطات الطيران المدني ووزارات الخارجية والدفاع."
            : "Direct relationships with CAAs and ministries of foreign affairs across East and Central Africa ensure fast clearances, tech stops and diplomatic overflights."
        }
      />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Table of Country Requirements */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white">
              {isAr ? "مصفوفة زمن استخراج التصاريح الإقليمية" : "Permit Processing Times by FIR / Country"}
            </h3>
            <div className="flex gap-1 rounded-lg bg-navy-900/5 p-1 dark:bg-white/5">
              <button
                onClick={() => setFilterType("all")}
                className={`rounded px-2.5 py-1 text-xs font-semibold ${
                  filterType === "all" ? "bg-white shadow text-navy-900 dark:bg-navy-800 dark:text-white" : "text-navy-700/70 dark:text-slate-400"
                }`}
              >
                {isAr ? "الكل" : "All"}
              </button>
              <button
                onClick={() => setFilterType("overflight")}
                className={`rounded px-2.5 py-1 text-xs font-semibold ${
                  filterType === "overflight" ? "bg-white shadow text-navy-900 dark:bg-navy-800 dark:text-white" : "text-navy-700/70 dark:text-slate-400"
                }`}
              >
                {isAr ? "عبور" : "Overflight"}
              </button>
              <button
                onClick={() => setFilterType("landing")}
                className={`rounded px-2.5 py-1 text-xs font-semibold ${
                  filterType === "landing" ? "bg-white shadow text-navy-900 dark:bg-navy-800 dark:text-white" : "text-navy-700/70 dark:text-slate-400"
                }`}
              >
                {isAr ? "هبوط" : "Landing"}
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-navy-900/60">
            <table className="w-full text-start text-xs">
              <thead className="border-b border-navy-900/10 bg-navy-900/5 text-navy-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                <tr>
                  <th className="p-3.5 text-start font-bold">{isAr ? "الدولة / المطار" : "Country / FIR"}</th>
                  <th className="p-3.5 text-start font-bold">{isAr ? "تصريح عبور (Overflight)" : "Overflight Lead"}</th>
                  <th className="p-3.5 text-start font-bold">{isAr ? "تصريح هبوط (Landing)" : "Landing Lead"}</th>
                  <th className="p-3.5 text-start font-bold">{isAr ? "تصريح دبلوماسي / خاص" : "Diplomatic"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-900/5 dark:divide-white/5">
                {COUNTRIES_PERMITS.map((row) => (
                  <tr key={row.countryEn} className="hover:bg-navy-900/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-3.5">
                      <span className="font-bold text-navy-900 dark:text-white">
                        {isAr ? row.countryAr : row.countryEn}
                      </span>
                      <span className="block font-mono text-[10px] text-slate-500">{row.icao}</span>
                    </td>
                    <td className="p-3.5 font-medium text-citico-700 dark:text-citico-300">
                      {row.overflightLead}
                    </td>
                    <td className="p-3.5 text-navy-700 dark:text-slate-300">
                      {row.landingLead}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {row.diplomaticClearance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl border border-navy-900/8 bg-navy-900/[0.02] p-4 text-xs text-navy-700/80 dark:border-white/8 dark:bg-white/[0.02] dark:text-slate-300">
            <strong className="text-citico-700 dark:text-citico-300">
              {isAr ? "الوثائق الإلزامية المطلوبة لمعالجة الطلب:" : "Mandatory submission attachments:"}
            </strong>{" "}
            {isAr
              ? "شهادة صلاحية الطيران (C of A)، شهادة التسجيل، بوليصة التأمين العالمية سارية المفعول، قائمة طاقم الطائرة ورخصهم."
              : "Certificate of Airworthiness (C of A), Certificate of Registration, Worldwide Insurance, Crew Licenses & Medicals."}
          </div>
        </div>

        {/* Permit Request Form */}
        <div className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-lg dark:border-white/10 dark:bg-navy-900/80">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-citico-700/10 text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
              <IconPermit className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
                {isAr ? "طلب تصريح عبور / هبوط رسمي" : "Permit Clearance Request"}
              </h3>
              <p className="text-xs text-navy-700/60 dark:text-slate-400">
                {isAr ? "إجراء سريع خلال ساعات" : "Fast-track response desk"}
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              <IconCheck className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              {lastPermitTicket && (
                <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Permit Ticket: #{lastPermitTicket.referenceId}
                </span>
              )}
              <p className="mt-2 text-base font-bold">
                {isAr ? "تم تسجيل طلب التصريح وتمريره للمكتب العملياتي" : "Flight Clearance Request Dispatched"}
              </p>
              <p className="mt-1 text-xs">
                {isAr
                  ? "مكتب التصاريح يتولى الآن التواصل مع سلطات الطيران المدني المعنية والتأكد من مطابقة المسار."
                  : "Our flight dispatch officer is validating FIR routing with relevant CAAs under priority clearance."}
              </p>
              {lastPermitTicket && (
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={`https://wa.me/211924016167?text=${formatWhatsAppMessage(lastPermitTicket)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                  >
                    <span>💬</span>
                    <span>{isAr ? "تسريع التصريح عبر واتساب العمليات" : "Expedite Permit via WhatsApp"}</span>
                  </a>
                  <a
                    href={formatMailtoUrl(lastPermitTicket)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-4 py-2 text-xs font-bold text-navy-900 transition hover:bg-navy-50 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                  >
                    <span>✉️</span>
                    <span>{isAr ? "إرسال نسخة بريدية رسمية" : "Email Dispatch Copy"}</span>
                  </a>
                </div>
              )}
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white"
              >
                {isAr ? "تقديم طلب آخر" : "Submit Another Request"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handlePermitSubmit}
              className="mt-6 space-y-3.5 text-xs"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "رمز النداء / التسجيل *" : "Callsign / Reg *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 5X-ABC / CTI102"
                    value={permitForm.callsign}
                    onChange={(e) => setPermitForm({ ...permitForm, callsign: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "طراز الطائرة (ICAO) *" : "Aircraft Type *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AN26, B733, F27, MI8"
                    value={permitForm.aircraftType}
                    onChange={(e) => setPermitForm({ ...permitForm, aircraftType: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                  {isAr ? "المسار المخطط (من - إلى - نقاط العبور) *" : "Routing (DEP - DEST - Entry/Exit FIR) *"}
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. HUEN - HJJJ - HKJK"
                  value={permitForm.route}
                  onChange={(e) => setPermitForm({ ...permitForm, route: e.target.value })}
                  className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "نافذة الطيران (تاريخ ووقت UTC) *" : "Flight Window (Dates & UTC) *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 15-18 OCT 2026"
                    value={permitForm.dates}
                    onChange={(e) => setPermitForm({ ...permitForm, dates: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "غرض الرحلة *" : "Purpose of Flight *"}
                  </label>
                  <select
                    value={permitForm.purpose}
                    onChange={(e) => setPermitForm({ ...permitForm, purpose: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  >
                    <option value="Humanitarian Cargo">{isAr ? "شحن إنساني / إغاثة" : "Humanitarian Cargo"}</option>
                    <option value="Commercial Charter">{isAr ? "رحلة عارضة تجارية" : "Commercial Charter"}</option>
                    <option value="Technical Stop / Fuel">{isAr ? "توقف فني للتزود بالوقود" : "Technical Stop / Fuel"}</option>
                    <option value="Medevac / Ambulance">{isAr ? "إخلاء طبي / إسعاف طائر" : "Medevac / Ambulance"}</option>
                    <option value="VIP / Diplomatic">{isAr ? "دبلوماسي / كبار الشخصيات" : "VIP / Diplomatic"}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "البريد الإلكتروني للرد *" : "Contact Email *"}
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="dispatch@airline.com"
                    value={permitForm.email}
                    onChange={(e) => setPermitForm({ ...permitForm, email: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "الهاتف / واتساب العمليات *" : "Operations Phone *" }
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+..."
                    value={permitForm.phone}
                    onChange={(e) => setPermitForm({ ...permitForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-citico-700 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-citico-600 dark:bg-citico-500"
              >
                <span>{isAr ? "إرسال طلب التصريح إلى مكتب العمليات" : "Submit to Permits Desk"}</span>
                <IconArrow className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   3. GROUND HANDLING INTERACTIVE (Airport Stations Directory & Request)
   ══════════════════════════════════════════════════════════════════════════════ */

type StationInfo = {
  nameEn: string;
  nameAr: string;
  code: string;
  capabilitiesEn: string[];
  capabilitiesAr: string[];
  hoursEn: string;
  hoursAr: string;
  status: "24/7 Active" | "Daylight / PPR" | "Scheduled";
};

const STATIONS: StationInfo[] = [
  {
    nameEn: "Juba International Airport",
    nameAr: "مطار جوبا الدولي",
    code: "JUB / HJJJ",
    capabilitiesEn: ["Full GSE (GPU, ASU, Belt Loaders)", "Jet A-1 Fuel Into-Plane", "Ramp Supervision & Pushback", "Pax & Cargo Manifest Handling"],
    capabilitiesAr: ["معدات أرضية كاملة (GPU, ASU, سيور أمتعة)", "تزويد بوقود Jet A-1 بالطائرة", "إشراف على الساحة وسحب الطائرات", "معالجة بيانات الركاب والشحن"],
    hoursEn: "24/7 Operations",
    hoursAr: "عمليات على مدار 24/7",
    status: "24/7 Active",
  },
  {
    nameEn: "Malakal Airport",
    nameAr: "مطار ملكال",
    code: "MAK / HSSM",
    capabilitiesEn: ["Ramp Marshalling", "Bulk Cargo Offloading", "Fuel Coordination", "Airfield Supervision"],
    capabilitiesAr: ["إرشاد الطائرات على الساحة", "تفريغ الشحنات الضخمة", "تنسيق الوقود", "إشراف على مهبط الطائرات"],
    hoursEn: "Daylight Operations (06:00 - 18:00 UTC)",
    hoursAr: "عمليات نهارية (06:00 - 18:00 UTC)",
    status: "Daylight / PPR",
  },
  {
    nameEn: "Wau Airport",
    nameAr: "مطار واو",
    code: "WAU / HSSW",
    capabilitiesEn: ["Cargo Handling & Forklifts", "Marshalling & Chocks", "Last-Mile Truck Trans-shipment", "Operations Dispatch"],
    capabilitiesAr: ["مناولة شحن ورافعات شوكية", "إرشاد وتثبيت الطائرات", "إعادة شحن بالشاحنات للميل الأخير", "تنسيق العمليات الميدانية"],
    hoursEn: "Daylight Operations (PPR 2h)",
    hoursAr: "عمليات نهارية (PPR ساعتان)",
    status: "Daylight / PPR",
  },
  {
    nameEn: "Rumbek Airstrip",
    nameAr: "مهبط رمبيك",
    code: "RBX / HSMK",
    capabilitiesEn: ["Ramp Control", "Humanitarian Cargo Offload", "Security Perimeter Check", "Load Control Sign-off"],
    capabilitiesAr: ["مراقبة الساحة الميدانية", "تفريغ شحنات الإغاثة", "فحص المحيط الأمني", "اعتماد بيانات الوزن والتوازن"],
    hoursEn: "Sunrise to Sunset",
    hoursAr: "من الشروق حتى الغروب",
    status: "Daylight / PPR",
  },
  {
    nameEn: "Bor & Twon River Corridor",
    nameAr: "ممر بور وتون النهري",
    code: "HSBR / Port",
    capabilitiesEn: ["Air-to-River Barge Trans-shipment", "Heavy Crane Offloading", "Warehousing Ground Support", "Fuel Bunker Transfer"],
    capabilitiesAr: ["نقل متعدد الوسائط من الجو إلى النهر", "تفريغ بالرافعات الثقيلة", "دعم لوجستي وتخزين أرضي", "نقل وتفريغ صهاريج الوقود"],
    hoursEn: "Daily Multimodal Dispatch",
    hoursAr: "ترحيل يومي متعدد الوسائط",
    status: "24/7 Active",
  },
];

export function GroundHandlingInteractive({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [stationReqSubmitted, setStationReqSubmitted] = useState(false);
  const [selectedStation, setSelectedStation] = useState(STATIONS[0].code);
  const [stationTicket, setStationTicket] = useState<RfqLeadPayload | null>(null);
  const [handlingForm, setHandlingForm] = useState({ aircraft: "", eta: "", phone: "", org: "" });

  const handleHandlingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = generateReferenceId("cargo");
    const payload: RfqLeadPayload = {
      referenceId: ref,
      createdAt: new Date().toISOString(),
      missionType: "cargo",
      destination: selectedStation,
      aircraft: handlingForm.aircraft,
      needsGroundHandling: true,
      urgency: "critical-24h",
      client: {
        name: handlingForm.org || "Operator Flight Deck",
        organization: handlingForm.org || "Visiting Airline",
        email: "ops@citicoaviation.com",
        phone: handlingForm.phone,
        whatsapp: handlingForm.phone,
      },
      notes: `Ground Handling PPR at ${selectedStation}. Aircraft/MTOW: ${handlingForm.aircraft}. ETA: ${handlingForm.eta}`,
      leadScore: 80,
    };

    await dispatchLead(payload);
    setStationTicket(payload);
    setStationReqSubmitted(true);
  };

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20 border-t border-navy-900/10 dark:border-white/10">
      <SectionHead
        align="left"
        kicker={isAr ? "محطات المناولة والخدمات الأرضية المعتمدة" : "Ramp & Station Network in South Sudan"}
        title={
          isAr ? (
            <>
              شبكة المحطات الأرضية <span className="text-gradient">وإشراف الساحة وفق معايير شركات الطيران</span>
            </>
          ) : (
            <>
              Airfield Station Directory & <span className="text-gradient">Airline-Standard Ground Handling</span>
            </>
          )
        }
        sub={
          isAr
            ? "نحن نوفر الدعم الأرضي المتكامل من معدات GSE وتزويد الوقود إلى التفريغ والتوزيع في جوبا وجميع المطارات والمهابط الإقليمية."
            : "From Juba International Airport to remote upcountry airstrips: marshalling, GPU/ASU support, into-plane fuel, weight & balance and cargo discharge."
        }
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {STATIONS.map((station) => (
          <div
            key={station.code}
            className="flex flex-col justify-between rounded-3xl border border-navy-900/10 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-citico-700 dark:text-citico-300">
                  {station.code}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold ${
                    station.status === "24/7 Active"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {station.status}
                </span>
              </div>
              <h4 className="mt-3 font-display text-base font-bold text-navy-900 dark:text-white">
                {isAr ? station.nameAr : station.nameEn}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                🕒 {isAr ? station.hoursAr : station.hoursEn}
              </p>

              <div className="mt-4 border-t border-navy-900/5 pt-3 dark:border-white/5">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-navy-700/60 dark:text-slate-400">
                  {isAr ? "القدرات المتوفرة بالمحطة:" : "Capabilities:"}
                </span>
                <ul className="mt-2 space-y-1.5 text-xs text-navy-700/85 dark:text-slate-300">
                  {(isAr ? station.capabilitiesAr : station.capabilitiesEn).map((cap) => (
                    <li key={cap} className="flex items-center gap-2">
                      <span className="text-citico-600 dark:text-citico-400">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-navy-900/5 dark:border-white/5">
              <a
                href="#handling-request"
                onClick={() => setSelectedStation(station.code)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-citico-700/10 py-2 text-xs font-semibold text-citico-700 transition hover:bg-citico-700 hover:text-white dark:bg-citico-500/20 dark:text-citico-300 dark:hover:bg-citico-500 dark:hover:text-white"
              >
                <span>{isAr ? `طلب مناولة في ${station.code}` : `Request Handling at ${station.code}`}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Handling PPR Request Form */}
      <div id="handling-request" className="mt-14 rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-citico-300">
            {isAr ? "إشعار مسبق وحجز المناولة" : "Prior Permission Required (PPR)"}
          </span>
          <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
            {isAr ? "حجز خدمات المناولة الأرضية واستقبال الطائرة" : "Book Handling & Ground Supervision"}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {isAr
              ? "نسق رحلتك مسبقاً لضمان جهوزية معدات الدفع والتفريغ وتزويد الوقود قبل الهبوط."
              : "Pre-advise our operations desk with your ETA and payload. We guarantee ramp slots, equipment positioning and into-plane fueling upon landing."}
          </p>
        </div>

        {stationReqSubmitted ? (
          <div className="mt-8 rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
            <IconCheck className="mx-auto h-10 w-10 text-emerald-400" />
            {stationTicket && (
              <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 font-mono text-xs font-bold text-white">
                PPR Ref: #{stationTicket.referenceId}
              </span>
            )}
            <p className="mt-2 text-lg font-bold">
              {isAr ? "تم تسجيل طلب المناولة بنجاح" : "Ground Handling Booking Confirmed"}
            </p>
            <p className="mt-1 text-xs text-slate-300">
              {isAr
                ? "تم إبلاغ مشرف الساحة بالمحطة المعنية لمتابعة خطة هبوط الطائرة والتنسيق مع الطاقم."
                : "Station ramp supervisor notified. PPR reference code has been queued with duty operations."}
            </p>
            {stationTicket && (
              <div className="mt-4 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <a
                  href={`https://wa.me/211924016167?text=${formatWhatsAppMessage(stationTicket)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                >
                  <span>💬</span>
                  <span>{isAr ? "تأكيد فوري مع مشرف الساحة عبر واتساب" : "Confirm with Ramp Lead via WhatsApp"}</span>
                </a>
              </div>
            )}
            <button
              onClick={() => setStationReqSubmitted(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-white"
            >
              {isAr ? "طلب آخر" : "New Booking"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleHandlingSubmit}
            className="mt-8 grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label className="mb-1 block text-slate-300">{isAr ? "المحطة *" : "Station *"}</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-white outline-none focus:ring-1 focus:ring-citico-400"
              >
                {STATIONS.map((s) => (
                  <option key={s.code} value={s.code} className="bg-navy-900 text-white">
                    {s.code} - {isAr ? s.nameAr : s.nameEn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-slate-300">{isAr ? "طراز الطائرة والوزن *" : "Aircraft & MTOW *"}</label>
              <input
                required
                type="text"
                placeholder="e.g. B737-300F / 63,000 kg"
                value={handlingForm.aircraft}
                onChange={(e) => setHandlingForm({ ...handlingForm, aircraft: e.target.value })}
                className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-citico-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">{isAr ? "موعد الوصول (ETA UTC) *" : "ETA Date & UTC *"}</label>
              <input
                required
                type="text"
                placeholder="e.g. 18 OCT 2026, 11:30Z"
                value={handlingForm.eta}
                onChange={(e) => setHandlingForm({ ...handlingForm, eta: e.target.value })}
                className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-citico-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">{isAr ? "الهاتف / الواتساب *" : "Contact Phone / VHF *"}</label>
              <input
                required
                type="tel"
                placeholder="+211..."
                value={handlingForm.phone}
                onChange={(e) => setHandlingForm({ ...handlingForm, phone: e.target.value })}
                className="w-full rounded-xl bg-white/10 px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-citico-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end mt-2">
              <button
                type="submit"
                className="rounded-full bg-white px-7 py-3 text-sm font-bold text-navy-900 shadow-lg transition hover:bg-slate-100"
              >
                {isAr ? "تأكيد حجز المناولة وإرسال PPR" : "Confirm Handling & Dispatch PPR"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   4. TOURS & TRAVELS INTERACTIVE (Curated Itineraries & Custom Expedition Builder)
   ══════════════════════════════════════════════════════════════════════════════ */

type Itinerary = {
  id: string;
  titleEn: string;
  titleAr: string;
  durationEn: string;
  durationAr: string;
  logisticsEn: string;
  logisticsAr: string;
  seasonEn: string;
  seasonAr: string;
  summaryEn: string;
  summaryAr: string;
  daysEn: { day: string; title: string; desc: string }[];
  daysAr: { day: string; title: string; desc: string }[];
};

const ITINERARIES: Itinerary[] = [
  {
    id: "sudd",
    titleEn: "The Great Sudd Wetland & White Nile Corridor",
    titleAr: "مستنقعات السد العظمى وممر النيل الأبيض",
    durationEn: "4 Days / 3 Nights",
    durationAr: "4 أيام / 3 ليالٍ",
    logisticsEn: "Private Charter Flight + River Cruiser Barge",
    logisticsAr: "رحلة طيران عارضة خاصة + بارجة نهرية سياحية",
    seasonEn: "November – April (Optimal water clarity)",
    seasonAr: "نوفمبر - أبريل (أفضل فصول الرؤية والمياه)",
    summaryEn: "Explore Africa's largest freshwater wetland — teeming with Shoebill storks, remote fishing communities, and sunset cruises along the Nile corridor.",
    summaryAr: "استكشف أكبر مستنقع للمياه العذبة في أفريقيا — موطن طائر حذاء النيل النادر ومجتمعات الصيد العريقة ومسارات الغروب الأخاذة.",
    daysEn: [
      { day: "Day 1", title: "Juba Departure & Bor Flight", desc: "Private charter hop to Bor air strip, transfer to private expedition vessel on the White Nile." },
      { day: "Day 2", title: "Deep Sudd Papyrus Navigation", desc: "Navigating tranquil channels, bird watching for Shoebill storks and local pastoralist encounters." },
      { day: "Day 3", title: "Shambe Lagoon & Fishing Village", desc: "Excursion to pristine fishing settlements and sunset dinner aboard the observation deck." },
      { day: "Day 4", title: "Return Flight to Juba", desc: "Scenic flight over the winding bends of the White Nile returning to Juba International." },
    ],
    daysAr: [
      { day: "اليوم 1", title: "المغادرة من جوبا إلى بور", desc: "رحلة جوية خاصة إلى مهبط بور، ثم الانتقال إلى متن السفينة الاستكشافية على النيل الأبيض." },
      { day: "اليوم 2", title: "الملاحة في قنوات البردي بالسد", desc: "الإبحار في القنوات الهادئة، ومشاهدة الطيور النادرة ولقاء المجتمعات الرعوية النيلية." },
      { day: "اليوم 3", title: "بحيرة شامبي وقرى الصيادين", desc: "جولة في مستوطنات الصيد البكر وعشاء الغروب على متن منصة المراقبة العلوية." },
      { day: "اليوم 4", title: "العودة جواً إلى جوبا", desc: "رحلة جوية بانورامية فوق تعرجات النيل الأبيض عائدين إلى مطار جوبا الدولي." },
    ],
  },
  {
    id: "boma",
    titleEn: "Boma National Park Great Migration Air Safari",
    titleAr: "سفاري الهجرة العظمى الجوي في حديقة بوما الوطنية",
    durationEn: "5 Days / 4 Nights",
    durationAr: "5 أيام / 4 ليالٍ",
    logisticsEn: "STOL Aircraft Bush Flight + Tented Camp Logistics",
    logisticsAr: "طائرة هبوط وإقلاع قصير (STOL) + مخيمات بيئية فاخرة",
    seasonEn: "March – June & September – November",
    seasonAr: "مارس - يونيو وسبتمبر - نوفمبر",
    summaryEn: "Witness the planet's largest mammal migration — millions of white-eared kob and tiang sweeping the pristine savannas of eastern South Sudan.",
    summaryAr: "شاهد أكبر هجرة للثدييات على وجه الأرض — ملايين من ظباء الكوب بيضاء الأذن والتيل تجوب سهول السافانا البكر في شرق جنوب السودان.",
    daysEn: [
      { day: "Day 1", title: "Direct Flight Juba to Boma Plateau", desc: "Air safari crossing the Ethiopian borderlands to our private airstrip encampment." },
      { day: "Day 2-3", title: "Savanna Migration Tracking", desc: "Guided 4x4 game viewing of massive antelope herds, apex predators, and birdlife." },
      { day: "Day 4", title: "Indigenous Community Engagement", desc: "Respectful cultural exchange with the Murle and Jie pastoralist clans." },
      { day: "Day 5", title: "Scenic Flight Back to Juba", desc: "Aerial photography return flight touching down in Juba by midday." },
    ],
    daysAr: [
      { day: "اليوم 1", title: "طيران مباشر من جوبا إلى هضبة بوما", desc: "سفاري جوي يعبر الحدود الشرقية نحو مهبط ومخيم البعثة المجهز." },
      { day: "اليوم 2-3", title: "تتبع موجات الهجرة الكبرى", desc: "جولات بسيارات الدفع الرباعي لمشاهدة قطعان الظباء المليونية والحيوانات المفترسة." },
      { day: "اليوم 4", title: "التواصل الثقافي مع المجتمعات المحلية", desc: "لقاءات تراثية تثقيفية مع مجتمعات المنطقة الرعوية والتعرف على تقاليدهم." },
      { day: "اليوم 5", title: "رحلة تصوير جوية والعودة لجوبا", desc: "رحلة طيران بانورامية للتصوير الجوي والوصول إلى جوبا منتصف النهار." },
    ],
  },
  {
    id: "juba-heritage",
    titleEn: "Juba Heritage, Nile Sunset & Cultural Expedition",
    titleAr: "تراث جوبا، غروب النيل والرحلة الثقافية المتكاملة",
    durationEn: "2 Days / 1 Night",
    durationAr: "يومان / ليلة واحدة",
    logisticsEn: "Executive SUV Convoy + Private Nile Catamaran",
    logisticsAr: "موكب سيارات دفع رباعي رئاسية + قارب نهري خاص",
    seasonEn: "Year-Round",
    seasonAr: "على مدار العام",
    summaryEn: "A curated cultural weekend exploring the historical landmarks of Juba, vibrant artisan markets, and private dining on the White Nile.",
    summaryAr: "عطلة نهاية أسبوع ثقافية منسقة تستكشف المعالم التاريخية لجوبا والأسواق الحرفية النابضة وعشاء فاخر على ضفاف النيل الأبيض.",
    daysEn: [
      { day: "Day 1", title: "City Landmarks & Jebel Kujur Sunset", desc: "Guided heritage tour, artisan crafts, and private sunset cruise along the Nile banks." },
      { day: "Day 2", title: "Gondokoro Historic Trading Post", desc: "Riverboat expedition to historic 19th-century trade outposts and traditional music dinner." },
    ],
    daysAr: [
      { day: "اليوم 1", title: "معالم المدينة وغروب جبل كوجور", desc: "جولة تراثية متخصصة، والأسواق الحرفية، وجولة بحرية خاصة وقت الغروب." },
      { day: "اليوم 2", title: "موقع غوندوكورو التجاري التاريخي", desc: "رحلة قارب إلى مراكز القرن التاسع عشر النهرية وأمسية موسيقية أصيلة." },
    ],
  },
];

export function ToursTravelsInteractive({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState(ITINERARIES[0].id);
  const [inquirySent, setInquirySent] = useState(false);
  const [tourTicket, setTourTicket] = useState<RfqLeadPayload | null>(null);
  const [tourForm, setTourForm] = useState({ dates: "", partySize: "1-2", name: "", email: "", phone: "" });

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = generateReferenceId("vip");
    const payload: RfqLeadPayload = {
      referenceId: ref,
      createdAt: new Date().toISOString(),
      missionType: "vip",
      urgency: "routine",
      client: {
        name: tourForm.name,
        organization: "Private Expedition",
        email: tourForm.email,
        phone: tourForm.phone,
        whatsapp: tourForm.phone,
      },
      notes: `Expedition: ${activeTab}, Dates: ${tourForm.dates}, Party Size: ${tourForm.partySize}`,
      leadScore: 65,
    };

    await dispatchLead(payload);
    setTourTicket(payload);
    setInquirySent(true);
  };

  const currentItinerary = ITINERARIES.find((it) => it.id === activeTab) || ITINERARIES[0];

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20 border-t border-navy-900/10 dark:border-white/10">
      <SectionHead
        align="left"
        kicker={isAr ? "رحلات استكشافية وسياحية فريدة" : "Bespoke Expeditions & Nile Corridor Safaris"}
        title={
          isAr ? (
            <>
              برامج الرحلات الاستكشافية <span className="text-gradient">وطيران السفاري المخصص</span>
            </>
          ) : (
            <>
              Curated Journey Itineraries & <span className="text-gradient">Custom Travel Planning</span>
            </>
          )
        }
        sub={
          isAr
            ? "نحن نجمع بين الطيران المخصص، والبوارج النهرية المجهزة، والخدمات اللوجستية الأرضية لنصحبك إلى أروع الوجهات البكر في أفريقيا بأمان تام."
            : "From Nile river safaris through the Sudd wetland to aerial views of the Boma migration — planned and escorted end-to-end by one operations team."
        }
      />

      {/* Tabs */}
      <div className="mt-10 flex flex-wrap gap-2 border-b border-navy-900/10 pb-4 dark:border-white/10">
        {ITINERARIES.map((it) => (
          <button
            key={it.id}
            onClick={() => setActiveTab(it.id)}
            className={`rounded-2xl px-5 py-3 text-xs font-bold transition sm:text-sm ${
              activeTab === it.id
                ? "bg-citico-700 text-white shadow-md dark:bg-citico-500"
                : "bg-navy-900/5 text-navy-800 hover:bg-navy-900/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {isAr ? it.titleAr : it.titleEn}
          </button>
        ))}
      </div>

      {/* Selected Itinerary Card & Day Logs */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-navy-900/60">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-citico-700/10 px-3 py-1 text-xs font-bold text-citico-700 dark:bg-citico-500/20 dark:text-citico-300">
                ⏳ {isAr ? currentItinerary.durationAr : currentItinerary.durationEn}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                🌱 {isAr ? currentItinerary.seasonAr : currentItinerary.seasonEn}
              </span>
            </div>

            <h3 className="mt-3 font-display text-xl font-bold text-navy-900 sm:text-2xl dark:text-white">
              {isAr ? currentItinerary.titleAr : currentItinerary.titleEn}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-700/80 dark:text-slate-300">
              {isAr ? currentItinerary.summaryAr : currentItinerary.summaryEn}
            </p>

            <div className="mt-4 rounded-xl bg-navy-900/5 p-3 text-xs text-navy-800 dark:bg-white/5 dark:text-slate-200">
              <strong>{isAr ? "الترتيبات اللوجستية المتضمنة:" : "Integrated Transport & Logistics:"}</strong>{" "}
              {isAr ? currentItinerary.logisticsAr : currentItinerary.logisticsEn}
            </div>

            {/* Day by Day Breakdown */}
            <div className="mt-7 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-700/60 dark:text-slate-400">
                {isAr ? "الجدول اليومي للرحلة:" : "Daily Expedition Schedule:"}
              </h4>
              {(isAr ? currentItinerary.daysAr : currentItinerary.daysEn).map((day) => (
                <div
                  key={day.day}
                  className="relative rounded-2xl border border-navy-900/5 bg-navy-900/[0.02] p-4 text-xs transition hover:bg-navy-900/[0.04] dark:border-white/5 dark:bg-white/[0.02]"
                >
                  <span className="font-bold text-citico-700 dark:text-citico-400">{day.day}</span>
                  <h5 className="mt-0.5 font-bold text-navy-900 dark:text-white">{day.title}</h5>
                  <p className="mt-1 text-navy-700/75 dark:text-slate-300">{day.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Travel Inquiry Form */}
        <div className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-lg dark:border-white/10 dark:bg-navy-900/80">
          <span className="text-xs font-bold uppercase tracking-widest text-citico-700 dark:text-citico-400">
            {isAr ? "مكتب الحجوزات والرحلات الخاصة" : "Travel Desk Inquiry"}
          </span>
          <h3 className="mt-1 font-display text-xl font-bold text-navy-900 dark:text-white">
            {isAr ? "صمم رحلتك الاستكشافية الخاصة" : "Inquire or Customize This Journey"}
          </h3>
          <p className="mt-1.5 text-xs text-navy-700/70 dark:text-slate-400">
            {isAr
              ? "سواء كنت تسافر مع وفد دبلوماسي، أو مجموعة تصوير، أو بعثة بحثية، نرتب مسارك بالكامل."
              : "Private charters, river cruisers, lodge buyouts and security escorts arranged to your dates."}
          </p>

          {inquirySent ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              <IconCheck className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              {tourTicket && (
                <span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Expedition Ref: #{tourTicket.referenceId}
                </span>
              )}
              <p className="mt-2 text-base font-bold">
                {isAr ? "تم تسجيل طلب الرحلة بنجاح" : "Expedition Inquiry Received"}
              </p>
              <p className="mt-1 text-xs">
                {isAr
                  ? "سيقوم مستشار السفر بالتواصل معك خلال 24 ساعة بمسار مفصل والتكاليف المقدرة."
                  : "Our bespoke travel manager will contact you with day-to-day logistics, aircraft configurations and quotation."}
              </p>
              {tourTicket && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2">
                  <a
                    href={`https://wa.me/211924016167?text=${formatWhatsAppMessage(tourTicket)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-500"
                  >
                    <span>💬</span>
                    <span>{isAr ? "تنسيق فوري مع مستشار السفر عبر واتساب" : "Chat with Travel Desk via WhatsApp"}</span>
                  </a>
                </div>
              )}
              <button
                onClick={() => setInquirySent(false)}
                className="mt-4 text-xs font-semibold text-slate-500 hover:text-navy-900 dark:hover:text-white"
              >
                {isAr ? "إرسال استفسار جديد" : "Send Another Inquiry"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleTourSubmit}
              className="mt-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                  {isAr ? "الرحلة المختارة *" : "Selected Expedition *"}
                </label>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                >
                  {ITINERARIES.map((it) => (
                    <option key={it.id} value={it.id}>
                      {isAr ? it.titleAr : it.titleEn}
                    </option>
                  ))}
                  <option value="custom">{isAr ? "رحلة مخصصة تماماً (حسب الطلب)" : "Custom Bespoke Itinerary"}</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "تاريخ السفر المفضل *" : "Preferred Dates / Month *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dec 2026 / Flexible"
                    value={tourForm.dates}
                    onChange={(e) => setTourForm({ ...tourForm, dates: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "عدد المسافرين *" : "Party Size *" }
                  </label>
                  <select
                    value={tourForm.partySize}
                    onChange={(e) => setTourForm({ ...tourForm, partySize: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  >
                    <option value="1-2">{isAr ? "مسافر أو زوجان (1-2)" : "Solo / Couple (1–2)"}</option>
                    <option value="3-6">{isAr ? "مجموعة صغيرة (3-6 مسافرين)" : "Small Group (3–6)"}</option>
                    <option value="7-15">{isAr ? "وفد أو بعثة (7-15 مسافراً)" : "Delegation / Crew (7–15)"}</option>
                    <option value="15+">{isAr ? "مجموعة خاصة أكبر (15+)" : "Large Expedition (15+)"}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "الاسم الكامل *" : "Your Name *"}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Full name"
                    value={tourForm.name}
                    onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="email@domain.com"
                    value={tourForm.email}
                    onChange={(e) => setTourForm({ ...tourForm, email: e.target.value })}
                    className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-navy-900 dark:text-white">
                  {isAr ? "الهاتف / الواتساب *" : "Phone / WhatsApp *"}
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+..."
                  value={tourForm.phone}
                  onChange={(e) => setTourForm({ ...tourForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-navy-900/15 bg-white px-3 py-2 text-xs outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800"
                />
              </div>

              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-citico-700 py-3 text-xs font-semibold text-white shadow-md transition hover:bg-citico-600 dark:bg-citico-500"
              >
                {isAr ? "إرسال طلب تخطيط الرحلة" : "Request Expedition Proposal"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}


/* ══════════════════════════════════════════════════════════════════════════════
   5. HELICOPTER LIFT CALCULATOR (Mi-8 Sling Load & Deep Field Assessment)
   ══════════════════════════════════════════════════════════════════════════════ */

const PAYLOAD_PRESETS = [
  { nameEn: "Fuel Bladders (2,500 L)", nameAr: "خزانات وقود مرنة (2500 لتر)", weight: 2150, type: "Liquid" },
  { nameEn: "Field Power Generator (Silent)", nameAr: "مولد كهرباء ميداني كاتم للصوت", weight: 3200, type: "Machinery" },
  { nameEn: "Telecom Tower Lattice Section", nameAr: "قطاع برج اتصالات فولاذي", weight: 1850, type: "Structural" },
  { nameEn: "Humanitarian Food Aid Sling Cargo", nameAr: "طرود إغاثة غذائية معلقة", weight: 3500, type: "Humanitarian" },
  { nameEn: "Oilfield Drill Rig Component", nameAr: "معدات حفر حقول نفطية ثقيلة", weight: 3950, type: "Industrial" },
];

export function HelicopterLiftCalculator({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [weightKg, setWeightKg] = useState<number>(2500);
  const [slingLength, setSlingLength] = useState<"15m" | "30m">("15m");

  // Mi-8 external cargo max hook load: 4,000 kg
  const maxHookCapacity = 4000;
  const loadPercentage = Math.round((weightKg / maxHookCapacity) * 100);
  const isFeasible = weightKg <= maxHookCapacity;
  const estimatedRadiusKm = Math.max(120, Math.round(450 - (weightKg / maxHookCapacity) * 220));

  return (
    <section className="section-pad mx-auto max-w-[1400px] py-16 sm:py-20 border-t border-navy-900/10 dark:border-white/10">
      <SectionHead
        align="left"
        kicker={isAr ? "حاسبة الرفع الثقيل وحبال التحميل الخارجي" : "Mi-8 Heavy-Lift & External Sling Load Tool"}
        title={
          isAr ? (
            <>
              مقدر حمولة الرفع الخارجي <span className="text-gradient">للمهام الميدانية والمواقع الوعرة</span>
            </>
          ) : (
            <>
              Sling-Load Feasibility & <span className="text-gradient">Deep-Field Lift Estimator</span>
            </>
          )
        }
        sub={
          isAr
            ? "اختبر إمكانية نقل المعدات الثقيلة وخزانات الوقود بحبال التحميل الخارجي حتى 4,000 كجم في المواقع التي لا تملك مدرجاً لهبوط الطائرات."
            : "Calculate hook limits, sling lengths, and operational radius for remote NGO, energy and construction tasks where no runway exists."
        }
      />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Controls */}
        <div className="rounded-3xl border border-navy-900/10 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-navy-900/60">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-navy-900 dark:text-white">
              {isAr ? "حدد وزن ونوع الشحنة المعلقة" : "Select Cargo Weight & Preset"}
            </h3>
            <span className="font-mono text-xs font-bold text-citico-700 dark:text-citico-300">
              Mi-8T Hook: 4,000 kg Max
            </span>
          </div>

          {/* Presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PAYLOAD_PRESETS.map((preset) => (
              <button
                key={preset.nameEn}
                onClick={() => setWeightKg(preset.weight)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                  weightKg === preset.weight
                    ? "bg-citico-700 text-white shadow-sm dark:bg-citico-500"
                    : "bg-navy-900/5 text-navy-800 hover:bg-navy-900/10 dark:bg-white/5 dark:text-slate-300"
                }`}
              >
                {isAr ? preset.nameAr : preset.nameEn} ({preset.weight} kg)
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="mt-7">
            <div className="flex justify-between text-xs font-semibold text-navy-900 dark:text-white">
              <span>{isAr ? "وزن الحمولة:" : "Configured Weight:"}</span>
              <span className="font-mono text-base font-bold text-citico-700 dark:text-citico-300">
                {weightKg.toLocaleString()} kg / {Math.round(weightKg * 2.20462).toLocaleString()} lbs
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={4200}
              step={50}
              value={weightKg}
              onChange={(e) => setWeightKg(parseInt(e.target.value, 10))}
              className="mt-3 w-full cursor-pointer accent-citico-700 dark:accent-citico-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>500 kg (Light cargo)</span>
              <span>2,000 kg</span>
              <span>4,000 kg (Max hook load)</span>
            </div>
          </div>

          {/* Sling Length choice */}
          <div className="mt-7 border-t border-navy-900/5 pt-4 dark:border-white/5">
            <label className="block text-xs font-semibold text-navy-900 dark:text-white">
              {isAr ? "طول حبل التعليق (Sling Line Length):" : "Sling Line Configuration:"}
            </label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSlingLength("15m")}
                className={`rounded-xl border p-3 text-start text-xs transition ${
                  slingLength === "15m"
                    ? "border-citico-600 bg-citico-50/50 font-bold text-citico-900 dark:border-citico-400 dark:bg-citico-950/20 dark:text-white"
                    : "border-navy-900/10 dark:border-white/10"
                }`}
              >
                <span>{isAr ? "15 متراً (قياسي)" : "15m Standard Line"}</span>
                <span className="block text-[10px] font-normal text-slate-500">
                  {isAr ? "للأراضي المفتوحة والمناطق المستوية" : "Open terrain & clear drop zones"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSlingLength("30m")}
                className={`rounded-xl border p-3 text-start text-xs transition ${
                  slingLength === "30m"
                    ? "border-citico-600 bg-citico-50/50 font-bold text-citico-900 dark:border-citico-400 dark:bg-citico-950/20 dark:text-white"
                    : "border-navy-900/10 dark:border-white/10"
                }`}
              >
                <span>{isAr ? "30 متراً (حبل طويل للغابات)" : "30m Long-Line"}</span>
                <span className="block text-[10px] font-normal text-slate-500">
                  {isAr ? "لتجاوز الأشجار الكثيفة ومعدات الحفر" : "High forest canopy & confined rigs"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculations & Results */}
        <div className="flex flex-col justify-between rounded-3xl bg-navy-950 p-7 text-white shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-citico-300">
                {isAr ? "مؤشر الجدوى الفنية للمهمة" : "Feasibility Indicator"}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isFeasible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {isFeasible ? (isAr ? "حمولة معتمدة وممكنة ✓" : "Feasible Mission ✓") : (isAr ? "تتجاوز خطاف الرفع ✗" : "Exceeds Hook Limit ✗")}
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">{isAr ? "نسبة استغلال قدرة الخطاف:" : "Hook Load Capacity:"}</span>
                <span className="text-xl font-bold">{loadPercentage}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    loadPercentage > 100
                      ? "bg-red-500"
                      : loadPercentage > 85
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, loadPercentage)}%` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-3 divide-y divide-white/10 text-xs">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">{isAr ? "نصف قطر العمليات التقديري:" : "Est. Mission Radius:"}</span>
                <span className="font-mono font-bold text-citico-200">~{estimatedRadiusKm} km</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-slate-400">{isAr ? "الحد الأدنى لمساحة الهبوط (LZ):" : "Min. Landing Zone (LZ):"}</span>
                <span className="font-mono font-bold">35m × 35m cleared</span>
              </div>
              <div className="flex justify-between pt-3">
                <span className="text-slate-400">{isAr ? "المعدات المطلوبة:" : "Rigging Hardware:"}</span>
                <span className="font-mono font-bold">{slingLength} Swivel + Cargo Net</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4">
            <a
              href={isAr ? "/ar/rfq?mission=medevac&aircraft=mi-8-helicopter" : "/rfq?mission=medevac&aircraft=mi-8-helicopter"}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-citico-600 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-citico-500"
            >
              <IconRotor className="h-4 w-4" />
              <span>{isAr ? "طلب تقييم موقع الهبوط والرفع الميداني" : "Request Sling-Load Mission Assessment"}</span>
            </a>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              {isAr
                ? "مهندسو العمليات يتحققون من كثافة الارتفاع ودرجة الحرارة وظروف الرياح قبل الإقلاع."
                : "Includes density altitude, payload CG and field fuel caching planning."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
