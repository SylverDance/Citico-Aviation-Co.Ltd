import * as data from "@/lib/content";

/* ──────────────────────────────────────────────────────────────
   English dictionary — the canonical copy of the site.
   Content data stays in `@/lib/content` (untouched); this module adds
   the UI layer (nav, header, footer, hero, sections, pages) that used to
   be written inline in components and pages, so every locale renders
   from the same shape.
   ────────────────────────────────────────────────────────────── */

export const en = {
  ...data,

  nav: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/fleet", label: "Fleet" },
    { href: "/leadership", label: "Leadership" },
    { href: "/contact", label: "Contact" },
  ],

  ui: {
    skipToContent: "Skip to content",
    getStarted: "Get Started",
    breadcrumbLabel: "Breadcrumb",
    home: "Home",
    learnMore: "Learn more",
    newBadge: "New",
    languageSwitcherLabel: "Language",
    languageNames: { en: "English", ar: "العربية" },
  },

  header: {
    brandAria: "CITICO Aviation home",
    primaryNavAria: "Primary",
    mobileNavAria: "Mobile",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    callAria: "Call CITICO Aviation",
    requestCharter: "Request Charter",
    phoneHref: "tel:+211924016167",
    phoneLabel: "+211 924 016 167",
  },

  footer: {
    signupTitle: "Sign up",
    signupSub: "for our newsletter, operational updates and special offers.",
    emailLabel: "Enter your email address",
    emailPlaceholder: "Enter your email address",
    signupButton: "Sign up",
    thanks: "Your email app should now be open with the signup ready to send — send that message to be added to the list.",
    deskTitle: "Talk to our operations desk",
    deskSub: "Charters, cargo and special missions — available 24/7.",
    requestCharter: "Request Charter",
    brandBlurb:
      "Connecting South Sudan to Africa and beyond through safe, reliable aviation and integrated logistics.",
    contactTitle: "Contact",
    hours: "Operations desk available 24/7",
    rightsTemplate: "© {year} {name}. All rights reserved.",
    policies: "Policies",
    terms: "Terms and conditions",
  },

  hero: {
    eyebrow: "SSCAA-Licensed Sovereign Air Operator — Juba Airport Base",
    ctaExplore: "Explore Our Fleet",
    ctaAbout: "Who We Are",
    scroll: "Scroll",
    slideAria: "Slide {n}",
    floatingCta: "Request Immediate Flight Quote",
    countStats: [
      { value: 13, suffix: "+", label: "Years in Operation" },
      { value: 24, suffix: "/7", label: "Ops Desk (JUB)" },
      { value: 5, suffix: "", label: "Active Airframes" },
    ],
    regionalLabel: "Regional",
    networkLabel: "Network",
    widget: {
      from: "From",
      to: "To",
      originValue: "Juba, South Sudan",
      destinationPlaceholder: "Destination",
      search: "Search",
      shipmentLabel: "Shipment Reference",
      shipmentPlaceholder: "Enter tracking number",
      track: "Track",
      flightLabel: "Flight or Route",
      flightPlaceholder: "e.g. Juba — Entebbe",
      check: "Check",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      emailLabel: "Email",
      emailPlaceholder: "Email address",
      send: "Send",
    },
  },

  sections: {
    whoWeAreKicker: "Who We Are",
    whoWeAreTitle: { lead: "Leading aviation & integrated logistics across", accent: "South Sudan" },
    whoWeAreCta: "Our Full Story",
    establishedLabel: "Established",
    zeroIncidents: "Zero major incidents since day one.",
    zeroBadgeTitle: "Zero Fatalities / Major Incidents",
    zeroBadgeSub: "Since establishment in 2012",

    missionKicker: "Purpose",
    missionTitle: { lead: "Driven by mission.", accent: "Guided by values." },
    missionCardTitle: "Our Mission",
    visionCardTitle: "Our Vision",

    servicesKicker: "Services Offered",
    servicesTitle: { lead: "A focused portfolio for", accent: "every mission" },
    servicesSub:
      "Passenger movement, cargo delivery, humanitarian response and end-to-end logistics — tailored to the unique demands of African operations.",
    servicesCtaTitle: "Need a mission flown?",
    servicesCtaBody:
      "Tell us the cargo, the destination and the timeline — our operations desk responds around the clock.",
    servicesCtaButton: "Request a Charter",

    fleetKicker: "Fleet",
    fleetTitle: { lead: "Our", accent: "Fleet" },
    fleetSub:
      "Aircraft chosen for versatility, durability and the ability to operate from short, unpaved runways.",

    logisticsKicker: "Integrated Logistics",
    logisticsTitle: { lead: "One Plan Across", accent: "Every Mode" },
    multimodalLabel: "Multimodal advantage — ",
    logisticsCta: "Explore Logistics Solutions",

    whyKicker: "Why CITICO",
    whyTitle: { lead: "Built for operations.", accent: "Connected to Africa." },

    leadershipKicker: "Leadership & Management",
    leadershipTitle: { lead: "Experienced Aviation &", accent: "Logistics Leadership" },
    leadershipIntro:
      "Meet the professionals driving CITICO Aviation's commitment to safety, operational excellence, innovation, and sustainable growth across Africa's most challenging environments.",
    leadershipQuote: "“ Experience aligned around safety, service and sustainable growth ”",
    leadershipQuoteBy: "CITICO Aviation Leadership",

    safetyKicker: "Safety",
    safetyTitle: { lead: "Safety is", accent: "operational" },

    partnersKicker: "Compliance & Partnerships",
    partnersTitle: { lead: "Trusted by the", accent: "mission-critical" },
    partnersSub:
      "Strong, impactful partnerships with UN agencies, NGOs, government and industry — underpinned by the highest standards of regulatory compliance.",

    contactKicker: "Contact",
    contactTitle: { lead: "Let's move your", accent: "mission forward" },
    contactSub: "We invite you to connect with us to discuss your aviation and logistics needs.",
    contactHeadOffice: "Head Office",
    contactPhone: "Phone",
    contactEmail: "Email",
    contactDesk: "Operations Desk",
    contactDeskBody: "Available 24/7 — charters, cargo and special missions.",
    mapButton: "Open Interactive Map",
    mapButtonSub: "Montana Building, Airport Road, Juba",
    mapAria: "Load interactive map of CITICO Aviation head office",
    mapTitle: "CITICO Aviation head office — Airport Road, Juba, South Sudan",

    industriesKicker: "Industries Served",
    industriesTitle: { lead: "Mission-critical support for", accent: "every sector" },
    industriesSub:
      "CITICO serves humanitarian organizations, government entities, corporate clients and commercial operations across South Sudan and the region.",

    capabilitiesKicker: "What We Do",
    capabilitiesTitle: { lead: "Built for", accent: "complex operations" },

    profileViewProfile: "View Profile",
    profileCardAria: "View profile of {name}, {role}",
    profileModalAria: "{name} — executive profile",
    profileClose: "Close profile",
    profileExecutiveLabel: "Executive Profile",
    profileExperience: "Key Experience",
    profileHighlights: "Leadership Highlights",
    profileExpertise: "Areas of Expertise",
    profileConnect: "Connect with our team",
    profileRequestCharter: "Request a Charter",
    profilePortraitAlt: "Executive portrait of {name}",

    missionCtaKicker: "Ready to Move?",
    missionCtaTitle: "Plan Your Next Mission",
    missionCtaBody:
      "Tell us your cargo, your destination and your timeline. Our operations desk responds around the clock.",
    missionCtaPrimary: "Request a Charter",
    missionCtaSecondary: "Contact Us",

    networkKicker: "Network",
    networkTitle: { lead: "Connecting South Sudan", accent: "to the Region" },
    networkSub:
      "From our Juba hub, CITICO connects South Sudan with regional destinations across East and Central Africa.",
    networkHubLabel: "Hub",
    networkHubCountry: "South Sudan",
    networkDomestic: "Domestic Destinations",

    panelFrom: "From",
    panelTo: "To",
    panelMission: "Mission",
    panelOrigin: "Origin",
    panelDestination: "Destination",
    panelCityPlaceholder: "City or airstrip",
    panelCargoType: "Cargo Type",
    panelService: "Service",
    panelAircraft: "Aircraft",
    panelRequestQuote: "Request a Quote",
    panelRequestLogistics: "Request Logistics Quote",
    panelEnquire: "Enquire",
    panelSendMessage: "Send Message",
    panelMessagePlaceholder: "Tell us about your mission...",
    panelNamePlaceholder: "Your name",
    panelEmailPlaceholder: "Email address",
    panelOriginValue: "Juba, South Sudan",
    panelMissionOptions: ["Passenger", "Cargo", "Humanitarian", "Other"],
    panelCargoOptions: ["General Cargo", "Humanitarian Aid", "Equipment", "Perishable"],
    panelServiceOptions: ["Charter", "Maintenance", "Inspection"],
  },

  pages: {
    home: {
      kicker: "CITICO Aviation Co. Ltd",
      title: { lead: "Connecting South Sudan to Africa", accent: "and beyond." },
      subTemplate:
        "{subTagline} Trusted since {founded} by UN agencies, NGOs, governments and commercial operators — explore what we do below.",
      ctaExplore: "Explore Our Services",
      ctaAbout: "About Us",
    },
    services: {
      metaTitle: "Services",
      metaDescription:
        "Charter flights, air cargo, passenger services, humanitarian operations, helicopter missions, river transport, ground handling, aircraft parts, tours and flight permits — CITICO Aviation's full service portfolio across South Sudan and East Africa.",
      heroKicker: "Services Offered",
      heroTitle: "A focused portfolio for every mission.",
      heroSub:
        "Passenger movement, cargo delivery, humanitarian response and end-to-end logistics — tailored to the unique demands of African operations.",
      sectionAKicker: "What We Do",
      sectionATitle: { lead: "Seven capabilities,", accent: "one operations desk" },
      sectionASub:
        "Every service below is backed by our 24/7 operations desk in Juba — one call activates aircraft, crews, ground teams and permits.",
      sectionBKicker: "Now Offered",
      sectionBTitle: { lead: "Extended", accent: "capabilities" },
      sectionBSub:
        "Newly added lines from the same operations desk — ground handling, parts supply, travel and permit clearing across the region.",
      ctaLabel: "Need a mission flown?",
      ctaSub: "Tell us the cargo, the destination and the timeline — our operations desk responds around the clock.",
    },
    serviceDetail: {
      kicker: "Service",
      deliverKicker: "What we deliver",
      deliverTitle: "Mission-focused capability",
      galleryKicker: "On the water",
      galleryTitle: "River operations, up close",
      alsoExplore: "Also explore",
      otherServices: "Other services",
      ctaLabelTemplate: "Plan a {service} mission",
      ctaSub: "Tell us the cargo, the destination and the timeline — our operations desk responds around the clock.",
    },
    about: {
      metaTitle: "About CITICO Aviation — Who We Are",
      metaDescription:
        "Citico Aviation is a leading South Sudan aviation and integrated logistics provider with 13+ years of experience connecting remote and challenging regions across Africa.",
      heroKicker: "Who We Are",
      heroTitle: "Operating where others cannot.",
      heroSub:
        "A leading South Sudan aviation and integrated logistics provider — connecting remote and challenging regions across the continent since 2012.",
      historyKicker: "Our History",
      historyTitle: { lead: "Thirteen years of", accent: "operational progress" },
      history: [
        {
          year: "2012",
          t: "Founded in Juba",
          b: "CITICO Aviation established on the principle that South Sudan deserves dependable, safety-first aviation — operating where few carriers venture.",
        },
        {
          year: "2016",
          t: "Humanitarian partnerships",
          b: "Became a trusted operator for UNMISS, UNHAS, WFP and international NGOs — emergency response, aid distribution and medevac support nationwide.",
        },
        {
          year: "Today",
          t: "Multimodal regional reach",
          b: "Five aircraft, river barges, secure warehousing and all-terrain trucking — one integrated plan connecting South Sudan with East and Central Africa.",
        },
      ],
      hseeKicker: "HSEE",
      hseeTitle: { lead: "Health, Safety, Environment &", accent: "Ethics" },
      hseeSub: "Safety, environmental stewardship and ethical conduct are embedded in our operating model.",
      hsee: [
        {
          t: "Safety & Health",
          b: "Rigorous health and safety protocols for all personnel, on and off duty — with comprehensive training programs and proactive risk assessment.",
          i: "shield",
        },
        {
          t: "Environmental Stewardship",
          b: "Fuel-efficient aircraft, optimized routes, responsible waste reduction and active exploration of certified carbon offset projects.",
          i: "leaf",
        },
        {
          t: "Community Impact",
          b: "Minimizing operational noise and disruption to local ecosystems and communities around our operational bases.",
          i: "users",
        },
        {
          t: "Ethical Conduct",
          b: "Zero-tolerance policy for corruption, adherence to international anti-bribery standards, and transparent operations with all partners.",
          i: "badge",
        },
      ],
      ctaLabel: "Work with us",
      ctaSub: "Discuss your aviation and logistics needs with our team in Juba.",
    },
    logistics: {
      metaTitle: "Integrated Multimodal Logistics | CITICO Aviation",
      metaDescription:
        "Air, river and ground logistics under one operating plan — CITICO Aviation's multimodal advantage across South Sudan and Africa.",
      heroKicker: "Integrated Logistics",
      heroTitle: "One plan across every mode.",
      heroSub:
        "Air, river, ground. Citico combines transport and ground capability to keep critical shipments moving when a single mode is not enough.",
      assetsKicker: "Logistics & Ground Assets",
      assetsTitle: { lead: "The hardware behind", accent: "every delivery" },
      assetHeaders: ["Asset Type", "Qty", "Capacity", "Role"],
      assets: [
        { type: "River Barges / Pushers", qty: "2", cap: "Up to 30 tons", role: "Heavy bulk cargo on the Nile corridor" },
        { type: "Warehousing (Juba)", qty: "3", cap: "1,000 sqm total", role: "Secure storage at Juba Airport & Twon" },
        { type: "All-Terrain Trucks", qty: "10", cap: "20–40 tons", role: "Last-mile delivery, 6×6 off-road capability" },
      ],
      cards: [
        { src: "/img/ops-river.jpg", t: "River capability", b: "Heavy and project cargo support along strategic inland routes." },
        { src: "/img/ops-warehouse.jpg", t: "Juba logistics hub", b: "Secure storage, coordinated transfer and last-mile delivery from Juba." },
        { src: "/img/ops-ground.jpg", t: "Ground reach", b: "6×6 all-terrain delivery to off-road destinations across South Sudan." },
      ],
      ctaLabel: "Move cargo across modes",
      ctaSub:
        "From airstrip to river barge to last-mile truck — plan your end-to-end delivery with our logistics team.",
    },
    safety: {
      metaTitle: "Safety & Compliance — Zero Major Incidents | CITICO Aviation",
      metaDescription:
        "Zero major incidents since 2012. CITICO Aviation operates a comprehensive Safety Management System exceeding international standards, fully compliant with ICAO.",
      heroKicker: "Safety",
      heroTitle: "Excellence takes flight.",
      complianceKicker: "Certifications & Standards",
      complianceTitle: { lead: "Regulated, audited,", accent: "continuously improved" },
      compliance: [
        "Fully compliant with International Civil Aviation Organization (ICAO) standards",
        "Adherence to IATA Operational Safety Audit (IOSA) best practices",
        "Licensed and regulated by the relevant African civil aviation authority",
        "Regular audits and continuous improvement programs",
        "Comprehensive Safety Management System (SMS) exceeding international standards",
      ],
      zeroLabel: "Fatalities / Major Incidents",
      zeroBody:
        "Since establishment in 2012 — demonstrating a relentless commitment to safety protocols and maintenance.",
      ctaLabel: "Fly with a safety-led operator",
      ctaSub: "Discuss your mission requirements with our operations desk.",
    },
    fleet: {
      metaTitle: "Aircraft Fleet — Cargo, STOL & Rotary | CITICO Aviation",
      metaDescription:
        "Antonov AN-26, Antonov AN-74, Fokker F27 Friendship, Mi-8 helicopter and Boeing 737-300F — CITICO Aviation's versatile fleet for short, unpaved runways and heavy regional freight.",
      heroKicker: "Fleet",
      heroTitle: "Aircraft chosen for the mission.",
      heroSub:
        "Versatile, durable aircraft able to operate from short, unpaved runways — from STOL cargo workhorses to heavy regional freighters and deep-field helicopters.",
      sectionKicker: "Our Aircraft",
      sectionTitle: { lead: "Five types,", accent: "every profile" },
      sectionSub:
        "Each aircraft type covers a distinct mission profile — austere airstrips, heavy freight, regional passengers and runway-free helicopter access.",
      labelCapacity: "Capacity",
      labelRange: "Range",
      labelInFleet: "{count} in fleet",
      viewAircraft: "View Aircraft",
      ctaLabel: "Charter the right aircraft",
      ctaSub:
        "Our operations desk matches your cargo, passengers and destination to the aircraft that fits — around the clock.",
    },
    fleetDetail: {
      specKicker: "Specifications",
      specTitleTemplate: "Built for {category} missions",
      labelPayload: "Payload",
      labelRange: "Range",
      labelInFleet: "In Fleet",
      labelCategory: "Category",
      labelConfiguration: "Configuration",
      inFleetValue: "{count} aircraft",
      alsoExplore: "Also explore",
      restOfFleet: "The rest of the fleet",
      ctaLabelTemplate: "Charter the {model}",
      ctaSub: "Request aircraft availability, payload planning and mission pricing from our operations desk.",
    },
    leadership: {
      metaTitle: "Leadership & Management | CITICO Aviation",
      metaDescription:
        "The CITICO Aviation leadership team — over 13 years of collective experience in South Sudan aviation, logistics, and operational management.",
      heroKicker: "Leadership & Management",
      heroTitle: "Experience aligned around safety, service and sustainable growth.",
      heroSub:
        "Our leadership brings together over 13 years of collective experience in South Sudan aviation, logistics, and operational management.",
      quote: "“Experience aligned around safety, service and sustainable growth.”",
      quoteBy: "CITICO Aviation Leadership",
      ctaLabel: "Connect with our team",
      ctaSub: "Reach the right department directly from our contact page.",
    },
    contact: {
      metaTitle: "Contact & 24/7 Operations Desk | CITICO Aviation",
      metaDescription:
        "Contact CITICO Aviation in Juba, South Sudan — Montana Building, Airport Road. Request charters, cargo and logistics support, 24/7 operations desk.",
      heroKicker: "Contact",
      heroTitle: "Let's move your mission forward.",
      heroSub: "We invite you to connect with us to discuss your aviation and logistics needs.",
      headOfficeTitle: "Head Office",
      deskLineTemplate: "{website} — operations desk 24/7",
      formTitle: "Request a Charter",
      formSub: "Share your mission details — the operations desk responds around the clock.",
      sentTitle: "Your email app should now be open.",
      sentBody: "If it didn't open, email us directly at",
      sentOr: "or call",
      fieldName: "Full name *",
      fieldNamePlaceholder: "Your name",
      fieldOrg: "Organization",
      fieldOrgPlaceholder: "UN agency, NGO, company…",
      fieldEmail: "Email *",
      fieldEmailPlaceholder: "you@organization.org",
      fieldService: "Service needed",
      fieldOther: "Other / Multiple",
      fieldMessage: "Mission details *",
      fieldMessagePlaceholder: "Cargo / passengers, destination, preferred dates, weight…",
      submit: "Send Request",
      mapTitle: "CITICO Aviation head office map — Airport Road, Juba",
    },
  },

  notFound: {
    title: "Off the flight plan.",
    body: "This page isn't on the route map. Let's get you back to safer skies.",
    home: "Back to Home",
    contact: "Contact Us",
  },
};

export type Dictionary = typeof en;
