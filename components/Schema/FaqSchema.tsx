import { JsonLd } from "./JsonLd";

type Faq = { q: string; a: string };

export function FaqSchema({ id, faqs }: { id: string; faqs: ReadonlyArray<Faq> }) {
  if (faqs.length === 0) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
  return <JsonLd id={id} data={data} />;
}
