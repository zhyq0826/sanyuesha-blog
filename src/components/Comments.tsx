import { useEffect, useRef } from "react";

type CommentsProps = {
  repo: string;
  issueTerm?: "pathname" | "url" | "title" | string;
  label?: string;
  theme?: string;
};

export default function Comments({
  repo,
  issueTerm = "pathname",
  label = "comment",
  theme = "github-light"
}: CommentsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", repo);
    script.setAttribute("issue-term", issueTerm);
    script.setAttribute("label", label);
    script.setAttribute("theme", theme);
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(script);
  }, [repo, issueTerm, label, theme]);

  return <div ref={containerRef} />;
}

