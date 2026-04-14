import { TUI_COOKIE_OPTIONS, parseTuiCookies, type TuiCookies, type TuiParsedJsCookies } from '../cookies';

import Cookies from 'js-cookie';

export const parseTuiClientCookies = (defaults?: Partial<TuiCookies>): TuiCookies => {
  const cookies = Cookies.get() as unknown as TuiParsedJsCookies;
  return parseTuiCookies(cookies, defaults);
};

export const setClientCookie = (key: string, value: string): void => {
  Cookies.set(key, value, TUI_COOKIE_OPTIONS); // one year.
};
