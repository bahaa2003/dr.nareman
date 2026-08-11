export type ServiceTone = "featured" | "mint" | "blush" | "white" | "teal";

export type ServiceIconKey = "calendar" | "syringe" | "baby" | "microscope" | "sparkles" | "dna" | "scan" | "shield" | "pulse";

export type MedicalService = {
  title: string;
  description: string;
  icon: ServiceIconKey;
  slug: string;
  tone: ServiceTone;
  featured?: boolean;
};

export const servicesCta = {
  label: "عرض جميع الخدمات",
  href: "/services"
};

export const verifiedServices: MedicalService[] = [
  {
    title: "تحفيز ومتابعة الإباضة",
    description: "تنشيط المبايض مع متابعة دقيقة بالموجات الصوتية والهرمونات لتحديد الوقت الأنسب.",
    icon: "calendar",
    slug: "ovulation-monitoring",
    tone: "mint"
  },
  {
    title: "الحقن داخل الرحم (IUI)",
    description: "إدخال الحيوانات المنوية داخل الرحم في وقت الإباضة لدعم فرص الالتقاء الطبيعي.",
    icon: "syringe",
    slug: "iui",
    tone: "white"
  },
  {
    title: "أطفال الأنابيب (IVF)",
    description: "تخصيب البويضات داخل المختبر، ثم نقل الأجنة إلى الرحم ضمن خطة علاجية واضحة.",
    icon: "baby",
    slug: "ivf",
    tone: "featured",
    featured: true
  },
  {
    title: "التلقيح المجهري (ICSI)",
    description: "حقن حيوان منوي واحد داخل البويضة، ويستخدم غالبًا مع ضعف الحيوانات المنوية.",
    icon: "microscope",
    slug: "icsi",
    tone: "teal"
  },
  {
    title: "تجميد الأجنة",
    description: "حفظ الأجنة المخصبة بالتبريد لاستخدامها لاحقًا دون إعادة خطوات التنشيط كاملة.",
    icon: "sparkles",
    slug: "embryo-freezing",
    tone: "blush"
  },
  {
    title: "فحص الأجنة وراثيًا (PGD)",
    description: "تحليل الأجنة قبل إرجاعها للرحم للكشف عن الأمراض الوراثية واختيار الأجنة السليمة.",
    icon: "dna",
    slug: "pgd",
    tone: "mint"
  },
  {
    title: "تحديد جنس الأجنة",
    description: "تحديد جنس الجنين قبل إرجاعه للرحم ضمن إجراءات أطفال الأنابيب والفحص الوراثي.",
    icon: "scan",
    slug: "gender-selection",
    tone: "white"
  },
  {
    title: "الكشف عن أمراض الكروموسومات",
    description: "فحص الأجنة للتأكد من سلامة عدد وتركيب الكروموسومات قبل الإرجاع.",
    icon: "shield",
    slug: "chromosome-screening",
    tone: "white"
  },
  {
    title: "تثقيب جدار الجنين بالليزر",
    description: "إحداث فتحة دقيقة في الغلاف الخارجي للجنين باستخدام الليزر لدعم الانغراس.",
    icon: "pulse",
    slug: "laser-assisted-hatching",
    tone: "blush"
  }
];

export const homepageServices = [
  verifiedServices[2],
  verifiedServices[0],
  verifiedServices[1],
  verifiedServices[3],
  verifiedServices[4],
  verifiedServices[5]
];
