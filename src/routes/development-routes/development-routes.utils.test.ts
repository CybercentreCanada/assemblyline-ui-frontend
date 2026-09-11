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
    } as AppRoute;

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
    expect(renderIcon(undefined, {} as AppConfigStore)).toBe('—');
  });

  it('invokes the icon factory with a mock location and the config state', () => {
    const configState = {} as AppConfigStore;
    const route = { path: '/manage/signature/detail/:id', params: { type: { id: '' } } } as AppRoute;

    const iconFactory = (location: never, config: AppConfigStore) =>
      `${JSON.stringify(location)}|${config === configState}`;

    const result = renderIcon(iconFactory, configState, route);

    expect(result).toContain('SampleId');
    expect(result).toContain('true');
  });

  it('returns a placeholder when the icon factory resolves to null', () => {
    expect(renderIcon(() => null, {} as AppConfigStore)).toBe('—');
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
      path: '/manage/signature/detail/:id',
      params: {
        blueprints: {
          id: { type: 'abc', kind: 'string', parse: (v: string) => v, stringify: (v: string) => v }
        }
      }
    } as unknown as AppRoute;

    const specs = formatPathParams(route);

    expect(specs).toEqual([{ key: 'id', kind: 'string', defaultValueLabel: 'abc', options: undefined }]);
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

  it('returns null for the default no-op string blueprint (unconfigured hash)', () => {
    const route = {
      path: '/development/routes',
      hash: { blueprint: { type: '', kind: 'string' } }
    } as unknown as AppRoute;

    expect(formatHashParam(route)).toBeNull();
  });

  it('returns a spec for a configured enum hash blueprint', () => {
    const route = {
      path: '/file/detail/:id',
      hash: { blueprint: { type: 'overview', kind: 'enum', options: ['overview', 'detail'] } }
    } as unknown as AppRoute;

    expect(formatHashParam(route)).toEqual({
      kind: 'enum',
      defaultValueLabel: 'overview',
      options: ['overview', 'detail']
    });
  });

  it('returns a spec for a configured non-empty string blueprint', () => {
    const route = {
      path: '/file/detail/:id',
      hash: { blueprint: { type: 'section', kind: 'string' } }
    } as unknown as AppRoute;

    expect(formatHashParam(route)).toEqual({
      kind: 'string',
      defaultValueLabel: 'section',
      options: undefined
    });
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

    const configState = { user: { is_admin: true } } as unknown as AppConfigStore;

    const row = toRouteTableRow(route, configState);

    expect(row.route).toBe(route);
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
    const row = toRouteTableRow(route, {} as AppConfigStore);

    expect(row.ancestor).toBe('—');
    expect(row.disabled).toBe('—');
    expect(row.forbidden).toBe('—');
  });
});
