//*****************************************************************************************
// Path
//*****************************************************************************************

export type PathParamValue = string | number | boolean;

export type PathParamKeys<Path extends string> = string extends Path
  ? string
  : Path extends `${string}:${infer Param}/${infer Rest}`
    ? Param | PathParamKeys<`/${Rest}`>
    : Path extends `${string}:${infer Param}`
      ? Param
      : never;

export type PathParams<Path extends string> = [PathParamKeys<Path>] extends [never]
  ? never
  : Record<PathParamKeys<Path>, PathParamValue>;

//*****************************************************************************************
// Params
//*****************************************************************************************

// type PathParamKeys<Path extends string> = PathParams<Path> extends never ? never : keyof PathParams<Path> & string;

export type ParamsBlueprint<T extends PathParamValue> = {
  type: string | number | boolean;
  parse: (value: string | undefined) => T;
  stringify: (value: T) => string;
};

export type ParamsBlueprintsForPath<Path extends string> = {
  [K in PathParamKeys<Path>]: ParamsBlueprint<PathParamValue>;
};

export type ParamsBlueprints = Record<string, ParamsBlueprint<PathParamValue>>;

export type ParamsValues<Blueprints extends ParamsBlueprints> = {
  [K in keyof Blueprints]: Blueprints[K] extends ParamsBlueprint<infer V> ? V : never;
};

export type ParamsTypes<Blueprints extends ParamsBlueprints> = ParamsValues<Blueprints>;

export type ParamsTypesFromDefinition<Definition extends (parsers: any) => ParamsBlueprints> = Definition extends (
  parsers: any
) => infer Blueprints
  ? Blueprints extends ParamsBlueprints
    ? ParamsValues<Blueprints>
    : never
  : never;

export type ParamsParser<Blueprints extends ParamsBlueprints = ParamsBlueprints> = {
  blueprints: Blueprints;
  parse: (raw: Record<string, string | undefined>) => ParamsValues<Blueprints>;
  stringify: (params: Partial<ParamsValues<Blueprints>>) => Record<string, string>;
};

//*****************************************************************************************
// Other
//*****************************************************************************************

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

// export type TypedRoute<Path extends string> = {
//   path: Path;
//   params: PathParams<Path>;
//   search?: SearchParamBlueprints;
//   hash?: string;
//   element: React.ReactElement;
//   paramsParser?: ParamsParser;
//   useParams: () => PathParams<Path> | Record<string, string>;
//   to: (params: PathParams<Path>) => string;
// };

// export type AnyTypedRoute<Path extends string = string> = TypedRoute<Path>;
