import type { Results } from 'components/models/ontology/ontology';

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
export type SandboxBody = Results;

export type SandboxBodyConfig = {};

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
