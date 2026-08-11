export type FooterNavItem = {
  label: string;
  href: string;
};

export type FooterSocialLink = {
  label: string;
  href: string;
};

export const footerContent = {
  brand: {
    name: "د. ناريمان الطريري",
    specialty: "استشارية علاج العقم وأطفال الأنابيب"
  },
  nav: [
    { label: "الرئيسية", href: "#home" },
    { label: "عن الدكتورة", href: "#doctor" },
    { label: "الخدمات", href: "#services" },
    { label: "المقالات", href: "#articles" },
    { label: "تواصل معنا", href: "#booking" }
  ] satisfies FooterNavItem[],
  // No verified social account URLs exist in the current project data yet.
  // Add official social links here once approved.
  socialLinks: [] as FooterSocialLink[]
};
