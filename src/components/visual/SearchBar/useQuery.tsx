import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

type GetArrayKeys<T> = { [K in keyof T]: T[K] extends Array<any> ? K : never }[keyof T];
type GetArrayType<T> = T extends (infer U)[] ? U : never;

type UseQueryReturn<Params extends object> = {
  /**
   * Returns a string containing the default query string suitable for use in a URL. Does not include the question mark.
   */
  getDefaultString?: () => string;
  /**
   * Returns a string containing the different query strings suitable for use in a URL. Does not include the question mark.
   */
  getDeltaString?: () => string;
  getParams?: () => Params;
  /**
   * Returns the first value associated to the given search parameter.
   */
  get?: <Key extends keyof Params>(
    key: Key,
    defaultVal?: Params[Key]
  ) => Params[Key] extends Array<any> ? GetArrayType<Params[Key]> : Params[Key];
  /**
   * Removes a key from the search param and return that value or the default value.
   */
  pop?: <Key extends keyof Params>(key: Key, defaultVal?: Params[Key]) => Params[Key];
  /**
   * Sets the value associated to a given search parameter to the given value. If there were several values, delete the others.
   */
  set?: <Key extends keyof Params>(key: Key, value: Params[Key]) => void;
  add?: <K extends GetArrayKeys<Params>>(key: K & string, value: GetArrayType<Params[K]>) => void;
  remove?: <K extends GetArrayKeys<Params>>(key: K & string, value: GetArrayType<Params[K]>) => void;
  replace?: <K extends GetArrayKeys<Params>>(
    key: K & string,
    old_item: GetArrayType<Params[K]>,
    new_item: GetArrayType<Params[K]>
  ) => void;
  getAll?: <K extends GetArrayKeys<Params>>(key: K & string, defaultVal?: Params[K]) => Params[K] | string[];
  deleteParam?: <K extends Params>(key: K & string) => void;
  deleteAll?: () => void;
  /**
   * Returns a Boolean indicating if such a search parameter exists.
   */
  has?: <Key extends keyof Params>(key: Key) => boolean;
  /**
   * Returns a string containing a query string suitable for use in a URL. Does not include the question mark.
   * You can strip to remove search parameters or fill to only use search parameters
   */
  toString?: <Key extends keyof Params>(strip?: (Key | 'group_by')[], fill?: Key[]) => string;
};

const useStateRef = <O extends object>(
  initialState: O
): [O, (value: O | ((prevState: O) => O)) => void, MutableRefObject<O>] => {
  const [state, setState] = useState<O>(initialState);
  const ref = useRef<O>(initialState);

  const toString = useCallback(
    (unordered: O) =>
      JSON.stringify(
        Object.fromEntries(
          Object.keys(unordered)
            .sort()
            .map(key => [key, unordered[key]])
        )
      ),
    []
  );

  const paramsChange = useCallback(
    (value: O | ((prevState: O) => O)): void => {
      if (typeof value === 'function' && toString(value(ref.current)) !== toString(ref.current)) {
        ref.current = value(ref.current);
        setState(p => value(p));
      }
      if (typeof value === 'object' && toString(value) !== toString(ref.current)) {
        ref.current = value;
        setState(value);
      }
    },
    [toString]
  );

  return [state, paramsChange, ref];
};

export const useQuery = <Params extends object>(
  baseSearch: string | Partial<Params>,
  defaults: string | Partial<Params>
): UseQueryReturn<Params> => {
  const basicSearchParams = new URLSearchParams('asdasd=0');

  const convertNumber = useCallback((value: any): number | string => (isNaN(value) ? value : parseFloat(value)), []);

  const parseSearchParam = useCallback(
    (searchParam: string | Partial<Params>): Params => {
      if (typeof searchParam === 'string')
        return Object.fromEntries(
          Object.entries(Object.fromEntries(new URLSearchParams(searchParam))).map(v => [v[0], convertNumber(v[1])])
        ) as Params;
      else if (typeof searchParam === 'object') return searchParam as Params;
    },
    [convertNumber]
  );

  const [params, setParams, paramsRef] = useStateRef<Params>(parseSearchParam(baseSearch));
  const [defaultParams, setDefaultParams, defaultParamsRef] = useStateRef<Params>(parseSearchParam(defaults));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setParams(parseSearchParam(baseSearch)), [parseSearchParam, setParams]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setDefaultParams(parseSearchParam(defaults)), [parseSearchParam, setDefaultParams]);

  const getDefaultString: UseQueryReturn<Params>['getDefaultString'] = useCallback(() => {
    const searchParams = Object.entries(defaultParamsRef.current);
    return new URLSearchParams(searchParams).toString();
  }, [defaultParamsRef]);

  const getDeltaString: UseQueryReturn<Params>['getDeltaString'] = useCallback(() => {
    const keys = Object.keys(defaultParams);
    const searchParams = Object.entries(params).filter(p => !keys.includes(p[0]) || p[1] !== defaultParams[p[0]]);
    return new URLSearchParams(searchParams).toString();
  }, [defaultParams, params]);

  // const getParams: UseQueryReturn<Params>['getParams'] = useCallback(() => {
  //   const output = {};
  //   defaultParams.forEach((value, key) => {
  //     if (!(key in output) && !params.has(key)) {
  //       if (key !== 'fq') {
  //         output[key] = value;
  //       } else {
  //         output[key] = [value];
  //       }
  //     } else if (key === 'fq') {
  //       output[key].push(value);
  //     }
  //   });

  //   params.forEach((value, key) => {
  //     if (!(key in output)) {
  //       if (key !== 'fq') {
  //         output[key] = value;
  //       } else {
  //         output[key] = [value];
  //       }
  //     } else if (key === 'fq') {
  //       output[key].push(value);
  //     }
  //   });
  //   return output as Params;
  // }, [defaultParams, params]);

  const get: UseQueryReturn<Params>['get'] = useCallback(
    (key, defaultVal = null) =>
      Array.isArray(paramsRef.current[key]) && (paramsRef.current[key] as Array<any>).length > 0
        ? paramsRef.current[key][0]
        : [null, undefined].includes(paramsRef.current[key])
        ? defaultVal
        : paramsRef.current[key],
    [paramsRef]
  );

  const pop: UseQueryReturn<Params>['pop'] = useCallback(
    (key, defaultVal = null) => {
      const val = paramsRef.current[key] || defaultVal;
      setParams(p => {
        delete p[key];
        return p;
      });
      return val;
    },
    [paramsRef, setParams]
  );

  const set: UseQueryReturn<Params>['set'] = useCallback(
    (key, value) => {
      setParams(p => ({
        ...p,
        [key]: value
      }));
    },
    [setParams]
  );

  // const add: UseQueryReturn<Params>['add'] = useCallback((key, value: any) => {
  //   setParams(p => {
  //     const items = p.getAll(key) || [];
  //     if (items.indexOf(`${value}`) === -1) {
  //       p.append(key, value);
  //     }
  //     return p;
  //   });
  // }, []);

  // const remove: UseQueryReturn<Params>['remove'] = useCallback((key, value: any) => {
  //   setParams(p => {
  //     const items = p.getAll(key) || [];
  //     p.delete(key);
  //     items.forEach(item => {
  //       if (item !== `${value}`) {
  //         p.append(key, item);
  //       }
  //     });
  //     return p;
  //   });
  // }, []);

  // const replace: UseQueryReturn<Params>['replace'] = useCallback((key, old_item: any, new_item: any) => {
  //   setParams(p => {
  //     const items = p.getAll(key) || [];
  //     p.delete(key);
  //     items.forEach(item => {
  //       if (item !== `${old_item}`) {
  //         p.append(key, item);
  //       } else {
  //         p.append(key, `${new_item}`);
  //       }
  //     });
  //     return p;
  //   });
  // }, []);

  // const getAll: UseQueryReturn<Params>['getAll'] = useCallback(
  //   (key, defaultVal = null) => params.getAll(key) || defaultVal,
  //   [params]
  // );

  // const deleteParam: UseQueryReturn<Params>['deleteParam'] = useCallback(
  //   key =>
  //     setParams(p => {
  //       p.delete(key);
  //       return p;
  //     }),
  //   []
  // );

  // const deleteAll: UseQueryReturn<Params>['deleteAll'] = useCallback(
  //   () =>
  //     setParams(p => {
  //       let keys = [];
  //       p.forEach((value, key) => keys.push(key));
  //       keys.forEach(key => p.delete(key));
  //       return p;
  //     }),
  //   []
  // );

  const has: UseQueryReturn<Params>['has'] = useCallback(
    key => paramsRef.current && key in paramsRef.current,
    [paramsRef]
  );

  const toString: UseQueryReturn<Params>['toString'] = useCallback(
    (strip = ['group_by'], fill = null) => {
      const filteredParams = Object.fromEntries(
        Object.entries(paramsRef.current).filter(
          value => !strip.includes(value[0] as any) && (!fill || fill.includes(value[0] as any))
        )
      );
      return new URLSearchParams(filteredParams).toString();
    },
    [paramsRef]
  );

  return {
    getDefaultString,
    getDeltaString,
    // getParams,
    get,
    pop,
    set,
    // add,
    // remove,
    // replace,
    // getAll,
    // deleteParam,
    // deleteAll,
    has,
    toString
  };
};

export default useQuery;
