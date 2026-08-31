import React from 'react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EmailCapture } from '@/components/site/EmailCapture';

const FAQS = [
  { q: 'Are Sculptiva leggings really squat proof?', a: 'Yes. Every fabric batch is tested to full squat depth under bright studio lighting before it goes into production. If even a hint of light passes through, the batch never ships.' },
  { q: 'How does sizing run?', a: 'True to size with high four-way stretch. If you are between sizes, size down for a more compressive sculpt fit or size up for all-day comfort. Check the size guide on any product page for exact measurements.' },
  { q: 'What is the Buy 2 Get 1 Free offer?', a: 'Add any three leggings to your bag and the lowest-priced pair is free at checkout. Mix colours and styles freely — the discount applies automatically.' },
  { q: 'How long does UK delivery take?', a: 'Orders placed before 2pm ship the same day from our Blackburn warehouse. Standard tracked delivery takes 2–3 working days (£3.95, free over £50). Express next-working-day is £5.95.' },
  { q: 'Do you ship internationally?', a: 'We currently ship across the UK. Europe and US shipping opens later this year — join the community list to be first to know.' },
  { q: 'What is your returns policy?', a: '30 days, no questions asked. Items must be unworn with tags attached. Size exchanges are always free — we cover the return postage.' },
  { q: 'How do I wash my sculpt pieces?', a: 'Cold machine wash inside out, no fabric softener, hang dry. This protects the sculpt knit and keeps the compression strong for years.' },
  { q: 'Can I pay in instalments?', a: 'Yes — Klarna and Clearpay are available at checkout, letting you split your order into interest-free payments.' },
  { q: 'How do I get featured on your socials?', a: 'Tag @sculptiva and #Sculptiva in your training clips and photos. We feature real community members every week — every body, every level, every journey.' },
  { q: 'What does "Confidence Starts Here" mean?', a: "It's our whole reason for existing: helping women feel confident in their own skin. Confidence isn't a size, a trend, or something you earn — it starts with how you feel. We design flattering, comfortable activewear that supports that feeling every day, whether you're training, walking the dog, or just getting started." },
];

export default function FAQ() {
  return (
    <div data-testid="faq-page">
      <section className="mx-auto max-w-3xl px-6 pt-20 md:pt-28 pb-24">
        <Reveal><Overline>Help centre</Overline></Reveal>
        <LineReveal className="mt-4 mb-14" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl" lines={['Questions,', 'Answered']} />
        <Reveal delay={0.2}>
          <Accordion type="single" collapsible data-testid="faq-accordion">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-[#2D2D2D]/10">
                <AccordionTrigger
                  className="text-left font-display text-lg md:text-xl tracking-tight hover:text-[#c98d92] py-6"
                  data-testid={`faq-question-${i}`}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-[#2D2D2D]/60 leading-relaxed pb-6">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>
      <EmailCapture source="faq" />
    </div>
  );
}
