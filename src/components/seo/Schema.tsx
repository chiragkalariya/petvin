import React from "react";
import { SITE } from "@/lib/site-content";

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://petvinfebtech.com/#organization",
    name: "Petvin Febtech",
    url: "https://petvinfebtech.com",
    logo: {
      "@type": "ImageObject",
      url: "https://petvinfebtech.com/images/petvin_febtech_updated.svg",
    },
    image: "https://petvinfebtech.com/images/hero_laser_cutting.jpg",
    description:
      "Petvin Febtech provides precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for prototype and production requirements.",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "382430",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi", "gu"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://petvinfebtech.com/#localbusiness",
    name: "Petvin Febtech",
    image: "https://petvinfebtech.com/images/hero_laser_cutting.jpg",
    url: "https://petvinfebtech.com",
    hasMap: SITE.mapUrl,
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "382430",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.0225,
      longitude: 72.5714,
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
        ],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    areaServed: ["Ahmedabad", "Gujarat", "India"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const ServiceSchema = ({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    provider: {
      "@type": "LocalBusiness",
      name: "Petvin Febtech",
      url: "https://petvinfebtech.com",
      telephone: SITE.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address,
        addressLocality: "Ahmedabad",
        addressRegion: "Gujarat",
        postalCode: "382430",
        addressCountry: "IN",
      },
    },
    areaServed: {
      "@type": "City",
      name: "Ahmedabad",
    },
    description: description,
    url: url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const FAQSchema = ({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const BreadcrumbSchema = ({
  items,
}: {
  items: { name: string; url: string }[];
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
