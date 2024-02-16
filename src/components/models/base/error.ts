export const STATUSES = ['FAIL_NONRECOVERABLE', 'FAIL_RECOVERABLE'] as const;
export const ERROR_TYPES = [
  'UNKNOWN',
  'EXCEPTION',
  'MAX DEPTH REACHED',
  'MAX FILES REACHED',
  'MAX RETRY REACHED',
  'SERVICE BUSY',
  'SERVICE DOWN',
  'TASK PRE-EMPTED'
] as const;

export type Status = (typeof STATUSES)[number];
export type ErrorType = (typeof ERROR_TYPES)[number];

/** Error Response from a Service */
export type Response = {
  /** Error message */
  message: string;

  /** Information about where the service was processed */
  service_debug_info?: string;

  /** Service Name */
  service_name: string;

  /** Service Tool Version */
  service_tool_version?: string;

  /** Service Version */
  service_version: 'UNKNOWN' | '0' | string | number;

  /** Status of error produced by service */
  status: Status;
};

/** Error Model used by Error Viewer */
export type Error = {
  /** Archiving timestamp (Deprecated) */
  archive_ts?: string & Date;

  /** Error creation timestamp */
  created: string & Date;

  /** Expiry timestamp */
  expiry_ts?: string | Date;

  /** ID of the error */
  id: string;

  /** Response from the service */
  response: Response;

  /** SHA256 of file related to service error */
  sha256: string;

  /** Type of error */
  type: ErrorType;
};

export type ParsedErrors = {
  aggregated: {
    depth: string[];
    files: string[];
    retry: string[];
    down: string[];
    busy: string[];
    preempted: string[];
    exception: string[];
    unknown: string[];
  };
  listed: string[];
  services: string[];
};

export type ErrorIndexed = Pick<Error, 'created' | 'id' | 'response' | 'sha256' | 'type'>;
