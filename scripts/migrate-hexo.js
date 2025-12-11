// Script to migrate Hexo markdown posts into Astro content collection.
// Usage: node scripts/migrate-hexo.js
import fs from "fs";
import path from "path";

const HEXO_POST_DIR = "/Users/zhyq0826/workspace/zhyq0826/blog/source/_posts";
const HEXO_IMAGE_DIRS = [
  "/Users/zhyq0826/workspace/zhyq0826/blog/source/images",
  "/Users/zhyq0826/workspace/zhyq0826/blog/public/images"
];
const ASTRO_POST_DIR = "/Users/zhyq0826/workspace/zhyq0826/sanyuesha-blog/src/content/posts";
const ASTRO_PUBLIC_IMAGE_DIR = "/Users/zhyq0826/workspace/zhyq0826/sanyuesha-blog/public/images";

/** Basic yaml-ish frontmatter parser for the simple Hexo format. */
function parseFrontmatter(lines) {
  const meta = {};
  let currentKey = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("-")) {
      if (currentKey && Array.isArray(meta[currentKey])) {
        meta[currentKey].push(line.replace(/^-+/, "").trim());
      }
      continue;
    }
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val === "") {
        meta[key] = [];
        currentKey = key;
      } else {
        currentKey = key;
        meta[key] = val;
      }
    }
  }
  return meta;
}

function isoDate(input) {
  if (!input) return null;
  const normalized = input.replace(/\//g, "-");
  const d = new Date(normalized);
  if (Number.isNaN(+d)) return null;
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, "") // code fences
    .replace(/`[^`]+`/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[[^\]]+\]\([^)]+\)/g, (m) => m.replace(/\[[^\]]+\]\([^)]+\)/g, (mm) => {
      const label = mm.match(/\[([^\]]+)\]/);
      return label ? label[1] : "";
    }))
    .replace(/<[^>]+>/g, "") // html tags
    .replace(/\s+/g, " ")
    .trim();
}

function buildSummary(body) {
  const noCode = body.replace(/```[\s\S]*?```/g, "");
  const paragraphs = noCode.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!paragraphs.length) return "";
  const cleaned = stripMarkdown(paragraphs[0]);
  return cleaned.slice(0, 140) + (cleaned.length > 140 ? "..." : "");
}

function yamlValue(v) {
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    return `\n${v.map((item) => `  - ${JSON.stringify(item)}`).join("\n")}`;
  }
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return JSON.stringify(v);
}

function toFrontmatter(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${yamlValue(v)}`)
    .join("\n");
}

function normalizeLinks(body) {
  let converted = body;
  // Absolute domain links
  converted = converted.replace(
    /https?:\/\/(?:www\.)?sanyuesha\.com\/\d{4}\/\d{2}\/\d{2}\/([A-Za-z0-9-_]+)\/?/g,
    (_m, slug) => `/blog/${slug}`
  );
  // Relative date-style links
  converted = converted.replace(
    /(\(|\s)(\/\d{4}\/\d{2}\/\d{2}\/([A-Za-z0-9-_]+)\/?)/g,
    (_m, prefix, _full, slug) => `${prefix}/blog/${slug}`
  );
  // Images pointing to old domain
  converted = converted.replace(
    /https?:\/\/(?:www\.)?sanyuesha\.com\/images\//g,
    "/images/"
  );
  return converted;
}

function collectImages(body, set) {
  const imageRegex = /!\[[^\]]*]\((\/images\/[^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(body))) {
    set.add(match[1]);
  }
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copyImages(imageSet) {
  ensureDir(ASTRO_PUBLIC_IMAGE_DIR);
  const missing = [];
  for (const rel of imageSet) {
    const target = path.join(ASTRO_PUBLIC_IMAGE_DIR, rel.replace(/^\/images\//, ""));
    if (fs.existsSync(target)) continue;
    let found = false;
    for (const base of HEXO_IMAGE_DIRS) {
      const candidate = path.join(base, rel.replace(/^\/images\//, ""));
      if (fs.existsSync(candidate)) {
        ensureDir(path.dirname(target));
        fs.copyFileSync(candidate, target);
        found = true;
        break;
      }
    }
    if (!found) missing.push(rel);
  }
  return missing;
}

function migrate() {
  ensureDir(ASTRO_POST_DIR);
  const files = fs
    .readdirSync(HEXO_POST_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("."));
  const slugSet = new Set(files.map((f) => path.basename(f, ".md")));
  const imageSet = new Set();
  const warnings = [];

  for (const file of files) {
    const fullPath = path.join(HEXO_POST_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const lines = raw.split(/\r?\n/);
    const end = lines.findIndex((line) => /^-{3,}$/.test(line.trim()));
    const frontLines = end === -1 ? [] : lines.slice(0, end);
    const bodyLines = end === -1 ? lines : lines.slice(end + 1);

    const meta = parseFrontmatter(frontLines);
    const slug = path.basename(file, ".md");
    const tags = Array.isArray(meta.tags)
      ? meta.tags
      : meta.tags
        ? String(meta.tags)
            .split(/[,\s]+/)
            .filter(Boolean)
        : [];
    const categories = Array.isArray(meta.categories)
      ? meta.categories
      : meta.categories
        ? [String(meta.categories)]
        : [];

    const group = categories[0] || "未分组";
    const iso = isoDate(meta.date) || "1970-01-01";
    const bodyRaw = bodyLines.join("\n");
    const normalizedBody = normalizeLinks(bodyRaw, slugSet);
    collectImages(normalizedBody, imageSet);
    const summary = buildSummary(normalizedBody);

    const frontmatter = {
      title: meta.title || slug,
      summary,
      date: iso,
      tags,
      group
    };
    if (meta.cover) frontmatter.cover = meta.cover;

    const out = `---\n${toFrontmatter(frontmatter)}\n---\n\n${normalizedBody}`;
    const target = path.join(ASTRO_POST_DIR, `${slug}.mdx`);
    fs.writeFileSync(target, out, "utf-8");

    if (!meta.title || !meta.date) {
      warnings.push(`缺少字段: ${file}`);
    }
    if (!summary) {
      warnings.push(`摘要为空: ${file}`);
    }
  }

  const missingImages = copyImages(imageSet);

  const report = {
    migrated: files.length,
    imagesReferenced: imageSet.size,
    missingImages,
    warnings
  };
  fs.writeFileSync(
    path.join(ASTRO_POST_DIR, "__migration_report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
  console.log("迁移完成", report);
}

migrate();

