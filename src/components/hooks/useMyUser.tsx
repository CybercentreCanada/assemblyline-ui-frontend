import { UserContextProps, UserProfileProps, ValidatedProp } from 'commons/components/user/UserProvider';
import { ClassificationDefinition } from 'helpers/classificationParser';
import { useState } from 'react';

export type ALField = {
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
  classification: string;
  groups: string[];
  is_active: boolean;
  type: string[];
}

export interface CustomUserContextProps extends UserContextProps<CustomUser> {
  c12nDef: ClassificationDefinition;
  configuration: ConfigurationDefinition;
  indexes: IndexDefinitionMap;
}

interface WhoAmIProps extends CustomUser {
  c12nDef: ClassificationDefinition;
  configuration: ConfigurationDefinition;
  indexes: IndexDefinitionMap;
}

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): CustomUserContextProps {
  const [user, setState] = useState<CustomUser>(null);
  const [c12nDef, setC12nDef] = useState<ClassificationDefinition>(null);
  const [configuration, setConfiguration] = useState<ConfigurationDefinition>(null);
  const [indexes, setIndexes] = useState<IndexDefinitionMap>(null);
  const [flattenedProps, setFlattenedProps] = useState(null);

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

  const setUser = (whoAmIData: WhoAmIProps) => {
    const { configuration: cfg, c12nDef: c12n, indexes: idx, ...curUser } = whoAmIData;
    setC12nDef(c12n);
    setConfiguration(cfg);
    setIndexes(idx);
    setState(curUser);
    setFlattenedProps(flatten({ user: curUser, c12nDef: c12n, configuration: cfg, indexes: idx }));
  };

  const validateProp = (propDef: ValidatedProp) => {
    return flattenedProps[propDef.prop] === propDef.value;
  };

  const validateProps = (props: ValidatedProp[]) => {
    if (props === undefined) return true;
    return props.every(validateProp);
  };

  const isReady = () => {
    if (user === null || (!user.agrees_with_tos && configuration.ui.tos) || !user.is_active) {
      return false;
    }

    return true;
  };

  return {
    c12nDef,
    configuration,
    indexes,
    user,
    setUser,
    isReady,
    validateProps
  };
}
