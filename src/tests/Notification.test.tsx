import { FeedURLsSchema } from 'components/models/notification';

test('Tests the notification parsers', () => {
  expect(FeedURLsSchema.parse(null)).toStrictEqual([]);
  expect(FeedURLsSchema.parse('string')).toStrictEqual([]);
  expect(FeedURLsSchema.parse(['url'])).toStrictEqual([]);
  expect(FeedURLsSchema.parse(['https://www.google.com/'])).toStrictEqual(['https://www.google.com/']);
  expect(FeedURLsSchema.parse(['https://www.google.com/', null, 'url'])).toStrictEqual(['https://www.google.com/']);
});
