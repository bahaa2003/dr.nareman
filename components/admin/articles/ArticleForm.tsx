"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { AdminArticleEditorInput, AdminArticleEditorUpdateInput, ArticleDetail } from "@/types/admin";

import styles from "./ArticleForm.module.css";

export interface ArticleFormValues {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
}

export interface ArticleFormSubmitError {
  message: string;
  field?: keyof ArticleFormValues;
}

interface ArticleFormProps {
  mode: "create" | "edit";
  initialValues: ArticleFormValues;
  article?: ArticleDetail;
  isSubmitting: boolean;
  successMessage?: string | null;
  onDirtyChange?: (isDirty: boolean) => void;
  onSubmit: (values: ArticleFormValues) => Promise<ArticleFormSubmitError | null>;
}

type FormErrors = Partial<Record<keyof ArticleFormValues, string>>;

const requiredFieldLimits = {
  title: 180,
  excerpt: 320,
  content: 50_000,
  category: 80
} as const;

const optionalFieldLimits = {
  slug: 220,
  seoTitle: 70,
  seoDescription: 170
} as const;

export const emptyArticleFormValues: ArticleFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  seoTitle: "",
  seoDescription: ""
};

export function articleToFormValues(article: ArticleDetail): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    category: article.category,
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? ""
  };
}

function normalizeText(value: string): string {
  return value.trim();
}

function toComparableValues(values: ArticleFormValues): ArticleFormValues {
  return {
    title: normalizeText(values.title),
    slug: normalizeText(values.slug),
    excerpt: normalizeText(values.excerpt),
    content: values.content,
    category: normalizeText(values.category),
    seoTitle: normalizeText(values.seoTitle),
    seoDescription: normalizeText(values.seoDescription)
  };
}

export function isArticleFormDirty(values: ArticleFormValues, baseline: ArticleFormValues): boolean {
  const current = toComparableValues(values);
  const original = toComparableValues(baseline);

  return Object.keys(current).some(
    (key) => current[key as keyof ArticleFormValues] !== original[key as keyof ArticleFormValues]
  );
}

export function buildCreateArticleInput(values: ArticleFormValues): AdminArticleEditorInput {
  const normalized = toComparableValues(values);

  return {
    title: normalized.title,
    ...(normalized.slug ? { slug: normalized.slug } : {}),
    excerpt: normalized.excerpt,
    content: normalized.content,
    category: normalized.category,
    ...(normalized.seoTitle ? { seoTitle: normalized.seoTitle } : {}),
    ...(normalized.seoDescription ? { seoDescription: normalized.seoDescription } : {})
  };
}

export function buildArticleUpdateInput(
  values: ArticleFormValues,
  baseline: ArticleFormValues
): AdminArticleEditorUpdateInput {
  const current = toComparableValues(values);
  const original = toComparableValues(baseline);
  const update: AdminArticleEditorUpdateInput = {};

  if (current.title !== original.title) {
    update.title = current.title;
  }
  if (current.slug !== original.slug) {
    update.slug = current.slug;
  }
  if (current.excerpt !== original.excerpt) {
    update.excerpt = current.excerpt;
  }
  if (current.content !== original.content) {
    update.content = current.content;
  }
  if (current.category !== original.category) {
    update.category = current.category;
  }
  if (current.seoTitle !== original.seoTitle) {
    update.seoTitle = current.seoTitle || null;
  }
  if (current.seoDescription !== original.seoDescription) {
    update.seoDescription = current.seoDescription || null;
  }

  return update;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(date);
}

function validateValues(values: ArticleFormValues, mode: "create" | "edit", baseline: ArticleFormValues): FormErrors {
  const normalized = toComparableValues(values);
  const errors: FormErrors = {};

  (Object.keys(requiredFieldLimits) as Array<keyof typeof requiredFieldLimits>).forEach((field) => {
    if (!normalized[field]) {
      errors[field] = "هذا الحقل مطلوب.";
    } else if (normalized[field].length > requiredFieldLimits[field]) {
      errors[field] = `الحد الأقصى هو ${requiredFieldLimits[field]} حرفًا.`;
    }
  });

  (Object.keys(optionalFieldLimits) as Array<keyof typeof optionalFieldLimits>).forEach((field) => {
    if (normalized[field] && normalized[field].length > optionalFieldLimits[field]) {
      errors[field] = `الحد الأقصى هو ${optionalFieldLimits[field]} حرفًا.`;
    }
  });

  if (mode === "edit" && normalized.slug !== normalizeText(baseline.slug) && !normalized.slug) {
    errors.slug = "لا يمكن ترك الرابط فارغًا عند تعديله.";
  }

  return errors;
}

function CharacterCounter({ value, maximum }: { value: string; maximum: number }) {
  return (
    <span className={styles.counter}>
      {value.length}/{maximum}
    </span>
  );
}

function ArticleMetadata({ article }: { article: ArticleDetail }) {
  return (
    <aside className={styles.metadata} aria-label="بيانات المقال">
      <h2>بيانات المقال</h2>
      <dl>
        <div>
          <dt>الحالة</dt>
          <dd>{article.status === "published" ? "منشور" : "مسودة"}</dd>
        </div>
        <div>
          <dt>مدة القراءة</dt>
          <dd>{article.readingTime} دقائق</dd>
        </div>
        {article.publishedAt ? (
          <div>
            <dt>تاريخ النشر</dt>
            <dd>{formatDate(article.publishedAt)}</dd>
          </div>
        ) : null}
        <div>
          <dt>آخر تحديث</dt>
          <dd>{formatDate(article.updatedAt)}</dd>
        </div>
      </dl>
    </aside>
  );
}

export function ArticleForm({ mode, initialValues, article, isSubmitting, successMessage, onDirtyChange, onSubmit }: ArticleFormProps) {
  const [values, setValues] = useState<ArticleFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const isHandlingSubmit = useRef(false);
  const isDirty = useMemo(() => isArticleFormDirty(values, initialValues), [initialValues, values]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
    };
  }, [isDirty]);

  const updateValue = (field: keyof ArticleFormValues, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setSubmissionError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || isHandlingSubmit.current) {
      return;
    }

    const nextErrors = validateValues(values, mode, initialValues);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    isHandlingSubmit.current = true;

    try {
      const result = await onSubmit(values);
      if (result) {
        setSubmissionError(result.message);
        if (result.field) {
          setErrors((currentErrors) => ({ ...currentErrors, [result.field as keyof ArticleFormValues]: result.message }));
        }
      }
    } finally {
      isHandlingSubmit.current = false;
    }
  };

  const submitLabel = mode === "create" ? "إنشاء المقال" : "حفظ التغييرات";

  return (
    <div className={styles.editorLayout}>
      <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
        <div className={styles.formHeader}>
          <div>
            <p className={styles.eyebrow}>{mode === "create" ? "مقال جديد" : "تعديل المقال"}</p>
            <h1>{mode === "create" ? "إنشاء مسودة جديدة" : "محتوى المقال"}</h1>
            <p>الحقول المعلّمة مطلوبة. يتم حفظ حالة النشر الحالية دون تغيير.</p>
          </div>
          <Link className={styles.backLink} href="/admin/articles">
            <ArrowRight aria-hidden="true" size={18} />
            العودة إلى المقالات
          </Link>
        </div>

        {successMessage ? (
          <p className={styles.successMessage} role="status">
            {successMessage}
          </p>
        ) : null}
        {submissionError ? (
          <p className={styles.formError} role="alert">
            {submissionError}
          </p>
        ) : null}

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="article-title">العنوان <span aria-hidden="true">*</span></label>
            <CharacterCounter value={values.title} maximum={requiredFieldLimits.title} />
          </div>
          <input
            id="article-title"
            value={values.title}
            maxLength={requiredFieldLimits.title}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "article-title-error" : undefined}
            onChange={(event) => updateValue("title", event.target.value)}
            disabled={isSubmitting}
            required
          />
          {errors.title ? <p id="article-title-error" className={styles.fieldError}>{errors.title}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="article-slug">الرابط المختصر</label>
            <CharacterCounter value={values.slug} maximum={optionalFieldLimits.slug} />
          </div>
          <input
            id="article-slug"
            value={values.slug}
            maxLength={optionalFieldLimits.slug}
            dir="ltr"
            aria-invalid={Boolean(errors.slug)}
            aria-describedby={errors.slug ? "article-slug-error" : "article-slug-hint"}
            onChange={(event) => updateValue("slug", event.target.value)}
            disabled={isSubmitting}
          />
          <p id="article-slug-hint" className={styles.hint}>
            {mode === "create" ? "اتركه فارغًا ليتم إنشاؤه من العنوان." : "لا يتغير الرابط عند تعديل العنوان فقط."}
          </p>
          {errors.slug ? <p id="article-slug-error" className={styles.fieldError}>{errors.slug}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="article-excerpt">الملخص <span aria-hidden="true">*</span></label>
            <CharacterCounter value={values.excerpt} maximum={requiredFieldLimits.excerpt} />
          </div>
          <textarea
            id="article-excerpt"
            value={values.excerpt}
            maxLength={requiredFieldLimits.excerpt}
            rows={4}
            aria-invalid={Boolean(errors.excerpt)}
            aria-describedby={errors.excerpt ? "article-excerpt-error" : undefined}
            onChange={(event) => updateValue("excerpt", event.target.value)}
            disabled={isSubmitting}
            required
          />
          {errors.excerpt ? <p id="article-excerpt-error" className={styles.fieldError}>{errors.excerpt}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="article-category">الفئة <span aria-hidden="true">*</span></label>
            <CharacterCounter value={values.category} maximum={requiredFieldLimits.category} />
          </div>
          <input
            id="article-category"
            value={values.category}
            maxLength={requiredFieldLimits.category}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "article-category-error" : undefined}
            onChange={(event) => updateValue("category", event.target.value)}
            disabled={isSubmitting}
            required
          />
          {errors.category ? <p id="article-category-error" className={styles.fieldError}>{errors.category}</p> : null}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="article-content">المحتوى <span aria-hidden="true">*</span></label>
            <CharacterCounter value={values.content} maximum={requiredFieldLimits.content} />
          </div>
          <textarea
            id="article-content"
            className={styles.contentArea}
            value={values.content}
            maxLength={requiredFieldLimits.content}
            aria-invalid={Boolean(errors.content)}
            aria-describedby={errors.content ? "article-content-error" : "article-content-hint"}
            onChange={(event) => updateValue("content", event.target.value)}
            disabled={isSubmitting}
            required
          />
          <p id="article-content-hint" className={styles.hint}>المحتوى يدعم Markdown.</p>
          {errors.content ? <p id="article-content-error" className={styles.fieldError}>{errors.content}</p> : null}
        </div>

        <section className={styles.seoSection} aria-labelledby="article-seo-title">
          <div>
            <p className={styles.eyebrow}>SEO</p>
            <h2 id="article-seo-title">بيانات محرك البحث</h2>
            <p>هذه الحقول اختيارية.</p>
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="article-seo-title-input">عنوان SEO</label>
              <CharacterCounter value={values.seoTitle} maximum={optionalFieldLimits.seoTitle} />
            </div>
            <input
              id="article-seo-title-input"
              value={values.seoTitle}
              maxLength={optionalFieldLimits.seoTitle}
              aria-invalid={Boolean(errors.seoTitle)}
              aria-describedby={errors.seoTitle ? "article-seo-title-error" : undefined}
              onChange={(event) => updateValue("seoTitle", event.target.value)}
              disabled={isSubmitting}
            />
            {errors.seoTitle ? <p id="article-seo-title-error" className={styles.fieldError}>{errors.seoTitle}</p> : null}
          </div>
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="article-seo-description">وصف SEO</label>
              <CharacterCounter value={values.seoDescription} maximum={optionalFieldLimits.seoDescription} />
            </div>
            <textarea
              id="article-seo-description"
              value={values.seoDescription}
              maxLength={optionalFieldLimits.seoDescription}
              rows={3}
              aria-invalid={Boolean(errors.seoDescription)}
              aria-describedby={errors.seoDescription ? "article-seo-description-error" : undefined}
              onChange={(event) => updateValue("seoDescription", event.target.value)}
              disabled={isSubmitting}
            />
            {errors.seoDescription ? <p id="article-seo-description-error" className={styles.fieldError}>{errors.seoDescription}</p> : null}
          </div>
        </section>

        <div className={styles.submitRow}>
          <p className={styles.dirtyState} aria-live="polite">
            {isDirty ? "لديك تغييرات غير محفوظة." : mode === "create" ? "ابدأ بكتابة المقال." : "جميع التغييرات محفوظة."}
          </p>
          <button className={styles.submitButton} type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "جارٍ الحفظ…" : submitLabel}
          </button>
        </div>
      </form>

      {article ? <ArticleMetadata article={article} /> : null}
    </div>
  );
}
