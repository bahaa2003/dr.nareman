import Image from "next/image";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { heroAssets, heroPhrases, siteContent } from "@/data/site";
import { ActionLink } from "@/components/ui/ActionLink";
import { HeroTypewriter } from "./HeroTypewriter";
import { MobileHero } from "./MobileHero";
import styles from "./Hero.module.css";

function DesktopHero() {
  return (
    <section className={`${styles.heroShell} ${styles.desktopHeroShell}`} aria-labelledby="hero-title">
      <div className={styles.heroPanel}>
        <Image
          className={styles.background}
          src={heroAssets.background}
          alt=""
          fill
          priority
          sizes="(max-width: 768px) 92vw, 94vw"
        />

        <div className={styles.photoOverlay} aria-hidden="true" />
        <div className={styles.textOverlay} aria-hidden="true" />
        <div className={styles.doctorShade} aria-hidden="true" />

        <svg className={styles.paths} viewBox="0 0 1480 760" aria-hidden="true" focusable="false">
          <path d="M150 650 C390 360 650 360 850 520 C1035 666 1240 615 1390 420" />
          <path d="M260 710 C480 430 720 415 955 575 C1150 705 1290 650 1435 520" />
          <circle cx="650" cy="530" r="7" />
          <circle cx="1030" cy="596" r="5" />
        </svg>

        <div className={styles.content}>
          <p className={styles.eyebrow}>{siteContent.specialty}</p>
          <h1 id="hero-title" className={styles.title} aria-label={heroPhrases[0]}>
            <HeroTypewriter phrases={heroPhrases} />
          </h1>
          <div className={styles.accentLine} aria-hidden="true" />
          <div className={styles.actions}>
            <ActionLink
              href={siteContent.ctas.booking.href}
              variant="primary"
              icon={<CalendarDays aria-hidden="true" size={20} strokeWidth={2.2} />}
            >
              {siteContent.ctas.booking.label}
            </ActionLink>
            <ActionLink
              href={siteContent.ctas.services.href}
              variant="secondary"
              icon={<ArrowLeft aria-hidden="true" size={20} strokeWidth={2.2} />}
            >
              {siteContent.ctas.services.label}
            </ActionLink>
          </div>
        </div>

        <div className={styles.doctorWrap}>
          <Image
            className={styles.doctor}
            src={heroAssets.doctor}
            alt="د. ناريمان الطريري، استشارية علاج العقم وأطفال الأنابيب"
            fill
            sizes="(max-width: 768px) 78vw, 42vw"
            priority
          />
        </div>

        <svg
          className={styles.lowerTransition}
          viewBox="0 0 1480 240"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            className={styles.lowerFill}
            d="M-80 92 C160 150 388 154 620 128 C840 100 1038 64 1228 76 C1370 84 1460 116 1560 140 L1560 260 L-80 260 Z"
          />
          <path
            className={styles.lowerStrokeMint}
            d="M-80 92 C160 150 388 154 620 128 C840 100 1038 64 1228 76 C1370 84 1460 116 1560 140"
          />
          <path
            className={styles.lowerStrokePink}
            d="M-80 92 C160 150 388 154 620 128 C840 100 1038 64 1228 76 C1370 84 1460 116 1560 140"
          />
        </svg>
      </div>
    </section>
  );
}

export function Hero() {
  return (
    <>
      <DesktopHero />
      <MobileHero />
    </>
  );
}
