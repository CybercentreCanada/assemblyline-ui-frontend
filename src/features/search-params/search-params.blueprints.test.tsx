import {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  ObjectSearchParamBlueprint,
  SEARCH_PARAM_BLUEPRINTS_MAP,
  StringSearchParamBlueprint
} from 'features/search-params';
import { describe, expect, it } from 'vitest';

//*****************************************************************************************
// Builder Methods (shared base blueprint API)
//*****************************************************************************************

describe('BaseSearchParamBlueprint builder methods', () => {
  it('chains defaultValue/ephemeral/ignored/locked/nullable/source and returns the same instance', () => {
    const blueprint = new StringSearchParamBlueprint('key');
    const result = blueprint
      .defaultValue('abc')
      .ephemeral(true)
      .ignored(true)
      .locked(true)
      .nullable(true)
      .source('state');

    expect(result).toBe(blueprint);
  });
});

//*****************************************************************************************
// SEARCH_PARAM_BLUEPRINTS_MAP factories
//*****************************************************************************************

describe('SEARCH_PARAM_BLUEPRINTS_MAP.boolean', () => {
  it('creates a BooleanSearchParamBlueprint with the given default value', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.boolean(true);
    expect(blueprint).toBeInstanceOf(BooleanSearchParamBlueprint);
  });
});

describe('SEARCH_PARAM_BLUEPRINTS_MAP.number', () => {
  it('creates a NumberSearchParamBlueprint with the given default value', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.number(5);
    expect(blueprint).toBeInstanceOf(NumberSearchParamBlueprint);
  });

  it('supports chaining min/max after creation', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.number(5).min(0).max(10);
    expect(blueprint).toBeInstanceOf(NumberSearchParamBlueprint);
  });
});

describe('SEARCH_PARAM_BLUEPRINTS_MAP.string', () => {
  it('creates a StringSearchParamBlueprint with the given default value', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.string('abc');
    expect(blueprint).toBeInstanceOf(StringSearchParamBlueprint);
  });
});

describe('SEARCH_PARAM_BLUEPRINTS_MAP.enum', () => {
  it('creates an EnumSearchParamBlueprint with the given default and options', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.enum('a', ['a', 'b', 'c'] as const);
    expect(blueprint).toBeInstanceOf(EnumSearchParamBlueprint);
  });

  it('supports overriding options after creation', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.enum('a', ['a', 'b'] as const).options([
      'a',
      'b',
      'c'
    ] as const as never);
    expect(blueprint).toBeInstanceOf(EnumSearchParamBlueprint);
  });
});

describe('SEARCH_PARAM_BLUEPRINTS_MAP.filters', () => {
  it('creates a FiltersSearchParamBlueprint with the given default, not, and omit prefixes', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.filters(['a'], 'NOT', '!');
    expect(blueprint).toBeInstanceOf(FiltersSearchParamBlueprint);
  });

  it('supports chaining not/omit after creation', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.filters(['a']).not('EXCLUDE').omit('SKIP');
    expect(blueprint).toBeInstanceOf(FiltersSearchParamBlueprint);
  });
});

describe('SEARCH_PARAM_BLUEPRINTS_MAP.object', () => {
  it('creates an ObjectSearchParamBlueprint with the given default value', () => {
    const blueprint = SEARCH_PARAM_BLUEPRINTS_MAP.object({ a: 1 });
    expect(blueprint).toBeInstanceOf(ObjectSearchParamBlueprint);
  });
});
