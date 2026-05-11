import { RootRequests, RootResponses } from 'models/api';
import { BadlistRequests, BadlistResponses } from 'models/api/badlist';
import { SearchRequests, SearchResponses } from 'models/api/search';
import { UserRequests, UserResponses } from 'models/api/user';

declare global {
  // prettier-ignore
  type ApiRequests =
    | BadlistRequests
    | RootRequests
    | SearchRequests
    | UserRequests;

  // prettier-ignore
  type ApiResponses<Request extends ApiRequests> =
    Request extends BadlistRequests ? BadlistResponses<Request> :
    Request extends RootRequests ? RootResponses<Request> :
    Request extends SearchRequests ? SearchResponses<Request> :
    Request extends UserRequests ? UserResponses<Request> :
    never;
}
