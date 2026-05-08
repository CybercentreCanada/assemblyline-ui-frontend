//*****************************************************************************************
// Key Construction
//*****************************************************************************************

/**
 * @name getHighlighterKey
 * @description Constructs a composite highlight key from a type and value.
 * @param type - Key type identifier
 * @param value - Key value
 * @returns Composite key in format "type__value"
 */
export const getHighlighterKey = (type: string, value: string): string => `${type}__${value}`;

//*****************************************************************************************
// Key Selectors
//*****************************************************************************************

/**
 * @name hasHighlighterKey
 * @description Returns a selector function that checks if a key is directly or indirectly highlighted.
 * @param key - Key to test
 * @returns Selector function that takes store state and returns true if highlighted
 */
export const hasHighlighterKey =
  (key: string) =>
  (store: AppInterface): boolean => {
    if (store.highlighter.links) return store.highlighter.keys.has(key) || store.highlighter.related.has(key);
    else return store.highlighter.keys.has(key);
  };

/**
 * @name hasHighlighterKeys
 * @description Returns a selector function that checks if any key in a list is highlighted.
 * @param keys - Keys to test
 * @returns Selector function that takes store state and returns true if any key is highlighted
 */
export const hasHighlighterKeys =
  (keys: string[]) =>
  (store: AppInterface): boolean =>
    keys.some(item => hasHighlighterKey(item)(store));

//*****************************************************************************************
// State Updaters
//*****************************************************************************************

/**
 * @name toggleHighlighterKey
 * @description Returns an updater function that toggles a key's highlight state and recomputes related keys.
 * @param key - Key to toggle
 * @returns Updater function that takes store state and returns mutated state
 */
export const toggleHighlighterKey =
  (key: string) =>
  (store: AppInterface): AppInterface => {
    if (!store.highlighter.keys.has(key)) {
      store.highlighter.keys.add(key);
    } else {
      store.highlighter.keys.delete(key);
    }

    if (store.highlighter.links) {
      store.highlighter.related.clear();
      store.highlighter.keys.forEach(item => {
        const items = store.highlighter.links[item];
        if (items) {
          for (const val of items) {
            store.highlighter.related.add(val);
          }
        }
      });
    }

    return store;
  };
