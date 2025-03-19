import type { AlertIndexed } from 'components/models/base/alert';
import type { Badlist } from 'components/models/base/badlist';
import type { FileIndexed } from 'components/models/base/file';
import type { Heuristic } from 'components/models/base/heuristic';
import type { ResultIndexed } from 'components/models/base/result';
import type { RetrohuntIndexed } from 'components/models/base/retrohunt';
import type { Safelist } from 'components/models/base/safelist';
import type { SignatureIndexed } from 'components/models/base/signature';
import type { SubmissionIndexed } from 'components/models/base/submission';
import type { WorkflowIndexed } from 'components/models/base/workflow';
import type { RequestBuilder } from './utils';

type SearchIndex =
  | 'alert'
  | 'badlist'
  | 'file'
  | 'heuristic'
  | 'result'
  | 'retrohunt'
  | 'safelist'
  | 'signature'
  | 'submission'
  | 'workflow';

type SearchGetRequest = RequestBuilder<
  `api/v4/search/${SearchIndex}/`,
  'GET',
  {
    archive_only?: boolean;
    deep_paging_id?: string;
    filters?: string;
    fl?: string;
    offset?: number;
    query?: string;
    rows?: number;
    sort?: string;
    timeout?: number;
    use_archive?: boolean;
  }
>;

type SearchPostRequest = RequestBuilder<
  `api/v4/search/${SearchIndex}/`,
  'POST',
  {
    query?: string;
    offset?: number;
    rows?: number;
    sort?: `${string} ${'asc' | 'desc'}`;
    fl?: string;
    timeout?: number;
    filters?: string[];
  }
>;

// prettier-ignore
type SearchResponse<Route extends SearchGetRequest['url'] | SearchPostRequest['url']> = Route extends `api/v4/search/${infer Index}/` ?
  Index extends 'alert' ? AlertIndexed :
  Index extends 'badlist' ? Badlist :
  Index extends 'file' ? FileIndexed :
  Index extends 'heuristic' ? Heuristic :
  Index extends 'result' ? ResultIndexed :
  Index extends 'retrohunt' ? RetrohuntIndexed :
  Index extends 'safelist' ? Safelist :
  Index extends 'signature' ? SignatureIndexed :
  Index extends 'submission' ? SubmissionIndexed :
  Index extends 'workflow' ? WorkflowIndexed :
  never
: never;

// prettier-ignore
export type SearchRequests = SearchGetRequest | SearchPostRequest;

// prettier-ignore
export type SearchResponses<Request extends SearchRequests> =
  Request['url'] extends SearchGetRequest['url'] ? Request['method'] extends SearchGetRequest['method'] ? SearchResponse<Request['url']> : never :
  Request['url'] extends SearchPostRequest['url'] ? Request['method'] extends SearchPostRequest['method'] ? SearchResponse<Request['url']> : never :
  never;
