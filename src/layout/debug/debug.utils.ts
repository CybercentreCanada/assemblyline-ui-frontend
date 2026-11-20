/**
 * @name serializeAppDebugState
 * @description Serializes a zustand store state to indented JSON, tolerating circular references,
 *              functions and DOM nodes that would otherwise throw.
 * @param state - Store state to serialize
 * @returns Indented JSON string, or a placeholder when serialization fails
 */
export const serializeAppDebugState = (state: unknown): string => {
  const seen = new WeakSet<object>();

  try {
    return (
      JSON.stringify(
        state,
        (_key: string, value: unknown) => {
          if (typeof value === 'function') return '[Function]';
          if (typeof value === 'bigint') return value.toString();
          if (typeof value === 'symbol') return value.toString();
          if (typeof Node !== 'undefined' && value instanceof Node) return '[DOM Node]';
          if (value instanceof Set) return [...(value as Set<unknown>)];

          if (value && typeof value === 'object') {
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
          }

          return value;
        },
        2
      ) ?? 'null'
    );
  } catch {
    return '[Unserializable]';
  }
};

/**
 * @name formatAppDebugTimestamp
 * @description Formats a snapshot timestamp for the history list.
 * @param timestamp - Epoch milliseconds
 * @returns Localized time string including milliseconds
 */
export const formatAppDebugTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.toLocaleTimeString()} (${`${date.getMilliseconds()}`.padStart(3, '0')}ms)`;
};
