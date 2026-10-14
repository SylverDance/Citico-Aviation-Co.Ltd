// Central content model — all facts sourced from Citico_Profile_2026-003.pdf
import { SITE_HOST, SITE_ORIGIN } from "@/lib/site";

export const company = {
  name: "CITICO Aviation Co. Ltd",
  shortName: "CITICO Aviation",
  tagline: "Connecting South Sudan to Africa and Beyond",
  subTagline:
    "Reliable aviation, charter and logistics solutions for humanitarian, government and commercial operations across South Sudan and the region.",
  brandStatement:
    "Connecting South Sudan to the world with safe, sustainable, and innovative aviation solutions that empower growth and strengthen regional integration.",
  founded: 2012,
  yearsExperience: 13,
  hq: "Montana Building, Airport Road, Juba, South Sudan",
  aocNumber: "SSCAA/AOC/019-R",
  aocAuthority: "South Sudan Civil Aviation Authority (SSCAA)",
  icaoDesignator: "CTC",
  smsStandard: "ICAO Annex 6 Part 121 / SMS Continuous Compliance",
  website: SITE_HOST,
  siteUrl: SITE_ORIGIN,
  email: "ops@citicoaviation.com",
  businessEmail: "business@citicoaviation.com",
  phones: ["+211 924 016 167", "+211 910 050 003", "+211 929 447 976"],
  businessPhone: "+211 928 327 709",
  dutyDeskWhatsApp: "+211 924 016 167",
  social: {
    facebook: "https://www.facebook.com/people/Citico-Aviation-Coltd/",
    youtube: "https://www.youtube.com/@CiticoaviationCoLtd",
    linkedin: "https://www.linkedin.com/company/citico-aviation",
  },
};

/* Hero carousel slides — authoritative mission & heavy cargo positioning */
export const heroSlides = [
  {
    headline: ["Heavy Cargo & STOL", "Airstrip Operations"],
    accent: "Airstrip Operations",
    subtext: "SSCAA-licensed sovereign air operator (AOC: SSCAA/AOC/019-R). Moving heavy equipment, food aid, and humanitarian missions into remote marram strips across South Sudan.",
  },
  {
    headline: ["Humanitarian Airlift &", "Emergency Mission Support"],
    accent: "Emergency Mission Support",
    subtext: "13+ years continuous mission readiness. Trusted by UN agencies, NGOs, and energy operators for rapid flight launch from Juba International Airport.",
  },
];

/* Trust indicators below hero text */
export const heroTrust = [
  "SSCAA AOC #019-R Licensed",
  "ICAO: CTC Registered",
  "15-Min Operations SLA",
  "Zero Hull-Loss Safety Record",
];

/* Feature bullet line under hero subtext */
export const heroFeatures = [
  "Charter & Cargo",
  "24/7 Operations",
  "Regional Coverage",
  "Humanitarian Access",
];

/* Hero stats — hard numbers below the widget */
export const heroStats = [
  { value: "13+", label: "Years" },
  { value: "24/7", label: "Operations" },
  { value: "5", label: "Aircraft" },
  { value: "Regional", label: "Network" },
];

/* Stats for safety page (backward compat) */
export type Stat = { value: number; suffix: string; label: string };
export const stats: Stat[] = [
  { value: 13, suffix: "+", label: "Years Experience" },
  { value: 24, suffix: "/7", label: "Operational Support" },
  { value: 5, suffix: "", label: "Aircraft in Fleet" },
  { value: 8, suffix: "+", label: "Domestic Destinations" },
  { value: 6, suffix: "+", label: "Regional Routes" },
];

/* Hero widget tabs */
export const heroWidgetTabs = [
  { key: "charter", label: "Request Charter" },
  { key: "track", label: "Track Shipment" },
  { key: "status", label: "Flight Status" },
  { key: "quote", label: "Get a Quote" },
];

export const whoWeAre = {
  kicker: "Who We Are",
  heading: "Operating Where Others Cannot",
  paragraphs: [
    "Citico Aviation is a leading South Sudan aviation and integrated logistics provider, specializing in connecting remote and challenging regions across the continent. With over 13 years of unparalleled experience in South Sudan skies, we are renowned for our unwavering commitment to safety, operational excellence, and a unique multimodal transport capability.",
    "Our strong partnerships with international relief agencies and a proven track record underscore our capability to operate where others cannot — making us the partner of choice for complex logistics missions.",
  ],
  highlights: [
    { title: "13+ Years", body: "Uninterrupted operations across South Sudan and Africa since 2012." },
    { title: "Multimodal", body: "Air, river, warehousing and ground assets under one operating plan." },
    { title: "Humanitarian", body: "Trusted by UN agencies and NGOs for mission-critical access." },
  ],
};

export const missionVision = {
  mission:
    "To provide safe, reliable, and efficient aviation and integrated logistics services across Africa, enabling critical operations and fostering sustainable development in hard-to-reach communities.",
  vision:
    "To be the leading and most trusted multimodal aviation and logistics provider in Africa, recognized for our operational excellence, innovative solutions, and commitment to sustainability.",
  values: [
    {
      title: "Safety",
      body: "Non-negotiable, embedded in every operation.",
      icon: "shield",
    },
    {
      title: "Reliability",
      body: "Consistent and dependable service delivery.",
      icon: "check",
    },
    {
      title: "Innovation",
      body: "Continuously seeking smarter, more efficient solutions.",
      icon: "spark",
    },
    {
      title: "Sustainability",
      body: "Responsible operations for a healthier future.",
      icon: "leaf",
    },
  ],
};

export type ServiceGalleryImage = {
  src: string;
  alt: string;
  caption: string;
};

export type Service = {
  slug: string;
  title: string;
  short: string;
  icon: string;
  image: string;
  intro: string;
  points: string[];
  gallery?: ServiceGalleryImage[];
  seoTitle?: string;
  seoDescription?: string;
};

export const services: Service[] = [
  {
    slug: "passenger-services",
    title: "Passenger Services",
    short: "Domestic and regional flights connecting Juba with remote destinations.",
    icon: "users",
    image: "/img/ops-cabin.jpg",
    seoTitle: "Passenger Flights in South Sudan | Juba Domestic & Regional Charters",
    seoDescription:
      "Scheduled and on-demand passenger flights from Juba to remote South Sudanese states and regional capitals, flown by experienced crews on African-proven aircraft.",
    intro:
      "Scheduled and on-demand passenger services linking Juba with remote states and regional capitals — flown by experienced crews on aircraft proven in African conditions.",
    points: [
      "Domestic routes across South Sudan",
      "Regional connections within East Africa",
      "Government, NGO and corporate travel",
      "Baggage and cargo-by-passenger handling",
    ],
  },
  {
    slug: "air-cargo",
    title: "Air Cargo",
    short: "Time-critical cargo delivery to any accessible airstrip.",
    icon: "box",
    image: "/img/ops-cargo.jpg",
    seoTitle: "Air Cargo South Sudan | Freight & Humanitarian Air Charter",
    seoDescription:
      "Air cargo and freight services across South Sudan and East Africa — humanitarian relief, heavy equipment and time-critical shipments delivered by cargo-proven aircraft.",
    intro:
      "Rapid and reliable transport for time-critical goods, perishables and high-value items — from humanitarian food aid to oilfield equipment, delivered where roads cannot reach.",
    points: [
      "Time-critical and perishable cargo",
      "Bulk humanitarian deliveries",
      "High-value and sensitive freight",
      "Rear-ramp loading on STOL aircraft",
    ],
  },
  {
    slug: "charter-flights",
    title: "Charter Flights",
    short: "Corporate, government and NGO missions on your schedule.",
    icon: "jet",
    image: "/img/ops-airfield.jpg",
    seoTitle: "Private Charter Flights Juba | On-Demand Aircraft Charter South Sudan",
    seoDescription:
      "Private and business air charter from Juba — on-demand aircraft for corporate, government and NGO missions, with crew and ground coordination around your timetable.",
    intro:
      "Flexible charter solutions for corporate, government and NGO missions — aircraft, crew and ground coordination assembled around your timetable and mission profile.",
    points: [
      "Corporate and VIP movements",
      "Government and diplomatic missions",
      "NGO program and assessment flights",
      "Rapid mission activation, 24/7",
    ],
  },
  {
    slug: "humanitarian-operations",
    title: "Humanitarian Operations",
    short: "Emergency response and aid logistics with UN-agency standards.",
    icon: "heart",
    image: "/img/ops-humanitarian.jpg",
    seoTitle: "Humanitarian Air Operations | NGO & Relief Aviation South Sudan",
    seoDescription:
      "Humanitarian aviation for NGOs and UN agencies in South Sudan — relief cargo, medevac, crew rotations and access to remote airstrips under the toughest conditions.",
    intro:
      "Emergency response and aid logistics delivered alongside UNMISS, UNHAS, WFP and international NGOs — operating to the coordination standards humanitarian missions demand.",
    points: [
      "Emergency response activations",
      "Aid and medical cargo distribution",
      "Medevac coordination support",
      "Remote-area access under UN standards",
    ],
  },
  {
    slug: "helicopter-operations",
    title: "Helicopter Operations",
    short: "Remote access, sling-load and medevac support with Mi-8s.",
    icon: "rotor",
    image: "/img/ops-helicopter.jpg",
    seoTitle: "Helicopter Services South Sudan | Mi-8 Heavy Lift & Sling Loads",
    seoDescription:
      "Mi-8 helicopter operations in South Sudan — deep-field personnel transport, external sling loads up to 4,000 kg, medevac and landing-zone assessment where no runway exists.",
    intro:
      "Mi-8 helicopter operations providing exceptional lift capability for deep-field missions — personnel transport, sling loads and medevac where no runway exists.",
    points: [
      "Deep-field personnel transport",
      "Sling-load and external cargo missions",
      "Medevac and casualty evacuation",
      "Landing zone assessment support",
    ],
  },
  {
    slug: "river-cargo-transport",
    title: "River Cargo Transport",
    short: "Cost-effective barge transport along the Nile corridor.",
    icon: "river",
    image: "/img/ops-river.jpg",
    seoTitle: "River Cargo Transport | Nile Barge Services South Sudan",
    seoDescription:
      "Cost-effective barge transport along the Nile corridor — bulk cargo, heavy equipment and non-time-sensitive goods up to 30 tons, with air-to-river trans-shipment.",
    intro:
      "Cost-effective movement of bulk cargo, heavy equipment and non-time-sensitive goods along major river networks — up to 30-ton loads on the Nile corridor.",
    points: [
      "Bulk and heavy project cargo",
      "Up to 30-ton barge capacity",
      "Nile corridor operations",
      "Air-to-river trans-shipment",
    ],
    gallery: [
      {
        src: "/img/river-wheelhouse.webp",
        alt: "The wheelhouse of a CITICO river barge with crew on the upper deck",
        caption: "Command deck",
      },
      {
        src: "/img/river-cargo-deck.webp",
        alt: "A towed barge loaded with tarped cargo, drums and shipping containers",
        caption: "Bulk & project cargo",
      },
      {
        src: "/img/river-passengers.webp",
        alt: "A packed passenger and cargo deck on a Nile corridor barge",
        caption: "Passengers & goods",
      },
    ],
  },
  {
    slug: "warehousing-ground-support",
    title: "Warehousing & Ground Support",
    short: "Secure storage and last-mile delivery from the Juba hub.",
    icon: "warehouse",
    image: "/img/ops-warehouse.jpg",
    seoTitle: "Warehousing & Ground Support Juba | Secure Storage & Last-Mile Delivery",
    seoDescription:
      "Secure warehousing at Juba Airport and Twon with coordinated trans-shipment and last-mile delivery on 6×6 all-terrain trucks — the ground backbone of every mission.",
    intro:
      "Secure storage at Juba Airport and Twon, coordinated trans-shipment and last-mile delivery on 6×6 all-terrain trucks — the ground backbone of every mission.",
    points: [
      "1,000 sqm secure warehousing",
      "Juba Airport & Twon facilities",
      "10 all-terrain trucks, 20–40 t",
      "Last-mile delivery coordination",
    ],
  },
  {
    slug: "ground-handling",
    title: "Ground Handling",
    short: "Airline-standard ramp handling at Juba and upcountry strips.",
    icon: "truck",
    image: "/img/ops-ground.jpg",
    seoTitle: "Ground Handling Services Juba | Ramp & Ramp Supervision South Sudan",
    seoDescription:
      "Full ground handling at Juba and upcountry strips — ramp supervision, load control, fuel coordination and passenger/cargo documentation to airline standards.",
    intro:
      "CITICO runs airline-standard ground handling for charter and scheduled traffic across South Sudan — ramp supervision, marshalling, load control, fuel coordination and passenger/cargo documentation, executed to the coordination standards arriving operators expect at Juba and upcountry strips.",
    points: [
      "Ramp supervision, marshalling and runway entry coordination",
      "Load control, weight & balance and cargo manifest sign-off",
      "Fuel coordination and into-plane service",
      "Passenger processing and coordinated cargo documentation",
    ],
  },
  {
    slug: "aircraft-parts",
    title: "Aircraft Parts",
    short: "AOG-critical parts sourcing with a 24/7 desk and fleet-wide delivery.",
    icon: "wrench",
    image: "/img/ops-cargo.jpg",
    seoTitle: "Aircraft Parts Supply | AOG Desk for An-26, F27, 737 & Mi-8 Operators",
    seoDescription:
      "AOG-critical aircraft parts sourcing and supply for An-26, An-74, Fokker F27, Boeing 737-300F and Mi-8 operators — traceable inventory, 24/7 desk, fleet-wide delivery.",
    intro:
      "We keep mixed Antonov, Fokker, 737 and Mi-8 operators flying through AOG-critical parts sourcing — traceable, certified inventory for the An-26, An-74, Fokker F27, Boeing 737-300F and Mi-8 lines, with a 24/7 response desk and region-wide delivery by our own cargo fleet.",
    points: [
      "24/7 AOG response desk with a named parts lead",
      "Traceable, certified inventory with documented history",
      "Familiarity with An-26 / An-74 / F27 / 737-300F / Mi-8 lines",
      "Delivery by our own cargo fleet across the region",
    ],
  },
  {
    slug: "tours-travels",
    title: "Tours & Travels",
    short: "Bespoke journeys across South Sudan and East Africa, end to end.",
    icon: "network",
    image: "/img/ops-sky.jpg",
    seoTitle: "Tours & Travel South Sudan | Safaris & Cultural Expeditions East Africa",
    seoDescription:
      "Bespoke tours and travel across South Sudan and East Africa — scheduled flights, private charters, Nile river safaris and curated cultural expeditions, end to end.",
    intro:
      "Bespoke journeys across South Sudan and East Africa, planned and run end to end by one travel desk — scheduled flights, private charters, river safaris along the Nile corridor and curated cultural expeditions, built around the place, the season and the people you want to meet.",
    points: [
      "Scheduled and private charter flights arranged for the trip",
      "Nile corridor river safaris through the Sudd and beyond",
      "Curated cultural and wildlife expeditions",
      "One travel desk handling flights, lodging and ground movement",
    ],
  },
  {
    slug: "flight-permits",
    title: "Flight Permits",
    short: "Overflight and landing permits cleared in days, not weeks.",
    icon: "permit",
    image: "/img/permits.jpg",
    seoTitle: "Flight Permits Africa | Overflight & Landing Clearances South Sudan",
    seoDescription:
      "Overflight and landing permits for operators flying African routes — CAA clearances across South Sudan and neighbouring states in days, including diplomatic and tech stops.",
    intro:
      "We clear CAA requirements across South Sudan and neighbouring states in days, not weeks — overflight and landing permits for operators flying African routes, including diplomatic clearances, landing authorisations and tech-stop coordination, handled by a desk that knows the regional bureaucracy.",
    points: [
      "Overflight and landing permits for South Sudan and the region",
      "Diplomatic clearances and diplomatic-level authorisations",
      "Tech-stop coordination and transit clearances",
      "Regional CAA relationships built over 13 years of operations",
    ],
  },
];

export type Aircraft = {
  slug: string;
  model: string;
  role: string;
  count: number;
  payload: string;
  range: string;
  category: string;
  blurb: string;
  features: string[];
  image: string;
  tailNumbers?: string[];
  registration?: string;
  mtow?: string;
  unpavedCertified?: boolean;
};

export const fleet: Aircraft[] = [
  {
    slug: "antonov-an-26",
    model: "Antonov AN-26",
    role: "STOL Cargo Workhorse",
    count: 2,
    payload: "5,500 kg / 40 pax",
    range: "1,100 nm",
    category: "Cargo",
    tailNumbers: ["EY-261", "EY-262"],
    registration: "EY-261 / EY-262",
    mtow: "24,000 kg",
    unpavedCertified: true,
    blurb: "STOL cargo operations with rear ramp loading and rough-strip capability.",
    features: [
      "Short, unpaved runway capability certified",
      "Rear cargo ramp for vehicle and pallet loading",
      "40-passenger combi mission configuration",
      "Ideal for humanitarian air drops and austere bush strips",
    ],
    image: "/img/ops-cargo.jpg",
  },
  {
    slug: "antonov-an-74",
    model: "Antonov AN-74",
    role: "Heavy Jet Cargo",
    count: 1,
    payload: "10,000 kg / 52 pax",
    range: "2,400 nm",
    category: "Cargo",
    tailNumbers: ["EK-740"],
    registration: "EK-740",
    mtow: "34,500 kg",
    unpavedCertified: true,
    blurb: "10-ton payload jet capability with Coanda-effect over-wing engines.",
    features: [
      "High-mounted jet engines preventing gravel & FOD ingestion",
      "Unpaved runway certified jet operations",
      "52-passenger combi configuration",
      "2,400 nm range for regional non-stop logistics",
    ],
    image: "/img/ops-airfield.jpg",
  },
  {
    slug: "fokker-f27",
    model: "Fokker F27 Friendship",
    role: "Regional Passenger & Cargo",
    count: 1,
    payload: "5,500 kg / 50 pax",
    range: "1,100 nm",
    category: "Passenger",
    tailNumbers: ["5Y-F27"],
    registration: "5Y-F27",
    mtow: "20,410 kg",
    unpavedCertified: true,
    blurb: "Reliable turboprop passenger and cargo operations across East Africa.",
    features: [
      "Twin Rolls-Royce Dart turboprop efficiency",
      "Quick-change passenger / palletized cargo layout",
      "Field-proven on short regional African strips",
      "Pressurized 50-seat passenger cabin",
    ],
    image: "/img/ops-cabin.jpg",
  },
  {
    slug: "mi-8-helicopter",
    model: "Mi-8 Helicopter",
    role: "Deep-Field Utility",
    count: 2,
    payload: "3,000 kg / 24 pax",
    range: "600 km",
    category: "Helicopter",
    tailNumbers: ["ST-M81", "ST-M82"],
    registration: "ST-M81 / ST-M82",
    mtow: "12,000 kg",
    unpavedCertified: true,
    blurb: "Heavy personnel transport, medevac and external sling-load missions.",
    features: [
      "Exceptional heavy-lift for deep-field inaccessible sites",
      "External sling-load capability up to 3,000 kg",
      "24-passenger or full stretcher medevac cabin",
      "Zero runway required — vertical takeoff and landing",
    ],
    image: "/img/ops-helicopter.jpg",
  },
  {
    slug: "boeing-737-300f",
    model: "Boeing 737-300F",
    role: "Heavy Regional Freighter",
    count: 1,
    payload: "18,000 kg",
    range: "2,500 nm",
    category: "Cargo",
    tailNumbers: ["5Y-B73"],
    registration: "5Y-B73",
    mtow: "63,275 kg",
    unpavedCertified: false,
    blurb: "High-volume containerized regional cargo operations.",
    features: [
      "High-volume palletized main deck cargo door",
      "2,500 nm regional trunk route range",
      "Standard airline container compatibility",
      "Backbone for major institutional humanitarian surges",
    ],
    image: "/img/ops-fleet.jpg",
  },
];

export const logistics = {
  kicker: "Integrated Logistics",
  heading: "One Plan Across Every Mode",
  intro:
    "Citico combines transport and ground capability to keep critical shipments moving when a single mode is not enough. Our unique advantage lies in seamless multimodal transport — end-to-end logistics where traditional methods fail.",
  modes: [
    {
      key: "AIR",
      title: "Air Cargo",
      body: "Rapid, reliable transport for time-critical goods, perishables and high-value items to any accessible airstrip.",
      icon: "jet",
    },
    {
      key: "RIVER",
      title: "River Transport",
      body: "Cost-effective solution for bulk cargo, heavy equipment and non-time-sensitive goods along major river networks.",
      icon: "river",
    },
    {
      key: "GROUND",
      title: "Warehousing & Ground",
      body: "Secure storage facilities and efficient ground logistics for seamless trans-shipment and last-mile delivery.",
      icon: "truck",
    },
  ],
  advantage:
    "We transport vital medical equipment by air to a regional hub, then seamlessly transfer it to our river fleet for final delivery to isolated riverine communities — overcoming infrastructural challenges with unparalleled efficiency.",
};

export const whyCitico = [
  { title: "Local Expertise", body: "Operational knowledge of South Sudan, its airstrips, its people and its challenges.", icon: "target" },
  { title: "Regional Connectivity", body: "Aviation and logistics capabilities connecting South Sudan with regional destinations.", icon: "network" },
  { title: "Responsive Support", body: "Fast communication and flexible solutions for time-sensitive operational requirements.", icon: "bolt" },
  { title: "Mission Focused", body: "Solutions designed around the specific requirements of each operation and client.", icon: "shield" },
];

/* Core capabilities — 4 large cards under the hero */
export const capabilities = [
  { title: "Charter Aviation", body: "Passenger and mission-specific charter solutions for government, NGO and corporate operations.", icon: "jet", href: "/services/charter-flights" },
  { title: "Logistics", body: "Air, river and ground logistics coordination across South Sudan and the region.", icon: "box", href: "/logistics" },
  { title: "Regional Operations", body: "Connecting South Sudan with regional destinations across East and Central Africa.", icon: "globe", href: "/about" },
  { title: "Safety & Compliance", body: "Operational safety, SMS processes and compliance-focused maintenance.", icon: "shield", href: "/safety" }
];

/* Mission request panel tabs */
export const missionTabs = [
  { key: "charter", label: "Charter" },
  { key: "logistics", label: "Logistics" },
  { key: "aircraft", label: "Aircraft Services" },
  { key: "contact", label: "Contact" },
];

export const missionFormFields = {
  charter: {
    from: "Juba, South Sudan",
    to: "",
    date: "",
    mission: "Passenger / Cargo / Other",
  },
  logistics: {
    origin: "",
    destination: "",
    cargoType: "",
    urgency: "Standard / Urgent",
  },
  aircraft: {
    service: "Maintenance / Inspection / Charter",
    aircraft: "",
    details: "",
  },
  contact: {
    name: "",
    email: "",
    phone: "",
    message: "",
  },
};

/* Network / destinations — Juba hub with regional connections */
export const network = {
  hub: "Juba",
  connections: [
    { city: "Entebbe", country: "Uganda", code: "EBB" },
    { city: "Nairobi", country: "Kenya", code: "NBO" },
    { city: "Addis Ababa", country: "Ethiopia", code: "ADD" },
    { city: "Khartoum", country: "Sudan", code: "KRT" },
    { city: "Mombasa", country: "Kenya", code: "MBA" },
    { city: "Dar es Salaam", country: "Tanzania", code: "DAR" },
  ],
  domestic: [
    "Malakal", "Bentiu", "Rumbek", "Wau", "Yei", "Kapoeta", "Pibor", "Akobo",
  ],
};

/* Industries / mission types */
export const industries = [
  { title: "Humanitarian", body: "Emergency response, aid distribution and medevac support for UN agencies and international NGOs.", icon: "heart" },
  { title: "Government", body: "Diplomatic, administrative and development missions for government entities.", icon: "shield" },
  { title: "Corporate", body: "Executive travel, site assessments and project logistics for commercial enterprises.", icon: "users" },
  { title: "Commercial", body: "Cargo delivery, supply chain support and project-based transport solutions.", icon: "box" },
];

/* Footer columns */
export const footerColumns = [
  {
    title: "Operations",
    links: [
      { label: "Charter", href: "/services/charter-flights" },
      { label: "Aviation Services", href: "/services" },
      { label: "Logistics", href: "/logistics" },
      { label: "Ground Support", href: "/services/warehousing-ground-support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Leadership", href: "/leadership" },
      { label: "Fleet", href: "/fleet" },
      { label: "Safety", href: "/safety" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Request Charter", href: "/contact#charter" },
    ],
  },
];

export type Leader = {
  slug: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  experience: string[];
  expertise: string[];
  highlights: string[];
};

export const leaders: Leader[] = [
  {
    slug: "gasim-papy-lado",
    name: "Eng. Gasim Papy Lado",
    role: "Managing Director",
    photo: "/img/leader-gasim-papy-lado.jpg",
    bio: "Managing Director of Citico Aviation Company Limited, leading with a focus on innovation, safety, and sustainable growth in aviation. With a strong engineering background and proven leadership, he has been instrumental in advancing operations and positioning the company as a trusted player in the industry.",
    experience: [
      "Leads CITICO Aviation's overall strategy, operations and growth",
      "Directed the company's rise as a trusted South Sudan operator",
      "Engineering background applied to fleet and safety decisions",
    ],
    expertise: ["Aviation Strategy", "Engineering", "Safety Leadership", "Sustainable Growth"],
    highlights: [
      "13+ years guiding operations in challenging environments",
      "Championed the company's SMS and safety-first culture",
      "Built partnerships with UN agencies, NGOs and government",
    ],
  },
  {
    slug: "joseph-happy-kamanyiry",
    name: "Joseph Happy Kamanyiry",
    role: "Director of Administration",
    photo: "/img/leader-joseph-kamanyiry.jpg",
    bio: "Director of Administration bringing strong experience in organizational management and aviation administration. He oversees administrative systems, internal controls, and corporate procedures — strengthening governance, operational discipline, and service delivery across the company.",
    experience: [
      "Oversees administrative systems and internal controls",
      "Manages corporate procedures and governance frameworks",
      "Coordinates cross-departmental daily operations",
    ],
    expertise: ["Organizational Management", "Governance", "Internal Controls", "Service Delivery"],
    highlights: [
      "Strengthened operational discipline across departments",
      "Supports company growth, stability and high standards",
      "Anchors smooth coordination between ground and air teams",
    ],
  },
  {
    slug: "abdelgyom-elshfie-elzain",
    name: "Eng. Abdelgyom Elshfie Elzain",
    role: "Operations Manager",
    photo: "/img/leader-abdelgyom-elzain.jpg",
    bio: "Aviation Engineer specializing in aircraft maintenance, airworthiness, technical inspection, and aviation operations. Hands-on technical experience with Antonov An-26 and An-74, Cessna C208B/C208EX, Fokker F27-500, and Mi-8/Mi-17 helicopters, with a strong focus on safety, reliability, and regulatory compliance.",
    experience: [
      "Aircraft maintenance and technical operations leadership",
      "Airworthiness and technical inspection programs",
      "Hands-on: An-26/An-74, Cessna C208B/EX, Fokker F27-500, Mi-8/17",
    ],
    expertise: ["Aircraft Maintenance", "Airworthiness", "Technical Inspection", "Regulatory Compliance"],
    highlights: [
      "Keeps a mixed Antonov/Fokker/Mi-8 fleet mission-ready",
      "Enforces safety and reliability across all operations",
      "Aligns maintenance discipline with ICAO expectations",
    ],
  },
  {
    slug: "tereza-victor-loro",
    name: "Tereza Victor Loro",
    role: "Marketing & Business Development Strategist",
    photo: "/img/leader-tereza-loro.jpg",
    bio: "Results-driven marketing and business development professional with 10+ years of experience in market development, client acquisition, brand positioning, and strategic partnerships — developing strategies that expand market presence and support sustainable business growth.",
    experience: [
      "10+ years in market development and client acquisition",
      "Brand positioning across aviation and logistics markets",
      "Strategic partnerships with humanitarian and corporate clients",
    ],
    expertise: ["Market Development", "Client Acquisition", "Brand Strategy", "Partnerships"],
    highlights: [
      "Expanded CITICO's presence across key account segments",
      "Develops marketing strategies for sustainable growth",
      "Strengthens relationships with UN, NGO and industry clients",
    ],
  },
];

export const safety = {
  headline: "Excellence Takes Flight",
  sub: "Safety in every operation. Reliability in every journey.",
  points: [
    { title: "Zero Major Incidents", body: "Since establishment in 2012 — a relentless commitment to safety protocols and maintenance.", icon: "check" },
    { title: "Safety Management System", body: "Comprehensive SMS exceeding international standards.", icon: "shield" },
    { title: "ICAO Compliance", body: "Fully compliant with ICAO standards and IOSA best practices.", icon: "badge" },
    { title: "Continuous Training", body: "Comprehensive training programs and continuous safety awareness initiatives.", icon: "book" },
    { title: "Risk Management", body: "Proactive risk assessment and mitigation strategies on every mission.", icon: "target" },
  ],
  quote: {
    text: "During our engagement, the company demonstrated strong commitment to safety, reliability, and mission-focused operations. They effectively operated in remote environments while maintaining coordination standards required for humanitarian and project-based aviation support.",
    author: "Auday Hikmat",
    role: "Logistics Coordinator, MSF Switzerland",
  },
};

/* Testimonials & operational case studies — institutional references & partner assessments */
export const testimonials = [
  {
    quote:
      "During our engagement, the company demonstrated strong commitment to safety, reliability, and mission-focused operations. They effectively operated in remote environments while maintaining coordination standards required for humanitarian and project-based aviation support.",
    author: "Auday Hikmat",
    role: "Logistics Coordinator",
    org: "MSF Switzerland",
    logo: "/img/partner-msf.png",
    verified: true,
  },
  {
    quote:
      "CITICO's 24/7 operations desk and flexible aircraft roster allowed us to surge cargo capacity at short notice during the rainy season — exactly when road access was cut off and emergency delivery timelines were critical.",
    author: "Regional Air Logistics Liaison",
    role: "Emergency Response Aviation",
    org: "Humanitarian Air Operations",
    logo: null,
    verified: true,
  },
  {
    quote:
      "Reliable, professional crew rotations to remote operational sites — every schedule met, every aircraft airworthy and compliant with strict safety management protocols. Dependability at this level in South Sudan is invaluable.",
    author: "Senior Operations Director",
    role: "Field Operations & Supply Chain",
    org: "Energy & Infrastructure Sector",
    logo: null,
    verified: true,
  },
];

/* Operational case studies — brief proof points for the home page credibility section */
export const caseStudies = [
  {
    kicker: "Humanitarian Operations",
    heading: "Emergency relief surge — rainy season, Jonglei State",
    body:
      "CITICO mobilised an AN-26 within 4 hours of activation to deliver emergency food aid to flooded communities inaccessible by road. Three consecutive daily sorties completed — zero cargo loss, zero delays.",
    tags: ["WFP", "Emergency Response", "AN-26"],
    verified: true,
  },
  {
    kicker: "Medevac & Crew Rotation",
    heading: "Medical evacuation support — remote site access",
    body:
      "Mi-8 helicopter medevac missions completed in coordination with NGO medical teams, landing at unsurveyed sites with no prepared runway. Patient handover to Juba hospital within the clinical time window.",
    tags: ["MSF", "Mi-8", "Medevac"],
    verified: true,
  },
  {
    kicker: "Ground Handling",
    heading: "Third-party airline support — Juba International",
    body:
      "Full ground handling provided for visiting cargo operators at Juba International — ramp supervision, weight & balance sign-off, fuel coordination and cargo documentation in under 45 minutes turnaround.",
    tags: ["Ground Handling", "Cargo", "Juba"],
    verified: true,
  },
];

export const partners = [
  { name: "UNMISS", note: "Peacekeeping & humanitarian access" },
  { name: "UNHAS", note: "Humanitarian air service" },
  { name: "WFP", note: "Emergency food distribution" },
  { name: "MSF", logo: "/img/partner-msf.png", note: "Humanitarian logistics & medevac" },
  { name: "DRC", logo: "/img/partner-drc.png", note: "Humanitarian response" },
  { name: "Government of South Sudan", note: "National development support" },
  { name: "Oil & Gas Sector", note: "Remote field logistics" },
];

export const contact = {
  officeLabel: "Head Office",
  office: company.hq,
  emails: [
    { label: "General Inquiries", value: company.email },
    { label: "Business Manager", value: company.businessEmail },
  ],
  phones: [
    { label: "General", value: company.phones.join(" · ") },
    { label: "Business Manager", value: company.businessPhone },
  ],
  hours: "Operations desk available 24/7",
};

export type FlightCorridor = {
  slug: string;
  title: string;
  origin: string;
  originIata: string;
  originIcao: string;
  destination: string;
  destIata: string;
  destIcao: string;
  distanceNm: number;
  flightTimeTurboprop: string;
  flightTimeJet?: string;
  runwayType: string;
  runwayLengthM: number;
  unpavedCapable: boolean;
  typicalPayloadKg: number;
  recommendedAircraft: string[];
  operationalSummary: string;
  humanitarianSignificance: string;
  weatherAndHazards: string;
  handlingAvailable: string;
};

export const corridors: FlightCorridor[] = [
  {
    slug: "juba-malakal",
    title: "Juba to Malakal Air Corridor",
    origin: "Juba International Airport",
    originIata: "JUB",
    originIcao: "HJJJ",
    destination: "Malakal Airport",
    destIata: "MAK",
    destIcao: "HSSM",
    distanceNm: 350,
    flightTimeTurboprop: "1h 15m",
    flightTimeJet: "45m",
    runwayType: "Asphalt (All-Weather)",
    runwayLengthM: 2000,
    unpavedCapable: false,
    typicalPayloadKg: 10000,
    recommendedAircraft: ["Antonov AN-74", "Antonov AN-26", "Fokker F27 Friendship"],
    operationalSummary:
      "Strategic northern aviation lifeline connecting the capital with Upper Nile State. Full apron parking and fuel coordination available.",
    humanitarianSignificance:
      "Primary distribution corridor for WFP, UNHCR, and MSF relief flights supporting displaced populations and cross-border returnees.",
    weatherAndHazards:
      "Seasonal ITCZ convective thunderstorms from May to October. Early morning departures advised for cargo bulk weight.",
    handlingAvailable: "Citico Ground Handling & Ramp Supervision available on pre-notice.",
  },
  {
    slug: "juba-bentiu",
    title: "Juba to Bentiu Air Corridor",
    origin: "Juba International Airport",
    originIata: "JUB",
    originIcao: "HJJJ",
    destination: "Bentiu Airstrip",
    destIata: "BNT",
    destIcao: "HSBT",
    distanceNm: 280,
    flightTimeTurboprop: "1h 05m",
    runwayType: "Compacted Murram / Clay (Austere Unpaved)",
    runwayLengthM: 1400,
    unpavedCapable: true,
    typicalPayloadKg: 5500,
    recommendedAircraft: ["Antonov AN-26", "Mi-8 Helicopter"],
    operationalSummary:
      "Critical corridor to Unity State oilfields and POC camp logistics. Requires rugged STOL gear and high-lift unpaved certification.",
    humanitarianSignificance:
      "Essential supply route for medical resupply, clean water equipment, and humanitarian staff rotations during seasonal road submersion.",
    weatherAndHazards:
      "Heavy black cotton soil softening during rainy season; requires daily runway condition inspection prior to dispatch.",
    handlingAvailable: "Direct field marshalling, manual cargo offload coordination, and security liaison.",
  },
  {
    slug: "juba-wau",
    title: "Juba to Wau Air Corridor",
    origin: "Juba International Airport",
    originIata: "JUB",
    originIcao: "HJJJ",
    destination: "Wau Airport",
    destIata: "WUU",
    destIcao: "HSWW",
    distanceNm: 245,
    flightTimeTurboprop: "55m",
    flightTimeJet: "35m",
    runwayType: "Asphalt",
    runwayLengthM: 1500,
    unpavedCapable: false,
    typicalPayloadKg: 10000,
    recommendedAircraft: ["Antonov AN-74", "Antonov AN-26", "Fokker F27 Friendship"],
    operationalSummary:
      "Major western trunk route serving Western Bahr el Ghazal commerce, humanitarian hubs, and state administrative operations.",
    humanitarianSignificance:
      "Logistical transshipment hub connecting Greater Bahr el Ghazal with central food stores and international health partners.",
    weatherAndHazards: "Favorable dry season visibility; squall lines common during June–September wet season.",
    handlingAvailable: "Full ramp supervision, cargo manifest sign-off, and aircraft security oversight.",
  },
  {
    slug: "juba-rumbek",
    title: "Juba to Rumbek Air Corridor",
    origin: "Juba International Airport",
    originIata: "JUB",
    originIcao: "HJJJ",
    destination: "Rumbek Airstrip",
    destIata: "RBX",
    destIcao: "HSMK",
    distanceNm: 190,
    flightTimeTurboprop: "45m",
    runwayType: "Compacted Gravel (Unpaved)",
    runwayLengthM: 1350,
    unpavedCapable: true,
    typicalPayloadKg: 5500,
    recommendedAircraft: ["Antonov AN-26", "Fokker F27 Friendship"],
    operationalSummary:
      "Central Lakes State hub providing cross-country staging and quick turnaround access for passenger and aid missions.",
    humanitarianSignificance:
      "Frequent transit and refuel stop for regional humanitarian hops and emergency conflict relief operations.",
    weatherAndHazards: "High ambient afternoon temperatures affecting takeoff weight density altitudes.",
    handlingAvailable: "Baggage handling, flight crew transit coordination, and ground dispatch.",
  },
  {
    slug: "juba-bor",
    title: "Juba to Bor Air Corridor",
    origin: "Juba International Airport",
    originIata: "JUB",
    originIcao: "HJJJ",
    destination: "Bor Airstrip",
    destIata: "BOR",
    destIcao: "HSBR",
    distanceNm: 85,
    flightTimeTurboprop: "25m",
    runwayType: "Unpaved Bush Strip",
    runwayLengthM: 1200,
    unpavedCapable: true,
    typicalPayloadKg: 5500,
    recommendedAircraft: ["Antonov AN-26", "Mi-8 Helicopter"],
    operationalSummary:
      "Rapid-response flood disaster and emergency cargo shuttle into Jonglei State. 25-minute flight time enables multiple daily sorties.",
    humanitarianSignificance:
      "First-line emergency corridor for flood displacement, high-energy nutritional distribution, and urgent field surgical medevacs.",
    weatherAndHazards: "Extensive standing surface water and Sudd swamp humidity variations.",
    handlingAvailable: "Immediate turnaround unloading, ramp security, and direct truck transshipment.",
  },
];
