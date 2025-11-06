import type {
  ConnectionDirection,
  ConnectionType,
  LookupType,
  RequestMethod
} from 'components/models/ontology/results/network';
import type { SignatureType } from 'components/models/ontology/results/signature';

export const BODY_FORMAT = [
  'GRAPH_DATA',
  'IMAGE',
  'JSON',
  'KEY_VALUE',
  'MEMORY_DUMP',
  'MULTI',
  'ORDERED_KEY_VALUE',
  'PROCESS_TREE',
  'SANDBOX',
  'TABLE',
  'TEXT',
  'TIMELINE',
  'URL'
] as const;

/**
 * This is a "keys-only" representation of the BODY_FORMAT StringTable in
 * assemblyline-v4-service/assemblyline_v4_service/common/result.py.
 * Any updates here need to go in that StringTable also.
 */
export type BodyFormat = (typeof BODY_FORMAT)[number];

/** Text Body */
export type TextBody = string;

/** Memory Dump Body */
export type MemDumpBody = string;

/** Graph Body */
export type GraphBody = {
  type: 'colormap' | string;
  data: {
    domain: [number, number];
    values: number[];
  };
};

/** URL Body */
export type URLBody =
  | {
      url: string;
      name: string;
    }
  | {
      url: string;
      name: string;
    }[];

/** JSON Body */
export type JSONBody = object;

/** Key Value Body  */
export type KeyValueBody = Record<string, any>;

/** Ordered Key Value Body  */
export type OrderedKeyValueBody = Record<string, any>;

/** Process Tree Body */
export type ProcessTreeBody = {
  children: ProcessTreeBody[];
  command_line: string;
  file_count: number;
  network_count: number;
  process_name: string;
  process_pid: number;
  registry_count: number;
  safelisted: boolean;
  signatures: Record<string, number | any>;
};

/** Table Body */
export type TableBody = Record<string, any>[];

/** Image Body */
export type ImageBody = {
  img: {
    sha256: string;
    name: string;
    description: string;
  };
  thumb: {
    sha256: string;
    name: string;
    description: string;
  };
}[];

export type Image = {
  name: string;
  description: string;
  img: string;
  thumb: string;
};

/** Timeline Body */
export type TimelineBody = {
  title: string;
  content?: string;
  score: number;
  icon: 'HTML' | 'EXECUTABLE' | 'TEXT' | 'ZIP' | 'CODE' | 'IMAGE' | 'DOCUMENT' | 'UNKNOWN' | 'PROTECTED' | 'NETWORK';
  signatures: string[];
  opposite_content: string | null;
};

/** Sandbox Body */
export type SandboxMachineMetadata = {
  /** The IP of the machine used for analysis. */
  ip?: string;

  /** The hypervisor of the machine used for analysis. */
  hypervisor?: string;

  /** The name of the machine used for analysis. */
  hostname?: string;

  /** The platform of the machine used for analysis. */
  platform?: string;

  /** The version of the operating system of the machine used for analysis. */
  version?: string;

  /** The architecture of the machine used for analysis. */
  architecture?: string;
};

export type SandboxAnalysisMetadata = {
  /** The ID used for identifying the analysis task. */
  task_id?: string;

  /** The start time of the analysis (ISO format). */
  start_time: string;

  /** The end time of the analysis (ISO format). */
  end_time?: string;

  /** The routing used in the sandbox setup. (e.g., Spoofed, Internet, Tor, VPN) */
  routing?: string;

  /** The resolution used for the analysis. */
  window_size?: string;
};

export type SandboxProcessItem = {
  /** The image of the process. Default: "<unknown_image>". */
  image: string;

  /** The time of creation for the process. (ISO date format) */
  start_time: string;

  /** The process ID of the parent process. */
  ppid?: number;

  /** The process ID. */
  pid?: number;

  /** The command line that the process ran. */
  command_line?: string;

  /** The time of termination for the process. (ISO date format) */
  end_time?: string;

  /** The integrity level of the process. */
  integrity_level?: string;

  /** The hash of the file run. */
  image_hash?: string;

  /** The original name of the file. */
  original_file_name?: string;

  /** Whether this process was safelisted. */
  safelisted?: boolean;

  /** Number of file events associated to the process. */
  file_count?: number;

  /** Number of registry events associated to the process. */
  registry_count?: number;
};

export type SandboxNetworkDNS = {
  /** The domain requested. */
  domain: string;

  /** The type of DNS request. */
  lookup_type: LookupType;

  /** A list of IPs that were resolved. */
  resolved_ips?: string[];

  /** A list of domains that were resolved. */
  resolved_domains?: string[];
};

export type SandboxNetworkHTTP = {
  /** The URI requested. */
  request_uri: string;

  /** Headers included in the request. */
  request_headers?: Record<string, unknown>;

  /** The method of the request. */
  request_method?: RequestMethod;

  /** Headers included in the response. */
  response_headers?: Record<string, unknown>;

  /** The body of the request. */
  request_body?: string;

  /** The status code of the response. */
  response_status_code?: number;

  /** The body of the response. */
  response_body?: string;

  /** File information of the response content. (JSON-friendly representation) */
  response_content_fileinfo?: Record<string, unknown>;

  /** MIME type returned by the server. */
  response_content_mimetype?: string;
};

export type SandboxNetworkSMTP = {
  /** Sender of the email. */
  mail_from: string;

  /** Recipients of the email. */
  mail_to: string[];

  /** File information about the attachments. */
  attachments?: Record<string, unknown>[];
};

export type SandboxNetflowItem = {
  /** The destination IP of the connection. */
  destination_ip?: string;

  /** The destination port of the connection. */
  destination_port?: number;

  /** The transport layer protocol (e.g., tcp, udp). */
  transport_layer_protocol?: 'tcp' | 'udp';

  /** The direction of the network connection. */
  direction?: ConnectionDirection;

  /** PID of the process that spawned the network connection. */
  pid?: number;

  /** The source IP of the connection. */
  source_ip?: string;

  /** The source port of the connection. */
  source_port?: number;

  /** The time at which the netflow item was observed. */
  time_observed?: string; // ISO date format

  /** HTTP-specific details of the request. Only present when relevant. */
  http_details?: SandboxNetworkHTTP;

  /** DNS-specific details of the request. Only present when relevant. */
  dns_details?: SandboxNetworkDNS;

  /** SMTP-specific details of the request. Only present when relevant. */
  smtp_details?: SandboxNetworkSMTP;

  /** Type of connection being made. */
  connection_type?: ConnectionType;
};

export type SandboxAttackItem = {
  /** ATT&CK technique id (e.g. "T1059.001"). */
  attack_id: string;

  /** Pattern Name */
  pattern: string;

  /** Categories */
  categories: string[];
};

export type SandboxSignatureItem = {
  /** The name of the signature. */
  name: string;

  /** Type of signature. One of: "CUCKOO", "YARA", "SIGMA", "SURICATA". */
  type: SignatureType;

  /** Classification of signature (e.g., "malicious", "benign"). */
  classification: string;

  /** Attributes about the signature (converted to attack objects here). */
  attacks?: SandboxAttackItem[];

  /** List of actors of the signature. */
  actors?: string[];

  /** List of malware families of the signature. */
  malware_families?: string[];

  /** ID of the signature. */
  signature_id?: string;

  /** Optional human-readable message. */
  message?: string;

  /** PIDs of the processes that generated the signature. */
  pids?: number[];

  /** Score of the heuristic this signature belongs to. */
  score?: number;
};

export type SandboxBody = {
  sandbox_name?: string;
  sandbox_version?: string;
  machine_metadata?: SandboxMachineMetadata;
  analysis_metadata?: SandboxAnalysisMetadata;
  processes: SandboxProcessItem[];
  netflows: SandboxNetflowItem[];
  signatures: SandboxSignatureItem[];
};

export type SandboxBodyConfig = null;

/** Multi Body */
export type MultiBody = (
  | ['DIVIDER', null]
  | ['GRAPH_DATA', GraphBody]
  | ['IMAGE', ImageBody]
  | ['JSON', JSONBody]
  | ['KEY_VALUE', KeyValueBody]
  | ['MEMORY_DUMP', MemDumpBody]
  | ['MULTI', MultiBody]
  | ['ORDERED_KEY_VALUE', OrderedKeyValueBody]
  | ['PROCESS_TREE', ProcessTreeBody[]]
  | ['SANDBOX', SandboxBody]
  | ['TABLE', TableBody, { column_order?: string[] }]
  | ['TABLE', TableBody]
  | ['TEXT', TextBody]
  | ['TIMELINE', TimelineBody[]]
  | ['URL', URLBody]
)[];

export type GraphItem = { body_format: 'GRAPH_DATA'; body: GraphBody };
export type ImageItem = { body_format: 'IMAGE'; body: ImageBody };
export type JSONItem = { body_format: 'JSON'; body: JSONBody };
export type KeyValueItem = { body_format: 'KEY_VALUE'; body: KeyValueBody };
export type MemDumpItem = { body_format: 'MEMORY_DUMP'; body: MemDumpBody };
export type MultiItem = { body_format: 'MULTI'; body: MultiBody };
export type OrderedKeyValueItem = { body_format: 'ORDERED_KEY_VALUE'; body: OrderedKeyValueBody };
export type ProcessTreeItem = { body_format: 'PROCESS_TREE'; body: ProcessTreeBody[] };
export type SandboxItem = { body_format: 'SANDBOX'; body: SandboxBody };
export type TableItem = { body_format: 'TABLE'; body: TableBody };
export type TextBodyItem = { body_format: 'TEXT'; body: TextBody };
export type TimelineItem = { body_format: 'TIMELINE'; body: TimelineBody[] };
export type URLItem = { body_format: 'URL'; body: URLBody };

/** Type of body in this section */
export type SectionBody =
  | GraphItem
  | ImageItem
  | JSONItem
  | KeyValueItem
  | MemDumpItem
  | MultiItem
  | OrderedKeyValueItem
  | ProcessTreeItem
  | SandboxItem
  | TableItem
  | TextBodyItem
  | TimelineItem
  | URLItem;
