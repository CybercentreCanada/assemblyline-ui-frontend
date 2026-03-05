import type { Location } from 'react-router';

//*****************************************************************************************
// Path Params Primitives
//*****************************************************************************************

export type RoutePath = string;

export type PathParamPrimitive = string | number | boolean;

export type PathParamKeyForPath<Path extends RoutePath> = string extends Path
  ? string
  : Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParamKeyForPath<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

//*****************************************************************************************
// Path Params Blueprints
//*****************************************************************************************

export type PathParamBlueprint<Value extends PathParamPrimitive = PathParamPrimitive> = {
  type: Value;
  parse: (value: string | undefined) => Value;
  stringify: (value: Value) => string;
};

export type PathParamBlueprintMap<Path extends RoutePath = RoutePath> = [PathParamKeyForPath<Path>] extends [never]
  ? never
  : Record<PathParamKeyForPath<Path>, PathParamBlueprint>;

export type PathParamBlueprintValues<Blueprints extends PathParamBlueprintMap> = {
  -readonly [K in keyof Blueprints]: Blueprints[K] extends PathParamBlueprint<infer V> ? V : never;
};

//*****************************************************************************************
// Path Params Codec
//*****************************************************************************************

export type PathParamCodec<Blueprints extends PathParamBlueprintMap = PathParamBlueprintMap<RoutePath>> = {
  blueprints: Blueprints;
  type: PathParamBlueprintValues<Blueprints>;
  parse: (location: Location) => PathParamBlueprintValues<Blueprints>;
  stringify: (params: Partial<PathParamBlueprintValues<Blueprints>>) => RoutePath;
};
