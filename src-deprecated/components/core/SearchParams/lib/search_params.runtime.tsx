/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BaseBlueprint } from 'components/core/SearchParams/lib/search_params.blueprint';
import {
  BooleanBlueprint,
  EnumBlueprint,
  FiltersBlueprint,
  NumberBlueprint,
  StringBlueprint
} from 'components/core/SearchParams/lib/search_params.blueprint';
import type { ParamValues } from 'components/core/SearchParams/lib/search_params.model';

/**
 * Factory that wraps a blueprint class and re-exposes its
 * protected methods as public runtime utilities.
 */
export function Runtime<T extends ParamValues, B extends abstract new (...args: any[]) => BaseBlueprint<T>>(Base: B) {
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

export type ParamRuntime = InstanceType<ReturnType<typeof Runtime>>;

/**
 * Collection of runtime wrappers for each blueprint type.
 */
export const PARAM_RUNTIMES = {
  boolean: Runtime(BooleanBlueprint),
  number: Runtime(NumberBlueprint),
  string: Runtime(StringBlueprint),
  filters: Runtime(FiltersBlueprint),
  enum: Runtime(EnumBlueprint)
} as const;
