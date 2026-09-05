import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash, Truck, LockSimple } from '@phosphor-icons/react';
import { Sheet, SheetContent } from '../ui/sheet';
import { toast } from 'sonner';
import { useCart } from '../../context/CartContext';
import { createCheckout, formatPrice } from '../../lib/api';
import { track } from './Pixels';

const FREE_SHIPPING_THRESHOLD = 50;

export const CartDrawer = () => {
  const { items, drawerOpen, setDrawerOpen, updateQty, removeItem, subtotal, count } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const checkout = async () => {
    setCheckingOut(true);
    track('InitiateCheckout', { value: subtotal, currency: 'GBP', num_items: count });
    try {
      const res = await createCheckout(items.map((i) => ({ variant_id: i.variant_id, quantity: i.qty })));
      if (res.url) {
        window.location.href = res.url;
      } else {
        toast.info('Demo checkout — live Shopify checkout activates automatically once your store products are connected.');
      }
    } catch {
      toast.error('Checkout unavailable right now — please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-[#F7F3F0] border-l border-[#2D2D2D]/10 p-0 flex flex-col shadow-[0_20px_40px_rgba(45,45,45,0.08)]"
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#2D2D2D]/10">
          <p className="font-display uppercase tracking-tight text-xl">Your Bag</p>
          <button onClick={() => setDrawerOpen(false)} data-testid="cart-close-button" aria-label="Close bag" className="mr-10 text-xs font-bold uppercase tracking-[0.2em] text-[#2D2D2D]/60 hover:text-[#2D2D2D] transition-colors">
            Close
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[#2D2D2D]/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2D2D2D]/70">
            <Truck size={16} className="text-[#c98d92]" />
            {remaining > 0 ? (
              <span data-testid="shipping-progress-text">You're {formatPrice(remaining)} away from free UK shipping</span>
            ) : (
              <span data-testid="shipping-progress-text" className="text-[#c98d92]">Free UK shipping unlocked</span>
            )}
          </div>
          <div className="mt-2 h-1 bg-[#2D2D2D]/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#E8B4B8] transition-all duration-700" style={{ width: `${progress}%` }} data-testid="shipping-progress-bar" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <p className="font-display text-2xl uppercase tracking-tight text-[#2D2D2D]/60">Your bag is empty</p>
              <button
                onClick={() => { setDrawerOpen(false); navigate('/shop'); }}
                data-testid="cart-empty-shop-button"
                className="rounded-full bg-[#2D2D2D] text-[#F7F3F0] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors"
              >
                Shop Best Sellers
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#2D2D2D]/10">
              {items.map((item) => (
                <li key={item.key} className="py-5 flex gap-4" data-testid={`cart-item-${item.key}`}>
                  <div className="h-24 w-20 shrink-0 overflow-hidden bg-white">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base leading-tight">{item.title}</p>
                    <p className="mt-1 text-xs text-[#2D2D2D]/50 uppercase tracking-wider">{item.colour ? `${item.colour} · ` : ''}Size {item.size}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#2D2D2D]/15 rounded-full">
                        <button onClick={() => updateQty(item.key, item.qty - 1)} data-testid={`cart-qty-minus-${item.key}`} aria-label="Decrease quantity" className="p-2 hover:text-[#c98d92] transition-colors">
                          <Minus size={12} weight="bold" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold" data-testid={`cart-qty-${item.key}`}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty + 1)} data-testid={`cart-qty-plus-${item.key}`} aria-label="Increase quantity" className="p-2 hover:text-[#c98d92] transition-colors">
                          <Plus size={12} weight="bold" />
                        </button>
                      </div>
                      <p className="font-semibold text-sm">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.key)} data-testid={`cart-remove-${item.key}`} aria-label={`Remove ${item.title}`} className="self-start p-1 text-[#2D2D2D]/40 hover:text-[#c98d92] transition-colors">
                    <Trash size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[#2D2D2D]/10 px-6 py-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[#2D2D2D]/60">Subtotal</span>
              <span className="font-display text-2xl" data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={checkingOut}
              data-testid="cart-checkout-button"
              className="w-full rounded-full bg-[#2D2D2D] text-[#F7F3F0] py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <LockSimple size={16} weight="bold" />
              {checkingOut ? 'Preparing checkout…' : 'Secure Checkout'}
            </button>
            <p className="mt-3 text-center text-[11px] text-[#2D2D2D]/40">Klarna · Clearpay · PayPal available at checkout</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
