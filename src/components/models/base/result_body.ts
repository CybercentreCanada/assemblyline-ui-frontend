export const BODY_FORMAT = [
  'TEXT',
  'MEMORY_DUMP',
  'GRAPH_DATA',
  'URL',
  'JSON',
  'KEY_VALUE',
  'ORDERED_KEY_VALUE',
  'PROCESS_TREE',
  'TABLE',
  'IMAGE',
  'MULTI',
  'TIMELINE'
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
  signatures: { [signature: string]: number | any };
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

/** Multi Body */
export type MultiBody = (
  | ['TEXT', TextBody]
  | ['MEMORY_DUMP', MemDumpBody]
  | ['GRAPH_DATA', GraphBody]
  | ['URL', URLBody]
  | ['JSON', JSONBody]
  | ['KEY_VALUE', KeyValueBody]
  | ['ORDERED_KEY_VALUE', OrderedKeyValueBody]
  | ['PROCESS_TREE', ProcessTreeBody[]]
  | ['TABLE', TableBody]
  | ['TABLE', TableBody, { column_order?: string[] }]
  | ['IMAGE', ImageBody]
  | ['TIMELINE', TimelineBody[]]
  | ['MULTI', MultiBody]
  | ['DIVIDER', null]
)[];

export type TextBodyItem = { body_format: 'TEXT'; body: TextBody };
export type MemDumpItem = { body_format: 'MEMORY_DUMP'; body: MemDumpBody };
export type GraphItem = { body_format: 'GRAPH_DATA'; body: GraphBody };
export type URLItem = { body_format: 'URL'; body: URLBody };
export type JSONItem = { body_format: 'JSON'; body: JSONBody };
export type KeyValueItem = { body_format: 'KEY_VALUE'; body: KeyValueBody };
export type OrderedKeyValueItem = { body_format: 'ORDERED_KEY_VALUE'; body: OrderedKeyValueBody };
export type ProcessTreeItem = { body_format: 'PROCESS_TREE'; body: ProcessTreeBody[] };
export type TableItem = { body_format: 'TABLE'; body: TableBody };
export type ImageItem = { body_format: 'IMAGE'; body: ImageBody };
export type TimelineItem = { body_format: 'TIMELINE'; body: TimelineBody[] };
export type MultiItem = { body_format: 'MULTI'; body: MultiBody };

/** Type of body in this section */
export type SectionBody =
  | TextBodyItem
  | MemDumpItem
  | GraphItem
  | URLItem
  | JSONItem
  | KeyValueItem
  | OrderedKeyValueItem
  | ProcessTreeItem
  | TableItem
  | ImageItem
  | TimelineItem
  | MultiItem;
