import type { ObjectID } from 'components/models/ontology/results/process';

export const ANTIVIRUS_CATEGORIES = ['type-unsupported', 'undetected', 'failure', 'suspicious', 'malicious'] as const;

export type AntivirusCategory = (typeof ANTIVIRUS_CATEGORIES)[number];

/** Antivirus Ontology Model. */
export type Antivirus = {
  /** The object ID of the antivirus object. */
  objectid: ObjectID;

  /** Name of antivirus engine. */
  engine_name: string;

  /** Version of antivirus engine. */
  engine_version?: string;

  /** Version of definition set. */
  engine_definition_version?: string;

  /** The name of the virus. */
  virus_name?: string;

  /**
   * What category does the verdict fall under?
   *
   * - `type-unsupported`: File sent to antivirus is unsupported
   * - `undetected`: File not detected by antivirus
   * - `failure`: Antivirus failed during detection
   * - `suspicious`: Antivirus deems suspicious
   * - `malicious`: Antivirus deems malicious
   */
  category?: AntivirusCategory;
};
