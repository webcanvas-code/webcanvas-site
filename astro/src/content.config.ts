import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Artykuły bloga: frontmatter (meta, hero, dane strukturalne) + treść w HTML.
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogTitle: z.string().optional(),
    ogImage: z.string().optional(),
    h1: z.string(),
    lead: z.array(z.string()).default([]),
    category: z.string().default(''),
    dateText: z.string().default(''),
    readTime: z.string().default(''),
    datePublished: z.string().default(''),
    dateModified: z.string().default(''),
    crumb: z.string().optional(),
    ctaHeading: z.string().optional(),
    excerpt: z.string().optional(),
    schema: z.array(z.any()).default([]),
  }),
});

// Pozostałe podstrony: hero + lista sekcji (wyciągnięte ze starych stron).
const pages = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages' }),
  schema: z.object({
    slug: z.string(),
    kind: z.string(),
    title: z.string(),
    description: z.string(),
    ogTitle: z.string().optional(),
    ogImage: z.string().optional(),
    robots: z.string().optional(),
    path: z.string(),
    schema: z.array(z.any()).default([]),
    hero: z.any(),
    sections: z.array(z.any()),
  }),
});

export const collections = { blog, pages };
