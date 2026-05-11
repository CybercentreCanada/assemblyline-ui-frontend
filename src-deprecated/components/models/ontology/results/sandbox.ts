import type { ObjectID } from 'components/models/ontology/results/process';

/**
 * Fields used for generating a unique object ID hash for sandbox entities.
 */
export const SANDBOX_OID_PARTS = [
  'sandbox_name',
  'sandbox_version',
  'analysis_metadata.start_time',
  'analysis_metadata.end_time',
  'analysis_metadata.task_id'
] as const;

export type SandboxOIDPart = (typeof SANDBOX_OID_PARTS)[number];

/**
 * The metadata regarding the machine where the analysis took place.
 */
export type MachineMetadata = {
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

export type AnalysisMetadata = {
  /** The ID used for identifying the analysis task. */
  task_id?: string;

  /** The start time of the analysis (ISO format). */
  start_time: string;

  /** The end time of the analysis (ISO format). */
  end_time?: string;

  /**
   * The routing used in the sandbox setup.
   * Possible values: Spoofed, Internet, Tor, VPN.
   */
  routing?: string;

  /** The metadata of the analysis machine. */
  machine_metadata?: MachineMetadata;

  /** The resolution used for the analysis. */
  window_size?: string;
};

/**
 * Sandbox Ontology Model
 */
export type Sandbox = {
  /** The object ID of the sandbox object. */
  objectid: ObjectID;

  /** Metadata for the analysis. */
  analysis_metadata: AnalysisMetadata;

  /** The name of the sandbox. */
  sandbox_name: string;

  /** The version of the sandbox. */
  sandbox_version?: string;
};
