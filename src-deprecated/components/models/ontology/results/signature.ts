import type { Attack } from 'components/models/base/result';
import type { ObjectID } from 'components/models/ontology/results/process';

/**
 * Possible signature types.
 */
export const SIGNATURE_TYPES = ['CAPE', 'CUCKOO'] as const;
export type SignatureType = (typeof SIGNATURE_TYPES)[number];

/**
 * Possible process actions describing relations between source and target objects.
 */
export const ATTRIBUTE_ACTIONS = [
  'clipboard_capture',
  'create_remote_thread',
  'create_stream_hash',
  'dns_query',
  'driver_loaded',
  'file_change',
  'file_creation',
  'file_delete',
  'image_loaded',
  'network_connection',
  'network_connection_linux',
  'pipe_created',
  'process_access',
  'process_creation',
  'process_creation_linux',
  'process_tampering',
  'process_terminated',
  'raw_access_thread',
  'registry_add',
  'registry_delete',
  'registry_event',
  'registry_rename',
  'registry_set',
  'sysmon_error',
  'sysmon_status',
  'wmi_event'
] as const;
export type AttributeAction = (typeof ATTRIBUTE_ACTIONS)[number];

/**
 * Fields used for generating a unique object ID hash for signature entities.
 */
export const SIGNATURE_OID_PARTS = ['name', 'type'] as const;
export type SignatureOIDPart = (typeof SIGNATURE_OID_PARTS)[number];

/**
 * Fields used for generating a tag for signature entities.
 */
export const SIGNATURE_TAG_PARTS = ['type', 'name'] as const;
export type SignatureTagPart = (typeof SIGNATURE_TAG_PARTS)[number];

/**
 * Attribute relating to the signature that was raised during the analysis of the task.
 */
export type Attribute = {
  /** Object that the rule triggered on. */
  source: ObjectID;

  /** Object targeted by source object. */
  target?: ObjectID;

  /** The relation between the source and target. */
  action?: AttributeAction;

  /** Metadata about the detection. */
  meta?: string;

  /** Event Record ID (Event Logs). */
  event_record_id?: string;

  /** Domain. */
  domain?: string;

  /** URI. */
  uri?: string;

  /** SHA256 of the file. */
  file_hash?: string;
};

/**
 * A signature that was raised during the analysis of the task.
 */
export type Signature = {
  /** The object ID of the signature object. */
  objectid: ObjectID;

  /** The name of the signature. */
  name: string;

  /** Type of signature. */
  type: SignatureType;

  /** Classification of signature. */
  classification: string;

  /** Attributes about the signature. */
  attributes?: Attribute[];

  /** A list of ATT&CK patterns and categories of the signature. */
  attacks?: Attack[];

  /** List of actors of the signature. */
  actors?: string[];

  /** List of malware families of the signature. */
  malware_families?: string[];

  /** ID of the signature. */
  signature_id?: string;
};
