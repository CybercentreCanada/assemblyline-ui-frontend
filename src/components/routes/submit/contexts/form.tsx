import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap, Submission } from 'components/models/base/config';
import { SubmitSettings } from 'components/routes/settings/utils/utils';
import generateUUID from 'helpers/uuid';

export const TABS = ['file', 'hash', 'options'] as const;
export type Tabs = (typeof TABS)[number];

export type SubmitStore = {
  /** State related to the interface of the Submit page */
  state: {
    /** Is the confirmation dialog open? */
    isConfirmationOpen: boolean;

    /** Are the settings currently being fetched? */
    isFetchingSettings: boolean;

    /** Is a submission being sent? */
    isUploading: boolean;

    /** Selected profile for the submission */
    profile: keyof Submission['profiles'];

    /** Selected tab */
    tab: Tabs;

    /** Type of submission being made */
    type: 'file' | 'hash';

    /** Upload progress of a file submission */
    uploadProgress: number;

    /** UUID of the submission */
    uuid: string;
  };

  /** Details of the file input  */
  file: File & { relativePath: string; fileName: string; path: string };

  /** Details of the hash input */
  hash: { type: HashPatternMap; value: string; hasError: boolean; urlAutoSelect: boolean };

  /** Selected metadata of the submission */
  metadata: Record<string, unknown>;

  /** All the user's settings */
  settings: SubmitSettings;
};

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: {
    state: {
      uuid: generateUUID(),
      type: 'file',
      isFetchingSettings: false,
      isConfirmationOpen: false,
      isUploading: false,
      uploadProgress: 0,
      tab: 'file',
      profile: null
    },
    file: null,
    hash: { type: null, value: '', hasError: true, urlAutoSelect: true },
    metadata: {},
    settings: null
  }
});
