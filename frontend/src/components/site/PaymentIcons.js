import React from 'react';

const Badge = ({ label, bg = '#FFFFFF', children }) => (
  <span
    aria-label={label}
    title={label}
    className="inline-flex items-center justify-center h-7 w-11 rounded-[5px] overflow-hidden"
    style={{ background: bg }}
  >
    {children}
  </span>
);

export const PaymentIcons = () => (
  <div className="flex flex-wrap items-center gap-2" data-testid="footer-payment-icons">
    <Badge label="Visa">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="19" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" fontStyle="italic" fill="#1A1F71">VISA</text>
      </svg>
    </Badge>
    <Badge label="Mastercard" bg="#F6F6F6">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <circle cx="18" cy="14" r="8" fill="#EB001B" />
        <circle cx="26" cy="14" r="8" fill="#F79E1B" fillOpacity="0.9" />
      </svg>
    </Badge>
    <Badge label="American Express" bg="#2E77BC">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="800" fill="#FFFFFF">AMEX</text>
      </svg>
    </Badge>
    <Badge label="PayPal">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="800" fontStyle="italic">
          <tspan fill="#003087">Pay</tspan><tspan fill="#009CDE">Pal</tspan>
        </text>
      </svg>
    </Badge>
    <Badge label="Apple Pay">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" fill="#000000">Pay</text>
        <path d="M15.7 9.6c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-1zm.7 1.2c-1.1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.7 1.7-1.2 2-.3 5 .8 6.6.5.8 1.2 1.7 2 1.7.8 0 1.1-.5 2.1-.5s1.3.5 2.2.5c.9 0 1.5-.8 2-1.6.6-.9.9-1.8.9-1.9 0 0-1.7-.7-1.7-2.6 0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.5-2.3-1.5z" fill="#000" transform="translate(-3.5 0) scale(0.62)" />
      </svg>
    </Badge>
    <Badge label="Google Pay">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700">
          <tspan fill="#4285F4">G</tspan><tspan fill="#5F6368"> Pay</tspan>
        </text>
      </svg>
    </Badge>
    <Badge label="Klarna" bg="#FFB3C7">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="8.5" fontWeight="800" fill="#17120F">Klarna.</text>
      </svg>
    </Badge>
    <Badge label="Clearpay" bg="#B2FCE4">
      <svg viewBox="0 0 44 28" className="h-full w-full">
        <text x="22" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7.5" fontWeight="800" fill="#17120F">clearpay</text>
      </svg>
    </Badge>
  </div>
);
