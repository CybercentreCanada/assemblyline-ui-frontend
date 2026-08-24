export const RETROHUNT_INDICES = ['hot', 'archive', 'hot_and_archive'] as const;
export const RETROHUNT_PHASES = ['Starting', 'Filtering', 'Yara', 'Finished'] as const;

export type RetrohuntIndex = (typeof RETROHUNT_INDICES)[number];
export type RetrohuntPhase = (typeof RETROHUNT_PHASES)[number];

export type RetrohuntProgress =
  | { type: 'Starting'; key: string }
  | { type: 'Filtering'; key: string; progress: number }
  | { type: 'Yara'; key: string; progress: number }
  | { type: 'Finished'; key: string; search: Retrohunt };

/** A search run on stored files. */
export type Retrohunt = {
  /** Defines the indices used for this retrohunt job */
  indices: RetrohuntIndex;

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

  /** Total number of warnings */
  total_warnings?: number;

  /** Total number of errors */
  total_errors?: number;

  step?: RetrohuntProgress['type'];

  ttl?: number;

  progress?: number;
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
> & {
  step?: RetrohuntProgress['type'];
  total_hits?: number;
  progress?: number;
};
