import { ServiceSelection } from './submission';

export const ENCODINGS = ['cart', 'raw', 'zip'] as const;
export const TYPES = ['bool'] as const;
export const VIEWS = ['report', 'details'] as const;

export type Encoding = (typeof ENCODINGS)[number];
export type Type = (typeof TYPES)[number];
export type View = (typeof VIEWS)[number];

export type ServiceParameter =
  | {
      type: 'bool';
      hide: boolean;
      name: string;
      value: boolean | 'true' | 'false';
      default: boolean;
    }
  | {
      type: 'int';
      hide: boolean;
      name: string;
      value: number;
      default: number;
    }
  | {
      type: 'str';
      hide: boolean;
      name: string;
      value: string;
      default: string;
    }
  | {
      type: 'list';
      hide: boolean;
      name: string;
      value: string;
      default: string;
      list: string[];
    };

export type ServiceSpecification = {
  /** Service name */
  name: string;

  /** Service parameters */
  params: ServiceParameter[];
};

export type UserSettings = {
  /** Default submission classification */
  classification: string;

  /** Should a deep scan be performed? */
  deep_scan: boolean;

  /** List of sha256 sources to check by default */
  default_external_sources: string[];

  /** Default user-defined password for creating password protected ZIPs when downloading files */
  default_zip_password: string;

  /** Default description */
  description: string;

  /** Default download encoding when downloading files */
  download_encoding: Encoding;

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

  /** Is the file submitted already known to be malicious? */
  malicious: boolean;

  /** Default priority for the submissions */
  priority: number;

  /** Should the submission do extra profiling? */
  profile: boolean;

  /** Default service specific settings */
  service_spec: ServiceSpecification[];

  /** Default service selection */
  services: ServiceSelection;

  /** Default view for completed submissions */
  submission_view: View;

  /** Default submission TTL, in days */
  ttl: number;
};