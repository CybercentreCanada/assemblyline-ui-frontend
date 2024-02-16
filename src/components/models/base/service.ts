export const ACCESS_MODES = ['ReadWriteOnce', 'ReadWriteMany'] as const;
export const DEFAULT_SERVICE_SELECTED = [
  'Filtering',
  'Antivirus',
  'Static Analysis',
  'Extraction',
  'Networking'
] as const;
export const OPERATING_SYSTEMS = ['windows', 'linux'] as const;
export const REGISTRY_TYPES = ['docker', 'harbor'] as const;
export const SUBMISSION_PARAM_TYPES = ['str', 'int', 'list', 'bool'] as const;
export const UPDATE_CHANNELS = ['stable', 'rc', 'beta', 'dev'] as const;
export const SIGNATURE_DELIMITERS = {
  new_line: '\n',
  double_new_line: '\n\n',
  pipe: '|',
  comma: ',',
  space: ' ',
  none: '',
  file: '',
  custom: ''
} as const;

export type AccessMode = (typeof ACCESS_MODES)[number];
export type DefaultServiceSelected = (typeof DEFAULT_SERVICE_SELECTED)[number];
export type OperatingSystem = (typeof OPERATING_SYSTEMS)[number];
export type RegistryType = (typeof REGISTRY_TYPES)[number];
export type SubmissionParamType = (typeof SUBMISSION_PARAM_TYPES)[number];
export type UpdateChannel = (typeof UPDATE_CHANNELS)[number];
export type SignatureDelimiter = keyof typeof SIGNATURE_DELIMITERS;

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

/** Default service specific settings */
export type ServiceSpecification = {
  /** Service name */
  name: string;

  /** Service parameters */
  params: ServiceParameter[];
};

/** Selected services */
export type SelectedService = {
  /** Which category does this service belong to? */
  category?: DefaultServiceSelected;

  /** Does this service perform analysis outside of Assemblyline? */
  is_external?: boolean;

  /** Name of the service category */
  name?: DefaultServiceSelected;

  /** Is the category selected */
  selected?: boolean;

  /** List of services */
  services?: SelectedService[];
};

/** Environment Variable Model */
export type EnvironmentVariable = {
  /** Name of Environment Variable */
  name: string;

  /** Value of Environment Variable */
  value: string;
};

export const DEFAULT_ENVIRONMENT_VARIABLE: EnvironmentVariable = { name: '', value: '' };

/** Docker Container Configuration */
export type DockerConfig = {
  /** Does the container have internet-access? */
  allow_internet_access: boolean;

  /** Command to run when container starts up. */
  command?: string[];

  /** CPU allocation */
  cpu_cores: number;

  /** Additional environemnt variables for the container */
  environment: EnvironmentVariable[];

  /** Complete name of the Docker image with tag, may include registry */
  image: string;

  /** What operating system does this container run under? */
  operating_system?: OperatingSystem;

  /** What ports of container to expose? */
  ports: string[];

  /** Container RAM request */
  ram_mb_min: number;

  /** Container RAM limit */
  ram_mb: number;

  /** The password or token to use when pulling the image */
  registry_password?: string | string[];

  /** The type of container registry */
  registry_type: RegistryType;

  /** The username to use when pulling the image */
  registry_username?: string;

  /** Service account to use for pods in kubernetes */
  service_account: string;
};

export const DEFAULT_DOCKER_CONFIG: DockerConfig = {
  allow_internet_access: false,
  command: null,
  cpu_cores: 1,
  environment: [],
  image: '',
  ports: [],
  ram_mb_min: 128,
  ram_mb: 512,
  registry_password: '',
  registry_type: 'docker',
  registry_username: '',
  service_account: ''
};

/** Container's Persistent Volume Configuration */
export type PersistentVolume = {
  /** Access mode for volume */
  access_mode: AccessMode;

  /** The amount of storage allocated for volume */
  capacity: string;

  /** Path into the container to mount volume */
  mount_path: string;

  /** Storage class used to create volume */
  storage_class: string;
};

export const DEFAULT_PERSISTENT_VOLUME: PersistentVolume = {
  capacity: '',
  mount_path: '',
  storage_class: '',
  access_mode: 'ReadWriteOnce'
};

/** Container's Dependency Configuration */
export type DependencyConfig = {
  /** Docker container configuration for dependency */
  container: DockerConfig;

  /** Should this dependency run as other core components? */
  run_as_core?: boolean;

  /** Volume configuration for dependency */
  volumes: Record<string, PersistentVolume>;
};

export type SourceStatus = {
  last_successful_update: string;
  state: string;
  message: string;
  ts: string;
};

/** Update Source Configuration */
export type UpdateSource = {
  /** CA cert for source */
  ca_cert?: string;

  /** Default classification used in absence of one defined in files from source */
  default_classification: string;

  /** Branch to checkout from Git repository. */
  git_branch?: string;

  /** Headers */
  headers: EnvironmentVariable[];

  /** Name of source */
  name: string;

  /** Password used to authenticate with source */
  password?: string;

  /** Pattern used to find files of interest from source */
  pattern?: string;

  /** Private key used to authenticate with source */
  private_key?: string;

  /** Proxy server for source */
  proxy?: string;

  /** Ignore SSL errors when reaching out to source? */
  ssl_ignore_errors: boolean;

  /**  */
  status: SourceStatus;

  /** Synchronize signatures with remote source. Allows system to auto-disable signatures no longer found in source. */
  sync: boolean;

  /** URI to source */
  uri: string;

  /** Username used to authenticate with source */
  username?: string;
};

/** Update Configuration for Signatures */
export type UpdateConfig = {
  /** Custom delimiter definition */
  custom_delimiter?: string;

  /** Does the updater produce signatures? */
  generates_signatures: boolean;

  /** Delimiter used when given a list of signatures */
  signature_delimiter: SignatureDelimiter;

  /** List of external sources */
  sources: UpdateSource[];

  /** Update check interval, in seconds */
  update_interval_seconds: number;

  /** Should the service wait for updates first? */
  wait_for_update: boolean;
};

/** Submission Parameters for Service */
export type SubmissionParams = {
  /** Default value (must match value in `value` field) */
  default: any;

  /** Should this parameter be hidden? */
  hide: boolean | 'true' | 'false';

  /** List of values if `type: list` */
  list?: any;

  /** Name of parameter */
  name: string;

  /** Type of parameter */
  type: SubmissionParamType;

  /** Default value (must match value in `default` field) */
  value: any;
};

export const DEFAULT_SUBMISSION_PARAMS: SubmissionParams = {
  name: '',
  type: 'bool',
  default: 'false',
  value: 'false',
  list: [],
  hide: 'false'
};

/** Service Configuration */
export type Service = {
  /** Regex to accept files as identified by Assemblyline */
  accepts: string;

  /** Which category does this service belong to? */
  category: string;

  /** Classification of the service */
  classification: string;

  /** Service Configuration */
  config: Record<string, any>;

  /** Default classification assigned to service results */
  default_result_classification: string;

  /** Dependency configuration for service */
  dependencies: Record<string, DependencyConfig>;

  /** Description of service */
  description: string;

  /** Should the result cache be disabled for this service? */
  disable_cache: boolean;

  /** Docker configuration for service */
  docker_config: DockerConfig;

  /** Is the service enabled (by default)? */
  enabled: boolean;

  /** Service ID */
  id: string;

  /** Does this service perform analysis outside of Assemblyline? */
  is_external: boolean;

  /** How many licences is the service allowed to use? */
  licence_count: number;

  /** If more than this many jobs are queued for this service drop those over this limit. 0 is unlimited. */
  max_queue_length: number;

  /** The minimum number of service instances. Overrides Scaler's min_instances configuration. */
  min_instances?: number;

  /** This service watches these temporary keys for changes when partial results are produced. */
  monitored_keys: string[];

  /** Name of service */
  name: string;

  /** Should the service be able to talk to core infrastructure or just service-server for tasking? */
  privileged: boolean;

  /** Regex to reject files as identified by Assemblyline */
  rejects?: string;

  /** Which execution stage does this service run in? */
  stage: string;

  /** Submission parameters of service */
  submission_params: SubmissionParams[];

  /** Service task timeout, in seconds */
  timeout: number;

  /** What channel to watch for service updates? */
  update_channel: UpdateChannel;

  /** Update configuration for fetching external resources */
  update_config?: UpdateConfig;

  /** Does this service use submission metadata for analysis? */
  uses_metadata: boolean;

  /** Does this service use scores of tags from other services for analysis? */
  uses_tag_scores: boolean;

  /** Does this service use tags from other services for analysis? */
  uses_tags: boolean;

  /** Does this service use temp data from other services for analysis? */
  uses_temp_submission_data: boolean;

  /** Version of service */
  version: string;
};

export type ServiceUpdateData = {
  auth: string;
  image: string;
  latest_tag: string;
  update_available: boolean;
  updating: boolean;
};

export type ServiceConstants = {
  categories: string[];
  stages: string[];
};

export type ServiceUpdates = { [service_name: string]: ServiceUpdateData };

export type ServiceIndexed = Pick<
  Service,
  | 'accepts'
  | 'category'
  | 'classification'
  | 'description'
  | 'enabled'
  | 'is_external'
  | 'name'
  | 'privileged'
  | 'rejects'
  | 'stage'
  | 'version'
>;

export const DEFAULT_SOURCE: UpdateSource = {
  ca_cert: '',
  default_classification: '',
  headers: [],
  name: '',
  password: '',
  pattern: '',
  private_key: '',
  proxy: '',
  ssl_ignore_errors: false,
  uri: '',
  username: '',
  git_branch: '',
  status: {
    last_successful_update: '',
    message: '',
    state: '',
    ts: ''
  },
  sync: false
};
