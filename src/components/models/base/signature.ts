import { Statistic } from './statistic';

export const DEPLOYED_STATUSES = ['DEPLOYED', 'NOISY', 'DISABLED'] as const;
export const DRAFT_STATUSES = ['STAGING', 'TESTING'] as const;
export const STALE_STATUSES = ['INVALID'] as const;
export const RULE_STATUSES = [...DEPLOYED_STATUSES, ...DRAFT_STATUSES, ...STALE_STATUSES] as const;

export type DeployedStatus = (typeof DEPLOYED_STATUSES)[number];
export type DraftStatus = (typeof DRAFT_STATUSES)[number];
export type StaleStatus = (typeof STALE_STATUSES)[number];
export type RuleStatus = (typeof RULE_STATUSES)[number];

export type Signature = {
  /**  */
  classification: string;

  /**  */
  data: string;

  id: string;

  /**  */
  last_modified: string | Date;

  /**  */
  name: string;

  /**  */
  order: number;

  /**  */
  revision: string;

  /**  */
  signature_id?: string;

  /**  */
  source: string;

  /**  */
  state_change_date?: string | Date;

  /**  */
  state_change_user?: string;

  /**  */
  stats: Statistic;

  /**  */
  status: RuleStatus;

  /**  */
  type: string;
};

export type SignatureIndexed = Pick<
  Signature,
  | 'classification'
  | 'id'
  | 'last_modified'
  | 'name'
  | 'revision'
  | 'signature_id'
  | 'source'
  | 'stats'
  | 'status'
  | 'type'
>;
