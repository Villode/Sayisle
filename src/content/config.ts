import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    draft: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    cover: z.string().optional(),
    summary: z.string().optional(),
  }),
});

const moments = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(z.object({
      id: z.number().optional(),
      author: z.string(),
      avatar: z.string().optional(),
      time: z.string(),
      text: z.string(),
      images: z.array(z.string()).optional(),
      date: z.string(),
    })),
  }),
});

export const collections = { blog, moments };
