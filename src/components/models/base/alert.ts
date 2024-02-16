import { Priority, Status } from './workflow';

export const ES_SUBMITTED = 'submitted';
export const ES_SKIPPED = 'skipped';
export const ES_INCOMPLETE = 'incomplete';
export const ES_COMPLETED = 'completed';
export const EXTENDED_SCAN_VALUES = [ES_SUBMITTED, ES_SKIPPED, ES_INCOMPLETE, ES_COMPLETED] as const;
export const EXTENDED_SCAN_PRIORITY = [ES_COMPLETED, ES_INCOMPLETE, ES_SKIPPED, ES_SUBMITTED] as const;
export const SUB_TYPE = ['EXP', 'CFG', 'OB', 'IMP', 'CFG', 'TA'] as const;
export const VERDICT = ['safe', 'info', 'suspicious', 'highly_suspicious', 'malicious'] as const;
export const ENTITY_TYPE = ['user', 'workflow'] as const;

export type ExtendedScanValue = (typeof EXTENDED_SCAN_VALUES)[number];
export type ExtendedScanPriority = (typeof EXTENDED_SCAN_PRIORITY)[number];
export type Verdict = (typeof VERDICT)[number];

/** Assemblyline Results Block */
export type DetailedItem = {
  /** Sub-type of the item */
  subtype?: (typeof SUB_TYPE)[number];

  /** Type of data that generated this item */
  type: string;

  /** Value of the item */
  value: string;

  /** Verdict of the item */
  verdict: Verdict;
};

/** Assemblyline Screenshot Block */
export type Screenshot = {
  /** Description of the screenshot */
  description: string;

  /** SHA256 hash of the image */
  img: string;

  /** Name of the screenshot */
  name: string;

  /** SHA256 hash of the thumbnail */
  thumb: string;
};

/** Assemblyline Detailed result block */
export type DetailedResults = {
  /** List of detailed Att&ck categories */
  attack_category: DetailedItem[];

  /** List of detailed Att&ck patterns */
  attack_pattern: DetailedItem[];

  /** List of detailed attribution */
  attrib: DetailedItem[];

  /** List of detailed AV hits */
  av: DetailedItem[];

  /** List of detailed behaviors for the alert */
  behavior: DetailedItem[];

  /** List of detailed domains */
  domain: DetailedItem[];

  /** List of detailed heuristics */
  heuristic: DetailedItem[];

  /** List of detailed IPs */
  ip: DetailedItem[];

  /** List of detailed URIs */
  uri: DetailedItem[];

  /** List of detailed YARA rule hits */
  yara: DetailedItem[];
};

/** Assemblyline Results Block */
export type ALResults = {
  /** List of attribution */
  attrib: string[];

  /** List of AV hits */
  av: string[];

  /** List of behaviors for the alert */
  behavior: string[];

  /** Assemblyline Detailed result block */
  detailed: DetailedResults;

  /** List of all domains */
  domain: string[];

  /** List of domains found during Dynamic Analysis */
  domain_dynamic: string[];

  /** List of domains found during Static Analysis */
  domain_static: string[];

  /** List of all IPs */
  ip: string[];

  /** List of IPs found during Dynamic Analysis */
  ip_dynamic: string[];

  /** List of IPs found during Static Analysis */
  ip_static: string[];

  /** Finish time of the Assemblyline submission */
  request_end_time: string & Date;

  /** Maximum score found in the submission */
  score: number;

  /** List of all URIs */
  uri: string[];

  /** List of URIs found during Dynamic Analysis */
  uri_dynamic: string[];

  /** List of URIs found during Static Analysis */
  uri_static: string[];

  /** List of YARA rule hits */
  yara: string[];
};

/** File Block Associated to the Top-Level/Root File of Submission */
export type File = {
  /** MD5 hash of file */
  md5: string;

  /** Name of the file */
  name: string;

  /** Screenshots of the file */
  screenshots: Screenshot[];

  /** SHA1 hash of the file */
  sha1: string;

  /** SHA256 hash of the file */
  sha256: string;

  /** Size of the file in bytes */
  size: number;

  /** Type of file as identified by Assemblyline */
  type: string;
};

/** Verdict Block of Submission */
export type SubmissionVerdict = {
  /** List of users that claim submission as malicious */
  malicious: string[];

  /** List of users that claim submission as non-malicious */
  non_malicious: string[];
};

/** Heuristic Block */
export type Heuristic = {
  /** List of related Heuristic names */
  name: string[];
};

/** ATT&CK Block */
export type Attack = {
  /** List of related ATT&CK categories */
  category: string[];

  /** List of related ATT&CK patterns */
  pattern: string[];
};

/** Model of Workflow Event */
export type Event = {
  /** ID of entity associated to event */
  entity_id: string;

  /** Name of entity */
  entity_name: string;

  /** Type of entity associated to event */
  entity_type: (typeof ENTITY_TYPE)[number];

  /** Labels added during event */
  labels?: string[];

  /** Priority applied during event */
  priority?: Priority;

  /** Status applied during event */
  status?: Status;

  /** Timestamp of event */
  ts: string & Date;
};

/** Submission relations for an alert */
export type Relationship = {
  /**  */
  child: string;

  /**  */
  parent?: string;
};

/** Model for Alerts */
export type Alert = {
  /** Assemblyline Result Block */
  al: ALResults;

  /** ID of the alert */
  alert_id: string;

  /** Archiving timestamp (Deprecated) */
  archive_ts?: string & Date;

  /** ATT&CK Block */
  attack: Attack;

  /** Classification of the alert */
  classification: string;

  /** An audit of events applied to alert */
  events: Event[];

  /** Expiry timestamp */
  expiry_ts?: string & Date;

  /** Status of the extended scan */
  extended_scan: ExtendedScanValue;

  /** File Block */
  file: File;

  /** Are the alert results filtered? */
  filtered: boolean;

  /** Heuristic Block */
  heuristic: Heuristic;

  /** ID of the alert */
  id: string;

  /** List of labels applied to the alert */
  label: string[];

  /** Metadata submitted with the file */
  metadata: Record<string, string>;

  /** Owner of the alert */
  owner?: string;

  /** Priority applied to the alert */
  priority?: Priority;

  /** Alert creation timestamp */
  reporting_ts: string & Date;

  /** Submission ID related to this alert */
  sid: string;

  /** Status applied to the alert */
  status?: Status;

  /** Describes relationships between submissions used to build this alert */
  submission_relations: Relationship[];

  /** File submission timestamp */
  ts: string & Date;

  /** Type of alert */
  type: string;

  /** Verdict Block */
  verdict: SubmissionVerdict;

  /** Have all workflows ran on this alert? */
  workflows_completed: boolean;
};

export type AlertIndexed = Pick<
  Alert,
  | 'al'
  | 'alert_id'
  | 'classification'
  | 'extended_scan'
  | 'file'
  | 'filtered'
  | 'id'
  | 'label'
  | 'owner'
  | 'priority'
  | 'reporting_ts'
  | 'sid'
  | 'status'
  | 'submission_relations'
  | 'ts'
  | 'type'
  | 'workflows_completed'
>;
