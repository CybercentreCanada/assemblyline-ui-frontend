export type PathParams<Path extends string> = string extends Path
  ? Record<string, string>
  : Path extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<`/${Rest}`>]: string }
    : Path extends `${string}:${infer Param}`
      ? Record<Param, string>
      : {};

export type GuardResult = true | 'forbidden' | 'notfound' | `redirect:${string}`;

export type TypedRoute<Path extends string> = {
  path: Path;
  params: PathParams<Path>;
  search: any;
  hash: any;
  page: React.ReactElement;
  route: React.ReactElement;
  to: (params: PathParams<Path>) => string;
};

export type AnyTypedRoute<Path extends string = string> = TypedRoute<Path>;
