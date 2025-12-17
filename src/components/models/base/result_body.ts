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

/** Information about the sandbox machine used during analysis. */
export type SandboxMachineMetadata = {
  /** The IP address of the machine used for analysis. */
  ip?: string;

  /** The hypervisor type of the machine used for analysis. */
  hypervisor?: string;

  /** The hostname of the machine used for analysis. */
  hostname?: string;

  /** The operating system platform of the machine (e.g., "Windows", "Linux"). */
  platform?: string;

  /** The version of the operating system. */
  version?: string;

  /** The system architecture of the machine (e.g., "x64", "arm64"). */
  architecture?: string;
};

/** Metadata describing the context and configuration of a sandbox analysis. */
export type SandboxAnalysisMetadata = {
  /** The unique identifier of the analysis task. */
  task_id?: number;

  /** The timestamp when the analysis started (ISO 8601 format). */
  start_time: string;

  /** The timestamp when the analysis ended (ISO 8601 format). */
  end_time?: string;

  /** The network routing used during analysis (e.g., "Spoofed", "Internet", "Tor", "VPN"). */
  routing?: string;

  /** The screen resolution or window size used for the sandbox environment. */
  window_size?: string;

  /** Metadata describing the machine on which the analysis ran. */
  machine_metadata?: SandboxMachineMetadata;
};

/** Information about a process observed during sandbox execution. */
export type SandboxProcessItem = {
  /** The executable image name of the process. Default: "<unknown_image>". */
  image: string;

  /** The timestamp when the process started (ISO 8601 format). */
  start_time: string;

  /** The parent process ID (PPID). */
  ppid?: number;

  /** The process ID (PID). */
  pid?: number;

  /** The full command line used to start the process. */
  command_line?: string;

  /** The timestamp when the process terminated (ISO 8601 format). */
  end_time?: string;

  /** The integrity level of the process (e.g., "High", "Medium", "Low"). */
  integrity_level?: string;

  /** The hash of the executable file for the process (e.g., SHA256). */
  image_hash?: string;

  /** The original file name as embedded in the binary metadata. */
  original_file_name?: string;

  /** Indicates whether this process was safelisted (whitelisted). */
  safelisted?: boolean;

  /** The number of file I/O events associated with this process. */
  file_count?: number;

  /** The number of registry modification events associated with this process. */
  registry_count?: number;
};

/** Details of a DNS query observed during sandbox execution. */
export type SandboxNetworkDNS = {
  /** The domain name requested (queried). */
  domain: string;

  /** The DNS lookup type (e.g., "A", "AAAA", "MX"). */
  lookup_type: LookupType;

  /** A list of IP addresses returned in the DNS response. */
  resolved_ips?: string[];

  /** A list of domain names returned in the DNS response (for CNAMEs, etc.). */
  resolved_domains?: string[];
};

/** Details of an HTTP request/response observed during sandbox execution. */
export type SandboxNetworkHTTP = {
  /** The URI requested by the process. */
  request_uri: string;

  /** Headers included in the HTTP request. */
  request_headers?: Record<string, unknown>;

  /** The HTTP request method (e.g., "GET", "POST"). */
  request_method?: RequestMethod;

  /** Headers included in the HTTP response. */
  response_headers?: Record<string, unknown>;

  /** The raw body content of the HTTP request. */
  request_body?: string;

  /** The HTTP status code of the response (e.g., 200, 404). */
  response_status_code?: number;

  /** The raw body content of the HTTP response. */
  response_body?: string;

  /** Metadata about any file contained in the HTTP response body. */
  response_content_fileinfo?: Record<string, unknown>;

  /** The MIME type of the HTTP response content. */
  response_content_mimetype?: string;
};

/** Details of an SMTP email transaction observed during sandbox execution. */
export type SandboxNetworkSMTP = {
  /** The sender email address in the SMTP transaction. */
  mail_from: string;

  /** A list of recipient email addresses in the SMTP transaction. */
  mail_to: string[];

  /** Information about any attachments transmitted via SMTP. */
  attachments?: Record<string, unknown>[];
};

/** Details of a network flow (connection) observed during sandbox execution. */
export type SandboxNetflowItem = {
  /** The destination IP address of the network connection. */
  destination_ip?: string;

  /** The destination port number of the connection. */
  destination_port?: number;

  /** The transport layer protocol used (e.g., "tcp", "udp"). */
  transport_layer_protocol?: 'tcp' | 'udp';

  /** The direction of the network connection (e.g., "inbound", "outbound"). */
  direction?: ConnectionDirection;

  /** The process ID that initiated or owned the network connection. */
  process?: number;

  /** The source IP address of the connection. */
  source_ip?: string;

  /** The source port number of the connection. */
  source_port?: number;

  /** The timestamp when the network event was observed (ISO 8601 format). */
  time_observed?: string;

  /** Detailed HTTP request/response data, if the flow is HTTP-related. */
  http_details?: SandboxNetworkHTTP;

  /** Detailed DNS query/response data, if the flow is DNS-related. */
  dns_details?: SandboxNetworkDNS;

  /** Detailed SMTP email data, if the flow is SMTP-related. */
  smtp_details?: SandboxNetworkSMTP;

  /** The type or category of the connection (e.g., "download", "upload"). */
  connection_type?: ConnectionType;
};

/** Describes an ATT&CK technique or tactic detected during sandbox execution. */
export type SandboxAttackItem = {
  /** The MITRE ATT&CK technique ID (e.g., "T1059.001"). */
  attack_id: string;

  /** The name or pattern describing the attack behavior. */
  pattern: string;

  /** The list of categories or tactics associated with this attack. */
  categories: string[];
};

/** Represents a detection signature triggered during analysis. */
export type SandboxSignatureItem = {
  /** The name of the detection signature. */
  name: string;

  /** The source type of the signature (e.g., "CUCKOO", "YARA", "SIGMA", "SURICATA"). */
  type: SignatureType;

  /** The classification of the signature (e.g., "malicious", "benign"). */
  classification: string;

  /** The list of ATT&CK patterns or related attack metadata linked to this signature. */
  attacks?: SandboxAttackItem[];

  /** The list of threat actors associated with this signature. */
  actors?: string[];

  /** The list of malware families linked to this signature. */
  malware_families?: string[];

  /** A human-readable description of what the signature represents. */
  description?: string;

  /** The list of process IDs (PIDs) that triggered the signature. */
  pid?: number[];

  /** The score or weight associated with the heuristic signature. */
  score?: number;
};

/** The main sandbox analysis body containing all observed data and metadata. */
export type SandboxBody = {
  /** General information about the sandbox and analysis environment. */
  analysis_information: {
    /** The name of the sandbox used to perform the analysis. */
    sandbox_name: string;

    /** The version of the sandbox software. */
    sandbox_version: string;

    /** Metadata about when and how the analysis was executed. */
    analysis_metadata: SandboxAnalysisMetadata;
  };

  /** The list of processes observed during the sandbox execution. */
  processes: SandboxProcessItem[];

  /** The list of network connections observed during the sandbox execution. */
  network_connections: SandboxNetflowItem[];

  /** The list of detection signatures triggered during the sandbox execution. */
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
