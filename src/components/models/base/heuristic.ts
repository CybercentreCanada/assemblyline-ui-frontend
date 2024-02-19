import { Statistic } from './statistic';

export const HEURISTIC_LEVELS = ['malicious', 'suspicious', 'info', 'safe'] as const;

export type HeuristicLevel = (typeof HEURISTIC_LEVELS)[number];

export type Heuristic = {
  /** List of all associated ATT&CK IDs */
  attack_id: string[];

  /** Classification of the heuristic */
  classification: string;

  /** Description of the heuristic */
  description: string;

  /** What type of files does this heuristic target? */
  filetype: string;

  /** ID of the Heuristic */
  heur_id: string;

  /** ID of the Heuristic */
  id: string;

  /** Maximum score for heuristic */
  max_score?: number;

  /** Name of the heuristic */
  name: string;

  /** Default score of the heuristic */
  score: number;

  /** Score of signatures for this heuristic */
  signature_score_map: Record<string, number>;

  /** Statistics related to the Heuristic */
  stats: Statistic;
};
