import type { Verdict } from 'components/models/base/alert';
import type { File } from 'components/models/base/file';
import type { PromoteTo } from 'components/models/base/result';
import type { SectionBody } from 'components/models/base/result_body';
import type { Submission } from 'components/models/base/submission';
import type { Tags } from './file';
import type { SubmissionSummary } from './submission';

/** */
export type TPromotedSection = SectionBody & {
  /** This is the type of data that the current section should be promoted to. */
  promote_to?: PromoteTo;
};

/**
 * File that generated the attack
 * @param name name of the file
 * @param sha256 sha256 of the file
 */
export type TAttackFile = [string, string];

export type TAttack = {
  h_type: Verdict;
  files: TAttackFile[];
};

export type TAttackMatrix = { [attack: string]: TAttack };

export type TSubmissionTags = {
  attributions: Tags;
  behaviors: Tags;
  indicators_of_compromise: Tags;
};

/**
 * Create a report for a submission based on its ID.
 */
export type SubmissionReport = Pick<
  Submission,
  | 'archive_ts'
  | 'archived'
  | 'classification'
  | 'error_count'
  | 'expiry_ts'
  | 'file_count'
  | 'files'
  | 'from_archive'
  | 'max_score'
  | 'metadata'
  | 'scan_key'
  | 'sid'
  | 'state'
  | 'times'
  | 'to_be_deleted'
  | 'verdict'
> &
  Pick<SubmissionSummary, 'heuristic_name_map' | 'heuristic_sections' | 'heuristics'> & {
    /** ATT&CK Matrix object */
    attack_matrix: { [category: string]: TAttackMatrix };
    file_info: File;
    file_tree: string;

    /** sha256 of the important files */
    important_files: string[];

    params: Submission['params'] & { services: { errors: string[] } };

    promoted_sections: TPromotedSection[];

    /** Has the tree cache entry been filtered? */
    report_filtered: boolean;

    /** Missing files. Might be caused by the submissions still being processed */
    report_partial: boolean;

    /** Dictionary of tags */
    tags: TSubmissionTags;
  };
