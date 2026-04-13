import { WhoAmI } from 'models/ui/user';

/**
 * @name flatten
 * @description Flattens a nested object into a single-level map using dot-path keys.
 * @param obj - Input object to flatten. Nested objects are expanded into dot-path keys.
 * @returns Record<string, unknown> containing dot-path keys and their values.
 */
export const flatten = (obj: Record<string, unknown>) => {
  const out: Record<string, unknown> = {};

  const walk = (cur: unknown, prefix: string) => {
    if (cur === null || cur === undefined) {
      out[prefix] = cur;
      return;
    }
    if (Array.isArray(cur) || typeof cur !== 'object') {
      out[prefix] = cur;
      return;
    }

    for (const key of Object.keys(cur)) {
      const next = prefix ? `${prefix}.${key}` : key;
      walk((cur as Record<string, unknown>)[key], next);
    }
  };

  for (const key of Object.keys(obj ?? {})) {
    walk(obj[key], key);
  }

  return out;
};

/**
 * @name ValidatedProp
 * @description A single property/value pair used to validate against a flattened props map.
 */
export type ValidatedProp = {
  prop: string;
  value: unknown;
  enforce?: boolean;
};

export type ValidatePropOptions = {
  /** treat array values as "contains" (default true) */
  arrayContains?: boolean;
  /** use loose equality instead of strict (default false) */
  looseEqual?: boolean;
  /** return false if prop key is missing (default true) */
  requireKey?: boolean;
};

const isEqual = (a: unknown, b: unknown, loose: boolean) => (loose ? a == b : a === b);

/**
 * @name validateProp
 * @description Validates one property from a flattened map against a target value.
 * @param flattenedProps - Map of dot-path keys to values.
 * @param propDef - The property rule to validate.
 * @param options - Matching behavior (arrayContains, looseEqual, requireKey).
 * @returns boolean indicating whether the property matches the rule.
 */
export const validateProp = (
  flattenedProps: Record<string, unknown>,
  propDef: ValidatedProp,
  options: ValidatePropOptions = {}
): boolean => {
  const { arrayContains = true, looseEqual = false, requireKey = true } = options;

  if (!flattenedProps || !propDef?.prop) return false;
  if (requireKey && !(propDef.prop in flattenedProps)) return false;

  const value = flattenedProps[propDef.prop];

  if (Array.isArray(value)) {
    return arrayContains
      ? value.some(v => isEqual(v, propDef.value, looseEqual))
      : isEqual(value, propDef.value, looseEqual);
  }

  return isEqual(value, propDef.value, looseEqual);
};

export type ValidatePropsOptions = ValidatePropOptions & {
  /** if true, an empty list returns true (default true) */
  allowEmpty?: boolean;
};

/**
 * @name validateProps
 * @description Validates a list of property rules against a flattened map.
 * @param flattenedProps - Map of dot-path keys to values.
 * @param props - List of property rules (enforced and optional).
 * @param options - Matching behavior and allowEmpty.
 * @returns boolean indicating whether all enforced rules match and at least one optional matches.
 */
export const validateProps = (
  flattenedProps: Record<string, unknown>,
  props: ValidatedProp[] | undefined,
  options: ValidatePropsOptions = {}
): boolean => {
  const { allowEmpty = true, ...validateOptions } = options;

  if (!props || !Array.isArray(props)) return allowEmpty;

  const enforced = props.filter(p => p?.enforce);
  const optional = props.filter(p => !p?.enforce);

  const enforcedOk = enforced.length === 0 || enforced.every(p => validateProp(flattenedProps, p, validateOptions));
  const optionalOk = optional.length === 0 || optional.some(p => validateProp(flattenedProps, p, validateOptions));

  return enforcedOk && optionalOk;
};

/**
 * @name NormalizedWhoAmI
 * @description Normalized WhoAmI output with uppercased classification definition and derived fields.
 */
export type NormalizedWhoAmI = {
  user: Omit<
    WhoAmI,
    'configuration' | 'classification_aliases' | 'c12nDef' | 'indexes' | 'system_message' | 'settings'
  > & {
    dynamic_group: string | null;
  };
  configuration: WhoAmI['configuration'];
  classificationAliases: WhoAmI['classification_aliases'];
  c12nDef: WhoAmI['c12nDef'];
  indexes: WhoAmI['indexes'];
  systemMessage: WhoAmI['system_message'];
  settings: WhoAmI['settings'];
  flattenedProps: Record<string, unknown>;
};

/**
 * @name normalizeWhoAmI
 * @description Normalizes WhoAmI data by uppercasing classification labels, deriving dynamic_group,
 * and producing a flattened props map for validation.
 * @param whoAmI - Raw WhoAmI response payload.
 * @returns NormalizedWhoAmI containing normalized fields and flattenedProps.
 */
export function normalizeWhoAmI({
  configuration,
  classification_aliases: c12nAliases,
  c12nDef: c12n,
  indexes,
  system_message: msg,
  settings,
  ...curUser
}: WhoAmI): NormalizedWhoAmI {
  const upperC12n = {
    ...c12n,
    original_definition: {
      ...c12n.original_definition,
      groups: c12n.original_definition.groups.map(grp => ({
        ...grp,
        aliases: grp.aliases.map(val => val.toUpperCase()),
        name: grp.name.toUpperCase(),
        short_name: grp.short_name.toUpperCase()
      })),
      levels: c12n.original_definition.levels.map(lvl => ({
        ...lvl,
        aliases: lvl.aliases.map(val => val.toUpperCase()),
        name: lvl.name.toUpperCase(),
        short_name: lvl.short_name.toUpperCase()
      })),
      subgroups: c12n.original_definition.subgroups.map(sg => ({
        ...sg,
        aliases: sg.aliases.map(val => val.toUpperCase()),
        name: sg.name.toUpperCase(),
        short_name: sg.short_name.toUpperCase()
      })),
      required: c12n.original_definition.required.map(req => ({
        ...req,
        aliases: req.aliases.map(val => val.toUpperCase()),
        name: req.name.toUpperCase(),
        short_name: req.short_name.toUpperCase()
      }))
    }
  };

  const user = {
    ...curUser,
    dynamic_group: curUser.email ? curUser.email.toUpperCase().split('@')[1] : null
  };

  const flattenedProps = flatten({
    user,
    classificationAliases: c12nAliases,
    c12nDef: upperC12n,
    configuration,
    indexes,
    settings
  });

  return {
    user,
    configuration,
    classificationAliases: c12nAliases,
    c12nDef: upperC12n,
    indexes,
    systemMessage: msg,
    settings,
    flattenedProps
  };
}
