"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./ConfirmDialog.module.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(",");

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "إلغاء",
  destructive = false,
  isSubmitting = false,
  onConfirm,
  onClose
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const isSubmittingRef = useRef(isSubmitting);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
    onCloseRef.current = onClose;
  }, [isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusCancelButton = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmittingRef.current) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusableElements || focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusCancelButton);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <div id="confirm-dialog-description" className={styles.description}>
          {description}
        </div>
        <div className={styles.actions}>
          <button ref={cancelButtonRef} type="button" className={styles.cancelButton} onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={destructive ? styles.destructiveButton : styles.confirmButton}
            onClick={onConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "جارٍ التنفيذ…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
