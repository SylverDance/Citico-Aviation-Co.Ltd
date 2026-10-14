"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDict } from "@/components/locale-provider";

/* ──── Projection helpers ──────────────────────────────────────────────── */
// Mercator-lite: maps lat/lon to SVG [0,100]×[0,100]
// Bounding box: lon 28–42 E, lat 0–14 N (covers Juba + all connections)
const LON_MIN = 28, LON_MAX = 42, LAT_MIN = -1, LAT_MAX = 15;

function project(lat: number, lon: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return [x, y];
}

/* ──── Static airport data with coordinates ───────────────────────────── */
const HUB = { code: "JUB", city: "Juba", lat: 4.87, lon: 31.60 };

const REGIONAL = [
  { code: "EBB", city: "Entebbe",      country: "Uganda",   lat: 0.04,  lon: 32.44 },
  { code: "NBO", city: "Nairobi",      country: "Kenya",    lat: -1.32, lon: 36.93 },
  { code: "ADD", city: "Addis Ababa",  country: "Ethiopia", lat: 8.98,  lon: 38.80 },
  { code: "KRT", city: "Khartoum",     country: "Sudan",    lat: 15.60, lon: 32.55 },
  { code: "MBA", city: "Mombasa",      country: "Kenya",    lat: -4.03, lon: 39.59 },
  { code: "DAR", city: "Dar es Salaam", country: "Tanzania", lat: -6.87, lon: 39.20 },
];

// Key domestic destinations with approximate coordinates
const DOMESTIC = [
  { code: "MAK", city: "Malakal",  lat: 9.56,  lon: 31.65 },
  { code: "BNT", city: "Bentiu",   lat: 9.25,  lon: 29.83 },
  { code: "RBX", city: "Rumbek",   lat: 6.82,  lon: 29.67 },
  { code: "WUU", city: "Wau",      lat: 7.70,  lon: 28.00 },
  { code: "PBO", city: "Pibor",    lat: 6.79,  lon: 33.12 },
  { code: "KPT", city: "Kapoeta",  lat: 4.77,  lon: 33.58 },
];

type Airport = typeof REGIONAL[0] & { isDomestic?: boolean };

/* ──── Animated flight-path dash ──────────────────────────────────────── */
function FlightPath({
  x1, y1, x2, y2,
  active,
  delay = 0,
  domestic = false,
}: {
  x1: number; y1: number; x2: number; y2: number;
  active: boolean; delay?: number; domestic?: boolean;
}) {
  // Curved path using a control point offset perpendicular to the line
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - (domestic ? 2 : 5);
  const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;

  return (
    <g>
      {/* Base path */}
      <path
        d={d}
        fill="none"
        stroke={active ? (domestic ? "#7CC4FF" : "#0078FF") : "rgba(255,255,255,0.12)"}
        strokeWidth={active ? (domestic ? "0.25" : "0.4") : "0.25"}
        strokeDasharray={domestic ? "0.8 0.8" : "1.2 0.8"}
        style={{ transition: "stroke 0.4s, stroke-width 0.4s" }}
      />
      {/* Animated pulse dot */}
      {active && (
        <circle r={domestic ? "0.5" : "0.7"} fill="#7CC4FF" opacity={0.9}>
          <animateMotion
            dur={domestic ? "2s" : "3s"}
            begin={`${delay}s`}
            repeatCount="indefinite"
          >
            <mpath href={`#path-${x2.toFixed(0)}-${y2.toFixed(0)}`} />
          </animateMotion>
        </circle>
      )}
      {/* Named path for animateMotion */}
      <path
        id={`path-${x2.toFixed(0)}-${y2.toFixed(0)}`}
        d={d}
        fill="none"
        stroke="none"
      />
    </g>
  );
}

/* ──── Main component ─────────────────────────────────────────────────── */
export function RouteMap({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const { sections } = useDict();
  const [activeAirport, setActiveAirport] = useState<Airport | null>(null);
  const [allActive, setAllActive] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  // Start animation when component mounts
  useEffect(() => {
    const t = setTimeout(() => setAllActive(true), 400);
    return () => clearTimeout(t);
  }, []);

  const [hubX, hubY] = project(HUB.lat, HUB.lon);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#04122a] shadow-[0_28px_80px_-24px_rgba(0,20,60,0.6)]">
      {/* Header */}
      {!hideHeader && (
        <div className="relative z-10 px-6 pt-6 pb-2 sm:px-8">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.26em] text-[#7CC4FF]">
            {sections.networkKicker}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">
            {sections.networkTitle.lead}{" "}
            <span className="bg-gradient-to-r from-[#7CC4FF] to-[#3D9BFF] bg-clip-text text-transparent">
              {sections.networkTitle.accent}
            </span>
          </h2>
          <p className="mt-1 text-[13px] text-white/60">{sections.networkSub}</p>
        </div>
      )}

      {/* SVG Map */}
      <div className="relative px-2 pb-4 pt-2">
        <svg
          ref={ref}
          viewBox="0 0 100 100"
          className="w-full select-none"
          style={{ maxHeight: "520px" }}
          aria-label="CITICO Aviation route network map"
        >
          {/* Background gradient */}
          <defs>
            <radialGradient id="bg-grad" cx="40%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#0a2248" />
              <stop offset="100%" stopColor="#04122a" />
            </radialGradient>
            <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0078FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0078FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#bg-grad)" />

          {/* Subtle grid lines */}
          {[20, 40, 60, 80].map((v) => (
            <g key={v}>
              <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            </g>
          ))}

          {/* Regional flight paths */}
          {REGIONAL.map((ap, i) => {
            const [ax, ay] = project(ap.lat, ap.lon);
            return (
              <FlightPath
                key={ap.code}
                x1={hubX} y1={hubY}
                x2={ax} y2={ay}
                active={allActive}
                delay={i * 0.4}
              />
            );
          })}

          {/* Domestic flight paths */}
          {DOMESTIC.map((ap, i) => {
            const [ax, ay] = project(ap.lat, ap.lon);
            return (
              <FlightPath
                key={ap.code}
                x1={hubX} y1={hubY}
                x2={ax} y2={ay}
                active={allActive}
                delay={i * 0.25 + 0.2}
                domestic
              />
            );
          })}

          {/* Hub glow */}
          <circle cx={hubX} cy={hubY} r="8" fill="url(#hub-glow)" />

          {/* Hub dot */}
          <circle cx={hubX} cy={hubY} r="2.8" fill="#0078FF" />
          <circle cx={hubX} cy={hubY} r="1.4" fill="white" />
          {/* Hub pulse ring */}
          <circle cx={hubX} cy={hubY} r="4" fill="none" stroke="#0078FF" strokeWidth="0.5" opacity="0.6">
            <animate attributeName="r" values="2.8;6;2.8" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Hub label */}
          <text x={hubX + 1.5} y={hubY - 3.5} fontSize="2.4" fontWeight="700" fill="white" fontFamily="system-ui">
            {HUB.code}
          </text>
          <text x={hubX + 1.5} y={hubY - 1.2} fontSize="1.6" fill="rgba(255,255,255,0.6)" fontFamily="system-ui">
            {sections.networkHubLabel}
          </text>

          {/* Regional airports */}
          {REGIONAL.map((ap) => {
            const [ax, ay] = project(ap.lat, ap.lon);
            const isRight = ax > 50;
            return (
              <g
                key={ap.code}
                className="cursor-pointer"
                onClick={() => setActiveAirport(activeAirport?.code === ap.code ? null : (ap as Airport))}
                aria-label={`${ap.city}, ${ap.country}`}
              >
                <circle cx={ax} cy={ay} r="1.8" fill={activeAirport?.code === ap.code ? "#0078FF" : "#1a4a8a"} stroke="#7CC4FF" strokeWidth="0.4" />
                <circle cx={ax} cy={ay} r="0.8" fill="#7CC4FF" />
                <text
                  x={isRight ? ax + 2.2 : ax - 2.2}
                  y={ay + 0.5}
                  fontSize="2"
                  fontWeight="700"
                  fill="white"
                  textAnchor={isRight ? "start" : "end"}
                  fontFamily="system-ui"
                >
                  {ap.code}
                </text>
                <text
                  x={isRight ? ax + 2.2 : ax - 2.2}
                  y={ay + 2.2}
                  fontSize="1.5"
                  fill="rgba(255,255,255,0.5)"
                  textAnchor={isRight ? "start" : "end"}
                  fontFamily="system-ui"
                >
                  {ap.city}
                </text>
              </g>
            );
          })}

          {/* Domestic airports */}
          {DOMESTIC.map((ap) => {
            const [ax, ay] = project(ap.lat, ap.lon);
            return (
              <g key={ap.code}>
                <circle cx={ax} cy={ay} r="1.1" fill="#0a3060" stroke="rgba(124,196,255,0.5)" strokeWidth="0.3" />
                <circle cx={ax} cy={ay} r="0.45" fill="rgba(124,196,255,0.7)" />
                <text
                  x={ax + 1.5}
                  y={ay + 0.5}
                  fontSize="1.4"
                  fill="rgba(255,255,255,0.55)"
                  fontFamily="system-ui"
                >
                  {ap.city}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip on airport click */}
        <AnimatePresence>
          {activeAirport && (
            <motion.div
              key={activeAirport.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl border border-[#0078FF]/30 bg-[#061a3a]/90 px-5 py-3.5 text-center backdrop-blur-sm"
            >
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#7CC4FF]">
                {activeAirport.code}
              </p>
              <p className="mt-0.5 text-[15px] font-bold text-white">{activeAirport.city}</p>
              {activeAirport.country && (
                <p className="mt-0.5 text-[12px] text-white/50">{activeAirport.country}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 border-t border-white/8 px-6 py-4 sm:px-8">
        <span className="flex items-center gap-2 text-[12px] text-white/55">
          <svg width="22" height="6" viewBox="0 0 22 6" aria-hidden>
            <line x1="0" y1="3" x2="22" y2="3" stroke="#0078FF" strokeWidth="2" />
            <circle cx="19" cy="3" r="3" fill="#7CC4FF" />
          </svg>
          Regional routes
        </span>
        <span className="flex items-center gap-2 text-[12px] text-white/55">
          <svg width="22" height="6" viewBox="0 0 22 6" aria-hidden>
            <line x1="0" y1="3" x2="22" y2="3" stroke="#7CC4FF" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="19" cy="3" r="2.5" fill="rgba(124,196,255,0.7)" />
          </svg>
          Domestic destinations
        </span>
        <span className="flex items-center gap-2 text-[12px] text-white/55">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="5" fill="#0078FF" />
            <circle cx="8" cy="8" r="2.5" fill="white" />
          </svg>
          Juba hub
        </span>
        <span className="ms-auto text-[11px] text-white/35">Click a regional airport for details</span>
      </div>
    </div>
  );
}
