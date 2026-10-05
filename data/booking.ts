export type BookingLink = {
  label: string;
  href: string;
  external: boolean;
  configured: boolean;
};

export const bookingFinale = {
  eyebrow: "خطوتك التالية",
  heading: "جاهزة لبدء رحلتك بخطوة أكثر وضوحًا؟",
  lead: "ابدئي بخطوة بسيطة، واحجزي موعدك للتقييم والاستشارة ضمن مواعيد العيادة المتاحة.",
  schedule: {
    days: ["الأحد", "الثلاثاء", "الخميس"],
    hours: "من ١:٠٠ ظهرًا إلى ٤:٠٠ عصرًا"
  },
  links: {
    whatsapp: {
      label: "احجزي موعدك الآن",
      href: "https://wa.me/966500511212?text=مرحباً،%20أرغب%20في%20حجز%20موعد%20مع%20د.%20ناريمان%20الطريري",
      external: true,
      configured: true
    },
    maps: {
      label: "عرض الموقع على الخريطة",
      href: "https://maps.app.goo.gl/JLfaxcTQZX6dTr8r6?g_st=com.google.maps.preview.copy",
      external: true,
      configured: true
    }
  } satisfies Record<string, BookingLink>
};
