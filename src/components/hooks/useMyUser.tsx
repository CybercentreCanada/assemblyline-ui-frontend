import { UserContextProps, UserProfileProps, ValidatedProp } from 'commons/components/user/UserProvider';
import { ClassificationDefinition } from 'helpers/classificationParser';
import { useState } from 'react';

type ALField = {
  name: string;
  indexed: boolean;
  stored: boolean;
  type: string;
  default: boolean;
  list: boolean;
};

type IndexDefinition = {
  [propName: string]: ALField;
};

type IndexDefinitionMap = {
  alert: IndexDefinition;
  file: IndexDefinition;
  heuristic: IndexDefinition;
  result: IndexDefinition;
  signature: IndexDefinition;
  submission: IndexDefinition;
  workflow: IndexDefinition;
};

export type ConfigurationDefinition = {
  auth: {
    allow_2fa: boolean;
    allow_apikeys: boolean;
    allow_security_tokens: boolean;
  };
  ui: {
    allow_url_submission: boolean;
    read_only: boolean;
    tos: boolean;
    tos_lockout: boolean;
    tos_lockout_notify: boolean;
  };
};

export interface CustomUser extends UserProfileProps {
  // Al specific props
  agrees_with_tos: boolean;
  c12nDef: ClassificationDefinition;
  classification: string;
  configuration: ConfigurationDefinition;
  groups: string[];
  indexes: IndexDefinitionMap;
  is_active: boolean;
  type: string[];
}

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): UserContextProps<CustomUser> {
  const [user, setState] = useState<CustomUser>(null);

  function flatten(ob) {
    const toReturn = {};

    for (const i in ob) {
      if ({}.hasOwnProperty.call(ob, i)) {
        if (typeof ob[i] == 'object') {
          const flatObject = flatten(ob[i]);
          for (const x in flatObject) {
            if ({}.hasOwnProperty.call(flatObject, x)) {
              toReturn[`${i}.${x}`] = flatObject[x];
            }
          }
        } else {
          toReturn[i] = ob[i];
        }
      }
    }
    return toReturn;
  }

  const setUser = (curUser: CustomUser) => {
    setState(curUser);
  };

  const validateProp = (propDef: ValidatedProp) => {
    const flattenedUser = flatten(user);
    return flattenedUser[propDef.prop] === propDef.value;
  };

  const validateProps = (props: ValidatedProp[]) => {
    if (props === undefined) return true;
    return props.every(validateProp);
  };

  const isReady = () => {
    if (user === null || (!user.agrees_with_tos && user.configuration.ui.tos) || !user.is_active) {
      return false;
    }

    return true;
  };

  return {
    user,
    setUser,
    isReady,
    validateProps
  };
}
