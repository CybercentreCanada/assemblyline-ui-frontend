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
// Blueprint introspection
//*****************************************************************************************

describe('BooleanSearchParamBlueprint introspection', () => {
  it('describes its kind and shared configuration', () => {
    const blueprint = new BooleanSearchParamBlueprint('enabled')
      .defaultValue(true)
      .ephemeral()
      .ignored()
      .locked()
      .nullable()
      .source('state');

    expect(blueprint.getKind()).toBe('boolean');
    expect(blueprint.describe()).toEqual({
      key: 'enabled',
      kind: 'boolean',
      defaultValue: true,
      source: 'state',
      ephemeral: true,
      ignored: true,
      locked: true,
      nullable: true
    });
  });
});

describe('NumberSearchParamBlueprint introspection', () => {
  it('describes its range constraints', () => {
    const blueprint = new NumberSearchParamBlueprint('page').defaultValue(2).min(1).max(5);

    expect(blueprint.getKind()).toBe('number');
    expect(blueprint.describe()).toEqual({
      key: 'page',
      kind: 'number',
      defaultValue: 2,
      source: 'search',
      ephemeral: false,
      ignored: false,
      locked: false,
      nullable: false,
      min: 1,
      max: 5
    });
  });
});

describe('StringSearchParamBlueprint introspection', () => {
  it('describes its string default value', () => {
    const blueprint = new StringSearchParamBlueprint('query').defaultValue('hello');

    expect(blueprint.getKind()).toBe('string');
    expect(blueprint.describe()).toEqual({
      key: 'query',
      kind: 'string',
      defaultValue: 'hello',
      source: 'search',
      ephemeral: false,
      ignored: false,
      locked: false,
      nullable: false
    });
  });
});

describe('EnumSearchParamBlueprint introspection', () => {
  it('describes its available options', () => {
    const blueprint = new EnumSearchParamBlueprint('mode').defaultValue(1).options([1, 2]);

    expect(blueprint.getKind()).toBe('enum');
    expect(blueprint.describe()).toEqual({
      key: 'mode',
      kind: 'enum',
      defaultValue: 1,
      source: 'search',
      ephemeral: false,
      ignored: false,
      locked: false,
      nullable: false,
      options: [1, 2]
    });
  });
});

describe('FiltersSearchParamBlueprint introspection', () => {
  it('describes its filter prefix tokens', () => {
    const blueprint = new FiltersSearchParamBlueprint('filters')
      .defaultValue(['type:file'])
      .not('EXCLUDE')
      .omit('SKIP');

    expect(blueprint.getKind()).toBe('filters');
    expect(blueprint.describe()).toEqual({
      key: 'filters',
      kind: 'filters',
      defaultValue: ['type:file'],
      source: 'search',
      ephemeral: false,
      ignored: false,
      locked: false,
      nullable: false,
      not: 'EXCLUDE',
      omit: 'SKIP'
    });
  });
});

describe('ObjectSearchParamBlueprint introspection', () => {
  it('describes its structured default value', () => {
    const blueprint = new ObjectSearchParamBlueprint('config').defaultValue({ enabled: true });

    expect(blueprint.getKind()).toBe('object');
    expect(blueprint.describe()).toEqual({
      key: 'config',
      kind: 'object',
      defaultValue: { enabled: true },
      source: 'search',
      ephemeral: false,
      ignored: false,
      locked: false,
      nullable: false
    });
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

  it('rejects options with colliding serialized values', () => {
    expect(() => SEARCH_PARAM_BLUEPRINTS_MAP.enum(1, [1, '1'] as const)).toThrow(
      'Enum options must have unique string representations.'
    );
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
