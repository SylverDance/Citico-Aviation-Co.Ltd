import { company } from "@/lib/content";

export function AviationOrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["AviationService", "LocalBusiness", "Organization"],
        "@id": `${company.siteUrl}/#organization`,
        name: company.name,
        alternateName: company.shortName,
        url: company.siteUrl,
        logo: `${company.siteUrl}/img/brand-logo.png`,
        image: `${company.siteUrl}/img/og.jpg`,
        description:
          "Certified South Sudan aviation operator providing cargo charter, passenger flights, humanitarian relief logistics, and aircraft services across East Africa.",
        telephone: company.phones[0],
        email: company.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Montana Building, Airport Road",
          addressLocality: "Juba",
          addressCountry: "SS",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 4.865,
          longitude: 31.585,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
        ],
        sameAs: [
          company.social.facebook,
          company.social.youtube,
          company.social.linkedin,
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Citico Aviation & Logistics Services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Cargo Charter & Humanitarian Airlift",
                description:
                  "AN-26, AN-74, and B737-300F heavy cargo flights to austere and unpaved airstrips.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Deep-Field Helicopter Missions",
                description:
                  "Mi-8 utility and heavy sling-load operations up to 3,000 kg.",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Overflight & Landing Clearances",
                description: "CAA flight permit dispatch across South Sudan and East Africa.",
              },
            },
          ],
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
