// Centralized Lead Management, RFQ Processing, and Resilient Dispatch Pipeline
// Compliant with offline environments and low-bandwidth connections across East Africa.

export type MissionType =
  | "cargo"
  | "passenger"
  | "humanitarian"
  | "medevac"
  | "vip"
  | "parts"
  | "permits"
  | "general"
  | "ad-hoc-ops"
  | string;

export type AircraftType =
  | "antonov-an-26"
  | "antonov-an-74"
  | "fokker-f27"
  | "mi-8-helicopter"
  | "boeing-737-300f"
  | "any"
  | string;

export type UrgencyLevel = "routine" | "critical-24h" | "emergency-aog" | "urgent" | string;

export interface RfqLeadPayload {
  referenceId: string;
  createdAt?: string;
  submittedAt?: string;
  missionType: MissionType;
  aircraft?: AircraftType;
  selectedAircraft?: AircraftType;
  origin?: string;
  destination?: string;
  alternate?: string;
  isInternational?: boolean;
  flightDate?: string;
  urgency: UrgencyLevel;
  payloadWeightKg?: number;
  cargoWeightKg?: number;
  passengerCount?: number;
  cargoDetails?: string;
  isHazardous?: boolean;
  hazmat?: boolean;
  isColdChain?: boolean;
  coldChain?: boolean;
  needsGroundHandling?: boolean;
  needsFuel?: boolean;
  partNumber?: string;
  client?: {
    name: string;
    organization: string;
    email: string;
    phone: string;
    whatsapp?: string;
  };
  clientName?: string;
  organization?: string;
  email?: string;
  phone?: string;
  notes?: string;
  additionalNotes?: string;
  leadScore: number;
}

export type DispatchResult = {
  success: boolean;
  referenceId: string;
  method: "api" | "queue" | "whatsapp" | "mailto";
  message: string;
};

const QUEUE_STORAGE_KEY = "citico_rfq_submissions_queue";

// Calculate automated enterprise lead score (0 - 100)
export function calculateLeadScore(lead: Partial<RfqLeadPayload>): number {
  let score = 30; // base score

  // Urgency weight
  if (lead.urgency === "emergency-aog") score += 30;
  else if (lead.urgency === "critical-24h") score += 20;

  // Mission weight
  if (lead.missionType === "medevac" || lead.missionType === "humanitarian") score += 20;
  else if (lead.missionType === "cargo") score += 15;
  else if (lead.missionType === "parts") score += 15;

  // Organization weight
  const org = (lead.client?.organization || "").toLowerCase();
  if (
    org.includes("un") ||
    org.includes("wfp") ||
    org.includes("msf") ||
    org.includes("ngo") ||
    org.includes("red cross") ||
    org.includes("ministry") ||
    org.includes("petrol") ||
    org.includes("oil")
  ) {
    score += 15;
  }

  // Completeness weight
  if (lead.client?.email && lead.client?.phone) score += 5;
  if (lead.origin && lead.destination) score += 5;

  return Math.min(score, 100);
}

// Generate human-friendly reference ID
export function generateReferenceId(type: MissionType = "general"): string {
  const prefix = String(type).substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CIT-${prefix}-${year}-${random}`;
}

export const generateTicketId = (prefix = "OPS") => generateReferenceId(prefix as MissionType);

// Save lead to local resilient queue
export function saveLeadToQueue(payload: RfqLeadPayload): void {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || "[]");
    existing.unshift(payload);
    // keep max 50 items
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn("Could not save RFQ to localStorage:", err);
  }
}

// Format lead summary for WhatsApp Direct Dispatch
export function formatWhatsAppMessage(payload: RfqLeadPayload): string {
  const clientName = payload.client?.name || payload.clientName || "Direct Inquiry";
  const org = payload.client?.organization || payload.organization || "N/A";
  const phone = payload.client?.phone || payload.phone || "N/A";
  const email = payload.client?.email || payload.email || "N/A";
  const aircraft = payload.aircraft || payload.selectedAircraft || "";
  const weight = payload.payloadWeightKg ?? payload.cargoWeightKg;
  const notes = payload.notes || payload.additionalNotes || "";

  const lines = [
    `*CITICO AVIATION — FLIGHT RFQ*`,
    `Ref: #${payload.referenceId}`,
    `Urgency: ${String(payload.urgency).toUpperCase()}`,
    `Mission: ${String(payload.missionType).toUpperCase()}`,
    aircraft ? `Aircraft: ${aircraft}` : "",
    payload.origin && payload.destination ? `Route: ${payload.origin} ➔ ${payload.destination}` : "",
    weight ? `Cargo Weight: ${weight} kg` : "",
    payload.passengerCount ? `Passengers: ${payload.passengerCount}` : "",
    payload.partNumber ? `AOG Part #: ${payload.partNumber}` : "",
    payload.flightDate ? `Date: ${payload.flightDate}` : "",
    `---------------------`,
    `Client: ${clientName}`,
    `Org: ${org}`,
    `Tel: ${phone}`,
    `Email: ${email}`,
    notes ? `Details: ${notes}` : "",
  ].filter(Boolean);

  return encodeURIComponent(lines.join("\n"));
}

export const getWhatsAppUrl = (payload: RfqLeadPayload): string =>
  `https://wa.me/211924016167?text=${formatWhatsAppMessage(payload)}`;

// Format RFC-compliant mailto URL
export function formatMailtoUrl(payload: RfqLeadPayload): string {
  const clientName = payload.client?.name || payload.clientName || "Direct Inquiry";
  const org = payload.client?.organization || payload.organization || "Private Client";
  const phone = payload.client?.phone || payload.phone || "N/A";
  const email = payload.client?.email || payload.email || "N/A";
  const aircraft = payload.aircraft || payload.selectedAircraft || "Best match";
  const weight = payload.payloadWeightKg ?? payload.cargoWeightKg;
  const isHaz = payload.isHazardous ?? payload.hazmat;
  const isCold = payload.isColdChain ?? payload.coldChain;
  const notes = payload.notes || payload.additionalNotes || "No additional comments";
  const timestamp = payload.createdAt || payload.submittedAt || new Date().toISOString();

  const subject = encodeURIComponent(
    `[RFQ #${payload.referenceId}] ${String(payload.urgency).toUpperCase()} — ${String(payload.missionType).toUpperCase()} — ${org || clientName}`
  );

  const body = encodeURIComponent(
    `CITICO AVIATION OPERATIONS DESK\n` +
      `MISSION REQUEST & RFQ SPECIFICATION\n\n` +
      `Reference ID: ${payload.referenceId}\n` +
      `Submission Time: ${timestamp}\n` +
      `Urgency Level: ${payload.urgency}\n` +
      `Mission Profile: ${payload.missionType}\n` +
      `Aircraft Specified: ${aircraft}\n` +
      `Route: ${payload.origin || "JUB"} to ${payload.destination || "TBD"}\n` +
      (payload.alternate ? `Alternate Strip: ${payload.alternate}\n` : "") +
      `Flight Date: ${payload.flightDate || "Immediate"}\n` +
      (weight ? `Payload Weight: ${weight} kg\n` : "") +
      (payload.passengerCount ? `Passengers: ${payload.passengerCount}\n` : "") +
      (payload.partNumber ? `AOG Part Number: ${payload.partNumber}\n` : "") +
      (isHaz ? `Dangerous Goods (DG/HAZMAT): YES\n` : "") +
      (isCold ? `Cold-Chain / Temp Control: YES\n` : "") +
      (payload.needsGroundHandling ? `Ground Handling Support: YES\n` : "") +
      `\nCLIENT INFORMATION:\n` +
      `Name: ${clientName}\n` +
      `Organization: ${org}\n` +
      `Direct Phone: ${phone}\n` +
      `Email: ${email}\n` +
      (payload.client?.whatsapp ? `WhatsApp: ${payload.client.whatsapp}\n` : "") +
      `\nMISSION NOTES & SCOPE:\n${notes}\n`
  );

  return `mailto:ops@citicoaviation.com?subject=${subject}&body=${body}`;
}

export const getMailtoUrl = (payload: RfqLeadPayload): string => formatMailtoUrl(payload);

// Unified Lead Dispatcher
export async function dispatchLead(payload: RfqLeadPayload): Promise<DispatchResult> {
  // Always persist locally first to guarantee zero lead loss
  saveLeadToQueue(payload);

  const endpoint =
    process.env.NEXT_PUBLIC_LEADS_ENDPOINT ||
    (process.env.NEXT_PUBLIC_FORMSPREE_ID && process.env.NEXT_PUBLIC_FORMSPREE_ID !== "YOUR_FORM_ID"
      ? `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`
      : null);

  if (endpoint) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          success: true,
          referenceId: payload.referenceId,
          method: "api",
          message: "Request transmitted directly to 24/7 Operations Desk.",
        };
      }
    } catch (err) {
      console.warn("Direct API dispatch failed, falling back to local queue and WhatsApp/mailto:", err);
    }
  }

  // Graceful fallback: lead is safely stored, provide direct channel execution
  return {
    success: true,
    referenceId: payload.referenceId,
    method: "queue",
    message: "Request queued successfully. Operations desk can be alerted immediately via WhatsApp or direct email.",
  };
}
