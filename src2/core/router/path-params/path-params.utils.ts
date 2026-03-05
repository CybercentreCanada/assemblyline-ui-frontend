import {
  PathParamBlueprint,
  PathParamBlueprintMap,
  PathParamBlueprintValues,
  PathParamCodec,
  RoutePath
} from './path-params.models';

//*****************************************************************************************
// Path Param Blueprints
//*****************************************************************************************
export const PATH_PARAM_BLUEPRINTS_MAP = {
  string: (defaultValue = ''): PathParamBlueprint<string> => ({
    type: '',
    parse: value => (value === undefined ? defaultValue : value),
    stringify: value => String(value)
  }),
  number: (defaultValue = 0): PathParamBlueprint<number> => ({
    type: 0,
    parse: value => {
      if (value === undefined) return defaultValue;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? defaultValue : parsed;
    },
    stringify: value => String(value)
  }),
  boolean: (defaultValue = false): PathParamBlueprint<boolean> => ({
    type: false,
    parse: value => {
      if (value === undefined) return defaultValue;
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      return defaultValue;
    },
    stringify: value => String(value)
  })
};

//*****************************************************************************************
// Create Path Param Codec
//*****************************************************************************************
export function createPathParamsCodec<const Path extends RoutePath>(basePath: Path) {
  return function <const Blueprints extends PathParamBlueprintMap<Path>>(
    input: (blueprints: typeof PATH_PARAM_BLUEPRINTS_MAP) => Blueprints
  ): PathParamCodec<Blueprints> {
    const blueprints = input(PATH_PARAM_BLUEPRINTS_MAP);
    const blueprintKeys = Object.keys(blueprints);

    const type: PathParamBlueprintValues<Blueprints> = {} as any;
    for (const key of blueprintKeys) {
      type[key as keyof typeof type] = blueprints[key].type as any;
    }

    const parse: PathParamCodec<Blueprints>['parse'] = pathname => {
      const safePathname = typeof pathname === 'string' ? pathname : '';
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

      const parsed = {} as PathParamBlueprintValues<Blueprints>;
      for (const key of blueprintKeys) {
        const parser = blueprints[key];
        parsed[key as keyof typeof parsed] = parser ? (parser.parse(raw[key]) as any) : (raw[key] as any);
      }
      return parsed;
    };

    const stringify: PathParamCodec<Blueprints>['stringify'] = params => {
      const safeBasePath = typeof basePath === 'string' ? basePath : '';
      const safeParams = (params ?? {}) as Partial<PathParamBlueprintValues<Blueprints>>;
      const parts = safeBasePath.split('/');

      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        if (!part || part[0] !== ':') continue;

        const key = part.slice(1);
        const parser = blueprints[key];
        const value = safeParams[key as keyof typeof safeParams];
        if (value === undefined || value === null || !parser) continue;

        try {
          parts[index] = encodeURIComponent(parser.stringify(value as never));
        } catch {
          parts[index] = String(value);
        }
      }

      return parts.join('/');
    };

    return { blueprints, type, parse, stringify };
  };
}
