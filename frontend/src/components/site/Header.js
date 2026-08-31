import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { List, ShoppingBag, X } from '@phosphor-icons/react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useCart } from '../../context/CartContext';

const NAV = [
  { to: '/shop', label: 'Shop All' },
  { to: '/collections/leggings', label: 'Leggings' },
  { to: '/collections/sports-bras', label: 'Sports Bras' },
  { to: '/collections/sculpt-shorts', label: 'Sculpt Shorts' },
  { to: '/about', label: 'About' },
];

export const Header = () => {
  const { count, setDrawerOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-[#2D2D2D] text-[#F7F3F0] text-center text-[11px] font-semibold uppercase tracking-[0.25em] py-2.5 px-4" data-testid="announcement-bar">
        Free UK shipping over £50 &nbsp;·&nbsp; Buy 2 leggings, get 1 free
      </div>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#F7F3F0]/80 border-b border-[#2D2D2D]/10" data-testid="site-header">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
          <nav className="hidden lg:flex items-center gap-6" data-testid="desktop-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.15em] transition-colors duration-300 hover:text-[#c98d92] ${
                    isActive ? 'text-[#c98d92]' : 'text-[#2D2D2D]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button aria-label="Open menu" data-testid="mobile-menu-button" className="p-2 -ml-2 text-[#2D2D2D] hover:text-[#c98d92] transition-colors">
                  <List size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#F7F3F0] border-r border-[#2D2D2D]/10 w-[85vw] max-w-sm p-0" data-testid="mobile-menu">
                <div className="flex items-center justify-between px-6 h-16 border-b border-[#2D2D2D]/10">
                  <span className="font-display uppercase tracking-tight text-lg">Menu</span>
                  <button aria-label="Close menu" data-testid="mobile-menu-close" onClick={() => setMobileOpen(false)} className="p-2">
                    <X size={20} />
                  </button>
                </div>
                <nav className="flex flex-col px-6 py-8 gap-6">
                  {[...NAV, { to: '/faq', label: 'FAQ' }, { to: '/contact', label: 'Contact' }].map((item) => (
                    <button
                      key={item.to}
                      data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => { setMobileOpen(false); navigate(item.to); }}
                      className="text-left font-display uppercase text-3xl tracking-tight text-[#2D2D2D] hover:text-[#c98d92] transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="justify-self-center text-center" data-testid="logo-link">
            <span className="font-display font-semibold uppercase tracking-tight text-xl md:text-2xl leading-none text-[#2D2D2D]">
              Sculpt<span className="text-[#E8B4B8]">iva</span>
            </span>
          </Link>
          <div className="justify-self-end flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              data-testid="cart-open-button"
              aria-label="Open bag"
              className="relative p-2 text-[#2D2D2D] hover:text-[#c98d92] transition-colors"
            >
              <ShoppingBag size={24} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-[#E8B4B8] text-[#2D2D2D] text-[10px] font-bold flex items-center justify-center" data-testid="cart-count-badge">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
