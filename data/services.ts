export type ServiceTone = "featured" | "mint" | "blush" | "white" | "teal";

export type ServiceIconKey = "calendar" | "syringe" | "baby" | "microscope" | "snowflake" | "dna" | "gender" | "pulse";

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
    description: "تنشيط المبايض مع متابعة دقيقة بالموجات الصوتية لتحديد الوقت الأنسب للإبرة التفجيرية (المنضجة) ثم العلاقة الحميمية.",
    icon: "calendar",
    slug: "ovulation-monitoring",
    tone: "mint"
  },
  {
    title: "الحقن داخل الرحم (IUI)",
    description: "تنشيط المبايض مع متابعة دقيقة بالموجات الصوتية لتحديد الوقت الأنسب للإبرة التفجيرية (المنضجة) ثم إدخال الحيوانات المنوية.",
    icon: "syringe",
    slug: "iui",
    tone: "white"
  },
  {
    title: "أطفال الأنابيب (IVF)",
    description: "سحب البويضات ثم تخصيبها داخل المختبر عن طريق التلقيح الذاتي للحيوانات المنوية، مع تنشيط المبايض واستخدام الإبرة التفجيرية (المنضجة).",
    icon: "baby",
    slug: "ivf",
    tone: "featured",
    featured: true
  },
  {
    title: "التلقيح المجهري (ICSI)",
    description: "حقن حيوان منوي واحد داخل البويضة.",
    icon: "microscope",
    slug: "icsi",
    tone: "teal"
  },
  {
    title: "تجميد الأجنة",
    description: "حفظ البويضات المخصبة (أجنة) بالتجميد (التجفيف السريع).",
    icon: "snowflake",
    slug: "embryo-freezing",
    tone: "blush"
  },
  {
    title: "فحص الأجنة",
    description: "تؤخذ خزعة من الأجنة قبل إرجاعها للرحم للكشف عن الأمراض الوراثية والتأكد من سلامة عدد وتركيب الكروموسومات، واختيار الأجنة السليمة.",
    icon: "dna",
    slug: "pgd",
    tone: "mint"
  },
  {
    title: "تحديد جنس الأجنة (PGT-A)",
    description: "تحديد جنس الجنين قبل إرجاعه للرحم ضمن إجراءات أطفال الأنابيب.",
    icon: "gender",
    slug: "gender-selection",
    tone: "white"
  },
  {
    title: "تثقيب جدار الجنين بالليزر",
    description: "إحداث فتحة دقيقة في الغلاف الخارجي للجنين باستخدام الليزر لدعم الانغراس.",
    icon: "pulse",
    slug: "laser-assisted-hatching",
    tone: "blush"
  },
  {
    title: "استحثاث البطانة",
    description: "إجراء طبي يهدف إلى تهيئة بطانة الرحم ودعم جاهزيتها لاستقبال الجنين وفق تقييم الحالة.",
    icon: "pulse",
    slug: "endometrial-induction",
    tone: "white"
  }
];

export const homepageServices = [
  verifiedServices[0],
  verifiedServices[1],
  verifiedServices[2],
  verifiedServices[3],
  verifiedServices[4],
  verifiedServices[5]
];
