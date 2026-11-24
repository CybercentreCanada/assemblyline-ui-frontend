import { createHashParamCodec } from 'features/hash-params';
import { createPathParamsCodec } from 'features/path-params';
import type { Configuration } from 'models/base/config';
import {
  createMockRouteLocation,
  formatFunctionText,
  formatHashParam,
  formatPathParams,
  formatRouteName,
  formatSearchParams,
  formatValue,
  renderIcon,
  toRouteTableRow
} from 'routes/development-routes';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// createMockRouteLocation
//*****************************************************************************************

describe('createMockRouteLocation', () => {
  it('fills route parameter placeholders with stable example values', () => {
    const route = {
      path: '/manage/signature/detail/:id',
      params: {
        type: { id: '' }
      }
    } as unknown as AppRoute;

    const location = createMockRouteLocation(route);

    expect(location.path).toEqual({ id: ':SampleId' });
    expect(location.search).toEqual({});
    expect(location.hash).toBeNull();
  });

  it('keeps non-parameter routes stable without generated params', () => {
    const route = {
      path: '/development/routes',
      params: {
        type: {}
      }
    } as AppRoute;

    expect(createMockRouteLocation(route).path).toEqual({});
  });

  it('uses the hash blueprint default for route metadata callbacks', () => {
    const route = {
      path: '/help/search',
      hash: createHashParamCodec()(blueprints => blueprints.enum(['overview', 'query'], 'query'))
    } as AppRoute;

    expect(createMockRouteLocation(route).hash).toBe('query');
  });
});

//*****************************************************************************************
// formatValue
//*****************************************************************************************

describe('formatValue', () => {
  it('returns non-empty strings as-is', () => {
    expect(formatValue('hello')).toBe('hello');
  });

  it('returns a placeholder for an empty string', () => {
    expect(formatValue('')).toBe('—');
  });

  it('returns a placeholder for null and undefined', () => {
    expect(formatValue(null)).toBe('—');
    expect(formatValue(undefined)).toBe('—');
  });

  it('stringifies numbers and booleans', () => {
    expect(formatValue(42)).toBe('42');
    expect(formatValue(false)).toBe('false');
  });

  it('joins array items with a middle dot', () => {
    expect(formatValue(['a', 'b', 'c'])).toBe('a · b · c');
  });

  it('returns a placeholder for an empty array', () => {
    expect(formatValue([])).toBe('—');
  });

  it('serializes plain objects to JSON', () => {
    expect(formatValue({ a: 1 })).toBe('{"a":1}');
  });
});

//*****************************************************************************************
// formatRouteName
//*****************************************************************************************

describe('formatRouteName', () => {
  it('returns a placeholder for an empty array', () => {
    expect(formatRouteName([])).toBe('—');
  });

  it('falls back to the translation key when it has no matching resource', () => {
    expect(formatRouteName(['missing.translation.key'])).toBe('missing.translation.key');
  });

  it('returns non-empty strings as-is', () => {
    expect(formatRouteName('Submission')).toBe('Submission');
  });

  it('returns a placeholder for an empty string', () => {
    expect(formatRouteName('')).toBe('—');
  });

  it('formats non-string, non-array values through formatValue', () => {
    expect(formatRouteName(42)).toBe('42');
  });
});

//*****************************************************************************************
// renderIcon
//*****************************************************************************************

describe('renderIcon', () => {
  it('returns a placeholder when no icon factory is provided', () => {
    expect(renderIcon(undefined, {} as Configuration)).toBe('—');
  });

  it('invokes the icon factory with a mock location and the config state', () => {
    const configuration = {} as Configuration;
    const route = { path: '/manage/signature/detail/:id', params: { type: { id: '' } } } as AppRoute;

    const iconFactory = (location: never, config: Configuration) =>
      `${JSON.stringify(location)}|${config === configuration}`;

    const result = renderIcon(iconFactory, configuration, route);

    expect(result).toContain('SampleId');
    expect(result).toContain('true');
  });

  it('returns a placeholder when the icon factory resolves to null', () => {
    expect(renderIcon(() => null, {} as Configuration)).toBe('—');
  });
});

//*****************************************************************************************
// formatFunctionText
//*****************************************************************************************

describe('formatFunctionText', () => {
  it('returns a placeholder for non-function values', () => {
    expect(formatFunctionText(null)).toBe('—');
    expect(formatFunctionText('not a function')).toBe('—');
  });

  it('dedents multi-line function source while preserving line breaks', () => {
    const fn = function (_location: unknown, config: { user: { is_admin: boolean } }) {
      return !config.user.is_admin;
    };

    const result = formatFunctionText(fn);

    expect(result).toContain('\n');
    expect(result.startsWith(' ')).toBe(false);
  });

  it('formats a single-line arrow function', () => {
    const fn = () => true;
    expect(formatFunctionText(fn)).toContain('=>');
  });
});

//*****************************************************************************************
// formatPathParams
//*****************************************************************************************

describe('formatPathParams', () => {
  it('returns an empty array when the route has no path param blueprints', () => {
    const route = { path: '/development/routes', params: { blueprints: {} } } as AppRoute;
    expect(formatPathParams(route)).toEqual([]);
  });

  it('builds one spec per path param blueprint', () => {
    const route = {
      path: '/file/:section/:enabled',
      params: createPathParamsCodec('/file/:section/:enabled')(blueprints => ({
        section: blueprints.string('section'),
        enabled: blueprints.boolean(true)
      }))
    } as unknown as AppRoute;

    const specs = formatPathParams(route);

    expect(specs).toEqual([
      { key: 'section', kind: 'string', defaultValueLabel: 'section', options: undefined },
      { key: 'enabled', kind: 'boolean', defaultValueLabel: 'true', options: undefined }
    ]);
  });

  it('formats enum options into display strings', () => {
    const route = {
      path: '/manage/signature/detail/:tab',
      params: {
        blueprints: {
          tab: {
            type: 'overview',
            kind: 'enum',
            options: ['overview', 'detail'],
            parse: (v: string) => v,
            stringify: (v: string) => v
          }
        }
      }
    } as unknown as AppRoute;

    const [spec] = formatPathParams(route);

    expect(spec.options).toEqual(['overview', 'detail']);
  });
});

//*****************************************************************************************
// formatSearchParams
//*****************************************************************************************

describe('formatSearchParams', () => {
  it('returns an empty array when the route has no search param engine', () => {
    const route = { path: '/development/routes' } as AppRoute;
    expect(formatSearchParams(route)).toEqual([]);
  });

  it('builds one spec per search param descriptor, including active flags', () => {
    const route = {
      path: '/submissions',
      search: {
        describeParams: () => ({
          page: {
            key: 'page',
            kind: 'number',
            defaultValue: 1,
            source: 'search',
            ephemeral: false,
            ignored: false,
            locked: true,
            nullable: false,
            min: 0,
            max: 100
          }
        })
      }
    } as unknown as AppRoute;

    const [spec] = formatSearchParams(route);

    expect(spec).toEqual({
      key: 'page',
      kind: 'number',
      defaultValueLabel: '1',
      options: undefined,
      min: 0,
      max: 100,
      source: 'search',
      flags: ['locked']
    });
  });

  it('collects every active flag', () => {
    const route = {
      path: '/submissions',
      search: {
        describeParams: () => ({
          query: {
            key: 'query',
            kind: 'string',
            defaultValue: '',
            source: 'state',
            ephemeral: true,
            ignored: true,
            locked: true,
            nullable: true
          }
        })
      }
    } as unknown as AppRoute;

    const [spec] = formatSearchParams(route);

    expect(spec.flags).toEqual(['locked', 'ephemeral', 'nullable', 'ignored']);
    expect(spec.source).toBe('state');
  });
});

//*****************************************************************************************
// formatHashParam
//*****************************************************************************************

describe('formatHashParam', () => {
  it('returns null when the route has no hash blueprint', () => {
    const route = { path: '/development/routes' } as AppRoute;
    expect(formatHashParam(route)).toBeNull();
  });

  it('returns null for the default no-op blueprint (unconfigured hash)', () => {
    const route = {
      path: '/development/routes',
      hash: createHashParamCodec()(() => null)
    } as unknown as AppRoute;

    expect(formatHashParam(route)).toBeNull();
  });

  it('uses the configured enum default instead of its representative type value', () => {
    const route = {
      path: '/file/detail/:id',
      hash: createHashParamCodec()(blueprints => blueprints.enum(['overview', 'detail'], 'detail'))
    } as AppRoute;

    expect(formatHashParam(route)).toEqual({
      kind: 'enum',
      defaultValueLabel: 'detail',
      options: ['overview', 'detail']
    });
  });

  it('preserves a configured string hash even when its default is empty', () => {
    const route = {
      path: '/file/detail/:id',
      hash: createHashParamCodec()(blueprints => blueprints.string())
    } as AppRoute;

    expect(formatHashParam(route)).toEqual({
      kind: 'string',
      defaultValueLabel: '—',
      options: undefined
    });
  });

  it('formats a configured string hash default from its parser', () => {
    const route = {
      path: '/file/detail/:id',
      hash: createHashParamCodec()(blueprints => blueprints.string('section'))
    } as AppRoute;

    expect(formatHashParam(route)?.defaultValueLabel).toBe('section');
  });
});

//*****************************************************************************************
// toRouteTableRow
//*****************************************************************************************

describe('toRouteTableRow', () => {
  it('flattens a route definition into a display-ready table row', () => {
    const route = {
      path: '/development/routes',
      ancestor: '/development',
      params: { blueprints: {} },
      disabled: () => false,
      forbidden: (_location: unknown, config: { user: { is_admin: boolean } }) => !config.user.is_admin
    } as unknown as AppRoute;

    const configuration = {} as Configuration;

    const row = toRouteTableRow(route, configuration);

    expect(row.path).toBe('/development/routes');
    expect(row.ancestor).toBe('/development');
    expect(row.pathParams).toEqual([]);
    expect(row.searchParams).toEqual([]);
    expect(row.hashParam).toBeNull();
    expect(row.disabled).toContain('=>');
    expect(row.forbidden).toContain('is_admin');
  });

  it('falls back to a placeholder ancestor when the route has none', () => {
    const route = { path: '/development/routes', params: { blueprints: {} } } as unknown as AppRoute;
    const row = toRouteTableRow(route, {} as Configuration);

    expect(row.ancestor).toBe('—');
    expect(row.disabled).toBe('—');
    expect(row.forbidden).toBe('—');
  });
});
