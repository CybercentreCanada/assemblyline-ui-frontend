import { parse } from 'cookie';
import { parseCookies, parseTuiCookies, type TuiCookieDef, type TuiCookies } from '.';

export const parseExtraServerCookie = <T extends object>(request: Request, ...entry: TuiCookieDef[]): T => {
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const requestCookies = parse(request.headers.get('cookie'));
    return parseCookies(requestCookies, ...entry);
  }
  return {} as T;
};

export const parseTuiServerCookies = (request: Request, defaults?: Partial<TuiCookies>): TuiCookies => {
  const cookies = request.headers.get('cookie');
  return parseTuiCookies(cookies ? parse(cookies) : {}, defaults);
};
