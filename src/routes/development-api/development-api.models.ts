import type { Method } from 'models/utils/request';

export type Request = {
  comment?: string;
  url?: string;
  method?: Method;
  body?: unknown;
  response?: unknown;
  error?: unknown;
};

export type Response = {
  statusCode: number;
  serverVersion: string;
  elapseTime: number;
};
