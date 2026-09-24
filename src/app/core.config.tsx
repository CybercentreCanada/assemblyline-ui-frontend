import type { AppUser } from '@tui/core';
import type { SystemMessage } from '@tui/notis';
import type { ClassificationAliases, ClassificationDefinition } from 'features/classification';
import { DEFAULT_CLASSIFICATION_ALIASES, DEFAULT_CLASSIFICATION_DEFINITION } from 'features/classification';
import type { Indexes } from 'models/api/user';
import { CONFIGURATION, type Configuration } from 'models/base/config';
import type { User } from 'models/base/user';
import type { UserSettings } from 'models/base/user_settings';

declare global {
  type CustomUser = AppUser &
    User & {
      default_view?: string;
      dynamic_group: string | null;
    };

  type AppConfigStore = {
    c12nDef?: ClassificationDefinition;
    classificationAliases?: ClassificationAliases;
    configuration?: Configuration;
    flattenedProps?: Record<string, unknown>;
    indexes?: Indexes;
    settings?: UserSettings;
    systemMessage?: SystemMessage;
    user?: CustomUser;
  };
}

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

const DEFAULT_USER: CustomUser = {
  api_quota: 0,
  apikeys: {},
  apps: {},
  can_impersonate: false,
  classification: '',
  dynamic_group: null,
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
