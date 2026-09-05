import React from 'react';
import { Link } from 'react-router-dom';
import { InstagramLogo, TiktokLogo } from '@phosphor-icons/react';
import { EmailCapture } from './EmailCapture';
import { PaymentIcons } from './PaymentIcons';

const SHOP_LINKS = [
  { to: '/shop', label: 'Shop All' },
  { to: '/collections/leggings', label: 'Leggings' },
  { to: '/collections/sports-bras', label: 'Sports Bras' },
  { to: '/collections/sculpt-shorts', label: 'Sculpt Shorts' },
];

const HELP_LINKS = [
  { to: '/track-order', label: 'Track My Order' },
  { to: '/faq', label: 'FAQ' },
  { to: '/shipping-returns', label: 'Shipping & Returns' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/about', label: 'About Us' },
];

const LEGAL_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-conditions', label: 'Terms & Conditions' },
];

export const Footer = () => (
  <footer className="bg-[#2D2D2D] text-[#F7F3F0]" data-testid="site-footer">
    <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24 grid gap-12 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="font-display font-semibold uppercase tracking-tight text-2xl">
          Sculpt<span className="text-[#E8B4B8]">iva</span>
        </p>
        <p className="mt-3 font-display uppercase tracking-tight text-lg text-[#E8B4B8]" data-testid="footer-tagline">Move with Confidence.</p>
        <p className="mt-3 text-sm text-[#F7F3F0]/60 max-w-sm leading-relaxed">
          Activewear designed to help every woman feel comfortable, supported and confident from the moment she puts it on — at the gym and in everyday life.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <a href="https://www.instagram.com/sculptivaofficial" target="_blank" rel="noreferrer" aria-label="Instagram" data-testid="footer-instagram"
            className="h-10 w-10 rounded-full border border-[#F7F3F0]/20 flex items-center justify-center hover:bg-[#E8B4B8] hover:text-[#2D2D2D] hover:border-[#E8B4B8] transition-colors">
            <InstagramLogo size={18} />
          </a>
          <a href="https://www.tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" data-testid="footer-tiktok"
            className="h-10 w-10 rounded-full border border-[#F7F3F0]/20 flex items-center justify-center hover:bg-[#E8B4B8] hover:text-[#2D2D2D] hover:border-[#E8B4B8] transition-colors">
            <TiktokLogo size={18} />
          </a>
          <a href="https://www.instagram.com/sculptivaofficial" target="_blank" rel="noreferrer" data-testid="footer-instagram-handle"
            className="text-sm text-[#F7F3F0]/70 hover:text-[#E8B4B8] transition-colors">
            @sculptivaofficial
          </a>
        </div>
        <div className="mt-8 max-w-sm">
          <EmailCapture compact source="footer" />
        </div>
      </div>
      <div className="md:col-span-2 md:col-start-7">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8B4B8]">Shop</p>
        <ul className="mt-5 space-y-3">
          {SHOP_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} data-testid={`footer-shop-${l.label.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-[#F7F3F0]/70 hover:text-[#E8B4B8] transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8B4B8]">Help</p>
        <ul className="mt-5 space-y-3">
          {HELP_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} data-testid={`footer-help-${l.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`} className="text-sm text-[#F7F3F0]/70 hover:text-[#E8B4B8] transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="md:col-span-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#E8B4B8]">Legal</p>
        <ul className="mt-5 space-y-3">
          {LEGAL_LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} data-testid={`footer-legal-${l.label.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '')}`} className="text-sm text-[#F7F3F0]/70 hover:text-[#E8B4B8] transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="border-t border-[#F7F3F0]/10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#F7F3F0]/40">
        <p>© 2026 Sculptiva. All rights reserved.</p>
        <PaymentIcons />
        <p>Designed in the UK. Confidence Starts Here.</p>
      </div>
    </div>
  </footer>
);
