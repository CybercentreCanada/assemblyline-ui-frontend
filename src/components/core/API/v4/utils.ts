export type Methods = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type RequestBuilder<URL extends string = string, Method extends Methods = 'GET', Body = null> = {
  url: URL;
  method: Method;
  body: Body;
};
