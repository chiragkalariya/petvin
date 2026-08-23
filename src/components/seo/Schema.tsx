import React from "react";

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Petvin Febtech",
    url: "https://petvinfebtech.com",
    logo: "https://petvinfebtech.com/images/logo.png",
    description:
      "Petvin Febtech provides precision fiber laser cutting, CNC bending and custom sheet metal fabrication in Ahmedabad for prototype and production requirements.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-0000000000", // Placeholder, requires real number
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
    name: "Petvin Febtech",
    image: "https://petvinfebtech.com/images/hero-bg.jpg", // Placeholder
    url: "https://petvinfebtech.com",
    telephone: "+91-0000000000", // Placeholder
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.0225, // Ahmedabad center placeholder
      longitude: 72.5714,
    },
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
