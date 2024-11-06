import type { AppSwitcherItem } from 'commons/components/app/AppConfigs';
import type { ServiceSpecification } from './service';
import type { ServiceSelection } from './submission';
import type { ACL, Role, Type } from './user';

export const API_PRIV = ['READ', 'READ_WRITE', 'WRITE', 'CUSTOM', 'EXTENDED'] as const;
export const AUTO_PROPERTY_TYPES = ['access', 'classification', 'type', 'role', 'remove_role', 'group'];
export const BANNER_LEVELS = ['info', 'warning', 'success', 'error'] as const;
export const DOWNLOAD_ENCODINGS = ['raw', 'cart', 'zip'] as const;
export const EXTERNAL_LINK_TYPES = ['hash', 'metadata', 'tag'] as const;
export const HASH_PATTERN_MAP = ['sha256', 'sha1', 'md5', 'tlsh', 'ssdeep', 'url'] as const;
export const KUBERNETES_LABEL_OPS = ['In', 'NotIn', 'Exists', 'DoesNotExist'] as const;
export const METADATA_FIELDTYPE_MAP = [
  'boolean',
  'date',
  'domain',
  'email',
  'enum',
  'integer',
  'ip',
  'keyword',
  'list',
  'regex',
  'text',
  'uri'
] as const;
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
export type HashPatternMap = (typeof HASH_PATTERN_MAP)[number];
export type KubernetesLabelOps = (typeof KUBERNETES_LABEL_OPS)[number];
export type MetadataFieldTypeMap = (typeof METADATA_FIELDTYPE_MAP)[number];
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

/** Malware Archive Configuration */
export type ArchiverMetadata = {
  /** Default value for the metadata */
  default?: string;

  /** Can the user provide a custom value */
  editable: boolean;

  /** List of possible values to pick from */
  values: string[];
};

/** Named Value */
export type NamedValue = {
  /** Name */
  name: string;

  /** Value */
  value: string;
};

/** Webhook Configuration */
export type Webhook = {
  /** CA cert for source */
  ca_cert?: string;

  /** Headers */
  headers: NamedValue[];

  /** HTTP method used to access webhook */
  method: string;

  /** Password used to authenticate with source */
  password?: string;

  /** Proxy server for source */
  proxy?: string;

  /** Number of retries */
  retries: number;

  /** Ignore SSL errors when reaching out to source? */
  ssl_ignore_errors: boolean;

  /** URI to source */
  uri: string;

  /** Username used to authenticate with source */
  username?: string;
};

/** Malware Archive Configuration */
export type Archiver = {
  /** Alternate number of days to keep the data in the malware archive. (0: Disabled, will keep data forever)*/
  alternate_dtl: number;

  /** Proxy configuration that is passed to Python Requests */
  metadata: Record<string, ArchiverMetadata>;

  /** List of minimum required service before archiving takes place */
  minimum_required_services: string[];

  /** Should the UI ask form metadata to be filed out when archiving */
  use_metadata: boolean;

  /** Should the archiving go through the webhook prior to actually trigger the archiving function */
  use_webhook?: boolean;

  /** Webhook to call before triggering the archiving process */
  webhook?: unknown;
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
  /** Configuration for the permanent submission archive */
  archiver: Archiver;

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

  /** Proxy requests to the configured API target and add headers */
  api_proxies: string[];

  /** Hogwarts App data */
  apps: AppSwitcherItem[];

  /** Should API calls be audited and saved to a separate log file? */
  audit: boolean;

  /** Banner message display on the main page (format: {<language_code>: message}) */
  banner: { [language: string]: string };

  /** Banner message level */
  banner_level: BannerLevel;

  /** Feed of all the services built by the Assemblyline community. */
  community_feed: string;

  /** Default user-defined password for creating password protected ZIPs when downloading files */
  default_zip_password: string;

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

/** A file source entry for remote fetching via string */
export type FileSource = {
  /** Should we force the source to be auto-selected for the user ? */
  auto_selected: string[];

  /** Custom types to regex pattern definition for input detection/validation */
  pattern: string;

  /** File Source */
  sources: string[];
};

/** Metadata configuration */
export type Metadata = {
  /** Field name aliases that map over to the field. */
  aliases: string[];

  /** Default value for the field */
  default?: any;

  /** Is this field required? */
  required: boolean;

  /** Key in redis where to get the suggestions from */
  suggestion_key?: string;

  /** List of suggestions for this field */
  suggestions: string[];

  /** Configuration parameters to apply to validator */
  validator_params: Record<string, any>;

  /** Type of validation to apply to metadata value */
  validator_type: MetadataFieldTypeMap;
};

/** Configuration for metadata compliance with APIs */
export type MetadataConfig = {
  /** Metadata specification for archiving */
  archive: Record<string, Metadata>;

  /** Metadata specification for certain ingestion based on ingest_type */
  ingest: Record<string, Metadata>;

  /** A list of metadata schemes with strict rules (ie. no extra/unknown metadata). ""Values can be: `archive`, `submit`, or one of the schemes under `ingest`. */
  strict_schemes: string[];

  /** Metadata specification for submission */
  submit: Record<string, Metadata>;
};

/** Submission Parameters for profile */
export type SubmissionProfileParams = {
  /** Does the submission automatically goes into the archive when completed? */
  auto_archive: boolean;

  /** Should a deep scan be performed? */
  deep_scan?: boolean;

  /** When the submission is archived, should we delete it from hot storage right away? */
  delete_after_archive?: boolean;

  /** A list of service-specific parameters that can be configured */
  editable_params: { [service: string]: string[] };

  /** Should this submission generate an alert? */
  generate_alert?: boolean;

  /** Ignore the cached service results? */
  ignore_cache?: boolean;

  /** Should we ignore dynamic recursion prevention? */
  ignore_dynamic_recursion_prevention?: boolean;

  /** Should we ignore filtering services? */
  ignore_filtering?: boolean;

  /** Ignore the file size limits? */
  ignore_size?: boolean;

  /** Max number of extracted files */
  max_extracted?: number;

  /** Max number of supplementary files */
  max_supplementary?: number;

  /** Priority of the scan */
  priority?: number;

  /** Service-specific parameters */
  service_spec?: ServiceSpecification[];

  /** Service selection */
  services?: ServiceSelection;

  /** Time, in days, to live for this submission */
  ttl?: number;

  /** Should we use the alternate dtl while archiving? */
  use_archive_alternate_dtl?: boolean;
};

/** Configuration for defining submission profiles for basic users */
export type SubmissionProfile = {
  /** Submission profile classification */
  classification: string;

  /** A list of service-specific parameters that can be configured */
  editable_params: { [service: string]: string[] };

  /** Submission profile name */
  name: string;

  /** Default submission parameters for profile */
  params: SubmissionProfileParams;
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

/** Default values for parameters for submissions that may be overridden on a per submission basis */
export type Submission = {
  /** How many extracted files may be added to a submission? */
  default_max_extracted: number;

  /** How many supplementary files may be added to a submission? */
  default_max_supplementary: number;

  /** Number of days submissions will remain in the system by default */
  dtl: number;

  /** List of external source to fetch file */
  file_sources: Record<HashPatternMap, FileSource>;

  /** Maximum number of days submissions will remain in the system */
  max_dtl: number;

  /** Maximum files extraction depth */
  max_extraction_depth: number;

  /** Maximum size for files submitted in the system */
  max_file_size: number;

  /** Maximum length for each metadata values */
  max_metadata_length: number;

  /** Metadata compliance rules */
  metadata: MetadataConfig;

  /** Submission profiles with preset submission parameters */
  profiles: { [profile_name: string]: SubmissionProfileParams };

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
  api_priv_map: Record<APIPriv, ACL[]> | Record<string, never>;

  /** ACL_MAP */
  priv_role_dependencies: Record<ACL, Role[]> | Record<string, never>;

  /** the relation between types and roles */
  role_dependencies: Record<Type, Role[]> | Record<string, never>;

  /** All user roles */
  roles: Role[];

  /** All user types */
  types: Type[];
};

/** Assemblyline Deployment Configuration */
export type Configuration = {
  /** Authentication module configuration */
  auth: Auth;

  /** Core component configuration */
  core: Core;

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

export const CONFIGURATION: Configuration = {
  auth: {
    allow_2fa: false,
    allow_apikeys: false,
    allow_extended_apikeys: false,
    allow_security_tokens: false
  },
  core: {
    archiver: {
      alternate_dtl: 0,
      metadata: undefined,
      minimum_required_services: [],
      use_metadata: false,
      use_webhook: false,
      webhook: undefined
    },
    ingester: {
      default_max_extracted: 0,
      default_max_supplementary: 0
    },
    scaler: {
      service_defaults: {
        min_instances: 0
      }
    }
  },
  datastore: {
    archive: {
      enabled: false
    }
  },
  retrohunt: {
    enabled: false,
    dtl: 0,
    max_dtl: 0
  },
  submission: {
    default_max_extracted: 0,
    default_max_supplementary: 0,
    dtl: 0,
    file_sources: {
      md5: { pattern: '^[a-f0-9]{32}$', sources: [], auto_selected: [] },
      sha1: { pattern: '^[a-f0-9]{40}$', sources: [], auto_selected: [] },
      sha256: { pattern: '^[a-f0-9]{64}$', sources: [], auto_selected: [] },
      tlsh: { pattern: '^((?:T1)?[0-9a-fA-F]{70})$', sources: [], auto_selected: [] },
      ssdeep: { pattern: '^[0-9]{1,18}:[a-zA-Z0-9/+]{0,64}:[a-zA-Z0-9/+]{0,64}$', sources: [], auto_selected: [] },
      url: { pattern: '([/?#]S*)', sources: [], auto_selected: [] }
    },
    max_dtl: 0,
    max_extraction_depth: 0,
    max_file_size: 0,
    max_metadata_length: 0,
    metadata: {
      archive: {},
      ingest: {},
      strict_schemes: [],
      submit: {}
    },
    profiles: {
      'Dynamic Analysis': {
        auto_archive: false,
        editable_params: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: []
        }
      },
      'Static Analysis': {
        auto_archive: false,
        editable_params: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: []
        }
      },
      'Static Analysis with Internet': {
        auto_archive: false,
        editable_params: {},
        services: {
          excluded: [],
          rescan: [],
          resubmit: [],
          selected: []
        }
      }
    },
    sha256_sources: [],
    tag_types: {
      attribution: [],
      behavior: [],
      ioc: []
    },
    verdicts: {
      info: 0,
      suspicious: 0,
      highly_suspicious: 0,
      malicious: 0
    }
  },
  system: {
    organisation: '',
    type: 'development',
    version: ''
  },
  ui: {
    ai: {
      enabled: false
    },
    alerting_meta: {
      important: [],
      subject: [],
      url: []
    },
    allow_malicious_hinting: false,
    allow_raw_downloads: false,
    allow_replay: false,
    allow_url_submissions: false,
    allow_zip_downloads: false,
    api_proxies: [],
    apps: [],
    audit: false,
    banner: {},
    banner_level: 'info',
    community_feed: '',
    download_encoding: 'raw',
    default_zip_password: 'infected',
    enforce_quota: false,
    external_links: {
      hash: {},
      metadata: {},
      tag: {}
    },
    external_source_tags: {},
    external_sources: [],
    fqdn: '',
    ingest_max_priority: 0,
    read_only: false,
    rss_feeds: [],
    services_feed: '',
    tos_lockout_notify: false,
    tos_lockout: false,
    tos: false,
    url_submission_auto_service_selection: []
  },
  user: {
    api_priv_map: {},
    priv_role_dependencies: {},
    role_dependencies: {},
    roles: [],
    types: []
  }
} as const;
