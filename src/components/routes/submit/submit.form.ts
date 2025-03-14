import Flow from '@flowjs/flow.js';
import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import generateUUID from 'helpers/uuid';

export type SubmitState = {
  hash: string;
  c12n: string;
  metadata?: Metadata;
};

export type SubmitMetadata = {
  data: { [key: string]: unknown };
  edit: string;
};

// [Category Index, Service Index, Previous Value]
export type AutoURLServiceIndices = [number, number, boolean][];

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

    /** The user is able to customize the values */
    customize: boolean;

    /** disable the inputs */
    disabled: boolean;

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

  /** adjust the service selection and parameters */
  autoURLServiceSelection: {
    /** Is the URLServiceSelection dialog open? */
    open: boolean;

    /** Previous values of the AutoURLServiceIndices */
    prev: AutoURLServiceIndices;
  };

  /** Details of the file input  */
  file: File & { relativePath: string; fileName: string; path: string; hash: string };

  /** Details of the hash input */
  hash: { type: HashPatternMap; value: string };

  /** Selected metadata of the submission */
  metadata: SubmitMetadata;

  /** All the user's settings */
  settings: ProfileSettings;
};

export const DEFAULT_SUBMIT_FORM: SubmitStore = Object.freeze({
  state: {
    adjust: false,
    customize: false,
    disabled: false,
    loading: true,
    profile: null,
    tab: 'file' as const,
    uploading: false,
    uploadProgress: 0,
    uuid: generateUUID()
  },
  autoURLServiceSelection: {
    open: false,
    prev: []
  },
  file: null,
  hash: {
    type: null,
    value: null
  },
  metadata: {
    edit: null,
    data: {}
  },
  settings: null
});

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: structuredClone(DEFAULT_SUBMIT_FORM)
});
