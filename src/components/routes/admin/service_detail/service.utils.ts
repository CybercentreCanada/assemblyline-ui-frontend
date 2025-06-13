export const getValue = <T extends object, K extends keyof T>(obj: T, fieldname: K): T[K] | string | null => {
  const val = obj?.[fieldname] || null;
  return Array.isArray(val) ? JSON.stringify(val) : val;
};

export const showReset = <T extends object, K extends keyof T>(original: T, defaults: T, field: K): boolean =>
  Array.isArray(field)
    ? field.some(elem => getValue(original, elem) !== getValue(defaults, elem))
    : getValue(original, field) !== getValue(defaults, field);
