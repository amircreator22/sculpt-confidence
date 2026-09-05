import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const track = (event, data) => {
  try {
    if (window.fbq) window.fbq('track', event, data);
  } catch {
    /* noop */
  }
};

export const Pixels = () => {
  const { pathname } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    track('PageView');
  }, [pathname]);

  useEffect(() => {
    const tiktokId = process.env.REACT_APP_TIKTOK_PIXEL_ID;
    if (tiktokId && !window.ttq) {
      const ttq = (window.ttq = []);
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = (t, e) => {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      ttq.methods.forEach((m) => ttq.setAndDefer(ttq, m));
      ttq.load = (id) => {
        const s = document.createElement('script');
        s.async = true;
        s.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`;
        document.head.appendChild(s);
      };
      ttq.load(tiktokId);
      ttq.page();
    }
  }, []);

  return null;
};
