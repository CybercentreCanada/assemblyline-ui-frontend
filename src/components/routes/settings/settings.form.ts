import { createFormContext } from 'components/core/form/createFormContext';
import type { ProfileSettings } from './settings.utils';

export type SettingsStore = {
  /** State related to the interface of the Settings page */
  state: {
    /** Is the confirmation dialog opened */
    confirm: boolean;

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

  /** Modified settings made by the user */
  next: ProfileSettings;

  /** Previous settings in the system */
  prev: ProfileSettings;
};

export const { FormProvider, useForm } = createFormContext<SettingsStore>({
  defaultValues: {
    state: {
      confirm: false,
      customize: false,
      disabled: false,
      loading: false,
      submitting: false,
      tab: null
    },
    prev: null,
    next: null
  }
});
