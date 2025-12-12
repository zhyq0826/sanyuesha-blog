import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      published: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      group: z.string().optional(),
      series: z.string().optional(),
      author: z.string().optional(),
      cover: z.string().optional(),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string()
        })
        .optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().optional().default(false),
      toc: z.boolean().optional().default(true)
    })
});

const insights = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      group: z.string().optional(),
      cover: z.string().optional(),
      coverImage: z
        .strictObject({
          src: image(),
          alt: z.string()
        })
        .optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().optional().default(false),
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

const home = defineCollection({
  loader: glob({ pattern: ["home.md", "home.mdx"], base: "./src/content" }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default("My avatar")
        })
        .optional(),
      githubCalendar: z.string().optional()
    })
});

const addendum = defineCollection({
  loader: glob({ pattern: ["addendum.md", "addendum.mdx"], base: "./src/content" }),
  schema: ({ image }) =>
    z.object({
      avatarImage: z
        .object({
          src: image(),
          alt: z.string().optional().default("My avatar")
        })
        .optional()
    })
});

export const collections = {
  posts,
  insights,
  projects,
  tools,
  home,
  addendum
};

