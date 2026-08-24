import { SEARCH_PARAM_RUNTIME_MAP } from 'features/search-params';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// SEARCH_PARAM_RUNTIME_MAP
//*****************************************************************************************

describe('SEARCH_PARAM_RUNTIME_MAP', () => {
  it('exposes a runtime constructor for every blueprint type', () => {
    expect(Object.keys(SEARCH_PARAM_RUNTIME_MAP)).toEqual(['boolean', 'number', 'string', 'filters', 'object', 'enum']);
  });

  it('constructs a boolean runtime exposing the wrapped protected methods as public', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.boolean('flag');
    (runtime as unknown as { defaultValue: (v: boolean) => unknown }).defaultValue(true);

    expect(runtime.getDefaultValue()).toBe(true);
    expect(runtime.isEphemeral()).toBe(false);
    expect(runtime.isIgnored()).toBe(false);
    expect(runtime.isLocked()).toBe(false);
    expect(runtime.isNullable()).toBe(false);
    expect(runtime.getSource()).toBe('search');
  });

  it('constructs a number runtime that resolves full/delta values', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.number('page');
    (runtime as unknown as { defaultValue: (v: number) => unknown }).defaultValue(1);

    const values: Record<string, unknown> = {};
    runtime.full(values, new URLSearchParams('page=5'));
    expect(values.page).toBe(5);
  });

  it('constructs a string runtime that resolves values from a plain object', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.string('query');
    (runtime as unknown as { defaultValue: (v: string) => unknown }).defaultValue('');

    const values: Record<string, unknown> = {};
    runtime.full(values, { query: 'abc' });
    expect(values.query).toBe('abc');
  });

  it('constructs an enum runtime that falls back to the default for invalid values', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.enum('mode');
    (
      runtime as unknown as { defaultValue: (v: string) => { options: (v: readonly string[]) => unknown } }
    ).defaultValue('a').options(['a', 'b'] as const);

    const values: Record<string, unknown> = {};
    runtime.full(values, new URLSearchParams('mode=zzz'));
    expect(values.mode).toBe('a');
  });

  it('constructs a filters runtime that resolves array values', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.filters('tags');
    (runtime as unknown as { defaultValue: (v: string[]) => unknown }).defaultValue([]);

    const values: Record<string, unknown> = {};
    runtime.full(values, new URLSearchParams('tags=a&tags=b'));
    expect(values.tags).toEqual(['a', 'b']);
  });

  it('constructs an object runtime that resolves object values', () => {
    const runtime = new SEARCH_PARAM_RUNTIME_MAP.object('filter');
    (runtime as unknown as { defaultValue: (v: object) => unknown }).defaultValue({});

    const values: Record<string, unknown> = {};
    runtime.full(values, { filter: { a: 1 } });
    expect(values.filter).toEqual({ a: 1 });
  });
});
