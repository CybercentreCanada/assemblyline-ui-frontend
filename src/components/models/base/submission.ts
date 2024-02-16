import { ParsedErrors } from './error';

export const SUBMISSION_STATES = ['failed', 'submitted', 'completed'] as const;

export const DEFAULT_SRV_SEL = ['Filtering', 'Antivirus', 'Static Analysis', 'Extraction', 'Networking'] as const;

export const DEFAULT_RESUBMIT = [] as const;

export type SubmissionState = (typeof SUBMISSION_STATES)[number];
export type DefaultSRVSel = (typeof DEFAULT_SRV_SEL)[number];
export type DefaultReSubmit = (typeof DEFAULT_RESUBMIT)[number];

/** File Model of Submission */
export type File = {
  /** Name of the file */
  name: string;

  /** SHA256 hash of the file */
  sha256: string;

  /** Size of the file in bytes */
  size?: number;
};

/** Service Selection Scheme */
export type ServiceSelection = {
  /** List of excluded services */
  excluded: string[];

  /** List of services to rescan when initial run scores as malicious */
  rescan: string[];

  /** Add to service selection when resubmitting */
  resubmit: string[];

  /** List of runtime excluded services */
  runtime_excluded: string[];

  /** List of selected services */
  selected: string[];
};

/** Submission Parameters */
export type SubmissionParams = {
  /** Does the submission automatically goes into the archive when completed? */
  auto_archive: boolean;

  /** Original classification of the submission */
  classification: string;

  /** Should a deep scan be performed? */
  deep_scan: boolean;

  /** When the submission is archived, should we delete it from hot storage right away? */
  delete_after_archive: boolean;

  /** Description of the submission */
  description: string;

  /** Should this submission generate an alert? */
  generate_alert: boolean;

  /** List of groups related to this scan */
  groups: string[];

  /** Ignore the cached service results? */
  ignore_cache: boolean;

  /** Should we ignore dynamic recursion prevention? */
  ignore_dynamic_recursion_prevention: boolean;

  /** Should we ignore filtering services? */
  ignore_filtering: boolean;

  /** Ignore the file size limits? */
  ignore_size: boolean;

  /** Initialization for temporary submission data */
  initial_data?: string;

  /** Is the file submitted already known to be malicious? */
  malicious: boolean;

  /** Max number of extracted files */
  max_extracted: number;

  /** Max number of supplementary files */
  max_supplementary: number;

  /** Exempt from being dropped by ingester? */
  never_drop: boolean;

  /** Priority of the scan */
  priority: number;

  /** Should the submission do extra profiling? */
  profile: boolean;

  /** Parent submission ID */
  psid?: string;

  /** Does this submission count against quota? */
  quota_item: boolean;

  /** Service-specific parameters */
  service_spec: Record<string, Record<string, any>>;

  /** Service selection */
  services: ServiceSelection;

  /** User who submitted the file */
  submitter: string;

  /** Time, in days, to live for this submission */
  ttl: number;

  /** Type of submission */
  type: string;
};

/** Submission-Relevant Times */
export type Times = {
  /** Date at which the submission finished scanning */
  completed?: string & Date;

  /** Date at which the submission started scanning */
  submitted: string & Date;
};

/** Submission Verdict */
export type Verdict = {
  /** List of user that thinks this submission is malicious */
  malicious: string[];

  /** List of user that thinks this submission is non-malicious */
  non_malicious: string[];
};

export type Metadata = {
  replay?: string;
  [meta: string]: string;
};

/** Model of Submission */
export type Submission = {
  /** Archiving timestamp (Deprecated) */
  archive_ts?: string & Date;

  /** Document is present in the malware archive */
  archived: boolean;

  /** Classification of the submission */
  classification: string;

  /** Total number of errors in the submission */
  error_count: number;

  /** List of error keys */
  errors: string[];

  /** Expiry timestamp */
  expiry_ts?: string & Date;

  /** Total number of files in the submission */
  file_count: number;

  /** List of files that were originally submitted */
  files: File[];

  /** Was loaded from the archive */
  from_archive: boolean;

  /** Submission ID */
  id: string;

  /** Maximum score of all the files in the scan */
  max_score: number;

  /** Metadata associated to the submission */
  metadata: Metadata;

  /** Submission parameter details */
  params: SubmissionParams;

  /** List of result keys */
  results: string[];

  /**  */
  scan_key?: string;

  /** Submission ID */
  sid: string;

  /** Status of the submission */
  state: SubmissionState;

  /** Submission-specific times */
  times: Times;

  /** This document is going to be deleted as soon as it finishes */
  to_be_deleted: boolean;

  /** Malicious verdict details */
  verdict: Verdict;
};

export type SubmissionIndexed = Pick<
  Submission,
  | 'archived'
  | 'classification'
  | 'error_count'
  | 'file_count'
  | 'from_archive'
  | 'id'
  | 'max_score'
  | 'params'
  | 'sid'
  | 'state'
  | 'times'
  | 'to_be_deleted'
>;

export type ParsedSubmission = Submission & {
  parsed_errors: ParsedErrors;
};
