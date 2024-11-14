import { createFormContext } from 'components/core/form/createFormContext';
import type { Submission } from 'components/models/base/config';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/mock/settings';

export const TABS = ['file', 'hash', 'options'] as const;
export type Tabs = (typeof TABS)[number];

export type SettingsStore = {
  state: {
    /** Key of the selected profile */
    profile: keyof Submission['profiles'];

    /** Disable all the component */
    disabled: boolean;

    /** Fetching the settings values  */
    loading: boolean;

    /** Submitting the new settings values */
    submitting: boolean;

    /** ID of the Anchor element that is in view used by the navigation pane */
    activeID: string;

    /** Hide all disabled parameters */
    hidden: boolean;

    /** User is allowed to customize all service-specific parameters. Otherwise, they may only change the parameters that are editable */
    customize: boolean;

    /** User is allowed to make changes to their settings */
    selfManage: boolean;
  };
  next: UserSettings;
  prev: UserSettings;
};

/**
 * Group -> Section -> Param
 */

export const { FormProvider, useForm } = createFormContext<SettingsStore>({
  defaultValues: {
    state: {
      profile: null,
      disabled: false,
      loading: true,
      submitting: false,
      activeID: null,
      hidden: false,
      customize: false,
      selfManage: false
    },
    next: {
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
    prev: {
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
    }
  }
});
