/** Model of Scoring related to a File */
export type FileScore = {
  /** Parent submission ID of the associated submission */
  psid?: string;

  /** Expiry timestamp, used for garbage collection */
  expiry_ts: string | Date;

  /** Maximum score for the associated submission */
  score: number;

  /** Number of errors that occurred during the previous analysis */
  errors: number;

  /** ID of the associated submission */
  sid: string;

  /** Epoch time at which the FileScore entry was created */
  time: number;
};
