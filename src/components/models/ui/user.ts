import { ClassificationDefinition } from 'helpers/classificationParser';
import { Configuration } from '../base/config';
import { Role, Type } from '../base/user';
import { UserSettings } from '../base/user_settings';

export type Field = {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: string;
  default: boolean;
  list: boolean;
};

/** Search indexes definitions */
export type Indexes = {
  alert: { [field: string]: Field };
  badlist: { [field: string]: Field };
  file: { [field: string]: Field };
  heuristic: { [field: string]: Field };
  result: { [field: string]: Field };
  retrohunt: { [field: string]: Field };
  safelist: { [field: string]: Field };
  signature: { [field: string]: Field };
  submission: { [field: string]: Field };
  workflow: { [field: string]: Field };
};

/**
 * User information and System Configuration
 * @summary Response of the /whoami/ route
 * @description Return the currently logged in user as well as the system configuration
 * */
export type WhoAmI =
  | any
  | {
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
