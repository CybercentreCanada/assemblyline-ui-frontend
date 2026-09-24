/** Submission Tree Model */
export type SubmissionTree = {
  /** Classification of the cache */
  classification: string;

  /** Expiry timestamp */
  expiry_ts: string | Date;

  /** Has this cache entry been filtered? */
  filtered: boolean;

  /** Tree of supplementary files */
  supplementary: string;

  /** File tree cache */
  tree: string;
};
