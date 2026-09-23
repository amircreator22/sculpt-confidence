import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { LockSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { LineReveal, Overline, Reveal } from '@/components/site/Reveal';
import { useCart } from '@/context/CartContext';
import { createCheckout, formatPrice } from '@/lib/api';
import { track } from '@/components/site/Pixels';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const inputCls =
  'w-full bg-white border border-[#2D2D2D]/15 px-4 py-3.5 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors';
const labelCls = 'block text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/60';

const PaymentStep = ({ orderId, email, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/${orderId}`,
        receipt_email: email,
      },
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message || 'Payment failed — please check your details and try again.');
      setSubmitting(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaid();
    } else {
      // Some payment methods require a redirect; Stripe will have already
      // navigated away in that case, so this branch rarely runs.
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="submit"
        disabled={!stripe || submitting}
        data-testid="checkout-pay-button"
        className="mt-6 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <LockSimple size={16} weight="bold" />
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('sculptiva_email') || '');
  const [address, setAddress] = useState({ name: '', line1: '', line2: '', city: '', postal_code: '', country: 'GB' });
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (items.length === 0 && !clientSecret) {
      navigate('/shop');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPayment = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      localStorage.setItem('sculptiva_email', email);
      const res = await createCheckout(items, email, address);
      setClientSecret(res.client_secret);
      setOrderId(res.order_id);
      setTotals({ subtotal: res.subtotal, shipping: res.shipping, total: res.total });
      track('AddPaymentInfo', { value: res.total, currency: 'GBP' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong — please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaid = () => {
    clearCart();
    navigate(`/order-confirmation/${orderId}`);
  };

  const elementsOptions = useMemo(
    () => (clientSecret ? { clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#2D2D2D' } } } : null),
    [clientSecret]
  );

  return (
    <div data-testid="checkout-page" className="min-h-[70vh]">
      <section className="mx-auto max-w-[1200px] px-6 md:px-10 pt-16 md:pt-24 pb-24">
        <Reveal><Overline>Checkout</Overline></Reveal>
        <LineReveal className="mt-4" lineClassName="font-display uppercase tracking-tight text-4xl md:text-6xl leading-[1.0]" lines={['Secure Checkout']} />

        <div className="mt-12 grid lg:grid-cols-[1fr_400px] gap-12">
          <div>
            {!clientSecret ? (
              <form onSubmit={startPayment} className="bg-white border border-[#2D2D2D]/10 p-6 md:p-8" data-testid="checkout-details-form">
                <p className="font-display uppercase tracking-tight text-xl mb-6">Contact & Shipping</p>
                <div className="grid gap-5">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`mt-2 ${inputCls}`} data-testid="checkout-email-input" />
                  </div>
                  <div>
                    <label className={labelCls}>Full name</label>
                    <input required value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-name-input" />
                  </div>
                  <div>
                    <label className={labelCls}>Address line 1</label>
                    <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-line1-input" />
                  </div>
                  <div>
                    <label className={labelCls}>Address line 2 (optional)</label>
                    <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-line2-input" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelCls}>City</label>
                      <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-city-input" />
                    </div>
                    <div>
                      <label className={labelCls}>Postcode</label>
                      <input required value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-postcode-input" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className={`mt-2 ${inputCls}`} data-testid="checkout-country-select">
                      <option value="GB">United Kingdom</option>
                      <option value="IE">Ireland</option>
                      <option value="US">United States</option>
                      <option value="FR">France</option>
                      <option value="DE">Germany</option>
                    </select>
                  </div>
                </div>
                {error && <p className="mt-4 text-sm text-red-600" data-testid="checkout-error">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !stripePromise}
                  data-testid="checkout-continue-button"
                  className="mt-8 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 disabled:opacity-60"
                >
                  {loading ? 'Preparing…' : 'Continue to Payment'}
                </button>
                {!stripePromise && (
                  <p className="mt-4 text-xs text-red-600">Payments aren't configured yet — missing REACT_APP_STRIPE_PUBLISHABLE_KEY.</p>
                )}
              </form>
            ) : (
              <div className="bg-white border border-[#2D2D2D]/10 p-6 md:p-8" data-testid="checkout-payment-form">
                <p className="font-display uppercase tracking-tight text-xl mb-6">Payment</p>
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <PaymentStep orderId={orderId} email={email} onPaid={handlePaid} />
                </Elements>
              </div>
            )}
          </div>

          <div className="bg-[#2D2D2D] text-[#F7F3F0] p-6 md:p-8 h-fit" data-testid="checkout-summary">
            <p className="font-display uppercase tracking-tight text-xl mb-6">Order Summary</p>
            <ul className="space-y-3 border-b border-[#F7F3F0]/10 pb-4">
              {items.map((item) => (
                <li key={item.key} className="flex justify-between text-sm">
                  <span className="text-[#F7F3F0]/80">
                    {item.title} {item.colour ? `· ${item.colour}` : ''} · {item.size} × {item.qty}
                  </span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#F7F3F0]/70">
                <span>Subtotal</span>
                <span>{formatPrice(totals ? totals.subtotal : subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#F7F3F0]/70">
                <span>Shipping</span>
                <span>{totals ? (totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)) : 'Calculated next step'}</span>
              </div>
              <div className="flex justify-between font-display text-lg pt-2 border-t border-[#F7F3F0]/10">
                <span>Total</span>
                <span data-testid="checkout-total">{formatPrice(totals ? totals.total : subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
