import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CaretLeft, CaretRight, Play, SpeakerHigh, SpeakerSlash, X, MagnifyingGlassPlus } from '@phosphor-icons/react';

export const ColourSwatches = ({ colours, value, onChange, testIdPrefix = 'colour' }) => (
  <div className="flex flex-wrap gap-4" data-testid={`${testIdPrefix}-selector`}>
    {colours.map((c) => {
      const active = value === c.name;
      return (
        <button
          key={c.name}
          onClick={() => onChange(c.name)}
          aria-label={`Select colour ${c.name}`}
          data-testid={`${testIdPrefix}-${c.name.toLowerCase().replace(/\s+/g, '-')}`}
          className="group flex flex-col items-center gap-2"
        >
          <span
            className={`h-12 w-12 rounded-full transition-all duration-300 group-hover:scale-110 ${
              active ? 'ring-2 ring-[#2D2D2D] ring-offset-4 ring-offset-[#F7F3F0] scale-105' : 'ring-1 ring-[#2D2D2D]/15 ring-offset-2 ring-offset-[#F7F3F0]'
            }`}
            style={{ backgroundColor: c.hex }}
          />
          <span className={`text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${active ? 'text-[#2D2D2D]' : 'text-[#2D2D2D]/45 group-hover:text-[#2D2D2D]/75'}`}>
            {c.name}
          </span>
        </button>
      );
    })}
  </div>
);

const VideoSlide = ({ slide, title, active, testId }) => {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, []);

  return (
    <button
      className="absolute inset-0 w-full h-full cursor-pointer"
      onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
      aria-label={muted ? 'Unmute video' : 'Mute video'}
      data-testid={testId}
    >
      <video
        ref={videoRef}
        poster={slide.poster}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={slide.src.replace('.mp4', '.webm')} type="video/webm" />
        <source src={slide.src} type="video/mp4" />
      </video>
      <span className="absolute left-4 bottom-4 z-10 flex items-center gap-2 bg-[#2D2D2D]/60 backdrop-blur-md text-[#F7F3F0] text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-2 rounded-full">
        <Play size={11} weight="fill" className="text-[#E8B4B8]" />
        {slide.label}
      </span>
      <span className="absolute right-4 bottom-4 z-10 h-9 w-9 rounded-full bg-[#2D2D2D]/60 backdrop-blur-md border border-[#F7F3F0]/25 text-[#F7F3F0] flex items-center justify-center">
        {muted ? <SpeakerSlash size={15} /> : <SpeakerHigh size={15} />}
      </span>
    </button>
  );
};

const Lightbox = ({ images, index, onClose, onNav, title }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onNav]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-[#2D2D2D]/95 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
      data-testid="gallery-lightbox"
    >
      <button
        onClick={onClose}
        aria-label="Close lightbox"
        data-testid="lightbox-close"
        className="absolute top-5 right-5 h-11 w-11 rounded-full bg-[#F7F3F0]/10 border border-[#F7F3F0]/25 text-[#F7F3F0] flex items-center justify-center hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors z-10"
      >
        <X size={20} weight="bold" />
      </button>
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            aria-label="Previous image"
            data-testid="lightbox-prev"
            className="absolute left-4 md:left-8 h-12 w-12 rounded-full bg-[#F7F3F0]/10 border border-[#F7F3F0]/25 text-[#F7F3F0] flex items-center justify-center hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors z-10"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            aria-label="Next image"
            data-testid="lightbox-next"
            className="absolute right-4 md:right-8 h-12 w-12 rounded-full bg-[#F7F3F0]/10 border border-[#F7F3F0]/25 text-[#F7F3F0] flex items-center justify-center hover:bg-[#E8B4B8] hover:text-[#2D2D2D] transition-colors z-10"
          >
            <CaretRight size={20} weight="bold" />
          </button>
        </>
      )}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="max-h-[86vh] max-w-[92vw] md:max-w-[70vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={images[index]} alt={title} className="max-h-[86vh] w-auto max-w-full object-contain mx-auto" data-testid="lightbox-image" />
      </motion.div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#F7F3F0]/60 text-xs uppercase tracking-[0.25em]" data-testid="lightbox-counter">
        {index + 1} / {images.length}
      </p>
    </motion.div>
  );
};

export const ProductGallery = ({ images, videos = [], title, galleryKey = 'default', badge }) => {
  const slides = [
    ...videos.map((v) => ({ type: 'video', ...v })),
    ...images.map((src) => ({ type: 'image', src })),
  ];
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);
  const swipeRef = useRef(null);

  useEffect(() => {
    setActive(0);
    if (swipeRef.current) swipeRef.current.scrollTo({ left: 0 });
  }, [galleryKey]);

  const safeActive = Math.min(active, slides.length - 1);
  const slide = slides[safeActive];
  const isVideo = slide?.type === 'video';
  const videoCount = videos.length;

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const onSwipeScroll = () => {
    const el = swipeRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== active) setActive(Math.min(idx, slides.length - 1));
  };

  const nav = (dir) => setActive((a) => {
    const next = a + dir;
    if (next < videoCount) return a;
    return ((next - videoCount + images.length) % images.length) + videoCount;
  });

  return (
    <div data-testid="product-gallery">
      {/* Desktop stage */}
      <div
        className={`relative hidden md:block overflow-hidden bg-white aspect-[4/5] group ${isVideo ? '' : 'cursor-zoom-in'}`}
        onMouseEnter={() => !isVideo && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMouseMove}
        onClick={() => !isVideo && setLightbox(true)}
        data-testid="gallery-stage"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${galleryKey}-${safeActive}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {isVideo ? (
              <VideoSlide slide={slide} title={title} active={safeActive} testId="gallery-video" />
            ) : (
              <motion.img
                src={slide.src}
                alt={`${title} — image ${safeActive - videoCount + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ transformOrigin: origin }}
                animate={{ scale: zoom ? 1.8 : 1 }}
                transition={{ scale: { duration: 0.4 } }}
                data-testid="product-main-image"
              />
            )}
          </motion.div>
        </AnimatePresence>
        {badge}
        {!isVideo && (
          <span className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-[#F7F3F0]/80 backdrop-blur border border-[#2D2D2D]/10 flex items-center justify-center text-[#2D2D2D] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <MagnifyingGlassPlus size={18} />
          </span>
        )}
      </div>

      {/* Mobile swipe stage */}
      <div className="md:hidden">
        <div
          ref={swipeRef}
          onScroll={onSwipeScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
          data-testid="gallery-swipe"
        >
          {slides.map((s, i) => (
            <div key={`${galleryKey}-${i}`} className="relative w-full shrink-0 snap-center aspect-[4/5] overflow-hidden bg-white">
              {s.type === 'video' ? (
                <VideoSlide slide={s} title={title} active={i} testId={`gallery-video-mobile-${i}`} />
              ) : (
                <button onClick={() => setLightbox(true)} className="absolute inset-0" aria-label={`Open image ${i + 1}`}>
                  <img src={s.src} alt={`${title} — image ${i - videoCount + 1}`} loading={i === 0 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover" />
                </button>
              )}
              {i === 0 && badge}
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" data-testid="gallery-dots">
            {slides.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === safeActive ? 'w-6 bg-[#2D2D2D]' : 'w-1.5 bg-[#2D2D2D]/20'}`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail carousel (desktop) */}
      {slides.length > 1 && (
        <div className="mt-3 hidden md:flex gap-3 overflow-x-auto no-scrollbar" data-testid="gallery-thumbs">
          {slides.map((s, i) => (
            <button
              key={`${galleryKey}-thumb-${i}`}
              onClick={() => setActive(i)}
              data-testid={`product-thumb-${i}`}
              aria-label={s.type === 'video' ? `Play video ${i + 1}` : `View image ${i + 1}`}
              className={`relative h-24 w-20 shrink-0 overflow-hidden bg-white transition-all duration-300 ${i === safeActive ? 'ring-2 ring-[#2D2D2D]' : 'opacity-55 hover:opacity-100'}`}
            >
              <img src={s.type === 'video' ? s.poster : s.src} alt={`${title} thumbnail ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
              {s.type === 'video' && (
                <span className="absolute inset-0 flex items-center justify-center bg-[#2D2D2D]/25">
                  <Play size={18} weight="fill" className="text-[#F7F3F0]" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && !isVideo && (
          <Lightbox
            images={images}
            index={Math.max(0, safeActive - videoCount)}
            title={title}
            onClose={() => setLightbox(false)}
            onNav={nav}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
