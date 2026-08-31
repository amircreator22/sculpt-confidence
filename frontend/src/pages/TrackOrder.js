import React, { useState } from 'react';
import { Package, MagnifyingGlass, EnvelopeSimple, ArrowSquareOut } from '@phosphor-icons/react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { trackOrder } from '@/lib/api';

const STATUS_LABELS = {
  fulfilled: 'Shipped — on its way to you',
  partial: 'Partially shipped',
  processing: 'Confirmed — being prepared',
  restocked: 'Returned',
};

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await trackOrder(orderNumber, email);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="track-order-page" className="min-h-[70vh]">
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-20 md:pt-28 pb-24">
        <Reveal><Overline>Your order</Overline></Reveal>
        <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-5xl md:text-7xl leading-[1.0]" lines={['Track My Order']} />
        <Reveal delay={0.25}>
          <p className="mt-6 max-w-lg text-[#2D2D2D]/70 leading-relaxed">
            Enter the order number from your confirmation email and the email you ordered with, and we'll show you exactly where your Sculptiva pieces are.
          </p>
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2 gap-10 md:gap-16">
          <Reveal delay={0.3}>
            <form onSubmit={submit} className="bg-white border border-[#2D2D2D]/10 p-8 md:p-10" data-testid="track-order-form">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/60">Order number</label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. 1001 or #1001"
                required
                data-testid="track-order-number-input"
                className="mt-2 w-full border border-[#2D2D2D]/15 bg-transparent px-4 py-3.5 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors"
              />
              <label className="mt-6 block text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/60">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                data-testid="track-order-email-input"
                className="mt-2 w-full border border-[#2D2D2D]/15 bg-transparent px-4 py-3.5 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="track-order-submit-button"
                className="mt-8 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 inline-flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <MagnifyingGlass size={16} weight="bold" />
                {loading ? 'Checking…' : 'Track Order'}
              </button>
              {error && <p className="mt-4 text-sm text-red-600" data-testid="track-order-error">{error}</p>}
            </form>
          </Reveal>

          <div>
            {result?.found && (
              <Reveal>
                <div className="bg-[#2D2D2D] text-[#F7F3F0] p-8 md:p-10" data-testid="track-order-result">
                  <div className="flex items-center gap-3">
                    <span className="h-10 w-10 rounded-full bg-[#E8B4B8]/20 flex items-center justify-center">
                      <Package size={18} weight="bold" className="text-[#E8B4B8]" />
                    </span>
                    <div>
                      <p className="font-display uppercase tracking-tight text-2xl">Order {result.order.name}</p>
                      <p className="text-xs text-[#F7F3F0]/50">Placed {new Date(result.order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <p className="mt-6 text-sm uppercase tracking-[0.2em] text-[#E8B4B8] font-bold" data-testid="track-order-status">
                    {STATUS_LABELS[result.order.fulfillment_status] || result.order.fulfillment_status}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-[#F7F3F0]/10 pt-4">
                    {result.order.items.map((it, i) => (
                      <li key={i} className="text-sm text-[#F7F3F0]/80 flex justify-between">
                        <span>{it.title}</span><span className="text-[#F7F3F0]/50">× {it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  {result.order.status_url && (
                    <a
                      href={result.order.status_url}
                      target="_blank"
                      rel="noreferrer"
                      data-testid="track-order-status-link"
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#E8B4B8] text-[#2D2D2D] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#F7F3F0] transition-colors"
                    >
                      View Live Tracking <ArrowSquareOut size={14} weight="bold" />
                    </a>
                  )}
                </div>
              </Reveal>
            )}
            {result && result.available && result.found === false && (
              <Reveal>
                <div className="border border-[#2D2D2D]/10 bg-white p-8" data-testid="track-order-not-found">
                  <p className="font-display uppercase tracking-tight text-xl">We couldn't find that order</p>
                  <p className="mt-3 text-sm text-[#2D2D2D]/60 leading-relaxed">
                    Double-check the order number and make sure the email matches the one you ordered with. Still stuck? We're happy to help at hello@sculptiva.co.uk.
                  </p>
                </div>
              </Reveal>
            )}
            {result && result.available === false && (
              <Reveal>
                <div className="border border-[#2D2D2D]/10 bg-white p-8" data-testid="track-order-fallback">
                  <div className="flex items-center gap-3">
                    <EnvelopeSimple size={22} className="text-[#c98d92]" />
                    <p className="font-display uppercase tracking-tight text-xl">Check your confirmation email</p>
                  </div>
                  <p className="mt-3 text-sm text-[#2D2D2D]/60 leading-relaxed">
                    Live tracking lookup isn't switched on yet. Your order confirmation email contains a "View your order" button that takes you straight to real-time tracking. Can't find it? Email us at hello@sculptiva.co.uk with your order number and we'll send your tracking link within 24 hours.
                  </p>
                </div>
              </Reveal>
            )}
            {!result && (
              <Reveal delay={0.4}>
                <div className="border border-[#2D2D2D]/10 p-8">
                  <p className="font-display uppercase tracking-tight text-xl">Good to know</p>
                  <ul className="mt-4 space-y-3 text-sm text-[#2D2D2D]/60 leading-relaxed">
                    <li>Orders are dispatched within 1–2 working days.</li>
                    <li>UK delivery typically takes 2–4 working days after dispatch.</li>
                    <li>Your order number starts with # and is in your confirmation email.</li>
                    <li>Questions? We reply within 24 hours at hello@sculptiva.co.uk.</li>
                  </ul>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
