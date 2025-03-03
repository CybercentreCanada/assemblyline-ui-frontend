import Flow from '@flowjs/flow.js';
import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import type { SubmitMetadata } from 'components/routes/submit2/submit.utils';
import generateUUID from 'helpers/uuid';

export const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

export type SubmitStore = {
  /** State related to the interface of the Submit page */
  state: {
    /** adjust the service selection and parameters */
    adjust: boolean;

    /** Is the confirmation dialog open? */
    confirmation: boolean;

    /** The user is able to customize the values */
    customize: boolean;

    /** disable the inputs */
    disabled: boolean;

    /** Are the settings currently being fetched? */
    isFetchingSettings: boolean;

    /** loading the settings */
    loading: boolean;

    /** Selected profile for the submission */
    profile: string;

    /** Type of submission being made */
    tab: 'file' | 'hash';

    /** Is a submission being sent? */
    uploading: boolean;

    /** Upload progress of a file submission */
    uploadProgress: number;

    /** UUID of the submission */
    uuid: string;
  };

  /** Details of the file input  */
  file: File & { relativePath: string; fileName: string; path: string };

  /** Details of the hash input */
  hash: { type: HashPatternMap; value: string };

  /** Selected metadata of the submission */
  // metadata: SubmitMetadata;
  metadata: {
    config: SubmitMetadata;
    extra: string;
  };

  /** All the user's settings */
  settings: ProfileSettings;
};

export const DEFAULT_SUBMIT_FORM: SubmitStore = Object.freeze({
  state: {
    adjust: false,
    confirmation: false,
    customize: false,
    disabled: false,
    isFetchingSettings: true,
    loading: true,
    profile: null,
    tab: 'file' as const,
    uploading: false,
    uploadProgress: 0,
    uuid: generateUUID()
  },
  file: null,
  hash: {
    type: 'url' as const,
    value: 'https://www.google.ca' as const
  },
  metadata: {
    config: {},
    extra: ''
  },
  settings: null
});

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: structuredClone(DEFAULT_SUBMIT_FORM)
});
