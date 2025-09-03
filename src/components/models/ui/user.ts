import type { AppUser } from 'commons/components/app/AppUserService';
import type { Configuration } from 'components/models/base/config';
import type { Role, Type, User } from 'components/models/base/user';
import type { UserSettings } from 'components/models/base/user_settings';
import type { RequestBuilder } from 'components/models/utils/request';
import type { ClassificationDefinition } from 'helpers/classificationParser';

/** Data Types based on the elastic definitions */
export const FIELD_TYPES = [
  'binary',
  'boolean',
  'byte',
  'date',
  'double',
  'float',
  'half_float',
  'integer',
  'ip',
  'keyword',
  'long',
  'nested',
  'null',
  'object',
  'scaled_float',
  'short',
  'text',
  'unsigned_long',
  'version'
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type Field = {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: FieldType;
  default: boolean;
  list: boolean;
  description?: string;
};

export type IndexDefinition = Record<string, Field>;

export type Indexes = {
  alert: IndexDefinition;
  badlist: IndexDefinition;
  file: IndexDefinition;
  heuristic: IndexDefinition;
  result: IndexDefinition;
  retrohunt: IndexDefinition;
  safelist: IndexDefinition;
  signature: IndexDefinition;
  submission: IndexDefinition;
  workflow: IndexDefinition;
};

export type SystemMessage = {
  user: string;
  title: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
};

export type CustomUser = AppUser &
  User & {
    default_view?: string;
    dynamic_group: string | null;
  };

/**
 * User information and System Configuration
 * @summary Response of the /whoami/ route
 * @description Return the currently logged in user as well as the system configuration
 * */
export type WhoAmIProps = {
  /** Date the user agreed with TOS */
  agrees_with_tos: string;

  /** Avatar data block */
  avatar: string;

  /** Classification definition block */
  c12nDef: ClassificationDefinition;

  /** Classification of the user */
  classification: string;

  /** Configuration block */
  configuration: Configuration;

  /** Email of the user */
  email: string;

  /** Groups the user if member of */
  groups: string[];

  /** Search indexes definitions */
  indexes: Indexes;

  /** Is the user active */
  is_active: boolean;

  /** Is the user an admin */
  is_admin: boolean;

  /** Name of the user */
  name: string;

  /** Roles the user is member of */
  roles: Role[];

  /** User Settings configuration */
  settings: UserSettings;

  /** Types the user is  */
  type: Type[];

  /** Username of the current user */
  username: string;
};

export type WhoAmI = CustomUser & {
  /** Classification definition block */
  c12nDef: ClassificationDefinition;

  /** Classificaiton Aliases block */
  classification_aliases: Record<string, { name: string; short_name: string }>;

  /** Configuration block */
  configuration: Configuration;

  /** Search indexes definitions */
  indexes: Indexes;

  /** System Message block */
  system_message: SystemMessage;

  /** User Settings configuration */
  settings: UserSettings;
};

/**
 * @name /user/whoami/
 * @description Return the currently logged in user as well as the system configuration
 * @method GET
 */
type WhoAmIGetRequest = RequestBuilder<`/api/v4/user/whoami/`, 'GET', null>;

/**
 * @name /settings/<username>/
 * @description Load the user's settings.
 * @method GET
 */
type SettingsGetRequest = RequestBuilder<`/api/v4/user/settings/${string}/`, 'GET', null>;

// prettier-ignore
export type UserRequests =
  | WhoAmIGetRequest
  | SettingsGetRequest;

// prettier-ignore
export type UserResponses<Request extends UserRequests> =
  Request extends WhoAmIGetRequest ? WhoAmI :
  Request extends SettingsGetRequest ? UserSettings :
  never;
