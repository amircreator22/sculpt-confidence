import { useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CartDrawer } from '@/components/site/CartDrawer';
import { Pixels } from '@/components/site/Pixels';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import Collection from '@/pages/Collection';
import ProductPage from '@/pages/ProductPage';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Info from '@/pages/Info';
import SculptFlex from '@/pages/SculptFlex';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
};

const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    window.__lenis = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);
};

const Shell = () => {
  useLenis();
  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#2D2D2D]">
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections/:handle" element={<Collection />} />
          <Route path="/products/:handle" element={<ProductPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/sculptflex" element={<SculptFlex />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/shipping-returns" element={<Info slug="shipping-returns" />} />
          <Route path="/privacy-policy" element={<Info slug="privacy-policy" />} />
          <Route path="/terms-conditions" element={<Info slug="terms-conditions" />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#2D2D2D', color: '#F7F3F0', border: '1px solid rgba(232,180,184,0.4)', borderRadius: '9999px' } }} />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Pixels />
        <Shell />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
