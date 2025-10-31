import type { File } from 'components/models/ontology/file';
import type { ObjectID, Process } from 'components/models/ontology/results/process';

/**
 * List of supported DNS lookup types.
 * @see https://en.wikipedia.org/wiki/List_of_DNS_record_types
 */
const DNS_RECORD_TYPES = {
  A: 'Returns a 32-bit IPv4 address; maps hostnames to an IP address of the host; also used for DNSBLs and subnet masks.',
  AAAA: 'Returns a 128-bit IPv6 address; maps hostnames to an IPv6 address of the host.',
  AFSDB: 'Specifies AFS database servers for an AFS cell; used by AFS clients to locate remote cells.',
  APL: 'Lists address ranges (CIDR format) for various address families; experimental use.',
  CAA: 'Specifies which certificate authorities (CAs) are allowed to issue certificates for a domain.',
  CDNSKEY: 'Child copy of a DNSKEY record for transfer to the parent zone.',
  CDS: 'Child copy of a DS record for transfer to the parent zone.',
  CERT: 'Stores public key certificates (PKIX, SPKI, PGP, etc.).',
  CNAME: 'Alias record; maps one name to another; DNS lookup continues with the new name.',
  CSYNC: 'Defines synchronization between child and parent zones (e.g. matching NS records).',
  DHCID: 'Used with DHCP to associate a host’s DHCP identifier and FQDN.',
  DLV: 'DNSSEC Lookaside Validation record; publishes DNSSEC trust anchors outside the DNS hierarchy.',
  DNAME: 'Alias for a name and all its subnames (unlike CNAME, which only aliases one name).',
  DNSKEY: 'Public key used in DNSSEC for signing and validation.',
  DS: 'Delegation Signer record; identifies the DNSSEC signing key of a delegated zone.',
  EUI48: '48-bit IEEE MAC address (EUI-48).',
  EUI64: '64-bit IEEE MAC address (EUI-64).',
  HINFO: 'Host information; provides minimal-sized responses to ANY queries.',
  HIP: 'Host Identity Protocol; separates endpoint identity and locator roles of IP addresses.',
  HTTPS: 'HTTPS Binding record (special SVCB); provides pre-connection info for secure HTTPS setup.',
  IPSECKEY: 'Key record used with IPsec for establishing security associations.',
  KEY: 'Legacy DNSSEC key record; now used only for SIG(0) and TKEY operations.',
  KX: 'Key Exchanger record; identifies a key management agent for a domain (non-DNSSEC use).',
  LOC: 'Specifies geographical location data associated with a domain name.',
  MX: 'Mail Exchange record; lists mail servers accepting email for the domain.',
  NAPTR: 'Naming Authority Pointer; enables regex-based rewriting of domain names (for URIs, etc.).',
  NS: 'Name Server record; delegates a DNS zone to specific authoritative servers.',
  NSEC: 'DNSSEC record proving nonexistence of a name (successor to NXT record).',
  NSEC3: 'DNSSEC extension allowing proof of nonexistence without enabling zone walking.',
  NSEC3PARAM: 'Parameters for NSEC3 DNSSEC records.',
  OPENPGPKEY: 'Publishes OpenPGP public keys for email addresses via DNS.',
  PTR: 'Pointer record; maps IP addresses to canonical hostnames (reverse DNS lookups).',
  RP: 'Responsible Person record; specifies contact information for a domain.',
  RRSIG: 'DNSSEC signature for a secured record set (replaces SIG).',
  SIG: 'Legacy signature record for DNSSEC (replaced by RRSIG).',
  SMIMEA: 'Associates an S/MIME certificate with a domain name for sender authentication.',
  SOA: 'Start of Authority; defines primary NS, admin email, serial, and zone refresh timers.',
  SRV: 'Service locator; defines the host and port for specific services (replaces protocol-specific records).',
  SSHFP: 'Publishes SSH public key fingerprints for verifying host authenticity.',
  SVCB: 'Service Binding; provides connection metadata (general version of HTTPS record).',
  TA: 'DNSSEC Trust Anchor; used in DNSSEC deployments without a signed root zone.',
  TKEY: 'Transaction Key; provides keying material for TSIG authentication.',
  TLSA: 'TLSA certificate association; links TLS server certificates or keys with a domain name (for DANE).',
  TSIG: 'Transaction Signature; authenticates dynamic updates and server responses using shared keys.',
  TXT: 'Text record; holds human- or machine-readable data (SPF, DKIM, DMARC, etc.).',
  URI: 'Maps hostnames to Uniform Resource Identifiers (URIs).',
  ZONEMD: 'Zone Message Digest; provides a cryptographic hash of DNS zone data at rest.'
} as const;

export type LookupType = keyof typeof DNS_RECORD_TYPES;

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
