import Flow from '@flowjs/flow.js';
import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { SubmitSettings2 } from 'components/routes/submit/submit.utils';
import generateUUID from 'helpers/uuid';

export const TABS = ['file', 'hash', 'options'] as const;
export type TabKey = (typeof TABS)[number];

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
    profile: string;

    /** Selected tab */
    tab: TabKey;

    /** Type of submission being made */
    type: 'file' | 'hash';

    /** Upload progress of a file submission */
    uploadProgress: number;

    /** UUID of the submission */
    uuid: string;

    /** loading the settings */
    loading: boolean;

    /** disable the inputs */
    disabled: boolean;

    /** The user is able to customize the values */
    customize: boolean;
  };

  /** Details of the file input  */
  file: File & { relativePath: string; fileName: string; path: string };

  /** Details of the hash input */
  hash: { type: HashPatternMap; value: string; hasError: boolean; urlAutoSelect: boolean };

  /** Selected metadata of the submission */
  metadata: Record<string, unknown>;

  /** All the user's settings */
  settings: SubmitSettings2;
};

export const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

export const DEFAULT_SUBMIT_FORM: SubmitStore = Object.freeze({
  state: {
    uuid: generateUUID(),
    type: 'file',
    isFetchingSettings: true,
    isConfirmationOpen: false,
    isUploading: false,
    uploadProgress: 0,
    tab: 'file',
    profile: null,
    loading: false,
    // loading: true,
    disabled: false,
    customize: false
  },
  file: null,
  hash: {
    type: 'url',
    value: 'https://www.google.ca',
    hasError: false,
    urlAutoSelect: true
  },
  metadata: {},
  settings: null
});

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: structuredClone(DEFAULT_SUBMIT_FORM)
});
