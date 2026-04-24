// import type { Method } from '../../../../src/models/utils/request';
// import type { RootRequests, RootResponses } from '../../../../src/models/ui';
// import type { BadlistRequests, BadlistResponses } from '../../../../src/models/ui/badlist';
// import type { SearchRequests, SearchResponses } from '../../../../src/models/ui/search';
// import type { UserRequests, UserResponses } from '../../../../src/models/ui/user';

// // prettier-ignore
// export type ALRequests =
//   | BadlistRequests
//   | RootRequests
//   | SearchRequests
//   | UserRequests

// // prettier-ignore
// export type ALResponses<Request extends ALRequests> =
//   Request extends BadlistRequests ? BadlistResponses<Request> :
//   Request extends RootRequests ? RootResponses<Request> :
//   Request extends SearchRequests ? SearchResponses<Request> :
//   Request extends UserRequests ? UserResponses<Request> :
//   never;

export type APIRequests = undefined;

export type APIResponses<Request extends APIRequests> = undefined;
