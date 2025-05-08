import type { AppUserService, AppUserValidatedProp } from 'commons/components/app/AppUserService';
import type { Configuration } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import type { CustomUser, Indexes, SystemMessage } from 'components/models/ui/user';
import type { ClassificationDefinition } from 'helpers/classificationParser';
import { useState } from 'react';

export type Alias = {
  name: string;
  short_name: string;
};

export type ClassificationAliases = Record<string, Alias>;

export interface CustomAppUserService extends AppUserService<CustomUser> {
  c12nDef: ClassificationDefinition;
  classificationAliases: ClassificationAliases;
  configuration: Configuration;
  indexes: Indexes;
  settings: UserSettings;
  systemMessage: SystemMessage;
  setClassificationAliases: (aliases: ClassificationAliases) => void;
  setConfiguration: (cfg: Configuration) => void;
  setSystemMessage: (msg: SystemMessage) => void;
  scoreToVerdict: (score: number) => string;
}

export interface WhoAmIProps extends CustomUser {
  c12nDef: ClassificationDefinition;
  classification_aliases: ClassificationAliases;
  configuration: Configuration;
  indexes: Indexes;
  system_message: SystemMessage;
  settings: UserSettings;
}

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): CustomAppUserService {
  const [user, setState] = useState<CustomUser>(null);
  const [c12nDef, setC12nDef] = useState<ClassificationDefinition>(null);
  const [configuration, setConfiguration] = useState<Configuration>(null);
  const [indexes, setIndexes] = useState<Indexes>(null);
  const [systemMessage, setSystemMessage] = useState<SystemMessage>(null);
  const [settings, setSettings] = useState<UserSettings>(null);
  const [classificationAliases, setClassificationAliases] = useState<ClassificationAliases>(null);
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
      classification_aliases: c12nAliases,
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
    setClassificationAliases(c12nAliases);
    setConfiguration(cfg);
    setIndexes(idx);
    setSystemMessage(msg);
    setState({
      ...curUser,
      dynamic_group: curUser.email ? curUser.email.toUpperCase().split('@')[1] : null
    });
    setSettings(userSettings);
    setFlattenedProps(
      flatten({
        user: curUser,
        classificationAliases: c12nAliases,
        c12nDef: upperC12n,
        configuration: cfg,
        indexes: idx,
        settings: userSettings
      })
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

    const enforcedProps: AppUserValidatedProp[] = [];
    const unEnforcedProps: AppUserValidatedProp[] = [];
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
    classificationAliases,
    configuration,
    indexes,
    systemMessage,
    settings,
    user,
    setUser,
    setClassificationAliases,
    setConfiguration,
    setSystemMessage,
    isReady,
    validateProps,
    scoreToVerdict
  };
}
