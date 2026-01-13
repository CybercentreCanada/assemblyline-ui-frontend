import type { SubmissionProfileParams } from 'components/models/base/config';
import type { SelectedServiceCategory, ServiceSpecification } from 'components/models/base/service';

export const ENCODINGS = ['cart', 'raw', 'zip'] as const;
export const VIEWS = ['report', 'details'] as const;

export type Encoding = (typeof ENCODINGS)[number];
export type View = (typeof VIEWS)[number];

export type UserSettings = {
  /** Should a deep scan be performed? */
  deep_scan: boolean;

  /** Default classification for submissions */
  default_classification: string;

  /** List of sha256 sources to check by default */
  default_external_sources: string[];

  /** Default metadata for submissions */
  default_metadata: Record<string, string>;

  /** Default user-defined password for creating password protected ZIPs when downloading files */
  default_zip_password: string;

  /** Default description */
  description: string;

  /** Default download encoding when downloading files */
  download_encoding: Encoding;

  /** Should executive summary sections be shown? */
  executive_summary: boolean;

  /** Auto-expand section when score bigger then this */
  expand_min_score: number;

  /** Generate an alert? */
  generate_alert: boolean;

  /** Ignore service caching? */
  ignore_cache: boolean;

  /** Ignore dynamic recursion prevention? */
  ignore_dynamic_recursion_prevention: boolean;

  /** Ignore filtering services? */
  ignore_filtering: boolean;

  /** Should we ignore recursion prevention? */
  ignore_recursion_prevention: boolean;

  /** Initialization for temporary submission data */
  initial_data: string;

  /** Is the file submitted already known to be malicious? */
  malicious: boolean;

  /** Default priority for the submissions */
  priority: number;

  /** Preferred submission profile */
  preferred_submission_profile?: string;

  /** Default submission profile settings */
  submission_profiles?: Record<string, SubmissionProfileParams>;

  /** Default service specific settings */
  service_spec: ServiceSpecification[];

  /** Default service selection */
  services: SelectedServiceCategory[];

  /** Default view for completed submissions */
  submission_view: View;

  /** Default submission TTL, in days */
  ttl: number;
};
