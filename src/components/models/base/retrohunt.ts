export const INDEX_CATAGORIES = ['hot', 'archive', 'hot_and_archive'] as const;
export const PHASE = ['filtering', 'yara', 'finished'] as const;

export type IndexCategory = (typeof INDEX_CATAGORIES)[number];
export type Phase = (typeof PHASE)[number];

/** A search run on stored files. */
export type Retrohunt = {
  /** Defines the indices used for this retrohunt job */
  indices: IndexCategory;

  /** Classification for the retrohunt job */
  classification: string;

  /** Maximum classification of results in the search */
  search_classification: string;

  /** User who created this retrohunt job */
  creator: string;

  /** Human readable description of this retrohunt job */
  description: string;

  /** Expiry timestamp of this retrohunt job */
  expiry_ts?: string & Date;

  /** Earliest expiry group this search will include */
  start_group: number;

  /** Latest expiry group this search will include */
  end_group: number;

  /** Start time for the search. */
  created_time: string & Date;

  /** Start time for the search. */
  started_time: string & Date;

  /** Time that the search ended */
  completed_time?: string & Date;

  /** Unique code identifying this retrohunt job */
  id: string;

  /** Unique code identifying this retrohunt job */
  key: string;

  /** Text of filter query derived from yara signature */
  raw_query: string;

  /** Text of original yara signature run */
  yara_signature: string;

  /** List of error messages that occured during the search */
  errors: string[];

  /** List of warning messages that occured during the search */
  warnings: string[];

  /** Boolean that indicates if this retrohunt job is finished */
  finished: boolean;

  /** Indicates if the list of hits been truncated at some limit */
  truncated: boolean;

  // these are deprecated
  archive_only: boolean;
  code: string;
  created: string | Date;
  hits: string[];
  pending_candidates: number;
  pending_indices: number;
  phase: Phase;
  progress: [number, number];
  percentage: number;
  tags: Record<string, any>;
  total_errors: number;
  total_hits: number;
  total_indices: number;
};

/** A hit encountered during a retrohunt search. */
export type RetrohuntHit = {
  /** Unique code indentifying this hit */
  key: string;

  /** Classification string for the retrohunt job and results list */
  classification: string;

  /** Unique code indentifying this hit */
  id: string;

  /** SHA256 of the file this hit is related to */
  sha256: string;

  /** Expiry for this entry. */
  expiry_ts?: string;

  /** ID of the Retrohunt search run */
  search: string;
};

export type RetrohuntIndexed = Pick<
  Retrohunt,
  | 'classification'
  | 'created_time'
  | 'creator'
  | 'description'
  | 'end_group'
  | 'finished'
  | 'id'
  | 'indices'
  | 'key'
  | 'search_classification'
  | 'start_group'
  | 'started_time'
  | 'truncated'
>;

export const DEFAULT_RETROHUNT: Partial<Retrohunt> = {
  archive_only: false,
  classification: null,
  code: null,
  created: '2020-01-01T00:00:00.000000Z',
  creator: null,
  description: '',
  errors: [],
  expiry_ts: null,
  finished: false,
  hits: [],
  pending_candidates: 0,
  pending_indices: 0,
  phase: 'finished',
  progress: [1, 1],
  raw_query: null,
  tags: {},
  total_errors: 0,
  total_hits: 0,
  total_indices: 0,
  truncated: false,
  yara_signature: ''
};
