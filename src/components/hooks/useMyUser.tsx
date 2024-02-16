import { AppUserService, AppUserValidatedProp } from 'commons/components/app/AppUserService';
import { Configuration } from 'components/models/base/config';
import { User } from 'components/models/base/user';
import { UserSettings } from 'components/models/base/user_settings';
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

export type SystemMessageDefinition = {
  user: string;
  title: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
};

export interface CustomUser extends User {
  // Al specific props
  // agrees_with_tos: boolean;
  classification: string;
  default_view?: string;
  dynamic_group: string | null;
  groups: string[];
  is_active: boolean;
  // roles: string[];
}

export interface CustomAppUserService extends AppUserService<CustomUser> {
  c12nDef: ClassificationDefinition;
  configuration: Configuration;
  indexes: IndexDefinitionMap;
  settings: UserSettings;
  systemMessage: SystemMessageDefinition;
  setConfiguration: (cfg: Configuration) => void;
  setSystemMessage: (msg: SystemMessageDefinition) => void;
  scoreToVerdict: (score: number) => string;
}

export interface WhoAmIProps extends CustomUser {
  c12nDef: ClassificationDefinition;
  configuration: Configuration;
  indexes: IndexDefinitionMap;
  system_message: SystemMessageDefinition;
  settings: UserSettings;
}

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): CustomAppUserService {
  const [user, setState] = useState<CustomUser>(null);
  const [c12nDef, setC12nDef] = useState<ClassificationDefinition>(null);
  const [configuration, setConfiguration] = useState<Configuration>(null);
  const [indexes, setIndexes] = useState<IndexDefinitionMap>(null);
  const [systemMessage, setSystemMessage] = useState<SystemMessageDefinition>(null);
  const [settings, setSettings] = useState<UserSettings>(null);
  const [flattenedProps, setFlattenedProps] = useState(null);

  function flatten(ob) {
    const toReturn = {};

    for (const i in ob) {
      if ({}.hasOwnProperty.call(ob, i)) {
        if (!Array.isArray(ob[i]) && typeof ob[i] == 'object') {
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
    const {
      configuration: cfg,
      c12nDef: c12n,
      indexes: idx,
      system_message: msg,
      settings: userSettings,
      ...curUser
    } = whoAmIData;
    const upperC12n = {
      ...c12n,
      original_definition: {
        ...c12n.original_definition,
        groups: c12n.original_definition.groups.map(grp => ({
          ...grp,
          aliases: grp.aliases.map(val => val.toUpperCase()),
          name: grp.name.toLocaleUpperCase(),
          short_name: grp.short_name.toLocaleUpperCase()
        })),
        levels: c12n.original_definition.levels.map(lvl => ({
          ...lvl,
          aliases: lvl.aliases.map(val => val.toUpperCase()),
          name: lvl.name.toLocaleUpperCase(),
          short_name: lvl.short_name.toLocaleUpperCase()
        })),
        subgroups: c12n.original_definition.subgroups.map(sg => ({
          ...sg,
          aliases: sg.aliases.map(val => val.toUpperCase()),
          name: sg.name.toLocaleUpperCase(),
          short_name: sg.short_name.toLocaleUpperCase()
        })),
        required: c12n.original_definition.required.map(req => ({
          ...req,
          aliases: req.aliases.map(val => val.toUpperCase()),
          name: req.name.toLocaleUpperCase(),
          short_name: req.short_name.toLocaleUpperCase()
        }))
      }
    };
    setC12nDef(upperC12n);
    setConfiguration(cfg);
    setIndexes(idx);
    setSystemMessage(msg);
    setState({
      ...curUser,
      dynamic_group: curUser.email ? curUser.email.toUpperCase().split('@')[1] : null
    });
    setSettings(userSettings);
    setFlattenedProps(
      flatten({ user: curUser, c12nDef: upperC12n, configuration: cfg, indexes: idx, settings: userSettings })
    );
  };

  const validateProp = (propDef: AppUserValidatedProp) => {
    const obj = flattenedProps[propDef.prop];
    if (Array.isArray(obj)) {
      return obj.indexOf(propDef.value) !== -1;
    }
    return obj === propDef.value;
  };

  const validateProps = (props: AppUserValidatedProp[]) => {
    if (props === undefined || !Array.isArray(props)) return true;

    let enforcedProps: AppUserValidatedProp[] = [];
    let unEnforcedProps: AppUserValidatedProp[] = [];
    props.forEach(prop => (prop?.enforce ? enforcedProps.push(prop) : unEnforcedProps.push(prop)));

    const enforcedValidated = enforcedProps.length > 0 ? enforcedProps.every(validateProp) : true;
    const unEnforcedValidated = unEnforcedProps.length > 0 ? unEnforcedProps.some(validateProp) : true;

    return enforcedValidated && unEnforcedValidated;
  };

  const isReady = () => {
    if (user === null || (!user.agrees_with_tos && configuration.ui.tos) || !user.is_active) {
      return false;
    }

    return true;
  };

  const scoreToVerdict = (score: number | null) => {
    if (score >= configuration.submission.verdicts.malicious) {
      return 'malicious';
    }

    if (score >= configuration.submission.verdicts.highly_suspicious) {
      return 'highly_suspicious';
    }

    if (score >= configuration.submission.verdicts.suspicious) {
      return 'suspicious';
    }

    if (score === null || score >= configuration.submission.verdicts.info) {
      return 'info';
    }

    return 'safe';
  };

  return {
    c12nDef,
    configuration,
    indexes,
    systemMessage,
    settings,
    user,
    setUser,
    setConfiguration,
    setSystemMessage,
    isReady,
    validateProps,
    scoreToVerdict
  };
}
