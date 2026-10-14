// Minimal premium line-icon set (inline SVG, stroke-based)
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 4.6-3 8.3-7 10-4-1.7-7-5.4-7-10V6l7-3z" />
    <path d="M9.5 11.8l1.8 1.8 3.4-3.6" />
  </svg>
);

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.5 12.3l2.4 2.4 4.6-5" />
  </svg>
);

export const IconSpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    <circle cx="12" cy="12" r="2.4" />
  </svg>
);

export const IconLeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 19c0-8 5-13 14-14 .8 8.5-4 14-11 14h-3z" />
    <path d="M5 19c2.5-5 6-8.5 10-10.5" />
  </svg>
);

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
    <path d="M15.5 5.6a3.2 3.2 0 010 4.9M17.8 14.4c1.6.8 2.6 2.4 2.9 4.6" />
  </svg>
);

export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2L12 3z" />
    <path d="M4.2 7.4L12 11.5l7.8-4.1M12 11.5V21" />
  </svg>
);

export const IconJet = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 13.5l8-2.2V5.6c0-.9.5-1.6 1-1.6s1 .7 1 1.6v5.7l8 2.2v2l-8-1v3.6l2.4 2v1.4L12 20.6l-3.4.9v-1.4l2.4-2v-3.6l-8 1v-2z" />
  </svg>
);

export const IconHeart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.7-7.5-10A4.3 4.3 0 0112 7.6 4.3 4.3 0 0119.5 10c0 5.3-7.5 10-7.5 10z" />
  </svg>
);

export const IconRotor = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 5c3 2 6 2.8 9 2.8S18 7 21 5M3 5h18M12 7.8V13M8 21c0-2.6 1.8-4.4 4-4.4s4 1.8 4 4.4" />
    <circle cx="12" cy="14.2" r="1.4" />
  </svg>
);

export const IconRiver = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 17c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 2-1 2.5-.7M4 12c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 2-1 2.5-.7M12 8V3M9 5.5L12 3l3 2.5" />
  </svg>
);

export const IconWarehouse = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 20V9.5L12 4l9 5.5V20" />
    <path d="M7 20v-6h10v6M7 17.2h10M9.5 20v-2.8" />
  </svg>
);

export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="16.5" cy="17.5" r="1.8" />
  </svg>
);

export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.8" />
    <circle cx="12" cy="12" r="1.4" />
  </svg>
);

export const IconNetwork = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2.2" />
    <circle cx="5" cy="18" r="2.2" />
    <circle cx="19" cy="18" r="2.2" />
    <path d="M11 7l-5 9M13 7l5 9M7.2 18h9.6" />
  </svg>
);

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2.5L4.5 13.5H11l-1 8L18.5 10H12l1-7.5z" />
  </svg>
);

export const IconBadge = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="M9 14.2L7.5 21l4.5-2.4L16.5 21 15 14.2" />
  </svg>
);

export const IconBook = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5.5C5.5 4.4 7.5 4 12 4s6.5.4 8 1.5v12C18.5 18.6 16.5 19 12 19s-6.5-.4-8-1.5v-12z" />
    <path d="M12 4v15" />
  </svg>
);

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.2l3.4 2" />
  </svg>
);

export const IconMapPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.4-6.5-10.4a6.5 6.5 0 0113 0C18.5 15.6 12 21 12 21z" />
    <circle cx="12" cy="10.4" r="2.3" />
  </svg>
);

export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 3.5h3l1.5 4-2 1.5c.8 2.4 2.6 4.2 5 5l1.5-2 4 1.5v3c0 1-.8 1.8-1.8 1.7C9.6 18.4 5.6 14.4 3.8 5.3 3.7 4.3 4.5 3.5 5.5 3.5z" />
  </svg>
);

export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
    <path d="M4.5 7l7.5 6 7.5-6" />
  </svg>
);

export const IconGlobe = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.6 2.3 3.9 5.1 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.1-3.9-8.5s1.3-6.2 3.9-8.5z" />
  </svg>
);

/* Directional icon — mirrors itself in RTL (Arabic) layouts.
   In Arabic we keep the arrow’s intended direction and let layout speak for itself, so the
   `rtl:-scale-x-100` mirror is intentionally not applied for Arabic locales. */
export const IconArrow = (p: P) => (
  <svg {...base({ ...p, className: `${p.className ?? ""}` })}>
    <path d="M4 12h15M13.5 6.5L19.5 12l-6 5.5" />
  </svg>
);

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconSun = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const IconMoon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 14.5A8.5 8.5 0 019.5 4 8.5 8.5 0 1020 14.5z" />
  </svg>
);

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0011 8.5V11H8.5v3.5H11V21h3.5v-6.5H17L17.5 11H14.5V9a1 1 0 01.1-.5z" strokeWidth={0} fill="currentColor" stroke="none" />
  </svg>
);

export const IconYouTube = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="12" rx="3.5" />
    <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLinkedIn = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 10.5V17M8 7.6v.1M12 17v-4a2.2 2.2 0 014.4 0v4" />
  </svg>
);

export const IconWrench = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 6.5a3.5 3.5 0 015 4.6l-8.2 8.2a2 2 0 01-2.8 0l-1.8-1.8a2 2 0 010-2.8l8.2-8.2a3.5 3.5 0 01-.4 0z" />
    <path d="M4 20l3-3" />
  </svg>
);

export const IconPermit = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
    <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    <circle cx="15.5" cy="16" r="3" />
    <path d="M14.4 16l.8.8 1.5-1.6" />
  </svg>
);

export const iconMap: Record<string, (p: P) => React.JSX.Element> = {
  shield: IconShield,
  check: IconCheck,
  spark: IconSpark,
  leaf: IconLeaf,
  users: IconUsers,
  box: IconBox,
  jet: IconJet,
  heart: IconHeart,
  rotor: IconRotor,
  river: IconRiver,
  warehouse: IconWarehouse,
  truck: IconTruck,
  target: IconTarget,
  network: IconNetwork,
  bolt: IconBolt,
  badge: IconBadge,
  book: IconBook,
  clock: IconClock,
  wrench: IconWrench,
  permit: IconPermit,
};

export function DynIcon({ name, ...rest }: { name: string } & P) {
  const C = iconMap[name] ?? IconShield;
  return <C {...rest} />;
}
