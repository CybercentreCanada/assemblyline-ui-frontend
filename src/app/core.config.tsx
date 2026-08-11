import type { SystemMessage } from '@tui/notis';
import type { ClassificationAliases, ClassificationDefinition } from 'features/classification/classificationParser';
import type { Indexes } from 'models/api/user';
import { CONFIGURATION, type Configuration } from 'models/base/config';
import type { User } from 'models/base/user';
import type { UserSettings } from 'models/base/user_settings';

declare global {
  type AppConfigStore = {
    c12nDef?: ClassificationDefinition;
    classificationAliases?: ClassificationAliases;
    configuration?: Configuration;
    flattenedProps?: Record<string, unknown>;
    indexes?: Indexes;
    settings?: UserSettings;
    systemMessage?: SystemMessage;
    user?: User;
  };
}

// Empty maps/arrays, invalid_mode disables enforcement until real data loads
const DEFAULT_CLASSIFICATION_DEFINITION: ClassificationDefinition = {
  RESTRICTED: '',
  UNRESTRICTED: '',
  access_req_aliases: {},
  access_req_map_lts: {},
  access_req_map_stl: {},
  description: {},
  dynamic_groups: false,
  dynamic_groups_type: 'email',
  enforce: false,
  groups_aliases: {},
  groups_auto_select: [],
  groups_auto_select_short: [],
  groups_map_lts: {},
  groups_map_stl: {},
  invalid_mode: true,
  levels_aliases: {},
  levels_map: {},
  levels_map_lts: {},
  levels_map_stl: {},
  levels_styles_map: {},
  original_definition: {
    dynamic_groups: false,
    dynamic_groups_type: '',
    enforce: false,
    groups: [],
    levels: [],
    required: [],
    restricted: '',
    subgroups: [],
    unrestricted: ''
  },
  params_map: {},
  subgroups_aliases: {},
  subgroups_auto_select: [],
  subgroups_auto_select_short: [],
  subgroups_map_lts: {},
  subgroups_map_stl: {}
};

const DEFAULT_CLASSIFICATION_ALIASES: ClassificationAliases = {};

const DEFAULT_INDEXES: Indexes = {
  alert: {},
  badlist: {},
  file: {},
  heuristic: {},
  result: {},
  retrohunt: {},
  safelist: {},
  signature: {},
  submission: {},
  workflow: {}
};

const DEFAULT_USER: User = {
  api_quota: 0,
  apikeys: {},
  apps: {},
  can_impersonate: false,
  classification: '',
  groups: [],
  id: '',
  is_active: false,
  name: '',
  password: '',
  roles: [],
  security_tokens: [],
  submission_quota: 0,
  type: [],
  uname: ''
};

const DEFAULT_USER_SETTINGS: UserSettings = {
  classification: '',
  deep_scan: false,
  default_external_sources: [],
  default_metadata: {},
  default_zip_password: '',
  description: '',
  download_encoding: 'raw',
  executive_summary: false,
  expand_min_score: 0,
  generate_alert: false,
  ignore_cache: false,
  ignore_dynamic_recursion_prevention: false,
  ignore_filtering: false,
  ignore_recursion_prevention: false,
  initial_data: '',
  malicious: false,
  priority: 0,
  service_spec: [],
  services: [],
  submission_view: 'report',
  ttl: 0
};

export const DEFAULT_APP_CONFIG_STORE: AppConfigStore = {
  c12nDef: DEFAULT_CLASSIFICATION_DEFINITION,
  classificationAliases: DEFAULT_CLASSIFICATION_ALIASES,
  configuration: CONFIGURATION,
  indexes: DEFAULT_INDEXES,
  settings: DEFAULT_USER_SETTINGS,
  user: DEFAULT_USER
};
