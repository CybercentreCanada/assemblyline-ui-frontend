import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/mock/settings';
import generateUUID from 'helpers/uuid';

export type SubmitStore = {
  submit: {
    uuid: string;
    type: 'file' | 'hash';
    isConfirmationOpen: boolean;
    isUploading: boolean;
    uploadProgress: number;
  };
  file: File & { relativePath: string; fileName: string; path: string };
  hash: { type: HashPatternMap; value: string; hasError: boolean; urlAutoSelect: boolean };
  submissionProfile: string;
  metadata: Metadata;
  settings: UserSettings;
};

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: {
    submit: {
      uuid: generateUUID(),
      type: 'file',
      isConfirmationOpen: false,
      isUploading: false,
      uploadProgress: 0
    },
    file: null,
    hash: { type: null, value: '', hasError: false, urlAutoSelect: true },
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
    submissionProfile: null
  }
});
