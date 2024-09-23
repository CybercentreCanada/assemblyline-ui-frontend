/** Statistics Model */
export type Statistic = {
  /** Average of all stastical hits */
  avg: number;

  /** Count of statistical hits */
  count: number;

  /** Date of first hit of statistic */
  first_hit?: string | Date;

  /** Date of last hit of statistic */
  last_hit?: string | Date;

  /** Maximum value of all stastical hits */
  max: number;

  /** Minimum value of all stastical hits */
  min: number;

  /** Sum of all stastical hits */
  sum: number;
};
