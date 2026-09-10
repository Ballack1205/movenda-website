// JSON-LD builders. Kept separate from components so both Astro pages and
// (later) any API routes can reuse them. See DECISIONS.md for why there is
// no AggregateRating here — reviews are shown as a badge linking to Google,
// not as self-reported schema.
import type { BlogPost, Dienst, Faq, Locatie, Teamlid } from "./content";

const SITE_URL = "https://movenda-preview.onrender.com";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Movenda",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo-square.png`,
  };
}

export function localBusinessSchema(locatie: Locatie) {
  const type = locatie.brand === "mpc" ? "SportsActivityLocation" : "MedicalBusiness";
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: locatie.naam,
    address: {
      "@type": "PostalAddress",
      streetAddress: locatie.adres,
      addressCountry: "BE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: locatie.geo.lat,
      longitude: locatie.geo.lng,
    },
    telephone: locatie.telefoon,
    email: locatie.email,
    url: `${SITE_URL}/locaties/${locatie.slug}`,
    openingHoursSpecification: locatie.uren.map((u) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: u.dag,
      opens: u.van,
      closes: u.tot,
    })),
  };
}

export function personSchema(teamlid: Teamlid) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${teamlid.voornaam} ${teamlid.naam}`,
    jobTitle: teamlid.rol,
    email: teamlid.email,
    url: `${SITE_URL}/team/${teamlid.slug}`,
    worksFor: { "@type": "Organization", name: "Movenda" },
  };
}

export function serviceSchema(dienst: Dienst, locatie: Locatie) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: dienst.titel,
    description: dienst.seoDescription,
    provider: { "@type": "Organization", name: locatie.naam },
    areaServed: "Hasselt",
    url: `${SITE_URL}/mpc/${dienst.slug}`,
  };
}

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.vraag,
      acceptedAnswer: { "@type": "Answer", text: faq.antwoord },
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titel,
    description: post.excerpt,
    datePublished: post.publicatiedatum,
    image: post.cover,
    author: post.auteurNaam ? { "@type": "Person", name: post.auteurNaam } : undefined,
    publisher: { "@type": "Organization", name: "Movenda" },
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
