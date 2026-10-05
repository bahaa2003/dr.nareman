"use client";

import {
  ArrowDownLeft,
  Baby,
  CalendarDays,
  Dna,
  HeartPulse,
  Microscope,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Syringe,
  type LucideIcon
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { verifiedServices, type MedicalService } from "@/data/services";
import { AnimatedSectionTitle } from "@/components/ui/AnimatedSectionTitle";
import styles from "./AllServices.module.css";

const iconMap: Record<MedicalService["icon"], LucideIcon> = {
  calendar: CalendarDays,
  syringe: Syringe,
  baby: Baby,
  microscope: Microscope,
  sparkles: Sparkles,
  dna: Dna,
  scan: ScanSearch,
  shield: ShieldCheck,
  pulse: HeartPulse
};

const indexedServices = verifiedServices.map((service, index) => ({
  ...service,
  number: String(index + 1).padStart(2, "0")
}));

const featuredService = indexedServices.find((service) => service.featured);
const remainingServices = indexedServices.filter((service) => !service.featured);

export function AllServices() {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? false : { opacity: 0, y: 18 };

  return (
    <section id="all-services" className={styles.section} aria-labelledby="all-services-title">
      <div className={styles.inner}>
        <motion.div
          className={styles.intro}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.2, 0.74, 0.24, 1] }}
        >
          <p className={styles.eyebrow}>خدماتنا الطبية</p>
          <h2 id="all-services-title">
            <AnimatedSectionTitle>خيارات علاجية مدروسة لكل خطوة</AnimatedSectionTitle>
          </h2>
        </motion.div>

        {featuredService ? <FeaturedService service={featuredService} reduceMotion={Boolean(reduceMotion)} /> : null}

        <div className={styles.rows} aria-label="قائمة الخدمات الطبية">
          {remainingServices.map((service, index) => (
            <ServiceRow
              key={service.slug}
              service={service}
              delay={index * 0.045}
              initial={reveal}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

type IndexedService = (typeof indexedServices)[number];

function FeaturedService({ service, reduceMotion }: { service: IndexedService; reduceMotion: boolean }) {
  const Icon = iconMap[service.icon];

  return (
    <motion.article
      id={service.slug}
      className={styles.featured}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: reduceMotion ? 0 : 0.68, ease: [0.2, 0.74, 0.24, 1] }}
    >
      <div className={styles.featuredImage} aria-hidden="true" />
      <div className={styles.featuredOverlay} aria-hidden="true" />
      <span className={styles.featuredNumber} aria-hidden="true">
        {service.number}
      </span>
      <div className={styles.featuredContent}>
        <span className={styles.featuredLabel}>الخدمة الرئيسية</span>
        <span className={styles.featuredIcon} aria-hidden="true">
          <Icon size={30} strokeWidth={1.75} />
        </span>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
      </div>
    </motion.article>
  );
}

function ServiceRow({
  service,
  delay,
  initial,
  reduceMotion
}: {
  service: IndexedService;
  delay: number;
  initial: false | { opacity: number; y: number };
  reduceMotion: boolean;
}) {
  const Icon = iconMap[service.icon];

  return (
    <motion.article
      id={service.slug}
      className={styles.row}
      initial={initial}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: reduceMotion ? 0 : 0.52, delay: reduceMotion ? 0 : delay, ease: [0.2, 0.74, 0.24, 1] }}
    >
      <span className={styles.rowNumber}>{service.number}</span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className={styles.rowIcon} aria-hidden="true">
        <Icon size={22} strokeWidth={1.8} />
        <ArrowDownLeft className={styles.rowArrow} size={17} strokeWidth={1.9} />
      </span>
    </motion.article>
  );
}
