import { Role } from '../base/user';
import type { SearchRoutes } from './search';

export const MUI_COLORS = ['default', 'info', 'success', 'warning', 'error'] as const;
export const METHODS = ['GET', 'POST', 'DELETE', 'PUT'] as const;

export type MuiColor = (typeof MUI_COLORS)[number];
export type Method = (typeof METHODS)[number];

type TestRoutes = {
  '/': string;
};

export type API<Data> = {
  api_response: Data;
  api_error_message: string;
  api_server_version: string;
  api_status_code: number;
};

export type Page = {
  audit: boolean;
  function: string;
  methods: Method[];
  protected: boolean;
  required_type: Role[];
  url: string;
};

/** Check if all pages have been protected by a login decorator */
export type SiteMap = Page[];

export type APIResponses = SearchRoutes & TestRoutes;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
