import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle } from '@phosphor-icons/react';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { getOrderStatus, formatPrice } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { track } from '@/components/site/Pixels';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const trackedRef = useRef(false);

  useEffect(() => {
    let attempts = 0;
    let timer;
    const poll = async () => {
      try {
        const data = await getOrderStatus(orderId);
        setStatus(data);
        if (data.payment_status === 'paid') {
          clearCart();
          if (!trackedRef.current) {
            trackedRef.current = true;
            track('Purchase', { value: data.total, currency: data.currency?.toUpperCase() || 'GBP' });
          }
          return;
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'We could not find that order.');
        return;
      }
      attempts += 1;
      if (attempts < 10) {
        timer = setTimeout(poll, 1500);
      }
    };
    poll();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div data-testid="order-confirmation-page" className="min-h-[70vh]">
      <section className="mx-auto max-w-[800px] px-6 md:px-10 pt-20 md:pt-28 pb-24 text-center">
        <Reveal><Overline>Order {orderId}</Overline></Reveal>

        {error && (
          <div className="mt-10">
            <XCircle size={56} weight="fill" className="mx-auto text-red-500" />
            <LineReveal className="mt-6" lineClassName="font-display uppercase tracking-tight text-3xl md:text-5xl" lines={['We hit a snag']} />
            <p className="mt-4 text-[#2D2D2D]/60">{error}</p>
          </div>
        )}

        {!error && status?.payment_status === 'paid' && (
          <div className="mt-10" data-testid="order-confirmation-success">
            <CheckCircle size={56} weight="fill" className="mx-auto text-[#c98d92]" />
            <LineReveal className="mt-6" lineClassName="font-display uppercase tracking-tight text-3xl md:text-5xl" lines={['Thank you for your order']} />
            <p className="mt-4 text-[#2D2D2D]/60">
              A confirmation email is on its way to you. Total charged: <strong>{formatPrice(status.total)}</strong>
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link to="/track-order" className="rounded-full border border-[#2D2D2D] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#2D2D2D] hover:text-[#F7F3F0] transition-colors">
                Track My Order
              </Link>
              <Link to="/shop" className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {!error && status && status.payment_status !== 'paid' && (
          <div className="mt-10" data-testid="order-confirmation-pending">
            <Clock size={56} weight="fill" className="mx-auto text-[#2D2D2D]/40 animate-pulse" />
            <LineReveal className="mt-6" lineClassName="font-display uppercase tracking-tight text-3xl md:text-5xl" lines={['Confirming your payment']} />
            <p className="mt-4 text-[#2D2D2D]/60">This usually takes a few seconds — hang tight.</p>
          </div>
        )}

        {!error && !status && (
          <div className="mt-10">
            <Clock size={56} weight="fill" className="mx-auto text-[#2D2D2D]/40 animate-pulse" />
            <p className="mt-6 text-[#2D2D2D]/60">Loading your order…</p>
          </div>
        )}
      </section>
    </div>
  );
}
