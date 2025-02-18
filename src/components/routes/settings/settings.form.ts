import { createFormContext } from 'components/core/form/createFormContext';
import type { SubmitSettings } from './settings.utils';

export const TABS = ['file', 'hash', 'options'] as const;
export type Tabs = (typeof TABS)[number];

export type SettingsStore = {
  /** State related to the interface of the Settings page */
  state: {
    /** Key of the selected profile */
    tab: string;

    /** Disable all the component */
    disabled: boolean;

    /** Fetching the settings values  */
    loading: boolean;

    /** Submitting the new settings values */
    submitting: boolean;

    /** User is allowed to customize all service-specific parameters. Otherwise, they may only change the parameters that are editable */
    customize: boolean;

    /** Is the confirmation dialog opened */
    confirm: boolean;
  };

  /** Modified settings made by the user  */
  next: SubmitSettings;

  /** Previous settings in the system */
  prev: SubmitSettings;
};

export const { FormProvider, useForm } = createFormContext<SettingsStore>({
  defaultValues: {
    state: {
      tab: null,
      disabled: false,
      loading: false,
      submitting: false,
      customize: false,
      confirm: false
    },
    prev: null,
    next: null
  }
});
