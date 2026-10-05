import ReactMarkdown from "react-markdown";

import styles from "./ArticleDetail.module.css";

type ArticleMarkdownProps = {
  content: string;
};

export function ArticleMarkdown({ content }: ArticleMarkdownProps) {
  return (
    <div className={styles.body} dir="auto">
      <ReactMarkdown
        skipHtml
        components={{
          h1: "h2",
          img: () => null
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
