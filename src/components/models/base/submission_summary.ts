/** Submission Summary Model */
export type SubmissionSummary = {
  /** ATT&CK Matrix cache */
  attack_matrix: string;

  /** Classification of the cache */
  classification: string;

  /** Expiry timestamp */
  expiry_ts: string | Date;

  /** Has this cache entry been filtered? */
  filtered: boolean;

  /** Map of heuristic names to IDs */
  heuristic_name_map: string;

  /** All sections mapping to the heuristics */
  heuristic_sections: string;

  /** Heuristics cache */
  heuristics: string;

  /** Tags cache */
  tags: string;
};
