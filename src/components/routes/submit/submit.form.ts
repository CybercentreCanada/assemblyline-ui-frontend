import Flow from '@flowjs/flow.js';
import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import generateUUID from 'helpers/uuid';

/**
 * State used when submitting to the backend.
 * Includes classification and server-side metadata.
 */
export type SubmitState = {
  c12n: string;
  description?: string | null;
  hash: string;
  metadata?: Metadata;
  priority?: string | null;
  profile?: string | null;
  raw?: string | null;
  ttl?: string | null;
};

/**
 * Metadata collected from the user on the Submit page.
 */
export type SubmitMetadata = {
  data: Record<string, unknown>;
  edit: string | null;
};

/**
 * Phases the Submit flow goes through:
 * - loading: initial fetches / setup
 * - editing: user is modifying parameters or metadata
 * - uploading: Flow.js is uploading a file
 * - redirecting: backend accepted submission and UI is navigating away
 */
export type SubmitPhase = 'loading' | 'editing' | 'uploading' | 'redirecting';

/**
 * [Category Index, Service Index] representing a previous service selection.
 * Used when restoring auto-selected services.
 */
export type AutoURLServiceIndices = [number, number][];

/**
 * File input with additional Flow.js or UI-related properties.
 * Nullable because initial state has no file selected.
 */
export type SubmitFile =
  | (File & {
      relativePath: string;
      fileName: string;
      path: string;
      hash: string;
    })
  | null;

/**
 * Hash submission data (used when submitting via hash instead of file).
 */
export type SubmitHash = {
  type: HashPatternMap | null;
  value: string | null;
};

/**
 * Raw submission data (used when submitting via the raw input instead of file).
 */
export type SubmitRaw = {
  hash: string | null;
  value: string | null;
};

/**
 * Global Flow.js instance configured for file uploads.
 * Handles chunk uploads, retries, and connection behavior.
 */
export const FLOW: Flow = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

/**
 * Full form-state representation for the Submit page.
 * This is used by React Hook Form and the Submit UI.
 */
export type SubmitStore = {
  /** State related to the interface of the Submit page */
  state: {
    /** Adjust the service selection and parameters */
    adjust: boolean;

    /** The user is able to customize the values */
    customize: boolean;

    /** Disable the inputs */
    disabled: boolean;

    /** Phase of the submit process */
    phase: SubmitPhase;

    /** Selected profile for the submission */
    profile: string | null;

    /** Type of submission being made */
    tab: 'file' | 'hash' | 'raw';

    /** Upload progress of a file submission */
    progress: number;

    /** UUID of the submission (generated once per form initialization) */
    uuid: string;
  };

  /** Adjust the service selection and parameters */
  autoURLServiceSelection: {
    /** Is the URLServiceSelection dialog open? */
    open: boolean;

    /** Previous values of the AutoURLServiceIndices */
    prev: AutoURLServiceIndices;
  };

  /** Details of the file input */
  file: SubmitFile;

  /** Details of the hash input */
  hash: SubmitHash;

  /** Selected metadata of the submission */
  metadata: SubmitMetadata;

  /** Raw plaintext input for direct text submissions */
  raw: SubmitRaw;

  /** All the user's settings */
  settings: ProfileSettings | null;
};

/**
 * Default form state used when initializing a new Submit form.
 * Matches the expected UX:
 * - no file
 * - no hash
 * - no settings yet
 * - initial phase set to 'loading'
 */
export const DEFAULT_SUBMIT_FORM: SubmitStore = {
  state: {
    adjust: false,
    customize: false,
    disabled: false,
    phase: 'loading',
    profile: null,
    tab: 'file',
    progress: 0,
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
  raw: {
    hash: null,
    value: null
  },
  metadata: {
    edit: null,
    data: {}
  },
  settings: null
};

/**
 * Creates a strongly-typed form context for SubmitStore.
 * Uses structuredClone to avoid mutating default objects.
 */
export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: structuredClone(DEFAULT_SUBMIT_FORM)
});
