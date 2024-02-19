import { Section } from '../base/result';
import { AttackMatrix, Heuristics, Tags } from './file';

export type HeuristicNameMap = { [name: string]: string[] };
export type HeuristicSection = { [heuristic: string]: Section[] };
export type Sha256TagMap = { [sha256: string]: string[] };
export type SubmissionTags = {
  attribution: Tags;
  behavior: Tags;
  ioc: Tags;
};

/**
 *  Retrieve the executive summary of a given submission ID. This
 *  is a MAP of tags to sha256 combined with a list of generated Tags by summary type.
 */
export type SubmissionSummary = {
  /** Attack matrix dictionary */
  attack_matrix: AttackMatrix;

  /**  */
  classification: string;

  /**  */
  filtered: boolean;

  /** Map of heuristic names to IDs */
  heuristic_name_map: HeuristicNameMap;

  /** Result section of the heuristic */
  heuristic_sections: HeuristicSection;

  /** Heuristics dictionary */
  heuristics: Heuristics;

  /** Map of TAGS to sha256 */
  map: Sha256TagMap;

  /**  */
  partial: boolean;

  /** Dictionary of tags */
  tags: SubmissionTags;
};

export type Tree = {
  /** Dictionary of children file blocks */
  children: { [sha256: string]: Tree };

  /** List of possible names for the file */
  name: string[];

  /** Score for the file */
  score: number;

  /** SHA256 of the file */
  sha256?: string;

  /** Size of the file */
  size?: number;

  /** Is the file truncated */
  truncated?: boolean;

  /** Type of the file */
  type: string;
};

/**
 * Get the file hierarchy of a given Submission ID. This is an
 * N deep recursive process but is limited to the max depth
 * set in the system settings.
 */
export type SubmissionTree = {
  /** Classification of the cache */
  classification: string;

  /** Expiry timestamp */
  expiry_ts: string | Date;

  /** Has this cache entry been filtered? */
  filtered: boolean;

  /** Missing files. Might be caused by the submissions still being processed */
  partial: boolean;

  /**  */
  supplementary: string[];

  /** Dictionary of children file blocks */
  tree: { [sha256: string]: Tree };
};
