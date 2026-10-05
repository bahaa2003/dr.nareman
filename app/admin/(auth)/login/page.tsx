"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin, loginAdmin } from "@/lib/admin-api/auth";
import { ApiError } from "@/lib/admin-api/client";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

import styles from "./LoginFoundation.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "تعذر تسجيل الدخول الآن. حاول مرة أخرى.";
  }

  if (error.status === 400) {
    return "تحقق من البيانات المدخلة.";
  }

  if (error.status === 401) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (error.status === 429) {
    return "تم إجراء محاولات تسجيل دخول كثيرة. حاول مرة أخرى لاحقًا.";
  }

  return "تعذر تسجيل الدخول الآن. حاول مرة أخرى.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { clearAdmin, setAdmin } = useAdminSession();
  const sessionCheckId = useRef(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(() => {
    if (typeof window !== "undefined" && window.location.search.includes("logout=uncertain")) {
      return "تعذر تأكيد إنهاء الجلسة على الخادم. يمكنك المحاولة مرة أخرى عند الحاجة.";
    }

    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const requestId = ++sessionCheckId.current;

    const checkExistingSession = async () => {
      try {
        const currentAdmin = await getCurrentAdmin();

        if (requestId !== sessionCheckId.current) {
          return;
        }

        setAdmin(currentAdmin);
        router.replace("/admin/articles");
      } catch (error) {
        if (requestId !== sessionCheckId.current) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearAdmin();
          return;
        }

        setSessionNotice("تعذر التحقق من الجلسة الحالية. يمكنك تسجيل الدخول الآن.");
      }
    };

    void checkExistingSession();

    return () => {
      sessionCheckId.current += 1;
    };
  }, [clearAdmin, router, setAdmin]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      setFormError("أدخل بريدًا إلكترونيًا صحيحًا.");
      return;
    }

    if (!password) {
      setFormError("أدخل كلمة المرور.");
      return;
    }

    sessionCheckId.current += 1;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const admin = await loginAdmin({ email: normalizedEmail, password });
      setPassword("");
      setAdmin(admin);
      router.replace("/admin/articles");
    } catch (error) {
      setFormError(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.panel} aria-labelledby="admin-login-title">
        <p className={styles.eyebrow}>د. ناريمان</p>
        <h1 id="admin-login-title">لوحة إدارة المحتوى</h1>
        <p className={styles.introduction}>سجّل الدخول للوصول إلى مساحة إدارة المقالات.</p>

        {sessionNotice ? (
          <p className={styles.notice} role="status">
            {sessionNotice}
          </p>
        ) : null}

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className={styles.field}>
            <label htmlFor="admin-email">البريد الإلكتروني</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="admin-password">كلمة المرور</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {formError ? (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          ) : null}

          <button className={styles.submitButton} type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
          </button>
        </form>
      </section>
    </main>
  );
}
