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

type SettingsDefinition = {
  classification: string;
  deep_scan: boolean;
  description: string;
  download_encoding: string;
  expand_min_score: number;
  ignore_cache: boolean;
  ignore_dynamic_recursion_prevention: boolean;
  ignore_filtering: boolean;
  priority: number;
  profile: boolean;
  service_spec: any[];
  services: any[];
  submission_view: string;
  ttl: number;
};

export type ConfigurationDefinition = {
  auth: {
    allow_2fa: boolean;
    allow_apikeys: boolean;
    allow_extended_apikeys: boolean;
    allow_security_tokens: boolean;
  };
  system: {
    organisation: string;
    type: string;
    version: string;
  };
  ui: {
    allow_malicious_hinting: boolean;
    allow_url_submissions: boolean;
    banner: {
      [lang: string]: string;
    };
    banner_level: 'info' | 'warning' | 'error' | 'success';
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
  default_view?: string;
  dynamic_group: string | null;
  groups: string[];
  is_active: boolean;
  roles: string[];
}

export interface CustomUserContextProps extends UserContextProps<CustomUser> {
  c12nDef: ClassificationDefinition;
  configuration: ConfigurationDefinition;
  indexes: IndexDefinitionMap;
  settings: SettingsDefinition;
  setConfiguration: (cfg: ConfigurationDefinition) => void;
}

interface WhoAmIProps extends CustomUser {
  c12nDef: ClassificationDefinition;
  configuration: ConfigurationDefinition;
  indexes: IndexDefinitionMap;
  settings: SettingsDefinition;
}

// Application specific hook that will provide configuration to commons [useUser] hook.
export default function useMyUser(): CustomUserContextProps {
  const [user, setState] = useState<CustomUser>(null);
  const [c12nDef, setC12nDef] = useState<ClassificationDefinition>(null);
  const [configuration, setConfiguration] = useState<ConfigurationDefinition>(null);
  const [indexes, setIndexes] = useState<IndexDefinitionMap>(null);
  const [settings, setSettings] = useState<SettingsDefinition>(null);
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
    const { configuration: cfg, c12nDef: c12n, indexes: idx, settings: userSettings, ...curUser } = whoAmIData;
    const upperC12n = {
      ...c12n,
      original_definition: {
        ...c12n.original_definition,
        groups: c12n.original_definition.groups.map(grp => {
          return {
            ...grp,
            aliases: grp.aliases.map(val => val.toUpperCase()),
            name: grp.name.toLocaleUpperCase(),
            short_name: grp.short_name.toLocaleUpperCase()
          };
        }),
        levels: c12n.original_definition.levels.map(lvl => {
          return {
            ...lvl,
            aliases: lvl.aliases.map(val => val.toUpperCase()),
            name: lvl.name.toLocaleUpperCase(),
            short_name: lvl.short_name.toLocaleUpperCase()
          };
        }),
        subgroups: c12n.original_definition.subgroups.map(sg => {
          return {
            ...sg,
            aliases: sg.aliases.map(val => val.toUpperCase()),
            name: sg.name.toLocaleUpperCase(),
            short_name: sg.short_name.toLocaleUpperCase()
          };
        }),
        required: c12n.original_definition.required.map(req => {
          return {
            ...req,
            aliases: req.aliases.map(val => val.toUpperCase()),
            name: req.name.toLocaleUpperCase(),
            short_name: req.short_name.toLocaleUpperCase()
          };
        })
      }
    };
    setC12nDef(upperC12n);
    setConfiguration(cfg);
    setIndexes(idx);
    setState({
      ...curUser,
      dynamic_group: curUser.email ? curUser.email.toUpperCase().split('@')[1] : null
    });
    setSettings(userSettings);
    setFlattenedProps(
      flatten({ user: curUser, c12nDef: upperC12n, configuration: cfg, indexes: idx, settings: userSettings })
    );
  };

  const validateProp = (propDef: ValidatedProp) => {
    const obj = flattenedProps[propDef.prop];
    if (Array.isArray(obj)) {
      return obj.indexOf(propDef.value) !== -1;
    }
    return obj === propDef.value;
  };

  const validateProps = (props: ValidatedProp[]) => {
    if (props === undefined) return true;
    return props.some(validateProp);
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
    settings,
    user,
    setUser,
    setConfiguration,
    isReady,
    validateProps
  };
}
