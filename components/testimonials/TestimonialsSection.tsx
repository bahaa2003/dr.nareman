import { resolveBackendAssetUrl } from "@/lib/backend-origin";
import type { PublicTestimonial } from "@/types/public-testimonials";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";

import styles from "./TestimonialsSection.module.css";

type TestimonialsSectionProps = {
  testimonials: PublicTestimonial[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>تجارب تمت مشاركتها للنشر</p>
          <h2 id="testimonials-title" className={styles.heading}>
            <AnimatedSectionTitle>آراء وتجارب المراجعات</AnimatedSectionTitle>
          </h2>
          <p className={styles.lead}>لقطات من رسائل وتجارب تمت مشاركتها بعد مراجعة الخصوصية والموافقة على النشر.</p>
        </div>

        <div className={styles.rail} aria-label="لقطات من آراء وتجارب المراجعات">
          {testimonials.map((testimonial) => {
            const imageUrl = resolveBackendAssetUrl(testimonial.image.url);

            return (
              <article key={testimonial.id} className={styles.card}>
                <a
                  className={styles.imageLink}
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="فتح لقطة التجربة بالحجم الكامل"
                >
                  {/* Backend-managed media URLs are runtime-configured and cannot use a static next/image remote pattern. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.image}
                    src={imageUrl}
                    alt={testimonial.image.alt}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
                <a className={styles.fullSizeLink} href={imageUrl} target="_blank" rel="noreferrer">
                  عرض بالحجم الكامل
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
