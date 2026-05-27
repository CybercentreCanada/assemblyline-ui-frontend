/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseSearchParamBlueprint } from 'features/search-params/search-params.blueprints';
import {
  BooleanSearchParamBlueprint,
  EnumSearchParamBlueprint,
  FiltersSearchParamBlueprint,
  NumberSearchParamBlueprint,
  StringSearchParamBlueprint
} from 'features/search-params/search-params.blueprints';
import type { SearchParamValue } from 'features/search-params/search-params.models';

/**
 * Factory that wraps a blueprint class and re-exposes its
 * protected methods as public runtime utilities.
 */
export function SearchParamRuntimeFactory<
  T extends SearchParamValue,
  B extends abstract new (...args: any[]) => BaseSearchParamBlueprint<T>
>(Base: B) {
  abstract class Accessor extends Base {
    // Getters
    public override getDefaultValue = super.getDefaultValue;
    public override isEphemeral = super.isEphemeral;
    public override isIgnored = super.isIgnored;
    public override isLocked = super.isLocked;
    public override isNullable = super.isNullable;
    public override getOrigin = super.getOrigin;

    // Setters
    public override setDefaultValue = super.setDefaultValue;

    // Helpers
    public override has = super.has;
    public override get = super.get;

    // Parsers
    public override full = super.full;
    public override delta = super.delta;
    public override fromLocation = super.fromLocation;

    // Resolvers
    public override toParams = super.toParams;
  }

  return Accessor;
}

/**
 * Collection of runtime wrappers for each blueprint type.
 */
export const SEARCH_PARAM_RUNTIME_MAP = {
  boolean: SearchParamRuntimeFactory(BooleanSearchParamBlueprint),
  number: SearchParamRuntimeFactory(NumberSearchParamBlueprint),
  string: SearchParamRuntimeFactory(StringSearchParamBlueprint),
  filters: SearchParamRuntimeFactory(FiltersSearchParamBlueprint),
  enum: SearchParamRuntimeFactory(EnumSearchParamBlueprint)
} as const;
