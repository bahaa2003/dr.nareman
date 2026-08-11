export type ArticlePreview = {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  readingTime?: string;
  href: string;
};

// TEMPORARY FRONTEND MOCK DATA.
// Replace with backend/CMS article response when the API is implemented.
// These records are development placeholders, not approved or published medical content.
// TODO: Replace temporary article URLs when Blog routes/backend are implemented.
export const mockArticles: ArticlePreview[] = [
  {
    id: "mock-ivf-icsi",
    slug: "ivf-vs-icsi",
    category: "تقنيات الإخصاب المساعد",
    title: "الفرق بين IVF و ICSI: متى يُستخدم كل إجراء؟",
    excerpt: "مقدمة مبسطة لفهم الفروق العامة بين الإجرائين وكيف يختار الفريق الطبي المسار الأنسب بعد التقييم.",
    image: "/images/articles/ivf-lab-suite.png",
    imageAlt: "مختبر إخصاب مجهري هادئ ومجهز",
    readingTime: "٤ دقائق قراءة",
    href: "#articles"
  },
  {
    id: "mock-delayed-conception",
    slug: "when-to-see-fertility-consultant",
    category: "تأخر الإنجاب",
    title: "متى يُنصح بمراجعة استشارية تأخر الإنجاب؟",
    excerpt: "إشارات عامة تساعد على ترتيب الخطوة الأولى وبدء تقييم طبي واضح دون وعود أو أحكام مسبقة.",
    image: "/images/articles/fertility-consultation.png",
    imageAlt: "جلسة استشارة طبية هادئة حول الخصوبة",
    readingTime: "٣ دقائق قراءة",
    href: "#articles"
  },
  {
    id: "mock-ovulation-followup",
    slug: "ovulation-monitoring-journey",
    category: "صحة المرأة الإنجابية",
    title: "متابعة التبويض: ماذا يحدث خلال رحلة التقييم؟",
    excerpt: "نظرة مختصرة على معنى المتابعة، ولماذا قد تساعد الفحوصات المنتظمة في بناء خطة علاج أوضح.",
    image: "/images/articles/ovulation-planning.png",
    imageAlt: "تقويم متابعة التبويض مع أدوات تخطيط صحية",
    readingTime: "٣ دقائق قراءة",
    href: "#articles"
  }
];

export const articlesCta = {
  label: "عرض جميع المقالات",
  href: "#articles"
};
