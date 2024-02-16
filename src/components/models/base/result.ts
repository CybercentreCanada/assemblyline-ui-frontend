import { SectionBody } from './result_body';

export const PROMOTE_TO = ['SCREENSHOT', 'ENTROPY', 'URI_PARAMS'] as const;

/**
 * This is a "keys-only" representation of the PROMOTE_TO StringTable in
 * assemblyline-v4-service/assemblyline_v4_service/common/result.py.
 * Any updates here need to go in that StringTable also.
 */
export type PromoteTo = (typeof PROMOTE_TO)[number];

export type Tagging = {
  type: string;
  short_type: string;
  value: string;
  safelisted: boolean;
  classification: string;
};

export type SectionItem = {
  id: number;
  children: SectionItem[];
};

export type Attack = {
  /** ID */
  attack_id: string;

  /** Categories */
  categories: string[];

  /** Pattern Name */
  pattern: string;
};

/** Heuristic Signatures */
export type Signature = {
  /** Number of times this signature triggered the heuristic */
  frequency: number;

  /** Name of the signature that triggered the heuristic */
  name: string;

  /** Is the signature safelisted or not */
  safe: boolean;
};

/** Heuristic associated to the Section */
export type Heuristic = {
  /** List of Att&ck IDs related to this heuristic */
  attack: Attack[];

  /** ID of the heuristic triggered */
  heur_id: string;

  /** Name of the heuristic */
  name: string;

  /** Calculated Heuristic score */
  score: number;

  /** List of signatures that triggered the heuristic */
  signature: Signature[];
};

export type Section = SectionBody & {
  /** Should the section be collapsed when displayed? */
  auto_collapse: boolean;

  /** Configurations for the body of this section */
  body_config: { column_order?: string[] };

  /** Classification of the section */
  classification: string;

  /** Depth of the section */
  depth: number;

  /** Heuristic used to score result section */
  heuristic?: Heuristic;

  /** This is the type of data that the current section should be promoted to. */
  promote_to?: PromoteTo;

  /** List of safelisted tags */
  safelisted_tags: Record<string, object>;

  /** List of tags associated to this section */
  tags: Tagging[];

  /** Title of the section */
  title_text: string;
};

/** Result Body */
export type ResultBody = {
  /** Aggregate of the score for all heuristics */
  score: number;

  /** List of sections */
  sections: Section[];
};

/** Service Milestones */
export type Milestone = {
  /** Date the service finished scanning */
  service_completed: string & Date;

  /** Date the service started scanning */
  service_started: string & Date;
};

/** File related to the Response */
export type File = {
  /** Allow file to be analysed during Dynamic Analysis even if Dynamic Recursion Prevention is enabled. */
  allow_dynamic_recursion: boolean;

  /** Classification of the file */
  classification: string;

  /** Description of the file */
  description: string;

  /** Is this an image used in an Image Result Section? */
  is_section_image: boolean;

  /** Name of the file */
  name: string;

  /** File relation to parent, if any.\<br>Values: `\"ROOT\", \"EXTRACTED\", \"INFORMATION\", \"DYNAMIC\", \"MEMDUMP\", \"DOWNLOADED\"` */
  parent_relation: string;

  /** SHA256 of the file */
  sha256: string;
};

/** Response Body of Result */
export type ResponseBody = {
  /** List of extracted files */
  extracted: File[];

  /** Milestone block */
  milestones: Milestone;

  /** Context about the service */
  service_context?: string;

  /** Debug info about the service */
  service_debug_info?: string;

  /** Name of the service that scanned the file */
  service_name: string;

  /** Tool version of the service */
  service_tool_version?: string;

  /** Version of the service */
  service_version: string;

  /** List of supplementary files */
  supplementary: File[];
};

/** Result Model */
export type Result = {
  /** Archiving timestamp (Deprecated) */
  archive_ts?: string & Date;

  /** Aggregate classification for the result */
  classification: string;

  /** Date at which the result object got created */
  created: string & Date;

  /** Use to not pass to other stages after this run */
  drop_file: boolean;

  /** Expiry timestamp */
  expiry_ts?: string & Date;

  /** Was loaded from the archive */
  from_archive: boolean;

  /**  */
  id: string;

  /** Invalidate the current result cache creation */
  partial: boolean;

  /** The body of the response from the service */
  response: ResponseBody;

  /** The result body */
  result: ResultBody;

  /** SHA256 of the file the result object relates to */
  sha256: string;

  /**  */
  size?: number;

  /**  */
  type?: string;
};

export type ResultIndexed = Pick<
  Result,
  'classification' | 'created' | 'drop_file' | 'from_archive' | 'id' | 'response' | 'result' | 'size' | 'type'
>;

export type AlternateResult = Pick<Result, 'classification' | 'created' | 'drop_file' | 'id'> & {
  response: Pick<ResponseBody, 'service_name' | 'service_version'>;
} & { result: Pick<ResultBody, 'score'> };

export type FileResult = Pick<
  Result,
  'archive_ts' | 'classification' | 'created' | 'drop_file' | 'expiry_ts' | 'response' | 'result' | 'sha256'
> & {
  section_hierarchy: SectionItem[];
};
