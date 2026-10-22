/**
 * @name isValidValue
 * @description Determines whether a value contains usable data.
 * @param value - Value to validate.
 * @returns True when the value is non-empty and usable.
 */
export const isValidValue = <T>(value: T): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * @name isValidNumber
 * @description Checks whether a number is within optional inclusive bounds.
 * @param value - Number to validate.
 * @param range - Optional minimum and maximum bounds.
 * @returns True when the value is defined and within the supplied bounds.
 */
export const isValidNumber = (
  value: number | null | undefined,
  { min = null, max = null }: { min?: number | null; max?: number | null }
): boolean => (value == null ? false : (min == null || value >= min) && (max == null || value <= max));

/**
 * @name shallowEqual
 * @description Compares two values by identity and enumerable object properties.
 * @param a - First value to compare.
 * @param b - Second value to compare.
 * @returns True when both values are shallowly equal.
 */
export const shallowEqual = <T>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  return keysA.length === keysB.length && keysA.every(key => key in b && Object.is(a[key], b[key]));
};

/**
 * @name deepReconcile
 * @description Reconciles incoming values with existing and initial values.
 * @param incoming - New values that take precedence.
 * @param existing - Current values.
 * @param initial - Initial fallback values.
 * @returns A reconciled value object.
 */
export const deepReconcile = <T extends Record<string, unknown>>(
  incoming: Partial<T>,
  existing: Partial<T>,
  initial: Partial<T>
): T => {
  const result: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(initial), ...Object.keys(existing), ...Object.keys(incoming)])) {
    if (key in incoming) {
      result[key] = incoming[key];
    } else if (key in existing && key in initial) {
      result[key] = initial[key];
    } else {
      result[key] = existing[key] ?? initial[key];
    }
  }

  return result as T;
};

/**
 * @name shallowReconcile
 * @description Reconciles current values with the previous result at one level.
 * @param current - Current incoming values.
 * @param previous - Previous incoming values.
 * @param result - Existing reconciled values.
 * @returns A shallowly reconciled value object.
 */
export const shallowReconcile = <T extends Record<string, unknown>>(
  current: Partial<T>,
  previous: Partial<T>,
  result: Partial<T>
): T => {
  const output: Record<string, unknown> = {};

  for (const key of new Set([...Object.keys(result), ...Object.keys(current), ...Object.keys(previous)])) {
    if (key in current) {
      output[key] = current[key];
    } else if (key in result && key in previous) {
      continue;
    } else if (key in result) {
      output[key] = result[key];
    }
  }

  return output as T;
};
