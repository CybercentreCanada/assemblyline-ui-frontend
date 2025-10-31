import type { Antivirus } from 'components/models/ontology/results/antivirus';
import type { HTTP } from 'components/models/ontology/results/http';
import type { MalwareConfig } from 'components/models/ontology/results/malware_config';
import type { NetworkConnection } from 'components/models/ontology/results/network';
import type { Process } from 'components/models/ontology/results/process';
import type { Sandbox } from 'components/models/ontology/results/sandbox';
import type { Signature } from 'components/models/ontology/results/signature';

/**
 * Heuristics raised
 */
export type Heuristics = {
  /** Heuristic ID */
  heur_id: string;

  /** Score associated to heuristic */
  score: number;

  /** The number of times the heuristic was raised */
  times_raised: number;

  /** Name of the heuristic raised */
  name: string;

  /** Tags associated to heuristic. Refer to Tagging documentation */
  tags: Record<string, unknown[]>;
};

/**
 * Ontological Results
 */
export type Results = {
  /** List of Antivirus Ontologies */
  antivirus?: Antivirus[];

  /** List of HTTP Ontologies */
  http?: HTTP[];

  /** List of MalwareConfig Ontologies */
  malwareconfig?: MalwareConfig[];

  /** List of Network Ontologies */
  netflow?: NetworkConnection[];

  /** List of Process Ontologies */
  process?: Process[];

  /** List of Sandbox Ontologies */
  sandbox?: Sandbox[];

  /** List of Signature Ontologies */
  signature?: Signature[];

  /** Tags raised during analysis */
  tags?: Record<string, unknown[]>;

  /** Heuristics raised during analysis */
  heuristics?: Heuristics[];

  /** The score assigned to the file */
  score?: number;

  /** Miscellaneous unstructured data recorded during analysis */
  other?: Record<string, string>;
};

/**
 * Service Details
 */
export type Service = {
  /** Service Name */
  name: string;

  /** Service Version */
  version: string;

  /** Service Tool Version */
  tool_version?: string;
};

/**
 * Submission Details
 */
export type Submission = {
  /** Date of analysis (ISO8601 format) */
  date?: string;

  /** Metadata associated to submission */
  metadata: Record<string, string>;

  /** Submission ID associated to file */
  sid?: string;

  /** Which Assemblyline instance does the result originate from? */
  source_system?: string;

  /** Source as specified by submitter (from metadata) */
  original_source?: string;

  /** Submitted classification */
  classification: string;

  /** Submitter */
  submitter?: string;

  /** Reference to knowledge base for long-term data retention */
  retention_id?: string;

  /** The highest file score of the submission */
  max_score?: number;
};

/**
 * Assemblyline Result Ontology
 */
export type ResultOntology = {
  /** Type of ODM Model (default: "Assemblyline Result Ontology") */
  odm_type: string;

  /** Version of ODM Model (default: "1.10") */
  odm_version: string;

  /** Classification of Ontological Record */
  classification: string;

  /** Descriptors about file being analyzed */
  file: File;

  /** Information about Service */
  service: Service;

  /** Information about Submission */
  submission?: Submission;

  /** Ontological Results */
  results?: Results;
};
