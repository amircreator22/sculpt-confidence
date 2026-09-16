import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Check } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { subscribeNewsletter } from '@/lib/api';
import { track } from '@/components/site/Pixels';

const SEEN_KEY = 'sculptiva_popup_seen';
const EMAIL_KEY = 'sculptiva_email';

export const DiscountPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SEEN_KEY) || localStorage.getItem(EMAIL_KEY)) return;
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(SEEN_KEY, '1');
    setOpen(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await subscribeNewsletter(email, 'popup');
      localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
      localStorage.setItem(SEEN_KEY, '1');
      track('Lead', { content_name: 'popup-15-signup' });
      setCode(res.discount_code || 'SCULPTIVA15');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Please enter a valid email');
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-5 bg-[#2D2D2D]/60 backdrop-blur-sm"
          data-testid="discount-popup-overlay"
          onClick={dismiss}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm bg-[#F7F3F0] overflow-hidden"
            data-testid="discount-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              data-testid="discount-popup-close"
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-[#2D2D2D]/10 flex items-center justify-center text-[#2D2D2D] hover:bg-[#2D2D2D]/20 transition-colors"
            >
              <X size={16} weight="bold" />
            </button>
            <div className="bg-[#E8B4B8] px-8 pt-10 pb-8 text-center">
              <p className="font-display font-semibold uppercase tracking-tight text-2xl text-[#2D2D2D]">
                Sculpt<span className="text-[#F7F3F0]">iva</span>
              </p>
              <p className="mt-4 font-display uppercase tracking-tight text-4xl text-[#2D2D2D] leading-none">15% Off</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/70">Your first order</p>
            </div>
            <div className="px-8 py-8">
              {!code ? (
                <>
                  <p className="text-sm text-[#2D2D2D]/70 text-center leading-relaxed">
                    Join the community and get 15% off — plus early access to new drops.
                  </p>
                  <form onSubmit={submit} className="mt-5">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email address"
                      data-testid="discount-popup-email-input"
                      className="w-full border border-[#2D2D2D]/20 bg-white px-4 py-3.5 text-sm focus:outline-none focus:border-[#E8B4B8] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      data-testid="discount-popup-submit"
                      className="mt-3 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#c98d92] transition-colors disabled:opacity-50"
                    >
                      {loading ? 'One sec…' : 'Claim 15% Off'}
                    </button>
                  </form>
                  <button onClick={dismiss} data-testid="discount-popup-no-thanks" className="mt-4 w-full text-center text-xs text-[#2D2D2D]/40 underline hover:text-[#2D2D2D]/70 transition-colors">
                    No thanks, I'll pay full price
                  </button>
                </>
              ) : (
                <div className="text-center" data-testid="discount-popup-success">
                  <p className="text-sm text-[#2D2D2D]/70">You're in! Use this code at checkout:</p>
                  <button
                    onClick={copy}
                    data-testid="discount-popup-code"
                    className="mt-4 inline-flex items-center gap-3 border-2 border-dashed border-[#E8B4B8] bg-white px-6 py-3.5 font-display text-2xl tracking-widest text-[#c94f5e] hover:bg-[#FDF1F2] transition-colors"
                  >
                    {code}
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-[#2D2D2D]/40" />}
                  </button>
                  <p className="mt-3 text-xs text-[#2D2D2D]/40">{copied ? 'Copied!' : 'Tap to copy'}</p>
                  <button
                    onClick={dismiss}
                    data-testid="discount-popup-continue"
                    className="mt-5 w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#c98d92] transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
