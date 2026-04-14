import { useContext } from 'react';
import { useStore } from 'zustand';
import { AppCookiesContext } from '../../app/providers/AppCookiesProvider';
import type { TuiCookiesStore } from '../../cookies';

export const useCookiesStore = <R,>(selector: (state: TuiCookiesStore) => R): R => {
  const store = useContext(AppCookiesContext);
  return useStore(store, selector);
};
