import { AppSwitcherItem } from 'commons/components/app/AppConfigs';
import { ACL, Role, Type } from './user';

export const API_PRIV = ['READ', 'READ_WRITE', 'WRITE', 'CUSTOM', 'EXTENDED'] as const;
export const AUTO_PROPERTY_TYPES = ['access', 'classification', 'type', 'role', 'remove_role', 'group'];
export const BANNER_LEVELS = ['info', 'warning', 'success', 'error'] as const;
export const DOWNLOAD_ENCODINGS = ['raw', 'cart'] as const;
export const EXTERNAL_LINK_TYPES = ['hash', 'metadata', 'tag'] as const;
export const KUBERNETES_LABEL_OPS = ['In', 'NotIn', 'Exists', 'DoesNotExist'] as const;
export const REGISTRY_TYPES = ['docker', 'harbor'] as const;
export const SAFELIST_HASH_TYPES = ['sha1', 'sha256', 'md5'] as const;
export const SERVICE_CATEGORIES = [
  'Antivirus',
  'Dynamic Analysis',
  'External',
  'Extraction',
  'Filtering',
  'Internet Connected',
  'Networking',
  'Static Analysis'
] as const;
export const SERVICE_STAGES = ['FILTER', 'EXTRACT', 'CORE', 'SECONDARY', 'POST', 'REVIEW'] as const;
export const SYSTEM_TYPES = ['production', 'staging', 'development'] as const;
export const TEMPORARY_KEY_TYPES = ['union', 'overwrite', 'ignore'] as const;

export type APIPriv = (typeof API_PRIV)[number];
export type AutoPropertyType = (typeof AUTO_PROPERTY_TYPES)[number];
export type BannerLevel = (typeof BANNER_LEVELS)[number];
export type DownloadEncoding = (typeof DOWNLOAD_ENCODINGS)[number];
export type ExternalLinkType = (typeof EXTERNAL_LINK_TYPES)[number];
export type KubernetesLabelOps = (typeof KUBERNETES_LABEL_OPS)[number];
export type RegistryType = (typeof REGISTRY_TYPES)[number];
export type SafelistHashType = (typeof SAFELIST_HASH_TYPES)[number];
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];
export type ServiceStage = (typeof SERVICE_STAGES)[number];
export type SystemType = (typeof SYSTEM_TYPES)[number];
export type TemporaryKeyType = (typeof TEMPORARY_KEY_TYPES)[number];

/** Authentication Methods */
export type Auth = {
  /** Allow 2FA? */
  allow_2fa: boolean;

  /** Allow API keys? */
  allow_apikeys: boolean;

  /** Allow extended API keys? */
  allow_extended_apikeys: boolean;

  /** Allow security tokens? */
  allow_security_tokens: boolean;
};

/** Ingester Configuration */
export type Ingester = {
  /** How many extracted files may be added to a Submission. Overrideable via submission parameters. */
  default_max_extracted: number;

  /** How many supplementary files may be added to a Submission. Overrideable via submission parameters */
  default_max_supplementary: number;
};

/** A set of default values to be used running a service when no other value is set */
export type ScalerServiceDefaults = {
  /** The minimum number of service instances to be running */
  min_instances: number;
};

/** Scaler Configuration */
export type Scaler = {
  /** Defaults Scaler will assign to a service. */
  service_defaults: ScalerServiceDefaults;
};

/** Core Component Configuration */
export type Core = {
  /** Configuration for Ingester */
  ingester: Ingester;

  /** Configuration for Scaler */
  scaler: Scaler;
};

/** Datastore Configuration" */
export type Datastore = {
  /** Datastore Archive feature configuration */
  archive: {
    /** Are we enabling Achiving features across indices? */
    enabled: boolean;
  };
};

/** Configuration for connecting to a retrohunt service. */
export type Retrohunt = {
  /** Is the Retrohunt functionnality enabled on the frontend */
  enabled: boolean;

  /** Number of days retrohunt jobs will remain in the system by default */
  dtl: number;

  /** Maximum number of days retrohunt jobs will remain in the system */
  max_dtl: number;
};

/** Services Configuration */
export type Services = {
  /** List of categories a service can be assigned to */
  categories: string[];

  /** Default update channel to be used for new services */
  preferred_update_channel: string;

  /** List of execution stages a service can be assigned to */
  stages: ServiceStage;
};

/** System Configuration */
export type System = {
  /** Organisation acronym used for signatures */
  organisation: string;

  /** Type of system */
  type: SystemType;

  /** Version of the system */
  version: string;
};

/** AI Configuration */
export type AI = {
  /** Is AI support enabled? */
  enabled: boolean;
};

export type AlertingMeta = {
  /** Metadata keys that are considered important */
  important: string[];

  /** Metadata keys that refer to an email's subject */
  subject: string[];

  /** Metadata keys that refer to a URL */
  url: string[];
};

/** External link that specific metadata and tags can pivot to */
export type ExternalLink = {
  /** If the classification of the item is higher than the max_classificaiton, can we let the user bypass the check and still query the external link? */
  allow_bypass: boolean;

  /** Name of the link */
  name: string;

  /** Should the replaced value be double encoded? */
  double_encode: boolean;

  /** Minimum classification the user must have to see this link */
  classification?: string;

  /** Maximum classification of data that may be handled by the link */
  max_classification?: string;

  /** Pattern that will be replaced in the URL with the metadata or tag value */
  replace_pattern: string;

  /** URL to redirect to */
  url: string;
};

/** Connection details for external systems/data sources. */
export type ExternalSource = {
  /** Name of the source. */
  name: string;

  /** Minimum classification applied to information from the source and required to know the existance of the source. */
  classification?: string;

  /** Maximum classification of data that may be handled by the source */
  max_classification?: string;

  /** URL of the upstream source's lookup service. */
  url: string;
};

/** UI Configuration */
export type UI = {
  /** AI support for the UI */
  ai: AI;

  /** Alerting metadata fields */
  alerting_meta: AlertingMeta;

  /** Allow user to tell in advance the system that a file is malicious? */
  allow_malicious_hinting: boolean;

  /** Allow user to download raw files? */
  allow_raw_downloads: boolean;

  /** Allow users to request replay on another server? */
  allow_replay: boolean;

  /** Allow file submissions via url? */
  allow_url_submissions: boolean;

  /** Allow user to download files as password protected ZIPs? */
  allow_zip_downloads: boolean;

  /** Hogwarts App data */
  apps: AppSwitcherItem[];

  /** Should API calls be audited and saved to a separate log file? */
  audit: boolean;

  /** Banner message display on the main page (format: {<language_code>: message}) */
  banner: { [language: string]: string };

  /** Banner message level */
  banner_level: BannerLevel;

  /** Which encoding will be used for downloads? */
  download_encoding: DownloadEncoding;

  /** Enforce the user's quotas? */
  enforce_quota: boolean;

  /** List of external pivot links */
  external_links: Record<ExternalLinkType, { [key: string]: ExternalLink }>;

  /** List of external sources to query */
  external_source_tags: { [tag: string]: string[] };

  /** List of external sources to query */
  external_sources: ExternalSource[];

  /** Fully qualified domain name to use for the 2-factor authentication validation */
  fqdn: string;

  /** Maximum priority for ingest API */
  ingest_max_priority: number;

  /** Turn on read only mode in the UI */
  read_only: boolean;

  /** List of RSS feeds to display on the UI */
  rss_feeds: string[];

  /** Service feed to display on the UI */
  services_feed: string;

  /** List of admins to notify when a user gets locked out */
  tos_lockout_notify: boolean;

  /** Lock out user after accepting the terms of service? */
  tos_lockout: boolean;

  /** Terms of service */
  tos?: boolean;

  /** List of services auto-selected by the UI when submitting URLs */
  url_submission_auto_service_selection: string[];
};

/** Minimum score value to get the specified verdict, otherwise the file is considered safe. */
export type Verdicts = {
  /** Minimum score for the verdict to be Informational. */
  info: number;

  /** Minimum score for the verdict to be Suspicious. */
  suspicious: number;

  /** Minimum score for the verdict to be Highly Suspicious. */
  highly_suspicious: number;

  /** Minimum score for the verdict to be Malicious. */
  malicious: number;
};

/** Options regarding all submissions, regardless of their input method */
export type TagTypes = {
  /** Attribution tags */
  attribution: string[];

  /** Behaviour tags */
  behavior: string[];

  /** IOC tags */
  ioc: string[];
};

/** Default values for parameters for submissions that may be overridden on a per submission basis */
export type Submission = {
  /** How many extracted files may be added to a submission? */
  default_max_extracted: number;

  /** How many supplementary files may be added to a submission? */
  default_max_supplementary: number;

  /** Number of days submissions will remain in the system by default */
  dtl: number;

  /** Maximum number of days submissions will remain in the system */
  max_dtl: number;

  /** Maximum files extraction depth */
  max_extraction_depth: number;

  /** Maximum size for files submitted in the system */
  max_file_size: number;

  /** Maximum length for each metadata values */
  max_metadata_length: number;

  /** List of external source to fetch file via their SHA256 hashes */
  sha256_sources: string[];

  /** Tag types that show up in the submission summary */
  tag_types: TagTypes;

  /** Minimum score value to get the specified verdict. */
  verdicts: Verdicts;
};

/** Configuration for all users */
export type User = {
  /** API_PRIV_MAP */
  api_priv_map: Record<APIPriv, ACL[]>;

  /** ACL_MAP */
  priv_role_dependencies: Record<ACL, Role[]>;

  /** the relation between types and roles */
  role_dependencies: Record<Type, Role[]>;

  /** All user roles */
  roles: Role[];

  /** All user types */
  types: Type[];
};

/** Assemblyline Deployment Configuration */
export type Configuration = {
  /** Authentication module configuration */
  auth: Auth;

  /** Datastore configuration */
  datastore: Datastore;

  /** Retrohunt configuration for the frontend and server. */
  retrohunt: Retrohunt;

  /** Options for how submissions will be processed */
  submission: Submission;

  /** System configuration */
  system: System;

  /** UI configuration parameters */
  ui: UI;

  /** User configuration */
  user: User;
};
