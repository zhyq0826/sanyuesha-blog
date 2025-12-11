import { defineCollection, z } from "astro:content";

const basePostFields = {
  title: z.string(),
  summary: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  group: z.string().optional(),
  cover: z.string().optional(),
  featured: z.boolean().default(false)
};

const posts = defineCollection({
  type: "content",
  schema: z.object(basePostFields)
});

const insights = defineCollection({
  type: "content",
  schema: z.object({
    ...basePostFields,
    source: z.string().optional()
  })
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    link: z.string().optional(),
    repo: z.string().optional(),
    status: z.enum(["wip", "released", "archived"]).default("released")
  })
});

const tools = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    version: z.string().default("0.1.0"),
    link: z.string().optional(),
    download: z.string().optional(),
    tags: z.array(z.string()).default([]),
    changelog: z.array(z.string()).optional()
  })
});

export const collections = {
  posts,
  insights,
  projects,
  tools
};

