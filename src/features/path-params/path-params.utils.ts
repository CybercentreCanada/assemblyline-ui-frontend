import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamValuesFromBlueprintMap,
  RoutePath
} from 'features/path-params';
import type { Location } from 'react-router';

//*****************************************************************************************
// Path Param Blueprints
//*****************************************************************************************
export const PATH_PARAM_BLUEPRINTS_MAP = {
  string: (defaultValue = ''): InferPathParamBlueprintFromValue<string> => ({
    type: '',
    kind: 'string',
    parse: value => (value == null ? defaultValue : value),
    stringify: value => String(value)
  }),
  number: (defaultValue = 0): InferPathParamBlueprintFromValue<number> => ({
    type: 0,
    kind: 'number',
    parse: value => {
      if (value == null) return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => String(value)
  }),
  boolean: (defaultValue = false): InferPathParamBlueprintFromValue<boolean> => ({
    type: false,
    kind: 'boolean',
    parse: value => {
      if (value == null) return defaultValue;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return defaultValue;
    },
    stringify: value => String(value)
  }),
  enum: <const Values extends readonly [string | boolean | number, ...(string | boolean | number)[]]>(
    values: Values,
    defaultValue: Values[number] = values[0]
  ): InferPathParamBlueprintFromValue<Values[number]> => {
    const optionByString = new Map<string, Values[number]>();

    for (const option of values) {
      const serialized = String(option);
      if (optionByString.has(serialized) && !Object.is(optionByString.get(serialized), option)) {
        throw new TypeError('Enum options must have unique string representations.');
      }
      optionByString.set(serialized, option);
    }

    return {
      type: defaultValue,
      kind: 'enum',
      options: values,
      parse: value => {
        if (value == null) return defaultValue;
        for (const candidate of values) {
          if (String(candidate) === value) return candidate;
        }
        return defaultValue;
      },
      stringify: value => {
        for (const candidate of values) {
          if (String(candidate) === String(value)) return String(candidate);
        }
        return String(defaultValue);
      }
    };
  }
};

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************
export function createPathParamsCodec<const Path extends RoutePath>(basePath: Path) {
  return function <const Blueprints extends InferPathParamBlueprintMapFromPath<Path>>(
    input: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Blueprints
  ) {
    const blueprints = input(PATH_PARAM_BLUEPRINTS_MAP);
    const blueprintMap = blueprints as Record<string, InferPathParamBlueprintFromValue>;
    const blueprintKeys = Object.keys(blueprints || {});

    const type: InferPathParamValuesFromBlueprintMap<Blueprints> = {} as never;
    for (const key of blueprintKeys) {
      type[key as keyof typeof type] = blueprintMap[key].type as never;
    }

    const parse = (location: Location): InferPathParamValuesFromBlueprintMap<Blueprints> => {
      const safePathname = typeof location?.pathname === 'string' ? location?.pathname : '';
      const safeBasePath = typeof basePath === 'string' ? basePath : '';
      const raw: Record<string, string | undefined> = {};
      const pathnameParts = safePathname.split('/');
      const baseParts = safeBasePath.split('/');

      for (let index = 0; index < baseParts.length; index += 1) {
        const part = baseParts[index];
        if (!part || part[0] !== ':') continue;

        const paramKey = part.slice(1);
        const candidate = pathnameParts[index];
        if (candidate === undefined) {
          raw[paramKey] = undefined;
          continue;
        }

        try {
          raw[paramKey] = decodeURIComponent(candidate);
        } catch {
          raw[paramKey] = candidate;
        }
      }

      const parsed = {} as InferPathParamValuesFromBlueprintMap<Blueprints>;
      for (const key of blueprintKeys) {
        const parser = blueprintMap[key];
        parsed[key as keyof typeof parsed] = parser ? (parser.parse(raw[key]) as never) : (raw[key] as never);
      }
      return parsed;
    };

    const stringify = (params: InferPathParamValuesFromBlueprintMap<Blueprints>): string => {
      const safeBasePath = typeof basePath === 'string' ? basePath : '';
      const safeParams = (params ?? {}) as Partial<InferPathParamValuesFromBlueprintMap<Blueprints>>;
      const parts = safeBasePath.split('/');

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (!part || part[0] !== ':') continue;

        const key = part.slice(1);
        const parser = blueprintMap[key];
        const value = safeParams[key as keyof typeof safeParams];
        if (!parser) continue;

        parts[index] = encodeURIComponent(parser.stringify(value as never));
      }

      return parts.join('/');
    };

    return { blueprints, type, parse, stringify };
  };
}
