import { createStateParamBlueprint, createStateParamCodec } from 'features/state-params';
import type { Location } from 'react-router';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// createStateParamBlueprint
//*****************************************************************************************
describe('createStateParamBlueprint', () => {
  it('creates a blueprint with a cloned type value', () => {
    const defaults = { test: 'asd', nested: { mode: 'auto' } } as const;

    const blueprint = createStateParamBlueprint(defaults);

    expect(blueprint.type).toEqual(defaults);
    expect(blueprint.type).not.toBe(defaults);
    expect(blueprint.type.nested).not.toBe(defaults.nested);
  });

  it('builds full state by merging route state with defaults', () => {
    const blueprint = createStateParamBlueprint({ test: 'asd', count: 1, nested: { mode: 'auto' } });

    const fullFn = blueprint.full as (value: unknown) => unknown;
    const next = fullFn({ count: 2, nested: { mode: 'manual' } });

    expect(next).toEqual({ test: 'asd', count: 2, nested: { mode: 'manual' } });
  });

  it('computes delta values against defaults', () => {
    const blueprint = createStateParamBlueprint({ test: 'asd', count: 1, nested: { mode: 'auto' } });

    const deltaFn = blueprint.delta as (value: unknown) => unknown;
    const next = deltaFn({ count: 5 });

    expect(next).toEqual({ count: 5 });
  });

  it('returns undefined when value equals defaults', () => {
    const blueprint = createStateParamBlueprint({ test: 'asd', count: 1, nested: { mode: 'auto' } });

    const deltaFn = blueprint.delta as (value: unknown) => unknown;
    const next = deltaFn({ test: 'asd', count: 1, nested: { mode: 'auto' } });

    expect(next).toBeUndefined();
  });
});

//*****************************************************************************************
// createStateParamCodec
//*****************************************************************************************
describe('createStateParamCodec', () => {
  it('parses location.state using the blueprint defaults', () => {
    const codec = createStateParamCodec(blueprint => blueprint({ test: 'asd', count: 1, nested: { mode: 'auto' } }));

    const location: Location = {
      key: 'default',
      pathname: '/file/detail/abc',
      search: '',
      hash: '',
      state: { count: 2, nested: { mode: 'manual' } }
    };

    expect(codec.full(location)).toEqual({ test: 'asd', count: 2, nested: { mode: 'manual' } });
  });

  it('returns defaults when location.state is missing', () => {
    const codec = createStateParamCodec(blueprint => blueprint({ test: 'asd', count: 1 }));

    const location: Location = {
      key: 'default',
      pathname: '/file/detail/abc',
      search: '',
      hash: '',
      state: undefined
    };

    expect(codec.full(location)).toEqual({ test: 'asd', count: 1 });
  });

  it('returns only changed keys as location state delta', () => {
    const codec = createStateParamCodec(blueprint => blueprint({ test: 'asd', count: 1 }));

    expect(codec.delta({ count: 4 })).toEqual({ count: 4 });
  });

  it('exposes a typed default value through the type property', () => {
    const codec = createStateParamCodec(blueprint => blueprint({ test: 'asd', count: 1 }));

    expect(codec.type).toEqual({ test: 'asd', count: 1 });
  });
});
