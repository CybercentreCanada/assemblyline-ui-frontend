import { beforeEach, describe, expect, it } from 'vitest';
import type { JSONFeedItem } from './notifications.models';
import { DEFAULT_JSON_FEED_ITEM } from './notifications.models';
import {
  arrayEquals,
  arrayHigher,
  decodeHTML,
  formatDate,
  getNewService,
  getVersionType,
  getVersionValues,
  markItemsAsNewerThan,
  type MinimalService,
  normalizeTags,
  readLastOpenedAt,
  sortByPublishedDateDesc,
  writeLastOpenedAt
} from './notifications.utils';

//*****************************************************************************************
// formatDate
//*****************************************************************************************

describe('formatDate', () => {
  it('should return empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('');
  });

  it('should return formatted string for valid ISO date', () => {
    const result = formatDate('2024-01-15T10:30:00Z');
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});

//*****************************************************************************************
// readLastOpenedAt / writeLastOpenedAt
//*****************************************************************************************

describe('readLastOpenedAt', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return epoch when no value stored', () => {
    expect(readLastOpenedAt().valueOf()).toBe(0);
  });

  it('should return stored date', () => {
    const date = new Date('2024-06-01T00:00:00Z');
    writeLastOpenedAt(date);
    expect(readLastOpenedAt().valueOf()).toBe(date.valueOf());
  });

  it('should return epoch for corrupted value', () => {
    localStorage.setItem('notifications.lastOpenedAt', 'garbage');
    expect(readLastOpenedAt().valueOf()).toBe(0);
  });
});

//*****************************************************************************************
// sortByPublishedDateDesc
//*****************************************************************************************

describe('sortByPublishedDateDesc', () => {
  it('should sort items by date descending', () => {
    const items: JSONFeedItem[] = [
      { ...DEFAULT_JSON_FEED_ITEM, id: '1', date_published: '2024-01-01T00:00:00Z' },
      { ...DEFAULT_JSON_FEED_ITEM, id: '2', date_published: '2024-06-01T00:00:00Z' },
      { ...DEFAULT_JSON_FEED_ITEM, id: '3', date_published: '2024-03-01T00:00:00Z' }
    ];
    const sorted = sortByPublishedDateDesc(items);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });

  it('should not mutate the original array', () => {
    const items: JSONFeedItem[] = [
      { ...DEFAULT_JSON_FEED_ITEM, id: '1', date_published: '2024-06-01T00:00:00Z' },
      { ...DEFAULT_JSON_FEED_ITEM, id: '2', date_published: '2024-01-01T00:00:00Z' }
    ];
    sortByPublishedDateDesc(items);
    expect(items[0].id).toBe('1');
  });
});

//*****************************************************************************************
// markItemsAsNewerThan
//*****************************************************************************************

describe('markItemsAsNewerThan', () => {
  it('should mark items published after cutoff as new', () => {
    const cutoff = new Date('2024-03-01T00:00:00Z');
    const items: JSONFeedItem[] = [
      { ...DEFAULT_JSON_FEED_ITEM, date_published: '2024-04-01T00:00:00Z' },
      { ...DEFAULT_JSON_FEED_ITEM, date_published: '2024-01-01T00:00:00Z' }
    ];
    const result = markItemsAsNewerThan(items, cutoff);
    expect(result[0]._isNew).toBe(true);
    expect(result[1]._isNew).toBe(false);
  });
});

//*****************************************************************************************
// normalizeTags
//*****************************************************************************************

describe('normalizeTags', () => {
  it('should filter out falsy values', () => {
    expect(normalizeTags(['a', '', 'b', null as unknown as string])).toEqual(['a', 'b']);
  });

  it('should return empty array for non-array', () => {
    expect(normalizeTags(undefined as unknown as string[])).toEqual([]);
  });
});

//*****************************************************************************************
// arrayEquals
//*****************************************************************************************

describe('arrayEquals', () => {
  it('should return true for equal arrays', () => {
    expect(arrayEquals([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return false for different arrays', () => {
    expect(arrayEquals([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it('should return false for different lengths', () => {
    expect(arrayEquals([1, 2], [1, 2, 3])).toBe(false);
  });
});

//*****************************************************************************************
// arrayHigher
//*****************************************************************************************

describe('arrayHigher', () => {
  it('should return true when first is higher', () => {
    expect(arrayHigher([2, 0, 0], [1, 9, 9])).toBe(true);
  });

  it('should return false when equal', () => {
    expect(arrayHigher([1, 2, 3], [1, 2, 3])).toBe(false);
  });

  it('should return false when lower', () => {
    expect(arrayHigher([1, 0, 0], [1, 0, 1])).toBe(false);
  });

  it('should return false for different lengths', () => {
    expect(arrayHigher([1, 2], [1, 2, 3])).toBe(false);
  });
});

//*****************************************************************************************
// getVersionValues
//*****************************************************************************************

describe('getVersionValues', () => {
  it('should parse stable version', () => {
    expect(getVersionValues('4.5.1.stable1')).toEqual([4, 5, 1, 1]);
  });

  it('should parse dev version', () => {
    expect(getVersionValues('4.5.1.dev2')).toEqual([4, 5, 1, 2]);
  });

  it('should return empty array for invalid string', () => {
    expect(getVersionValues('not-a-version')).toEqual([]);
  });
});

//*****************************************************************************************
// getVersionType
//*****************************************************************************************

describe('getVersionType', () => {
  const makeConfig = (version: string) => ({ system: { version } }) as unknown as Parameters<typeof getVersionType>[1];

  it('should return null if no version info', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, url: '' };
    expect(getVersionType(item, makeConfig('4.5.1.1'))).toBeNull();
  });

  it('should return current for matching versions', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, url: '4.5.1.stable1' };
    expect(getVersionType(item, makeConfig('4.5.1.1'))).toBe('current');
  });

  it('should return newer when notification version is higher', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, url: '5.0.0.stable1' };
    expect(getVersionType(item, makeConfig('4.5.1.1'))).toBe('newer');
  });

  it('should return older when notification version is lower', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, url: '4.0.0.stable1' };
    expect(getVersionType(item, makeConfig('4.5.1.1'))).toBe('older');
  });
});

//*****************************************************************************************
// getNewService
//*****************************************************************************************

describe('getNewService', () => {
  it('should return null for non-service notifications', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, title: 'Some Update' };
    expect(getNewService(item, [])).toBeNull();
  });

  it('should return true when service exists', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, title: 'myapp service update' };
    const services: MinimalService[] = [{ name: 'myap' }];
    expect(getNewService(item, services)).toBe(true);
  });

  it('should return false when service is new', () => {
    const item = { ...DEFAULT_JSON_FEED_ITEM, title: 'newapp Service Update' };
    const services: MinimalService[] = [{ name: 'other' }];
    expect(getNewService(item, services)).toBe(false);
  });
});

//*****************************************************************************************
// decodeHTML
//*****************************************************************************************

describe('decodeHTML', () => {
  it('should decode HTML entities', () => {
    expect(decodeHTML('&amp; &lt; &gt;')).toBe('& < >');
  });

  it('should return plain text unchanged', () => {
    expect(decodeHTML('hello world')).toBe('hello world');
  });
});
