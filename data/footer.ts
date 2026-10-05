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
    { label: "الرئيسية", href: "/" },
    { label: "عن الدكتورة", href: "/about" },
    { label: "الخدمات", href: "/services" },
    { label: "المقالات", href: "/articles" },
    { label: "تواصل معنا", href: "/contact" }
  ] satisfies FooterNavItem[],
  socialLinks: [
    { label: "Instagram", href: "https://instagram.com/dtorairi?igshid=MzRlODBiNWFlZA==" },
    { label: "Snapchat", href: "https://www.snapchat.com/add/dtorairi" },
    { label: "X", href: "https://x.com/dtorairi?s=21&t=Tk5mnNdJCLEUZwAa4bckiA" },
    { label: "TikTok", href: "https://www.tiktok.com/@dtorairi?_t=8rBhImZgxc8&_r=1" }
  ] satisfies FooterSocialLink[]
};
