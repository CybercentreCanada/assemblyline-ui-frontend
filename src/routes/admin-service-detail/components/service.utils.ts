export const getValue = <T extends object, K extends keyof T>(obj: T, fieldname: K): T[K] | string | null => {
  const val = obj?.[fieldname] || null;
  return Array.isArray(val) ? JSON.stringify(val) : val;
};

export const showReset = <T extends object, K extends keyof T>(current: T, defaults: T, field: K | K[]): boolean =>
  !current || !defaults
    ? false
    : Array.isArray(field)
      ? field.some(elem => getValue(current, elem) !== getValue(defaults, elem))
      : getValue(current, field) !== getValue(defaults, field);
