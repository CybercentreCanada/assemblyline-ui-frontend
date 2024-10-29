import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { UserSettings } from 'components/models/base/user_settings';
import generateUUID from 'helpers/uuid';
import { DEFAULT_SETTINGS } from '../mock/settings';

export type FormData = {
  allowClick: boolean;
  file: File;
  input: { type: HashPatternMap; value: string; hasError: boolean };
  metadata: Metadata;
  settings: Omit<UserSettings, 'services'>;
  submissionProfile: string;
  submissionMetadata: Metadata;
  uploadProgress: number;
  uuid: string;
  validate: boolean;
  validateCB: string;
};

export const { FormProvider, useForm } = createFormContext({
  defaultValues: {
    allowClick: true,
    file: null,
    input: { type: undefined, value: '', hasError: false },
    metadata: {},
    settings: {
      classification: '',
      deep_scan: false,
      default_external_sources: [],
      default_zip_password: '',
      description: '',
      download_encoding: 'cart',
      executive_summary: false,
      expand_min_score: 0,
      generate_alert: false,
      ignore_cache: false,
      ignore_dynamic_recursion_prevention: false,
      ignore_filtering: false,
      malicious: false,
      priority: 0,
      services: [],
      service_spec: [],
      submission_view: 'report',
      ttl: 0,
      ...DEFAULT_SETTINGS
    },
    submissionMetadata: {},
    submissionProfile: null,
    uploadProgress: null,
    uuid: generateUUID(),
    validate: false,
    validateCB: null
  }
});
