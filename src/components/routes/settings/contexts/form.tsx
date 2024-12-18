import { createFormContext } from 'components/core/form/createFormContext';
import type { SubmitSettings } from 'components/routes/settings/utils/utils';

export const TABS = ['file', 'hash', 'options'] as const;
export type Tabs = (typeof TABS)[number];

export type SettingsStore = {
  /** State related to the interface of the Settings page */
  state: {
    /** Key of the selected profile */
    tab: 'static' | 'static_with_internet' | 'dynamic' | 'interface';

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
      loading: true,
      submitting: false,
      activeID: null,
      hidden: false,
      customize: false,
      selfManage: false,
      confirm: false
    },
    prev: null,
    next: null
  }
});
