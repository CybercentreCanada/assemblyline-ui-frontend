import { useCallback, useState } from 'react';

type GetArrayKeys<T> = { [K in keyof T]: T[K] extends Array<any> ? K : never }[keyof T];
type GetArrayType<T> = T extends (infer U)[] ? U : never;

type UseQueryReturn<Params extends object> = {
  /**
   * Returns a string containing the default query string suitable for use in a URL. Does not include the question mark.
   */
  getDefaultString: () => string;
  /**
   * Returns a string containing the different query strings suitable for use in a URL. Does not include the question mark.
   */
  getDeltaString: () => string;
  getParams: () => Params;
  get: <K extends keyof Params>(key: keyof Params & string, defaultVal?: Params[K]) => Params[K] | string;
  pop: <K extends keyof Params>(key: keyof Params & string, defaultVal?: Params[K]) => Params[K] | string;
  set: <K extends keyof Params>(key: K & string, value: Params[K] & string) => void;
  add: <K extends GetArrayKeys<Params>>(key: K & string, value: GetArrayType<Params[K]>) => void;
  remove: <K extends GetArrayKeys<Params>>(key: K & string, value: GetArrayType<Params[K]>) => void;
  replace: <K extends GetArrayKeys<Params>>(
    key: K & string,
    old_item: GetArrayType<Params[K]>,
    new_item: GetArrayType<Params[K]>
  ) => void;
  getAll: <K extends GetArrayKeys<Params>>(key: K & string, defaultVal?: Params[K]) => Params[K] | string[];
  deleteParam: <K extends Params>(key: K & string) => void;
  deleteAll: () => void;
  has: <K extends keyof Params>(key: K & string) => boolean;
  /**
   * Returns a string containing a query string suitable for use in a URL. Does not include the question mark.
   */
  toString: (strip?: (keyof Params | 'group_by')[]) => string;
};

export const useQuery = <Params extends object>(
  baseSearch: string | Params,
  defaults: string | Params
): UseQueryReturn<Params> => {
  const parseSearchParam = useCallback((searchParam: string | Params): URLSearchParams => {
    if (typeof searchParam === 'string') return new URLSearchParams(searchParam);
    else if (typeof searchParam === 'object') return new URLSearchParams(Object.entries(searchParam));
  }, []);

  const [params, setParams] = useState<URLSearchParams>(parseSearchParam(baseSearch));
  const [defaultParams] = useState<URLSearchParams>(parseSearchParam(defaults));

  const getDefaultString: UseQueryReturn<Params>['getDefaultString'] = useCallback(
    () => defaultParams.toString(),
    [defaultParams]
  );

  const getDeltaString: UseQueryReturn<Params>['getDeltaString'] = useCallback(() => {
    const deltaParams = new URLSearchParams();
    params.forEach((value, key) => {
      if (defaultParams.get(key) !== value) {
        deltaParams.append(key, value);
      }
    });
    return deltaParams.toString();
  }, [defaultParams, params]);

  const getParams: UseQueryReturn<Params>['getParams'] = useCallback(() => {
    const output = {};
    defaultParams.forEach((value, key) => {
      if (!(key in output) && !params.has(key)) {
        if (key !== 'fq') {
          output[key] = value;
        } else {
          output[key] = [value];
        }
      } else if (key === 'fq') {
        output[key].push(value);
      }
    });

    params.forEach((value, key) => {
      if (!(key in output)) {
        if (key !== 'fq') {
          output[key] = value;
        } else {
          output[key] = [value];
        }
      } else if (key === 'fq') {
        output[key].push(value);
      }
    });
    return output as Params;
  }, [defaultParams, params]);

  const get: UseQueryReturn<Params>['get'] = useCallback(
    (key, defaultVal = null) => params.get(key) || defaultVal,
    [params]
  );

  const pop: UseQueryReturn<Params>['pop'] = useCallback(
    (key, defaultVal = null) => {
      const val = params.get(key) || defaultVal;
      setParams(p => {
        p.delete(key);
        return p;
      });
      return val;
    },
    [params]
  );

  const set: UseQueryReturn<Params>['set'] = useCallback((key: string, value: string) => {
    setParams(p => {
      p.set(key, value);
      return p;
    });
  }, []);

  const add: UseQueryReturn<Params>['add'] = useCallback((key, value: any) => {
    setParams(p => {
      const items = p.getAll(key) || [];
      if (items.indexOf(`${value}`) === -1) {
        p.append(key, value);
      }
      return p;
    });
  }, []);

  const remove: UseQueryReturn<Params>['remove'] = useCallback((key, value: any) => {
    setParams(p => {
      const items = p.getAll(key) || [];
      p.delete(key);
      items.forEach(item => {
        if (item !== `${value}`) {
          p.append(key, item);
        }
      });
      return p;
    });
  }, []);

  const replace: UseQueryReturn<Params>['replace'] = useCallback((key, old_item: any, new_item: any) => {
    setParams(p => {
      const items = p.getAll(key) || [];
      p.delete(key);
      items.forEach(item => {
        if (item !== `${old_item}`) {
          p.append(key, item);
        } else {
          p.append(key, `${new_item}`);
        }
      });
      return p;
    });
  }, []);

  const getAll: UseQueryReturn<Params>['getAll'] = useCallback(
    (key, defaultVal = null) => params.getAll(key) || defaultVal,
    [params]
  );

  const deleteParam: UseQueryReturn<Params>['deleteParam'] = useCallback(
    key =>
      setParams(p => {
        p.delete(key);
        return p;
      }),
    []
  );

  const deleteAll: UseQueryReturn<Params>['deleteAll'] = useCallback(
    () =>
      setParams(p => {
        let keys = [];
        p.forEach((value, key) => keys.push(key));
        keys.forEach(key => p.delete(key));
        return p;
      }),
    []
  );

  const has: UseQueryReturn<Params>['has'] = useCallback(key => params.has(key), [params]);

  const toString: UseQueryReturn<Params>['toString'] = useCallback(
    (strip = ['group_by']) => {
      const p = new URLSearchParams(params.toString());
      strip.forEach(item => {
        p.delete(item);
      });
      return p.toString();
    },
    [params]
  );

  return {
    getDefaultString,
    getDeltaString,
    getParams,
    get,
    pop,
    set,
    add,
    remove,
    replace,
    getAll,
    deleteParam,
    deleteAll,
    has,
    toString
  };
};

export default useQuery;
