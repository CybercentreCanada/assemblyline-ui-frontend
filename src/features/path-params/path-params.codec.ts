import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamValuesFromBlueprintMap,
  RoutePath
} from 'features/path-params/path-params.models';
import type { Location } from 'react-router';

//*****************************************************************************************
// Path Param Blueprints
//*****************************************************************************************
export const PATH_PARAM_BLUEPRINTS_MAP = {
  string: (defaultValue = ''): InferPathParamBlueprintFromValue<string> => ({
    type: '',
    parse: value => (value == null ? defaultValue : value),
    stringify: value => String(value)
  }),
  number: (defaultValue = 0): InferPathParamBlueprintFromValue<number> => ({
    type: 0,
    parse: value => {
      if (value == null) return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => String(value)
  }),
  boolean: (defaultValue = false): InferPathParamBlueprintFromValue<boolean> => ({
    type: false,
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
  ): InferPathParamBlueprintFromValue<Values[number]> => ({
    type: defaultValue,
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
  })
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
      const pathnameParts = safePathname.split('/').filter(Boolean);
      const baseParts = safeBasePath.split('/').filter(Boolean);

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

        try {
          parts[index] = encodeURIComponent(parser.stringify(value as never));
        } catch {
          parts[index] = String(value ?? '');
        }
      }

      return parts.join('/');
    };

    return { blueprints, type, parse, stringify };
  };
}
