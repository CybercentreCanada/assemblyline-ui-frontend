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
import type { RequestBuilder } from 'components/models/utils/request';

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

/**
 * @name /search/<index>/
 * @description Search through specified index for a given query. Uses lucene search syntax for query.
 * @method GET_POST
 */

type SearchParams = {
  // Query to search for
  query?: string;

  // ID of the next page or * to start deep paging
  deep_paging_id?: string;

  // List of additional filter queries limit the data
  filters?: string[];

  // Offset in the results
  offset?: number;

  // Number of results per page
  rows?: number;

  // How to sort the results (not available in deep paging)
  sort?: string;

  // List of fields to return
  fl?: string;

  // Maximum execution time (ms)
  timeout?: number;

  // Allow access to the malware archive (Default: False)
  use_archive?: boolean;

  // Only access the Malware archive (Default: False)
  archive_only?: boolean;
};

export type SearchGetRequest = RequestBuilder<`/api/v4/search/${SearchIndex}/`, 'GET', SearchParams>;

export type SearchPostRequest = RequestBuilder<`/api/v4/search/${SearchIndex}/`, 'POST', SearchParams>;

/** Search through specified index for a given query. Uses lucene search syntax for query. */
export type SearchResult<Item> = {
  /** List of results */
  items: Item[];

  /** Offset in the result list */
  offset: number;

  /** Number of results returned */
  rows: number;

  /** Total results found */
  total: number;
};

// prettier-ignore
export type SearchResponse<Route extends SearchGetRequest['url'] | SearchPostRequest['url']> = Route extends `/api/v4/search/${infer Index}/` ?
  Index extends 'alert' ? SearchResult<AlertIndexed> :
  Index extends 'badlist' ? SearchResult<Badlist> :
  Index extends 'file' ? SearchResult<FileIndexed> :
  Index extends 'heuristic' ? SearchResult<Heuristic> :
  Index extends 'result' ? SearchResult<ResultIndexed> :
  Index extends 'retrohunt' ? SearchResult<RetrohuntIndexed> :
  Index extends 'safelist' ? SearchResult<Safelist> :
  Index extends 'signature' ? SearchResult<SignatureIndexed> :
  Index extends 'submission' ? SearchResult<SubmissionIndexed> :
  Index extends 'workflow' ? SearchResult<WorkflowIndexed> :
  never
: never;

/**
 * @name /search/grouped/<index>/<group_field>/
 * @description Search through all relevant indexs for a given query and groups the data based on a specific field. Uses lucene search syntax for query.
 * @method GET_POST
 */

type GroupedSearchParams = {
  // How to sort the results inside the group
  group_sort?: string;

  // Maximum number of results return for each groups
  limit?: number;

  // Query to search for
  query?: string;

  // List of additional filter queries limit the data
  filters?: string[];

  // Offset in the results
  offset?: number;

  // Max number of results
  rows?: number;

  // How to sort the results
  sort?: string;

  // List of fields to return
  fl?: string;

  // Maximum execution time (ms)
  timeout?: number;

  // Allow access to the malware archive (Default: False)
  use_archive?: boolean;

  // Only access the Malware archive (Default: False)
  archive_only?: boolean;
};

export type GroupedSearchGetRequest = RequestBuilder<
  `/api/v4/search/grouped/${SearchIndex}/${string}/`,
  'GET',
  GroupedSearchParams
>;

export type GroupedSearchPostRequest = RequestBuilder<
  `/api/v4/search/grouped/${SearchIndex}/${string}/`,
  'POST',
  GroupedSearchParams
>;

export type GroupedSearchGetResponse = SearchResult<unknown>;

/**
 * @name /search/fields/<index>/
 * @description List all available fields for a given index
 * @method GET
 */

export type ListSearchGetRequest = RequestBuilder<`/api/v4/search/list/${SearchIndex}/`, 'GET', null>;

/** Data Types based on the elastic definitions */
export const FIELD_TYPES = [
  'null',
  'boolean',
  'byte',
  'short',
  'integer',
  'long',
  'unsigned_long',
  'double',
  'float',
  'half_float',
  'scaled_float',
  'keyword',
  'text',
  'binary',
  'date',
  'ip',
  'version',
  'object',
  'nested'
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type ListSearchGetResponse = {
  [field: string]: {
    default?: boolean;

    /** Is the field indexed */
    indexed: boolean;

    /** Is the field a list */
    list: boolean;

    /** Is the field stored */
    stored: boolean;

    /** What type of data in the field */
    type: FieldType;

    name: string;
  };
};

/**
 * @name /search/facet/<index>/<field>/
 * @description Perform field analysis on the selected field. (Also known as facetting in lucene)
    This essentially counts the number of instances a field is seen with each specific values
    where the documents matches the specified queries.
 * @method GET_POST
 */

type FaceSearchParams = {
  // Query to search for
  query?: string;

  // Minimum item count for the fieldvalue to be returned
  mincount?: number;

  // Additional query to limit to output
  filters?: string[];

  // Maximum execution time (ms)
  timeout?: number;

  // Allow access to the malware archive (Default: False)
  use_archive?: boolean;

  // Only access the Malware archive (Default: False)
  archive_only?: boolean;

  // How many facets are returned? (Default: 10)
  size?: number;
};

export type FacetSearchGetRequest = RequestBuilder<
  `/api/v4/search/facet/${SearchIndex}/${string}/`,
  'GET',
  FaceSearchParams
>;

export type FacetSearchPostRequest = RequestBuilder<
  `/api/v4/search/facet/${SearchIndex}/${string}/`,
  'POST',
  FaceSearchParams
>;

export type FacetSearchResponse = { [step: string]: number };

/**
 * @name /search/histogram/<index>/<field>/
 * @description Generate an histogram based on a time or and int field using a specific gap size
 * @method GET_POST
 */

type HistogramParams = {
  // Query to search for
  query?: string;

  // Minimum item count for the fieldvalue to be returned
  mincount?: number;

  // Additional query to limit to output
  filters?: string[];

  // Value at which to start creating the histogram * Defaults: 0 or now-1d
  start?: string;

  // Value at which to end the histogram * Defaults: 2000 or now
  end?: string;

  // Size of each step in the histogram * Defaults: 100 or +1h
  gap?: string;

  // Maximum execution time (ms)
  timeout?: number;

  // Allow access to the malware archive (Default: False)
  use_archive?: boolean;

  // Only access the Malware archive (Default: False)
  archive_only?: boolean;
};

export type HistogramSearchGetRequest = RequestBuilder<
  `/api/v4/search/histogram/${SearchIndex}/${string}/`,
  'GET',
  HistogramParams
>;

export type HistogramSearchPostRequest = RequestBuilder<
  `/api/v4/search/histogram/${SearchIndex}/${string}/`,
  'POST',
  HistogramParams
>;

export type HistogramSearchResponse = { [step: string]: number };

/**
 * @name /search/stats/<index>/<int_field>/
 * @description Perform statistical analysis of an integer field to get its min, max, average and count values
 * @method GET_POST
 */

type StatsParams = {};

export type StatsSearchGetRequest = RequestBuilder<
  `/api/v4/search/stats/${SearchIndex}/${string}/`,
  'GET',
  StatsParams
>;

export type StatsSearchPostRequest = RequestBuilder<
  `/api/v4/search/stats/${SearchIndex}/${string}/`,
  'POST',
  StatsParams
>;

export type StatsSearchResponse = {
  // Number of times this field is seen
  count: number;

  // Minimum value
  min: number;

  // Maximum value
  max: number;

  // Average value
  avg: number;

  // Sum of all values
  sum: number;
};

// prettier-ignore
export type SearchRequests =
  | SearchGetRequest
  | SearchPostRequest
  | GroupedSearchGetRequest
  | GroupedSearchPostRequest
  | ListSearchGetRequest
  | FacetSearchGetRequest
  | FacetSearchPostRequest
  | HistogramSearchGetRequest
  | HistogramSearchPostRequest
  | StatsSearchGetRequest
  | StatsSearchPostRequest

// prettier-ignore
export type SearchResponses<Request extends SearchRequests> =
  Request extends SearchGetRequest ? SearchResponse<Request['url']> :
  Request extends SearchPostRequest ? SearchResponse<Request['url']> :
  Request extends GroupedSearchGetRequest ? GroupedSearchGetResponse :
  Request extends GroupedSearchPostRequest ? GroupedSearchGetResponse :
  Request extends ListSearchGetRequest ? ListSearchGetResponse :
  Request extends FacetSearchGetRequest ? FacetSearchResponse :
  Request extends FacetSearchPostRequest ? FacetSearchResponse :
  Request extends HistogramSearchGetRequest ? HistogramSearchResponse :
  Request extends HistogramSearchPostRequest ? HistogramSearchResponse :
  Request extends StatsSearchGetRequest ? StatsSearchResponse :
  Request extends StatsSearchPostRequest ? StatsSearchResponse :
  never;

/**
 * Old
 */

/** Perform statistical analysis of an integer field to get its min, max, average and count values */
export type StatResult = {
  /** Number of times this field is seen */
  count: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Average value */
  avg: number;

  /** Sum of all values */
  sum: number;
};

/** Generate an histogram based on a time or and int field using a specific gap size */
export type HistogramResult = { [step: string]: number };

/**
 * Perform field analysis on the selected field. (Also known as facetting in lucene)
    This essentially counts the number of instances a field is seen with each specific values
    where the documents matches the specified queries.
 */
export type FacetResult = { [step: string]: number };

export type FieldsResult = {
  [field: string]: {
    default?: boolean;

    /** Is the field indexed */
    indexed: boolean;

    /** Is the field a list */
    list: boolean;

    /** Is the field stored */
    stored: boolean;

    /** What type of data in the field */
    type: FieldType;

    name: string;
  };
};
