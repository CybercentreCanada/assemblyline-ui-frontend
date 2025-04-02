import type { BadlistRequests, BadlistResponses } from 'components/models/ui/badlist';
import type { SearchRequests, SearchResponses } from 'components/models/ui/search';

// prettier-ignore
export type ALRequests =
  | BadlistRequests
  | SearchRequests;

// prettier-ignore
export type ALResponses<Request extends ALRequests> =
  Request extends BadlistRequests ? BadlistResponses<Request> :
  Request extends SearchRequests ? SearchResponses<Request> :
  never;
