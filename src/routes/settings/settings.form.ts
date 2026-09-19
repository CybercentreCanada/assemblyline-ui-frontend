import { createFormContext } from 'features/form';
import type { UserSettings } from 'models/base/user_settings';
import type { ProfileSettings } from 'routes/settings/settings.utils.ts';

/**
 * Store structure for the Settings page form.
 */
export type SettingsStore = {
  /** UI state for the settings page */
  state: {
    /** Whether the user can customize all parameters */
    customize: boolean;

    /** Disable all UI components */
    disabled: boolean;

    /** Whether settings are currently being fetched */
    loading: boolean;

    /** Whether settings are being submitted */
    submitting: boolean;

    /** Selected settings tab */
    tab: string;
  };

  /** Combined settings for the active profile */
  settings: ProfileSettings | null;

  /** General user settings */
  user: UserSettings | null;
};

export const { FormProvider, useForm } = createFormContext<SettingsStore>({
  defaultValues: {
    state: {
      customize: false,
      disabled: false,
      loading: false,
      submitting: false,
      tab: 'interface'
    },
    settings: null,
    user: null
  } as const
});
