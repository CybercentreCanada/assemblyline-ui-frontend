import { z } from 'zod';
// import type { Method } from '../../../../src/models/utils/request';
// import type { RootRequests, RootResponses } from '../../../../src/models/ui';
// import type { BadlistRequests, BadlistResponses } from '../../../../src/models/ui/badlist';
// import type { SearchRequests, SearchResponses } from '../../../../src/models/ui/search';
// import type { UserRequests, UserResponses } from '../../../../src/models/ui/user';

export type APIRequest = {
  url: string;
  method?: Method;
  body?: null | boolean | number | string | object;
};

export type APIResponse<T = unknown> = {
  message?: string;
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
};

export type BlobResponse<T = unknown> = {
  api_error_message: string;
  api_response: T;
  api_server_version: string;
  api_status_code: number;
  filename: string;
  size: number;
  type: string;
};

export type APIReturn<Response = unknown> = {
  data: Response;
  error: string;
  serverVersion: string;
  statusCode: number;
};

export type APIQueryKey = [
  string, // URL
  Method, // Method
  string, // Stringified Body
  boolean // allowCache
];

// prettier-ignore
export type ALRequests =
  | BadlistRequests
  | RootRequests
  | SearchRequests
  | UserRequests

// prettier-ignore
export type ALResponses<Request extends ALRequests> =
  Request extends BadlistRequests ? BadlistResponses<Request> :
  Request extends RootRequests ? RootResponses<Request> :
  Request extends SearchRequests ? SearchResponses<Request> :
  Request extends UserRequests ? UserResponses<Request> :
  never;

//*****************************************************************************************
// App API Settings & Config
//*****************************************************************************************

export const AppAPISettingsSchema = z.object({
  staleTime: z.number().min(0).optional(),
  gcTime: z.number().min(0).optional()
});

export type AppAPISettings = z.infer<typeof AppAPISettingsSchema>;

export type AppAPIConfig = AppAPISettings & {
  showDevtools?: boolean;
};
