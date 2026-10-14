"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  MissionType,
  AircraftType,
  UrgencyLevel,
  RfqLeadPayload,
  generateReferenceId,
  calculateLeadScore,
  dispatchLead,
  formatWhatsAppMessage,
  formatMailtoUrl,
} from "@/lib/leads";
import {
  IconJet,
  IconCheck,
  IconArrow,
  IconClock,
} from "@/components/icons";

interface AviationRfqProps {
  locale?: "en" | "ar";
  initialMission?: MissionType;
  initialOrigin?: string;
  initialDestination?: string;
}

const AIRSTRIPS = [
  { code: "JUB", name: "Juba International", state: "Central Equatoria", runway: "3,100m Asphalt" },
  { code: "MAK", name: "Malakal Airport", state: "Upper Nile", runway: "2,000m Asphalt" },
  { code: "BNT", name: "Bentiu Airstrip", state: "Unity State", runway: "1,300m Unpaved / Marram" },
  { code: "WUU", name: "Wau Airport", state: "Western Bahr el Ghazal", runway: "2,175m Asphalt" },
  { code: "RBX", name: "Rumbek Airstrip", state: "Lakes State", runway: "1,400m Unpaved" },
  { code: "BOR", name: "Bor Airstrip", state: "Jonglei State", runway: "1,200m Unpaved" },
  { code: "PBO", name: "Pibor Airstrip", state: "Greater Pibor", runway: "1,000m Compact Soil" },
  { code: "KPT", name: "Kapoeta Airstrip", state: "Eastern Equatoria", runway: "1,100m Gravel" },
  { code: "EBB", name: "Entebbe International (Uganda)", state: "Regional", runway: "3,650m Asphalt" },
  { code: "NBO", name: "Nairobi JKIA / Wilson (Kenya)", state: "Regional", runway: "4,117m Asphalt" },
];

const FLEET_OPTIONS: { id: AircraftType; name: string; tag: string; capacity: string; reg: string }[] = [
  { id: "antonov-an-26", name: "Antonov AN-26", tag: "STOL Cargo Workhorse", capacity: "5,500 kg / 40 pax", reg: "EY-261" },
  { id: "antonov-an-74", name: "Antonov AN-74", tag: "High-Wing Heavy Jet", capacity: "10,000 kg / 52 pax", reg: "EK-740" },
  { id: "fokker-f27", name: "Fokker F27-500", tag: "Regional Combi Turboprop", capacity: "5,500 kg / 50 pax", reg: "5Y-F27" },
  { id: "mi-8-helicopter", name: "Mil Mi-8T", tag: "Deep-Field Utility Rotary", capacity: "3,000 kg sling / 24 pax", reg: "ST-M81/M82" },
  { id: "boeing-737-300f", name: "Boeing 737-300F", tag: "Regional Container Freighter", capacity: "18,000 kg", reg: "5Y-B73" },
  { id: "any", name: "Best Available Match", tag: "Ops Desk Recommendation", capacity: "Mission Optimized", reg: "Fleet Wide" },
];

function AviationRfqForm({
  locale = "en",
  initialMission = "cargo",
  initialOrigin = "Juba (JUB)",
  initialDestination = "",
}: AviationRfqProps) {
  const isAr = locale === "ar";
  const searchParams = useSearchParams();

  // Read URL query params if present for deep linking from Hero / Route pages
  const paramMission = (searchParams?.get("mission") as MissionType) || initialMission;
  const paramFrom = searchParams?.get("from") || initialOrigin;
  const paramTo = searchParams?.get("to") || initialDestination;
  const paramAircraft = searchParams?.get("aircraft") || "any";

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [lastPayload, setLastPayload] = useState<RfqLeadPayload | null>(null);

  // Form State
  const [missionType, setMissionType] = useState<MissionType>(paramMission);
  const [aircraft, setAircraft] = useState<string>(paramAircraft);
  const [origin, setOrigin] = useState(paramFrom);
  const [destination, setDestination] = useState(paramTo);
  const [alternate, setAlternate] = useState("");
  const [isInternational, setIsInternational] = useState(false);

  // Payload
  const [payloadWeightKg, setPayloadWeightKg] = useState<number | "">("");
  const [passengerCount, setPassengerCount] = useState<number | "">("");
  const [cargoDetails, setCargoDetails] = useState("");
  const [isHazardous, setIsHazardous] = useState(false);
  const [isColdChain, setIsColdChain] = useState(false);

  // Operations
  const [flightDate, setFlightDate] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("routine");
  const [needsGroundHandling, setNeedsGroundHandling] = useState(true);
  const [needsFuel, setNeedsFuel] = useState(false);

  // Client Details
  const [clientName, setClientName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (searchParams?.get("to")) setDestination(searchParams.get("to") || "");
    if (searchParams?.get("from")) setOrigin(searchParams.get("from") || "");
    if (searchParams?.get("mission")) setMissionType(searchParams.get("mission") as MissionType);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const ref = generateReferenceId(missionType);
    setReferenceId(ref);

    const payload: RfqLeadPayload = {
      referenceId: ref,
      createdAt: new Date().toISOString(),
      missionType,
      aircraft,
      origin,
      destination,
      alternate,
      isInternational,
      flightDate,
      urgency,
      payloadWeightKg: typeof payloadWeightKg === "number" ? payloadWeightKg : undefined,
      passengerCount: typeof passengerCount === "number" ? passengerCount : undefined,
      cargoDetails,
      isHazardous,
      isColdChain,
      needsGroundHandling,
      needsFuel,
      client: {
        name: clientName,
        organization,
        email,
        phone,
        whatsapp: whatsapp || phone,
      },
      notes,
      leadScore: 0,
    };

    payload.leadScore = calculateLeadScore(payload);
    setLastPayload(payload);

    await dispatchLead(payload);
    setSubmitting(false);
    setSubmissionComplete(true);
  };

  if (submissionComplete && lastPayload) {
    const waUrl = `https://wa.me/211924016167?text=${formatWhatsAppMessage(lastPayload)}`;
    const mailtoUrl = formatMailtoUrl(lastPayload);

    return (
      <div className="rounded-3xl border border-navy-900/10 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-navy-900 sm:p-12">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconCheck className="h-9 w-9" />
          </div>

          <span className="mt-6 inline-block rounded-full bg-citico-500/10 px-4 py-1 font-mono text-xs font-bold text-citico-600 dark:text-citico-400">
            RFQ #{referenceId}
          </span>

          <h3 className="mt-3 font-display text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
            {isAr ? "تم تسجيل طلب الرحلة بنجاح" : "Flight RFQ Received & Logged"}
          </h3>

          <p className="mt-3 text-sm leading-relaxed text-navy-700/75 dark:text-slate-300">
            {isAr
              ? `تم تسجيل طلبكم تحت الرمز المرجعي (${referenceId}). نسخة كاملة محفوظة وجاهزة للمطابقة الفورية مع أسطول سيتيكو.`
              : `Your flight request has been queued with reference ID (${referenceId}). Operations officers at Juba Hub have been notified.`}
          </p>

          <div className="mt-6 rounded-2xl border border-navy-900/8 bg-navy-50/60 p-5 text-start text-xs dark:border-white/10 dark:bg-white/5">
            <div className="grid grid-cols-2 gap-2 text-navy-800 dark:text-slate-200">
              <div><span className="text-slate-500">Mission:</span> {missionType.toUpperCase()}</div>
              <div><span className="text-slate-500">Urgency:</span> {urgency.toUpperCase()}</div>
              <div><span className="text-slate-500">Route:</span> {origin} ➔ {destination}</div>
              <div><span className="text-slate-500">Aircraft:</span> {aircraft}</div>
              <div><span className="text-slate-500">Client:</span> {clientName} ({organization || "Private"})</div>
              <div><span className="text-slate-500">Status:</span> 🟢 Queued & Traceable</div>
            </div>
          </div>

          {/* Instant Direct Channel Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-500"
            >
              <span>💬</span>
              {isAr ? "إشعار العمليات مباشرة عبر واتساب" : "Escalate to Ops via WhatsApp"}
            </a>

            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-900/15 bg-white px-6 py-3.5 text-sm font-bold text-navy-900 transition hover:bg-navy-50 dark:border-white/15 dark:bg-navy-800 dark:text-white"
            >
              <span>✉️</span>
              {isAr ? "فتح نسخة البريد الإلكتروني" : "Open Email Client Copy"}
            </a>
          </div>

          <div className="mt-6 border-t border-navy-900/10 pt-4 text-xs text-slate-500 dark:border-white/10">
            {isAr
              ? "للحالات الطارئة جداً أو عمليات الإخلاء الطبي: اتصل فوراً بغرفة العمليات 24/7 على: "
              : "For immediate time-critical operations or Medevac coordination, call the 24/7 desk directly: "}
            <a href="tel:+211924016167" className="font-bold text-citico-600 hover:underline dark:text-citico-400">
              +211 924 016 167
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-navy-900/10 bg-white shadow-2xl dark:border-white/10 dark:bg-navy-900">
      {/* Header bar */}
      <div className="border-b border-navy-900/10 bg-navy-950 p-6 text-white dark:border-white/10 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-citico-300">
              <IconJet className="h-4 w-4" />
              <span>{isAr ? "نظام طلب عروض الأسعار الجوية (Aviation RFQ)" : "Institutional Aviation RFQ System"}</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">
              {isAr ? "مواصفات حجز وتأجير الطائرات" : "Flight Charter & Mission Specification"}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 text-xs">
            <IconClock className="h-4 w-4 text-citico-300" />
            <span>24/7 Ops Desk · SSCAA / ICAO Compliant</span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-semibold">
          {[
            { n: 1, label: isAr ? "نوع المهمة" : "Mission" },
            { n: 2, label: isAr ? "الطائرة والمسار" : "Route & Fleet" },
            { n: 3, label: isAr ? "الحمولة والعمليات" : "Payload" },
            { n: 4, label: isAr ? "معلومات الجهة" : "Contact & Org" },
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => s.n < step && setStep(s.n)}
              className={`flex items-center gap-2 transition ${
                step === s.n
                  ? "text-citico-300"
                  : step > s.n
                  ? "cursor-pointer text-white"
                  : "text-white/40"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  step === s.n
                    ? "bg-citico-500 text-navy-950"
                    : step > s.n
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/40"
                }`}
              >
                {step > s.n ? "✓" : s.n}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        {/* STEP 1: Mission Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-navy-900 dark:text-white">
                {isAr ? "حدد طبيعة المهمة الجوية المطلوبة *" : "Select Mission Profile *"}
              </label>
              <p className="mt-1 text-xs text-navy-700/60 dark:text-slate-400">
                {isAr
                  ? "يتم توجيه كل مهمة إلى فريق العمليات المتخصص (شحن ثقيل، إغاثة إنسانية، أو إخلاء طبي)"
                  : "Each profile unlocks custom loading, clearance and turnaround protocols."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { id: "cargo", title: "Air Cargo & Freight", sub: "Bulk, pallets, remote strip airdrop", icon: "📦" },
                { id: "humanitarian", title: "Humanitarian / UN / NGO", sub: "Emergency aid, field rotation, WFP/MSF standards", icon: "🤝" },
                { id: "medevac", title: "Medical Evacuation", sub: "Stretcher, ICU equipment, unsurveyed strip", icon: "🚑" },
                { id: "passenger", title: "Passenger & Group Charter", sub: "Field workforce, delegation, 10–50 pax", icon: "👥" },
                { id: "vip", title: "Executive / Diplomatic", sub: "Government, corporate VIP, priority slots", icon: "✈️" },
                { id: "parts", title: "AOG Parts & Maintenance", sub: "Urgent component airfreight & technician flight", icon: "⚙️" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMissionType(m.id as MissionType)}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-start transition ${
                    missionType === m.id
                      ? "border-citico-500 bg-citico-500/5 ring-2 ring-citico-500/20 dark:bg-citico-500/10"
                      : "border-navy-900/10 bg-white hover:border-navy-900/20 dark:border-white/10 dark:bg-navy-800"
                  }`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="mt-2 text-sm font-bold text-navy-900 dark:text-white">{m.title}</span>
                  <span className="mt-1 text-xs text-navy-700/60 dark:text-slate-400">{m.sub}</span>
                </button>
              ))}
            </div>

            {/* Urgency Selector */}
            <div className="rounded-2xl border border-navy-900/10 bg-navy-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 dark:text-white">
                {isAr ? "مستوى الأولوية والاستعجال *" : "Operational Urgency Window *"}
              </label>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { id: "routine", label: "Scheduled / Routine (3+ Days)", desc: "Standard planning" },
                  { id: "critical-24h", label: "Time-Critical (< 24 Hours)", desc: "Immediate aircraft slot" },
                  { id: "emergency-aog", label: "Emergency / Medevac / AOG", desc: "Instant scramble" },
                ].map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setUrgency(u.id as UrgencyLevel)}
                    className={`rounded-xl border px-3 py-2.5 text-start transition ${
                      urgency === u.id
                        ? "border-citico-500 bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-white"
                        : "border-transparent text-slate-600 hover:bg-white/60 dark:text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">{u.label}</div>
                    <div className="text-[11px] opacity-75">{u.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 rounded-xl bg-citico-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-citico-500"
              >
                <span>{isAr ? "متابعة: المسار والأسطول" : "Next: Route & Aircraft"}</span>
                <IconArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Route & Aircraft */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "مدرج / مطار الإقلاع *" : "Departure Airstrip / Airport *"}
                </label>
                <input
                  required
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Juba (JUB), Entebbe (EBB), Lokichogio"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "مدرج / مطار الوصول *" : "Arrival Airstrip / Destination *"}
                </label>
                <input
                  required
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Malakal (MAK), Bentiu, Wau, Pibor, Bor"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>
            </div>

            {/* Quick airstrip chips */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500">Popular Corridors:</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {AIRSTRIPS.slice(0, 6).map((a) => (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => setDestination(`${a.name} (${a.code})`)}
                    className="rounded-lg border border-navy-900/8 bg-navy-50/50 px-2.5 py-1 text-xs text-navy-800 transition hover:bg-citico-50 hover:text-citico-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  >
                    {a.name} ({a.code})
                  </button>
                ))}
              </div>
            </div>

            {/* Aircraft Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                {isAr ? "اختر الطراز المفضل من الأسطول *" : "Preferred Aircraft Requirement *"}
              </label>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {FLEET_OPTIONS.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setAircraft(`${f.name} (${f.reg})`)}
                    className={`flex flex-col items-start rounded-xl border p-3.5 text-start transition ${
                      aircraft.includes(f.name)
                        ? "border-citico-500 bg-citico-500/10 ring-1 ring-citico-500"
                        : "border-navy-900/10 bg-white hover:border-navy-900/20 dark:border-white/10 dark:bg-navy-800"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-navy-900 dark:text-white">{f.name}</span>
                      <span className="font-mono text-[10px] text-citico-600 dark:text-citico-400">{f.reg}</span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-500">{f.tag}</span>
                    <span className="mt-1.5 text-[11px] font-semibold text-navy-700 dark:text-slate-300">
                      Cap: {f.capacity}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-navy-900/15 px-5 py-2.5 text-xs font-bold text-navy-800 dark:border-white/15 dark:text-slate-200"
              >
                {isAr ? "السابق" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-xl bg-citico-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-citico-500"
              >
                <span>{isAr ? "متابعة: تفاصيل الحمولة" : "Next: Payload & Cargo"}</span>
                <IconArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payload & Operations */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "الوزن التقديري (كجم)" : "Estimated Payload (kg)"}
                </label>
                <input
                  type="number"
                  value={payloadWeightKg}
                  onChange={(e) => setPayloadWeightKg(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 4500"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "عدد الركاب" : "Passenger Count"}
                </label>
                <input
                  type="number"
                  value={passengerCount}
                  onChange={(e) => setPassengerCount(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 18"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "تاريخ الرحلة المطلوب" : "Target Flight Date"}
                </label>
                <input
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>
            </div>

            {/* Special Cargo Toggles */}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-900/10 bg-navy-50/40 p-3.5 dark:border-white/10 dark:bg-white/5">
                <input
                  type="checkbox"
                  checked={isHazardous}
                  onChange={(e) => setIsHazardous(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-citico-600 focus:ring-citico-500"
                />
                <div>
                  <span className="block text-xs font-bold text-navy-900 dark:text-white">
                    Dangerous Goods / HAZMAT
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Includes lithium batteries, fuel drums, or medical bio-hazards.
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-900/10 bg-navy-50/40 p-3.5 dark:border-white/10 dark:bg-white/5">
                <input
                  type="checkbox"
                  checked={isColdChain}
                  onChange={(e) => setIsColdChain(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-citico-600 focus:ring-citico-500"
                />
                <div>
                  <span className="block text-xs font-bold text-navy-900 dark:text-white">
                    Cold-Chain / Temperature Sensitive
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Vaccines, pharmaceuticals, temperature monitored storage.
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                {isAr ? "طبيعة الشحنة أو تفاصيل المهمة" : "Cargo Description / Dimensions / Mission Brief"}
              </label>
              <textarea
                rows={3}
                value={cargoDetails}
                onChange={(e) => setCargoDetails(e.target.value)}
                placeholder="Describe pallet count, dimensions, special offloading crane required at remote field strip..."
                className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="rounded-xl border border-navy-900/15 px-5 py-2.5 text-xs font-bold text-navy-800 dark:border-white/15 dark:text-slate-200"
              >
                {isAr ? "السابق" : "Back"}
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-2 rounded-xl bg-citico-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-citico-500"
              >
                <span>{isAr ? "متابعة: جهة الاتصال والاعتماد" : "Next: Client Details"}</span>
                <IconArrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Client & Submission */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "الاسم الكامل *" : "Contact Name *"}
                </label>
                <input
                  required
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Captain James / Logistics Lead"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "المؤسسة / الوكالة / الشركة *" : "Organization / Agency / Company *"}
                </label>
                <input
                  required
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. WFP, MSF, Ministry, Commercial Contractor"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "البريد الإلكتروني الرسمي *" : "Official Email Address *"}
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.org"
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                  {isAr ? "رقم الهاتف المباشر *" : "Direct Phone / Satellite *" }
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+211 ... / +254 ..."
                  className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-700/70 dark:text-slate-300">
                {isAr ? "رقم الواتساب للتنسيق الفوري (اختياري)" : "WhatsApp Number for Instant Field Dispatch"}
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Include country code (e.g. +211 924 016 167)"
                className="w-full rounded-xl border border-navy-900/12 bg-white px-4 py-3 text-sm text-navy-900 outline-none focus:border-citico-500 dark:border-white/15 dark:bg-navy-800 dark:text-white"
              />
            </div>

            {/* Review Summary Box */}
            <div className="rounded-2xl border border-citico-500/20 bg-citico-50/50 p-4 text-xs dark:bg-citico-950/20">
              <div className="font-bold text-citico-900 dark:text-citico-200">
                Pre-Flight Mission Summary:
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-navy-700 dark:text-slate-300">
                <div>Route: <span className="font-semibold">{origin} ➔ {destination}</span></div>
                <div>Fleet: <span className="font-semibold">{aircraft}</span></div>
                <div>Urgency: <span className="font-semibold">{urgency}</span></div>
                <div>Payload: <span className="font-semibold">{payloadWeightKg ? `${payloadWeightKg} kg` : "TBD"}</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl border border-navy-900/15 px-5 py-2.5 text-xs font-bold text-navy-800 dark:border-white/15 dark:text-slate-200"
              >
                {isAr ? "السابق" : "Back"}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-citico-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-citico-500 disabled:opacity-50"
              >
                {submitting ? (
                  <span>{isAr ? "جاري الإرسال والتأمين..." : "Transmitting RFQ..."}</span>
                ) : (
                  <>
                    <span>{isAr ? "إرسال طلب التسعير الرسمي" : "Submit Aviation RFQ"}</span>
                    <IconCheck className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export function AviationRfq(props: AviationRfqProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-4xl animate-pulse rounded-3xl border border-navy-900/10 bg-white/50 p-8 shadow-xl backdrop-blur dark:border-white/10 dark:bg-navy-900/40">
          <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-4 h-4 w-96 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="mt-8 h-40 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        </div>
      }
    >
      <AviationRfqForm {...props} />
    </Suspense>
  );
}

