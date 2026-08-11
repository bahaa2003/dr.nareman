"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpLeft, CalendarDays, Menu, X } from "lucide-react";
import Image from "next/image";
import { siteContent } from "@/data/site";
import { ActionLink } from "@/components/ui/ActionLink";
import styles from "./Header.module.css";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState(siteContent.nav[0]?.href ?? "#home");
  const reduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateScrolledState = () => {
      setScrolled(window.scrollY > 72);
    };

    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    const sectionIds = siteContent.nav
      .map((item) => item.href)
      .filter((href) => href.startsWith("#"))
      .map((href) => href.slice(1));

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveHref(`#${visibleEntry.target.id}`);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.12, 0.24, 0.42]
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
      <div className={styles.inner}>
        <a className={styles.brand} href="#home" aria-label={`${siteContent.doctorName} الصفحة الرئيسية`}>
          <Image
            className={styles.logoImage}
            src="/images/nariman-logo-main.png"
            alt=""
            width={1187}
            height={435}
            priority
          />
        </a>

        <nav className={styles.desktopNav} aria-label="التنقل الرئيسي">
          {siteContent.nav.map((item) => (
            <a key={item.href} href={item.href} className={activeHref === item.href ? styles.navLinkActive : undefined}>
              {activeHref === item.href ? (
                <motion.span className={styles.activePill} layoutId="desktop-nav-active" aria-hidden="true" />
              ) : null}
              <span className={styles.navLabel}>
              {item.label}
              </span>
            </a>
          ))}
        </nav>

        <a
          href={siteContent.ctas.booking.href}
          className={styles.headerCta}
        >
          <span>احجزي موعدك</span>
          <ArrowUpLeft aria-hidden="true" size={17} strokeWidth={2.3} />
        </a>

        <button
          className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
          type="button"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <Menu className={styles.menuIcon} aria-hidden="true" size={22} />
          <X className={styles.closeIcon} aria-hidden="true" size={21} />
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className={styles.mobileLayer}
            aria-hidden={false}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          >
            <div className={styles.mobileBackdrop} onClick={closeMenu} />
            <motion.aside
              id="mobile-menu"
              className={styles.mobileMenu}
              role="dialog"
              aria-modal="true"
              aria-label="القائمة الرئيسية"
              initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.985 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.mobileTop}>
                <span>د. ناريمان</span>
                <button ref={closeButtonRef} type="button" aria-label="إغلاق القائمة" onClick={closeMenu}>
                  <X aria-hidden="true" size={22} />
                </button>
              </div>
              <nav className={styles.mobileNav} aria-label="تنقل الهاتف">
                {siteContent.nav.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.36,
                      delay: reduceMotion ? 0 : 0.08 + index * 0.07,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <span className={styles.mobileNavNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <span>{item.label}</span>
                  </motion.a>
                ))}
              </nav>
              <ActionLink
                href={siteContent.ctas.booking.href}
                variant="primary"
                className={styles.mobileBookingCta}
                icon={<CalendarDays aria-hidden="true" size={18} />}
                onClick={closeMenu}
              >
                {siteContent.ctas.booking.label}
              </ActionLink>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
