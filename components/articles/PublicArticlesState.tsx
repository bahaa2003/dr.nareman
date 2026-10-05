import styles from "./PublicArticlesState.module.css";

type PublicArticlesStateProps = {
  state: "empty" | "error";
};

export function PublicArticlesState({ state }: PublicArticlesStateProps) {
  const isError = state === "error";

  return (
    <div className={styles.state} role={isError ? "alert" : "status"}>
      {isError ? "تعذر تحميل المقالات حاليًا." : "لا توجد مقالات منشورة حاليًا."}
    </div>
  );
}
