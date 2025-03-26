import type { AppUser } from 'commons/components/app/AppUserService';

export const TYPES = [
  'admin',
  'user',
  'signature_manager',
  'signature_importer',
  'viewer',
  'submitter',
  'custom'
] as const;

export const ROLES = [
  'administration',
  'alert_manage',
  'alert_view',
  'apikey_access',
  'archive_comment',
  'archive_download',
  'archive_manage',
  'archive_trigger',
  'archive_view',
  'assistant_use',
  'badlist_manage',
  'badlist_view',
  'bundle_download',
  'external_query',
  'file_detail',
  'file_download',
  'file_purge',
  'heuristic_view',
  'obo_access',
  'replay_system',
  'replay_trigger',
  'retrohunt_run',
  'retrohunt_view',
  'safelist_manage',
  'safelist_view',
  'self_manage',
  'signature_download',
  'signature_import',
  'signature_manage',
  'signature_view',
  'submission_create',
  'submission_delete',
  'submission_manage',
  'submission_view',
  'workflow_manage',
  'workflow_view'
] as const;

export const SCOPES = ['r', 'w', 'rw', 'c'] as const;
export const ACL_VALUES = ['R', 'W', 'E', 'C'] as const;
export const PRIV_VALUES = ['READ', 'WRITE', 'READ_WRITE', 'EXTENDED', 'CUSTOM'] as const;

export const ACL_TO_PRIV_MAP = {
  R: 'READ',
  W: 'WRITE',
  RW: 'READ_WRITE',
  E: 'EXTENDED',
  C: 'CUSTOM'
} as const;

export const PRIV_TO_ACL_MAP = {
  READ: ['R'],
  WRITE: ['W'],
  READ_WRITE: ['R', 'W'],
  EXTENDED: ['E'],
  CUSTOM: ['C']
} as const;

export type Type = (typeof TYPES)[number];
export type Role = (typeof ROLES)[number];
export type Scope = (typeof SCOPES)[number];
export type ACL = (typeof ACL_VALUES)[number];
export type PRIV = (typeof PRIV_VALUES)[number];

/** Model for API keys */
export type ApiKey = {
  /** Access Control List for the API key */
  acl: ACL[];

  /** BCrypt hash of the password for the apikey */
  password?: string;

  /** List of roles tied to the API key */
  roles: Role[];

  /** Name of the API key */
  key_name: string;

  /** username of API key owner */
  uname: string;

  /** Date the API key is created */
  creation_date?: string;

  /** Time the API key expires */
  expiry_ts?: string;

  /** Time  this API key was last used*/
  last_used?: string;

  /** Id of APIKey in the system */
  id?: string;
};

/** Model of Apps used of OBO (On Behalf Of) */
export type Apps = {
  /** Username allowed to impersonate the current user */
  client_id: string;

  /** DNS hostname for the server */
  netloc: string;

  /** Scope of access for the App token */
  scope: Scope;

  /** Name of the server that has access */
  server: string;

  /** List of roles tied to the App token */
  roles: Role[];
};

/** Model of User */
export type User = AppUser & {
  /** Date the user agree with terms of service */
  agrees_with_tos?: string & Date;

  /** Maximum number of API calls a user can do daily (0: No Quota) */
  api_daily_quota?: number;

  /** Maximum number of concurrent API requests */
  api_quota: number;

  /** Mapping of API keys */
  apikeys: Record<string, ApiKey>;

  /** Applications with access to the account */
  apps: Record<string, Apps>;

  /** Allowed to query on behalf of others? */
  can_impersonate: boolean;

  /** Maximum classification for the user */
  classification: string;

  /** User's LDAP DN */
  dn?: string;

  /** User's email address */
  email?: string;

  /** List of groups the user submits to */
  groups: string[];

  /** Username */
  id: string;

  /** Is the user active? */
  is_active: boolean;

  /** Full name of the user */
  name: string;

  /** Secret key to generate one time passwords */
  otp_sk?: string;

  /** BCrypt hash of the user's password */
  password: string;

  /** Maximum number of concurrent async submission (0: No Quota) */
  submission_async_quota?: number;

  /** Maximum number of submissions a user can do daily (0: No Quota) */
  submission_daily_quota?: number;

  /** Maximum number of concurrent submissions */
  submission_quota: number;

  /** Type of user */
  type: Type[];

  /** Default roles for user */
  roles: Role[];

  /** Map of security tokens */
  security_tokens: string[];

  /** Username */
  uname: string;
};

export type UserIndexed = Pick<
  User,
  'classification' | 'email' | 'groups' | 'id' | 'is_active' | 'name' | 'roles' | 'type' | 'uname'
>;
