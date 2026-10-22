import type {
  InferPathParamBlueprintFromValue,
  InferPathParamBlueprintMapFromPath,
  InferPathParamStringifyValuesFromBlueprintMap,
  InferPathParamValuesFromBlueprintMap,
  RoutePath,
  RoutePathWithoutOptionalStaticSegments
} from 'features/path-params';
import type { Location } from 'react-router';

const assertValidPathParam = (value: string): void => {
  if (value === '' || value === '.' || value === '..') {
    throw new TypeError('Path parameter values must not be empty, "." or "..".');
  }
};

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
          if (Object.is(candidate, value)) return String(candidate);
        }
        return String(defaultValue);
      }
    };
  }
};

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************
export function createPathParamsCodec<const Path extends RoutePath>(
  basePath: Path & RoutePathWithoutOptionalStaticSegments<Path>
) {
  const initialBasePath = typeof basePath === 'string' ? basePath : '';
  if (initialBasePath.split('/').some(segment => segment.endsWith('?') && !segment.startsWith(':'))) {
    throw new TypeError('Optional static path segments are not supported.');
  }

  return function <
    const Blueprints extends InferPathParamBlueprintMapFromPath<Path> & Record<string, InferPathParamBlueprintFromValue>
  >(input: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Blueprints) {
    const blueprints = input(PATH_PARAM_BLUEPRINTS_MAP);
    const blueprintMap = blueprints as Record<string, InferPathParamBlueprintFromValue>;
    const blueprintKeys = Object.keys(blueprints || {});

    const type = Object.create(null) as InferPathParamValuesFromBlueprintMap<Blueprints>;
    for (const key of blueprintKeys) {
      type[key as keyof typeof type] = blueprintMap[key].type as never;
    }

    const parse = (location: Location): InferPathParamValuesFromBlueprintMap<Blueprints> => {
      const safePathname = typeof location?.pathname === 'string' ? location?.pathname : '';
      const safeBasePath = typeof basePath === 'string' ? basePath : '';
      const pathnameParts = safePathname.replace(/^\//, '').split('/');
      const baseParts = safeBasePath.replace(/^\//, '').split('/');

      const matchSegments = (
        baseIndex: number,
        pathnameIndex: number,
        params: Record<string, string | undefined>
      ): Record<string, string | undefined> | null => {
        if (baseIndex === baseParts.length) {
          return pathnameIndex === pathnameParts.length ||
            (pathnameIndex === pathnameParts.length - 1 && pathnameParts[pathnameIndex] === '')
            ? params
            : null;
        }

        const part = baseParts[baseIndex];
        if (!part || part[0] !== ':') {
          if (
            pathnameIndex >= pathnameParts.length ||
            part.toLowerCase() !== pathnameParts[pathnameIndex].toLowerCase()
          ) {
            return null;
          }
          return matchSegments(baseIndex + 1, pathnameIndex + 1, params);
        }

        const optional = part.endsWith('?');
        const paramKey = part.slice(1, optional ? -1 : undefined);
        const candidate = pathnameParts[pathnameIndex];
        if (candidate === undefined) {
          const missingParams = Object.assign(Object.create(null), params) as Record<string, string | undefined>;
          missingParams[paramKey] = undefined;
          return matchSegments(baseIndex + 1, pathnameIndex, missingParams);
        }

        let decodedCandidate: string;
        try {
          decodedCandidate = decodeURIComponent(candidate);
        } catch {
          decodedCandidate = candidate;
        }

        assertValidPathParam(decodedCandidate);
        const includedParams = Object.assign(Object.create(null), params) as Record<string, string | undefined>;
        includedParams[paramKey] = decodedCandidate;
        const includedMatch = matchSegments(baseIndex + 1, pathnameIndex + 1, includedParams);
        if (includedMatch || !optional) return includedMatch;

        const omittedParams = Object.assign(Object.create(null), params) as Record<string, string | undefined>;
        omittedParams[paramKey] = undefined;
        return matchSegments(baseIndex + 1, pathnameIndex, omittedParams);
      };

      const raw = matchSegments(0, 0, Object.create(null)) ?? Object.create(null);

      const parsed = Object.create(null) as InferPathParamValuesFromBlueprintMap<Blueprints>;
      for (const key of blueprintKeys) {
        const parser = blueprintMap[key];
        parsed[key as keyof typeof parsed] = parser ? (parser.parse(raw[key]) as never) : (raw[key] as never);
      }
      return parsed;
    };

    const stringify = (params: InferPathParamStringifyValuesFromBlueprintMap<Path, Blueprints>): string => {
      const safeBasePath = typeof basePath === 'string' ? basePath : '';
      const safeParams = (params ?? {}) as Partial<InferPathParamValuesFromBlueprintMap<Blueprints>>;
      const parts: string[] = [];

      for (const part of safeBasePath.split('/')) {
        if (!part || part[0] !== ':') {
          parts.push(part);
          continue;
        }

        const optional = part.endsWith('?');
        const key = part.slice(1, optional ? -1 : undefined);
        const parser = blueprintMap[key];
        const value = safeParams[key as keyof typeof safeParams];
        if (optional && value == null) continue;
        if (!parser) {
          parts.push(part);
          continue;
        }

        const serializedValue = parser.stringify(value as never);
        const encodedValue = encodeURIComponent(serializedValue);
        assertValidPathParam(serializedValue);
        parts.push(encodedValue);
      }

      return parts.join('/');
    };

    return { blueprints, type, parse, stringify };
  };
}
