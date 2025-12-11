import type { CollectionEntry } from "astro:content";
import { marked } from "marked";

function cleanExcerptMarkdown(input: string) {
  return input
    .replace(/```[\s\S]*?```/g, "") // drop fenced code blocks to keep excerpt短
    .replace(/{\/\*\s*more\s*\*\/}/gi, "")
    .replace(/<!--\s*more\s*-->/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Return excerpt before `<!-- more -->` if present, otherwise summary.
 * Keeps preview text short and Markdown-free for cards.
 */
export function getExcerpt(entry: CollectionEntry<"posts" | "insights">) {
  const markers = ["<!-- more -->", "{/* more */}"];
  const marker = markers.find((m) => entry.body?.includes(m));
  if (marker) {
    const raw = entry.body.split(marker)[0];
    const cleaned = cleanExcerptMarkdown(raw);
    return cleaned || entry.data.summary;
  }
  return cleanExcerptMarkdown(entry.data.summary);
}

export function getExcerptHtml(entry: CollectionEntry<"posts" | "insights">) {
  const md = getExcerpt(entry);
  return marked.parse(md);
}

