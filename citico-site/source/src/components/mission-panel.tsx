"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDict, useLocalizedHref } from "@/components/locale-provider";
import { IconJet, IconBox, IconShield, IconPhone } from "@/components/icons";

const tabIcons: Record<string, React.ReactNode> = {
  charter: <IconJet className="h-4 w-4" />,
  logistics: <IconBox className="h-4 w-4" />,
  aircraft: <IconShield className="h-4 w-4" />,
  contact: <IconPhone className="h-4 w-4" />,
};

export function MissionRequestPanel() {
  const { missionTabs, sections } = useDict();
  const lhref = useLocalizedHref();
  const [active, setActive] = useState("charter");

  // State for all panel inputs to feed real RFQ flow
  const [charterTo, setCharterTo] = useState("");
  const [charterMission, setCharterMission] = useState(sections.panelMissionOptions[0] || "Passenger");
  const [logisticsOrigin, setLogisticsOrigin] = useState("");
  const [logisticsDestination, setLogisticsDestination] = useState("");
  const [logisticsCargo, setLogisticsCargo] = useState(sections.panelCargoOptions[0] || "Humanitarian Aid");
  const [aircraftService, setAircraftService] = useState(sections.panelServiceOptions[0] || "Charter Operation");
  const [aircraftType, setAircraftType] = useState("Antonov AN-26");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  return (
    <section className="relative z-10 -mt-16 sm:-mt-20">
      <div className="section-pad mx-auto max-w-[1100px]">
        <div className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-[0_20px_60px_-16px_rgba(0,10,31,0.18)] dark:border-white/10 dark:bg-navy-800/90 dark:shadow-[0_20px_60px_-16px_rgba(0,0,0,0.5)]">
          {/* Tab bar */}
          <div className="flex border-b border-navy-900/8 dark:border-white/10">
            {missionTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-4 text-[13px] font-semibold transition-colors ${
                  active === tab.key
                    ? "text-citico-600 dark:text-citico-400"
                    : "text-navy-700/60 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {tabIcons[tab.key]}
                <span className="hidden sm:inline">{tab.label}</span>
                {active === tab.key && (
                  <motion.div
                    layoutId="mission-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-citico-600 dark:bg-citico-400"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {active === "charter" && (
                  <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelFrom}</label>
                      <div className="rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] font-medium text-navy-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
                        {sections.panelOriginValue}
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelTo}</label>
                      <input
                        type="text"
                        value={charterTo}
                        onChange={(e) => setCharterTo(e.target.value)}
                        placeholder={sections.panelCityPlaceholder}
                        className="w-full rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelMission}</label>
                      <select
                        value={charterMission}
                        onChange={(e) => setCharterMission(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        {sections.panelMissionOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <Link
                      href={`${lhref("/rfq")}?mission=cargo&from=Juba&to=${encodeURIComponent(charterTo || "Malakal")}&details=${encodeURIComponent(charterMission)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-citico-600 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-citico-500 hover:-translate-y-0.5 sm:col-span-3 sm:w-fit"
                    >
                      {sections.panelRequestQuote}
                    </Link>
                  </div>
                )}

                {active === "logistics" && (
                  <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelOrigin}</label>
                      <input
                        type="text"
                        value={logisticsOrigin}
                        onChange={(e) => setLogisticsOrigin(e.target.value)}
                        placeholder={sections.panelCityPlaceholder}
                        className="w-full rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelDestination}</label>
                      <input
                        type="text"
                        value={logisticsDestination}
                        onChange={(e) => setLogisticsDestination(e.target.value)}
                        placeholder={sections.panelCityPlaceholder}
                        className="w-full rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelCargoType}</label>
                      <select
                        value={logisticsCargo}
                        onChange={(e) => setLogisticsCargo(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        {sections.panelCargoOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <Link
                      href={`${lhref("/rfq")}?mission=cargo&from=${encodeURIComponent(logisticsOrigin || "Juba")}&to=${encodeURIComponent(logisticsDestination || "Wau")}&cargo=${encodeURIComponent(logisticsCargo)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-citico-600 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-citico-500 hover:-translate-y-0.5 sm:col-span-3 sm:w-fit"
                    >
                      {sections.panelRequestLogistics}
                    </Link>
                  </div>
                )}

                {active === "aircraft" && (
                  <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelService}</label>
                      <select
                        value={aircraftService}
                        onChange={(e) => setAircraftService(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        {sections.panelServiceOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold uppercase tracking-[0.18em] text-navy-700/50 dark:text-slate-500">{sections.panelAircraft}</label>
                      <select
                        value={aircraftType}
                        onChange={(e) => setAircraftType(e.target.value)}
                        className="w-full appearance-none rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="Antonov AN-26">Antonov AN-26</option>
                        <option value="Antonov AN-74">Antonov AN-74</option>
                        <option value="Fokker F27">Fokker F27</option>
                        <option value="Mi-8 Helicopter">Mi-8 Helicopter</option>
                        <option value="Boeing 737-300F">Boeing 737-300F</option>
                      </select>
                    </div>
                    <Link
                      href={`${lhref("/rfq")}?aircraft=${encodeURIComponent(aircraftType)}&details=${encodeURIComponent(aircraftService)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-citico-600 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-citico-500 hover:-translate-y-0.5 sm:col-span-2 sm:w-fit"
                    >
                      {sections.panelEnquire}
                    </Link>
                  </div>
                )}

                {active === "contact" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={sections.panelNamePlaceholder}
                      className="rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={sections.panelEmailPlaceholder}
                      className="rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                    />
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={sections.panelMessagePlaceholder}
                      rows={3}
                      className="sm:col-span-2 rounded-lg border border-navy-900/10 bg-navy-950/[0.03] px-4 py-3 text-[14px] text-navy-900 placeholder:text-navy-700/40 focus:border-citico-500/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 resize-none"
                    />
                    <Link
                      href={`${lhref("/rfq")}?name=${encodeURIComponent(contactName)}&email=${encodeURIComponent(contactEmail)}&notes=${encodeURIComponent(contactMessage)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-citico-600 px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-citico-500 hover:-translate-y-0.5 sm:col-span-2 sm:w-fit"
                    >
                      {sections.panelSendMessage}
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
