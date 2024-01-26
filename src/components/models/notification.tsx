import { z } from 'zod';
import { zTime } from './utils/helpers';

/**
 * JSON Feed Version 1.1
 * https://www.jsonfeed.org/
 */

export const decodeHTML = (html: string) => {
  if (!html) return '';
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

export const FeedHubSchema = z.object({
  type: z.string().default('').catch(''),
  url: z.string().default('').catch('')
});

export const FeedAttachmentSchema = z.object({
  url: z.string().url().default(null).catch(null),
  mime_type: z.string().default(null).catch(null),
  title: z.string().default('').catch(''),
  size_in_bytes: z.number().optional().default(0).catch(0),
  duration_in_seconds: z.number().optional().default(0).catch(0)
});

export const FeedAuthorSchema = z.object({
  name: z.string().optional().default(null).catch(null),
  url: z.string().url().optional().default(null).catch(null),
  avatar: z.string().url().optional().default(null).catch(null)
});

export const FeedItemSchema = z.object({
  id: z.string().default(null).catch(null),
  url: z.string().url().optional().default(null).catch(null),
  external_url: z.string().url().optional().default(null).catch(null),
  title: z.string().default(null).catch(null),
  content_html: z
    .string()
    .transform(arg => decodeHTML(arg))
    .default(null)
    .catch(null),
  content_md: z.string().default(null).catch(null),
  content_text: z.string().default(null).catch(null),
  summary: z.string().default(null).catch(null),
  image: z.string().url().default(null).catch(null),
  banner_image: z.string().url().default(null).catch(null),
  date_published: zTime,
  date_modified: zTime,
  authors: z.array(FeedAuthorSchema).default([]).catch([]),
  tags: z.enum(['new', 'current', 'dev', 'service', 'blog']).default(null).catch(null),
  language: z.string().default('en').catch('en'),
  attachments: z.array(FeedAttachmentSchema).default([]).catch([]),
  _isNew: z.boolean().default(false).catch(false)
});

export const FeedSchema = z.object({
  version: z.string().url().default(null).catch(null),
  title: z.string().default(null).catch(null),
  home_page_url: z.string().url().optional().default(null).catch(null),
  feed_url: z.string().url().optional().default(null).catch(null),
  description: z.string().optional().default(null).catch(null),
  user_comment: z.string().optional().default(null).catch(null),
  next_url: z.string().url().optional().default(null).catch(null),
  icon: z.string().url().optional().default(null).catch(null),
  favicon: z.string().url().optional().default(null).catch(null),
  authors: z.array(FeedAuthorSchema).default([]).catch([]),
  language: z.string().default('en').catch('en'),
  expired: z.boolean().optional().default(false).catch(false),
  hubs: z.array(FeedHubSchema).default([]).catch([]),
  items: z.array(FeedItemSchema).default([]).catch([])
});

export type FeedHub = z.infer<typeof FeedHubSchema>;
export type FeedAttachment = z.infer<typeof FeedAttachmentSchema>;
export type FeedAuthor = z.infer<typeof FeedAuthorSchema>;
export type FeedItem = z.infer<typeof FeedItemSchema>;
export type Feed = z.infer<typeof FeedSchema>;
