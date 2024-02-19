import { ClassificationDefinition } from 'helpers/classificationParser';
import { Configuration } from '../base/config';
import { Role, Type, User } from '../base/user';
import { UserSettings } from '../base/user_settings';

export type Field = {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: string;
  default: boolean;
  list: boolean;
};

export type IndexDefinition = { [field: string]: Field };

/** Search indexes definitions */
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

export interface CustomUser extends User {
  // Al specific props
  // agrees_with_tos: boolean;
  // classification: string;
  default_view?: string;
  dynamic_group: string | null;
  // groups: string[];
  // is_active: boolean;
  // roles: string[];
}

/**
 * User information and System Configuration
 * @summary Response of the /whoami/ route
 * @description Return the currently logged in user as well as the system configuration
 * */
export type WhoAmI = {
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
