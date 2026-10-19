"use client";

/* eslint-disable @next/next/no-img-element -- Testimonial media URLs are runtime-configured backend assets. */

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { resolveBackendAssetUrl } from "@/lib/backend-origin";
import type { PublicTestimonial } from "@/types/public-testimonials";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";

import styles from "./TestimonialsSection.module.css";

type TestimonialsSectionProps = { testimonials: PublicTestimonial[] };

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function TestimonialLightbox({ testimonials, initialIndex, onClose }: { testimonials: PublicTestimonial[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const testimonial = testimonials[index];
  const move = (direction: -1 | 1) => setIndex((current) => (current + direction + testimonials.length) % testimonials.length);

  useEffect(() => {
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (testimonials.length > 1 && event.key === "ArrowRight") setIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
      if (testimonials.length > 1 && event.key === "ArrowLeft") setIndex((current) => (current + 1) % testimonials.length);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [onClose, testimonials.length]);

  return <div className={styles.lightboxBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={styles.lightbox} role="dialog" aria-modal="true" aria-label="عرض لقطة الرأي بالحجم الكبير">
      <header className={styles.lightboxHeader}><span>{index + 1} / {testimonials.length}</span><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="إغلاق عرض الصورة"><X aria-hidden="true" size={22} />إغلاق</button></header>
      <div className={styles.lightboxImageWrap}><img src={resolveBackendAssetUrl(testimonial.image.url)} alt={testimonial.image.alt} /></div>
      {testimonials.length > 1 ? <div className={styles.lightboxControls} aria-label="التنقل بين لقطات الآراء"><button type="button" onClick={() => move(1)} aria-label="الصورة التالية"><ChevronRight aria-hidden="true" size={22} />التالي</button><button type="button" onClick={() => move(-1)} aria-label="الصورة السابقة"><ChevronLeft aria-hidden="true" size={22} />السابق</button></div> : null}
    </section>
  </div>;
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useReducedMotion();
  const move = (direction: -1 | 1) => setActiveIndex((current) => (current + direction + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (testimonials.length < 2 || reducedMotion || isInteracting || lightboxIndex !== null) return;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % testimonials.length), 5_000);
    return () => window.clearInterval(timer);
  }, [activeIndex, isInteracting, lightboxIndex, reducedMotion, testimonials.length]);

  if (testimonials.length === 0) return null;
  const active = testimonials[activeIndex];

  return <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
    <div className={styles.inner}>
      <div className={styles.intro}><p className={styles.eyebrow}>تجارب تمت مشاركتها للنشر</p><h2 id="testimonials-title" className={styles.heading}><AnimatedSectionTitle>آراء وتجارب المراجعات</AnimatedSectionTitle></h2><p className={styles.lead}>لقطات من رسائل وتجارب تمت مشاركتها بعد مراجعة الخصوصية والموافقة على النشر.</p></div>
      <div className={styles.carousel} aria-roledescription="carousel" aria-label="لقطات من آراء وتجارب المراجعات" onMouseEnter={() => setIsInteracting(true)} onMouseLeave={() => setIsInteracting(false)} onFocusCapture={() => setIsInteracting(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false); }}>
        <div className={styles.viewport} onTouchStart={(event) => { const touch = event.changedTouches[0]; touchStart.current = { x: touch.clientX, y: touch.clientY }; }} onTouchEnd={(event) => { const start = touchStart.current; const touch = event.changedTouches[0]; touchStart.current = null; if (!start || Math.abs(touch.clientX - start.x) < 42 || Math.abs(touch.clientY - start.y) > Math.abs(touch.clientX - start.x)) return; move(touch.clientX < start.x ? 1 : -1); }}>
          <article className={styles.card} aria-label={`لقطة ${activeIndex + 1} من ${testimonials.length}`}><button className={styles.imageButton} type="button" onClick={() => setLightboxIndex(activeIndex)} aria-label={`تكبير الصورة: ${active.image.alt}`}><img className={styles.image} src={resolveBackendAssetUrl(active.image.url)} alt={active.image.alt} /><span className={styles.expandHint}><Expand aria-hidden="true" size={17} />تكبير الصورة</span></button></article>
        </div>
        {testimonials.length > 1 ? <div className={styles.controls}><button type="button" onClick={() => move(-1)} aria-label="لقطة الرأي السابقة"><ChevronRight aria-hidden="true" size={21} />السابق</button><div className={styles.dots} aria-label="اختيار لقطة رأي">{testimonials.map((testimonial, index) => <button key={testimonial.id} type="button" className={index === activeIndex ? styles.activeDot : undefined} onClick={() => setActiveIndex(index)} aria-label={`عرض لقطة ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><button type="button" onClick={() => move(1)} aria-label="لقطة الرأي التالية">التالي<ChevronLeft aria-hidden="true" size={21} /></button></div> : null}
      </div>
    </div>
    {lightboxIndex !== null ? <TestimonialLightbox testimonials={testimonials} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} /> : null}
  </section>;
}
