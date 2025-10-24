import type { File } from 'components/models/ontology/file';
import type { ObjectID, Process } from 'components/models/ontology/results/process';

/**
 * List of supported DNS lookup types.
 * @see https://en.wikipedia.org/wiki/List_of_DNS_record_types
 */
export const LOOKUP_TYPES = [
  'A',
  'AAAA',
  'AFSDB',
  'APL',
  'CAA',
  'CDNSKEY',
  'CDS',
  'CERT',
  'CNAME',
  'CSYNC',
  'DHCID',
  'DLV',
  'DNAME',
  'DNSKEY',
  'DS',
  'EUI48',
  'EUI64',
  'HINFO',
  'HIP',
  'HTTPS',
  'IPSECKEY',
  'KEY',
  'KX',
  'LOC',
  'MX',
  'NAPTR',
  'NS',
  'NSEC',
  'NSEC3',
  'NSEC3PARAM',
  'OPENPGPKEY',
  'PTR',
  'RRSIG',
  'RP',
  'SIG',
  'SMIMEA',
  'SOA',
  'SRV',
  'SSHFP',
  'SVCB',
  'TA',
  'TKEY',
  'TLSA',
  'TSIG',
  'TXT',
  'URI',
  'ZONEMD'
] as const;

export type LookupType = (typeof LOOKUP_TYPES)[number];

/**
 * Supported HTTP request methods.
 * Includes both standard and WebDAV methods.
 */
export const REQUEST_METHODS = [
  // Standard HTTP methods
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'HEAD',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
  // WebDAV HTTP methods
  'BCOPY',
  'BDELETE',
  'BMOVE',
  'BPROPFIND',
  'BPROPPATCH',
  'COPY',
  'LOCK',
  'MKCOL',
  'MOVE',
  'NOTIFY',
  'POLL',
  'PROPFIND',
  'PROPPATCH',
  'SEARCH',
  'SUBSCRIBE',
  'UNLOCK',
  'UNSUBSCRIBE',
  'X-MS-ENUMATTS'
] as const;

export type RequestMethod = (typeof REQUEST_METHODS)[number];

/**
 * Possible types of network connections.
 */
export const CONNECTION_TYPES = ['http', 'dns', 'tls', 'smtp'] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

/**
 * Possible directions of a network connection.
 */
export const CONNECTION_DIRECTIONS = ['outbound', 'inbound', 'unknown'] as const;
export type ConnectionDirection = (typeof CONNECTION_DIRECTIONS)[number];

/**
 * Details for a DNS request.
 */
export type NetworkDNS = {
  /** The domain requested. */
  domain: string;

  /** A list of IPs that were resolved. */
  resolved_ips?: string[];

  /** A list of domains that were resolved. */
  resolved_domains?: string[];

  /** The type of DNS request. */
  lookup_type: LookupType;
};

/**
 * Details for an HTTP request.
 */
export type NetworkHTTP = {
  /** The URI requested. */
  request_uri: string;

  /** Headers included in the request. */
  request_headers: Record<string, unknown>;

  /** The method of the request. */
  request_method: RequestMethod;

  /** Headers included in the response. */
  response_headers: Record<string, unknown>;

  /** The body of the request. */
  request_body?: string;

  /** The status code of the response. */
  response_status_code?: number;

  /** The body of the response. */
  response_body?: string;

  /** File information of the response content. */
  response_content_fileinfo?: File;

  /** MIME type returned by the server. */
  response_content_mimetype?: string;
};

/**
 * Details for an SMTP request.
 */
export type NetworkSMTP = {
  /** Sender of the email. */
  mail_from: string;

  /** Recipients of the email. */
  mail_to: string[];

  /** File information about the attachments. */
  attachments?: File[];
};

/**
 * Details for a low-level network connection by IP.
 */
export type NetworkConnection = {
  /** The object ID of the network object. */
  objectid: ObjectID;

  /** The destination IP of the connection. */
  destination_ip?: string;

  /** The destination port of the connection. */
  destination_port?: number;

  /** The transport layer protocol (e.g., tcp, udp). */
  transport_layer_protocol?: 'tcp' | 'udp';

  /** The direction of the network connection. */
  direction?: ConnectionDirection;

  /** The process that spawned the network connection. */
  process?: Process;

  /** The source IP of the connection. */
  source_ip?: string;

  /** The source port of the connection. */
  source_port?: number;

  /** HTTP-specific details of the request. */
  http_details?: NetworkHTTP;

  /** DNS-specific details of the request. */
  dns_details?: NetworkDNS;

  /** SMTP-specific details of the request. */
  smtp_details?: NetworkSMTP;

  /** Type of connection being made. */
  connection_type?: ConnectionType;
};
