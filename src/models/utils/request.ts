export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type RequestBuilder<URL extends string = string, M extends Method = 'GET', Body = null> = {
  url: URL;
  method?: M;
  body?: Body;
};
