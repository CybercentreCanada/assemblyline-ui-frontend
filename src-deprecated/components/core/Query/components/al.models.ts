import type { RootRequests, RootResponses } from 'components/models/ui';
import type { BadlistRequests, BadlistResponses } from 'components/models/ui/badlist';
import type { SearchRequests, SearchResponses } from 'components/models/ui/search';
import type { UserRequests, UserResponses } from 'components/models/ui/user';

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
