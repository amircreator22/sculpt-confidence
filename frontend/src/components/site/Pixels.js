import { useEffect } from 'react';

export const Pixels = () => {
  useEffect(() => {
    const metaId = process.env.REACT_APP_META_PIXEL_ID;
    const tiktokId = process.env.REACT_APP_TIKTOK_PIXEL_ID;

    if (metaId && !window.fbq) {
      const n = (window.fbq = function (...args) {
        n.callMethod ? n.callMethod(...args) : n.queue.push(args);
      });
      if (!window._fbq) window._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
      window.fbq('init', metaId);
      window.fbq('track', 'PageView');
    }

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
