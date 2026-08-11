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
    // TODO: Replace with the verified WhatsApp booking URL when it is provided.
    whatsapp: {
      label: "احجزي موعدك الآن",
      href: "#booking",
      external: false,
      configured: false
    },
    // TODO: Replace with the verified Google Maps URL when it is provided.
    maps: {
      label: "عرض الموقع على الخريطة",
      href: "#booking-location",
      external: false,
      configured: false
    }
  } satisfies Record<string, BookingLink>
};
