import type { Dispatch, FC, PropsWithChildren, SetStateAction } from 'react';
import { createContext, useEffect, useMemo, useState } from 'react';

/**
 * AppClassification context type specification.
 */
type AppClassificationContextType = {
  initialized: boolean;
  value: AppClassificationState;
  setValue: Dispatch<SetStateAction<AppClassificationState>>;
};

/**
 * Provider props specification.
 */
type AppClassificationProviderProps = PropsWithChildren & {
  /**
   * The classification value.
   *
   * This takes precedence over the `url` prop.
   */
  value?: Exclude<AppClassificationState, 'loading' | 'error'>;

  /**
   * This endpoint should return an object that satisfies the specification defined by {@link AppClassificationResponse}
   */
  url?: string;
};

/**
 * Supported classification values.
 */
export const AppClassificationValues = ['u', 'pa', 'pb', 'pc', 'c', 's', 'ts'] as const;

/**
 * Type definition of supported classification values.
 */
export type AppClassificationValue = (typeof AppClassificationValues)[number];

/**
 * Supported classification states.
 */
export const AppClassificationStates = [...AppClassificationValues, 'loading', 'error'] as const;

/**
 * Type definition of supported classification states.
 */
export type AppClassificationState = (typeof AppClassificationStates)[number];

/**
 * The expected shape of the response payload of the `url` defined in {@link AppClassificationProviderProps}
 */
export type AppClassificationResponse = { value: AppClassificationValue };

/**
 * React {@link Context} for {@link AppClassificationProvider}
 */
export const AppClassificationContext = createContext<AppClassificationContextType>({
  initialized: false,
  value: 'u',
  setValue: () => {}
});

/**
 * Implementation of the AppClassification provider.
 */
export const AppClassificationProvider: FC<AppClassificationProviderProps> = ({ children, value, url }) => {
  const [state, setState] = useState<AppClassificationState | undefined>(value);

  useEffect(() => {
    if (!url) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState('loading');

    fetch(url)
      .then(response => response.json())
      .then((data: AppClassificationResponse) => {
        setState(data.value);
      })
      .catch(() => {
        setState('error');
      });
  }, [url]);

  const _state = useMemo(() => {
    if (state) {
      return state;
    }
    return value;
  }, [state, value]);

  const _value = useMemo(() => ({ initialized: !!_state, value: _state, setValue: setState }), [_state]);

  return <AppClassificationContext.Provider value={_value}>{children}</AppClassificationContext.Provider>;
};
