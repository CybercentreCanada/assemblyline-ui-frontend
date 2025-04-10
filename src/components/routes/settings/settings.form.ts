import { createFormContext } from 'components/core/form/createFormContext';
import type { UserSettings } from 'components/models/base/user_settings';
import type { ProfileSettings } from './settings.utils';

export type SettingsStore = {
  /** State related to the interface of the Settings page */
  state: {
    /** User is allowed to customize all service-specific parameters. Otherwise, they may only change the parameters that are editable */
    customize: boolean;

    /** Disable all the component */
    disabled: boolean;

    /** Fetching the settings values */
    loading: boolean;

    /** Submitting the new settings values */
    submitting: boolean;

    /** Key of the selected profile */
    tab: string;
  };

  /** Aggregate user settings */
  settings: ProfileSettings;

  /** Aggregate user settings */
  user: UserSettings;
};

export const { FormProvider, useForm } = createFormContext<SettingsStore>({
  defaultValues: {
    state: {
      customize: false,
      disabled: false,
      loading: false,
      submitting: false,
      tab: null
    },
    settings: null,
    user: null
  }
});
