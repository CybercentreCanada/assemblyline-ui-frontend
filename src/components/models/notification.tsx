import { z } from 'zod';

export const FeedAuthorSchema = z.object({
  name: z.string().optional().default('').catch('').describe('author’s name'),
  url: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of a site owned by the author. It could be a blog, micro-blog, Twitter account, and so on. Ideally the linked-to page provides a way to contact the author, but that’s not required. The URL could be a mailto: link, though we suspect that will be rare.'
    ),
  avatar: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL for an image for the author. As with icon, it should be square and relatively large — such as 512 x 512 — and should use transparency where appropriate, since it may be rendered on a non-white background.'
    )
});

export const FeedItemSchema = z.object({
  id: z
    .string()
    .default('')
    .catch('')
    .describe(
      'Unique for that item for that feed over time. If an item is ever updated, the id should be unchanged. New items should never use a previously-used id. If an id is presented as a number or other type, a JSON Feed reader must coerce it to a string. Ideally, the id is the full URL of the resource described by the item, since URLs make great unique identifiers.'
    ),
  url: z
    .string()
    .default('')
    .catch('')
    .describe(
      'URL of the resource described by the item. It’s the permalink. This may be the same as the id — but should be present regardless.'
    ),
  external_url: z
    .string()
    .default('')
    .catch('')
    .describe(
      'URL of a page elsewhere. This is especially useful for linkblogs. If url links to where you’re talking about a thing, then external_url links to the thing you’re talking about.'
    ),
  title: z.string().default('').catch('').describe('plain text. Microblog items in particular may omit titles.'),
  content_html: z.string().default('').catch('').describe('This is the HTML of the item.'),
  content_text: z.string().default('').catch('').describe('This is the plain text of the item.'),
  content_md: z.string().default('').catch('').describe('This is the Markdown text of the item.'),
  summary: z
    .string()
    .default('')
    .catch('')
    .describe(
      'plain text sentence or two describing the item. This might be presented in a timeline, for instance, where a detail view would display all of content_html or content_text.'
    ),
  image: z
    .string()
    .default('')
    .catch('')
    .describe(
      'URL of the main image for the item. This image may also appear in the content_html — if so, it’s a hint to the feed reader that this is the main, featured image. Feed readers may use the image as a preview (probably resized as a thumbnail and placed in a timeline).'
    ),
  banner_image: z.string().default('').catch('').describe(''),
  date_published: z.string().default('').catch('').describe(''),
  date_modified: z.string().default('').catch('').describe(''),
  authors: z.string().default('').catch('').describe(''),
  tags: z.string().default('').catch('').describe(''),
  language: z.string().default('').catch('').describe(''),
  attachments: z.string().default('').catch('').describe(''),
  _isNew: z.string().default('').catch('').describe('')
});

export const FeedSchema = z.object({
  version: z
    .string()
    .default('')
    .catch('')
    .describe(
      'URL of the version of the format the feed uses. This should appear at the very top, though we recognize that not all JSON generators allow for ordering.'
    ),
  title: z
    .string()
    .default('')
    .catch('')
    .describe(
      'Name of the feed, which will often correspond to the name of the website (blog, for instance), though not necessarily.'
    ),
  home_page_url: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of the resource that the feed describes. This resource may or may not actually be a “home” page, but it should be an HTML page. If a feed is published on the public web, this should be considered as required. But it may not make sense in the case of a file created on a desktop computer, when that file is not shared or is shared only privately.'
    ),
  feed_url: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of the feed, and serves as the unique identifier for the feed. As with home_page_url, this should be considered required for feeds on the public web.'
    ),
  description: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'Provides more detail, beyond the title, on what the feed is about. A feed reader may display this text.'
    ),
  user_comment: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'Description of the purpose of the feed. This is for the use of people looking at the raw JSON, and should be ignored by feed readers.'
    ),
  next_url: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of a feed that provides the next n items, where n is determined by the publisher. This allows for pagination, but with the expectation that reader software is not required to use it and probably won’t use it very often. next_url must not be the same as feed_url, and it must not be the same as a previous next_url (to avoid infinite loops).'
    ),
  icon: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of an image for the feed suitable to be used in a timeline, much the way an avatar might be used. It should be square and relatively large — such as 512 x 512 — so that it can be scaled-down and so that it can look good on retina displays. It should use transparency where appropriate, since it may be rendered on a non-white background.'
    ),
  favicon: z
    .string()
    .optional()
    .default('')
    .catch('')
    .describe(
      'URL of an image for the feed suitable to be used in a source list. It should be square and relatively small, but not smaller than 64 x 64 (so that it can look good on retina displays). As with icon, this image should use transparency where appropriate, since it may be rendered on a non-white background.'
    ),
  authors: z
    .array(FeedAuthorSchema)
    .default([])
    .catch([])
    .describe(
      'Specifies the feed author. The author object has several members. These are all optional — but if you provide an author object, then at least one is required.'
    ),
  language: z.string().default('EN').catch('EN').describe('Specifies the language of the feed.'),
  expired: z
    .boolean()
    .default(false)
    .catch(false)
    .describe(
      'says whether or not the feed is finished — that is, whether or not it will ever update again. A feed for a temporary event, such as an instance of the Olympics, could expire. If the value is true, then it’s expired. Any other value, or the absence of expired, means the feed may continue to update.'
    ),
  hubs: z
    .array(z.object({ type1: z.string().default('').catch(''), url: z.string().default('').catch('') }))
    .default([])
    .catch([])
    .describe(
      'describes endpoints that can be used to subscribe to real-time notifications from the publisher of this feed. Each object has a type and url, both of which are required. See the section “Subscribing to Real-time Notifications” below for details.'
    ),
  items: z.array(FeedItemSchema).default([]).catch([])
});
