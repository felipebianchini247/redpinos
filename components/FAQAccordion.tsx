'use client';
import React, { useState } from 'react';
import type { FaqItem } from '@/lib/content';

export default function FAQAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <dl className="accordion">
      {faqs.map(({ q, a }, i) => (
        <React.Fragment key={q}>
          <dt>
            <a
              href="#"
              className={openIndex === i ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                setOpenIndex(openIndex === i ? null : i);
              }}
            >
              {q}
            </a>
          </dt>
          <dd style={{ display: openIndex === i ? 'block' : 'none' }}>{a}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
