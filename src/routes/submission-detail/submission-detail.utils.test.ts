import { getFileTreeKeys, isFileTreeItemVisible } from 'routes/submission-detail/submission-detail.utils';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// isFileTreeItemVisible
//*****************************************************************************************
describe('isFileTreeItemVisible', () => {
  it('shows a highlighted safe item', () => {
    const item = { children: {}, name: ['safe.txt'], score: 0, sha256: 'safe', type: 'text/plain' };

    expect(isFileTreeItemVisible(item, [], new Set(['safe']), false)).toBe(true);
  });

  it('shows a parent when a descendant is highlighted', () => {
    const item = {
      children: {
        child: { children: {}, name: ['child.txt'], score: 0, sha256: 'child', type: 'text/plain' }
      },
      name: ['parent.zip'],
      score: 0,
      sha256: 'parent',
      type: 'application/zip'
    };

    expect(isFileTreeItemVisible(item, [], new Set(['child']), false)).toBe(true);
  });

  it('hides an unhighlighted safe leaf when safe results are disabled', () => {
    const item = { children: {}, name: ['safe.txt'], score: 0, sha256: 'safe', type: 'text/plain' };

    expect(isFileTreeItemVisible(item, [], new Set(), false)).toBe(false);
  });
});

//*****************************************************************************************
// getFileTreeKeys
//*****************************************************************************************
describe('getFileTreeKeys', () => {
  it('returns parent and descendant keys', () => {
    const tree = {
      parent: {
        children: {
          child: { children: {}, name: ['child.txt'], score: 0, sha256: 'child', type: 'text/plain' }
        },
        name: ['parent.zip'],
        score: 0,
        sha256: 'parent',
        type: 'application/zip'
      }
    };

    expect(getFileTreeKeys(tree)).toEqual(['parent', 'child']);
  });

  it('returns keys for a tree with no descendants', () => {
    const tree = {
      file: { children: {}, name: ['file.txt'], score: 0, sha256: 'file', type: 'text/plain' }
    };

    expect(getFileTreeKeys(tree)).toEqual(['file']);
  });

  it('returns an empty list for an empty tree', () => {
    expect(getFileTreeKeys({})).toEqual([]);
  });
});
