import React from 'react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';

const CONTENT = {
  'shipping-returns': {
    overline: 'Delivery & returns',
    title: ['Shipping &', 'Returns'],
    sections: [
      { h: 'UK Delivery', body: 'Orders placed before 2pm (Mon–Fri) ship the same day from our Blackburn warehouse. Standard tracked delivery (2–3 working days) costs £3.95 and is free on orders over £50. Express next-working-day delivery is available at checkout for £5.95. You will receive tracking by email as soon as your order leaves us.' },
      { h: 'International Delivery', body: 'We currently ship within the United Kingdom only. European and US shipping opens later this year — join the community mailing list to be notified first.' },
      { h: '30-Day Returns', body: 'Changed your mind? You have 30 days from delivery to return unworn items with tags attached for a full refund to your original payment method. Start a return by emailing hello@confidencesculpt.co.uk with your order number.' },
      { h: 'Free Size Exchanges', body: 'Wrong size? Exchanges are always free. We send your new size immediately and include a prepaid return label for the original pair.' },
      { h: 'Faulty Items', body: 'If something arrives damaged or develops a fault within 6 months, contact us with photos and we will replace or refund it — your choice.' },
    ],
  },
  'privacy-policy': {
    overline: 'Your data, respected',
    title: ['Privacy', 'Policy'],
    sections: [
      { h: 'What We Collect', body: 'We collect the information needed to run your order and your experience: name, email, delivery address, and order history. If you join our community list, we store your email and signup source. Analytics and advertising cookies help us understand how the site is used.' },
      { h: 'How We Use It', body: 'Your data is used to fulfil orders, provide customer support, send marketing you have opted into (with one-click unsubscribe in every email), and improve the site. We never sell your personal data.' },
      { h: 'Third-Party Processors', body: 'We use trusted processors including Shopify (storefront and checkout), Klaviyo (email marketing), and Meta/TikTok pixels (advertising measurement, where enabled). Each processes data under their own privacy terms.' },
      { h: 'Your Rights (UK GDPR)', body: 'You can request access to, correction of, or deletion of your personal data at any time by emailing hello@confidencesculpt.co.uk. We respond within 30 days. You may also complain to the ICO if you believe your data has been mishandled.' },
      { h: 'Cookies', body: 'We use essential cookies for cart and checkout, plus optional analytics and advertising cookies. You can control non-essential cookies through your browser settings.' },
    ],
  },
  'terms-conditions': {
    overline: 'The small print',
    title: ['Terms &', 'Conditions'],
    sections: [
      { h: 'The Basics', body: 'Confidence Sculpt ("we", "us") operates this store. By ordering, you agree to these terms. All prices are in GBP and include UK VAT. We may update these terms; the version at your order date applies.' },
      { h: 'Orders & Payment', body: 'An order is accepted when we dispatch it. Payment is taken at checkout via our secure providers, including Klarna and Clearpay for instalment options. Promotional offers (including Buy 2 Get 1 Free) apply automatically and cannot be combined with other discount codes unless stated.' },
      { h: 'Discount Codes', body: 'The CONFIDENCE10 community code gives 10% off your first order, one use per customer, excluding bundle offers. Codes have no cash value.' },
      { h: 'Product Information', body: 'We work hard to photograph colours accurately, but screens vary. If a product arrives and is not what you expected, our 30-day returns policy applies.' },
      { h: 'Liability', body: 'Nothing in these terms limits your statutory rights under UK consumer law. Our liability for any order is limited to the amount you paid for it.' },
      { h: 'Contact', body: 'Confidence Sculpt, Blackburn, United Kingdom. hello@confidencesculpt.co.uk.' },
    ],
  },
};

export default function Info({ slug }) {
  const page = CONTENT[slug] || CONTENT['shipping-returns'];
  return (
    <div data-testid={`info-page-${slug}`}>
      <section className="mx-auto max-w-3xl px-6 pt-20 md:pt-28 pb-24 md:pb-32">
        <Reveal><Overline>{page.overline}</Overline></Reveal>
        <LineReveal className="mt-4 mb-16" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl leading-[1.0]" lines={page.title} />
        <div className="space-y-12">
          {page.sections.map((s, i) => (
            <Reveal key={s.h} delay={0.05 * i}>
              <div className="border-t border-[#2D2D2D]/10 pt-8" data-testid={`info-section-${i}`}>
                <div className="flex gap-6">
                  <span className="font-display text-2xl text-[#E8B4B8]">0{i + 1}</span>
                  <div>
                    <h2 className="font-display text-2xl tracking-tight">{s.h}</h2>
                    <p className="mt-3 text-sm md:text-base text-[#2D2D2D]/60 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
