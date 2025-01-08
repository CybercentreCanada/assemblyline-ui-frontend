import { createFormContext } from 'components/core/form/createFormContext';

type LibraryFormStore = {
  inputs: {
    open: boolean;
    state: {
      disabled: boolean;
      loading: boolean;
      reset: boolean;
      tooltip: boolean;
      error: boolean;
      readOnly: boolean;
    };
    values: {
      text: string;
      number: number;
      date: string;
      select: string;
      checkbox: boolean;
      switch: boolean;
      slider: number;
    };
  };
};

const LIBRARY_FORM_STORE: LibraryFormStore = Object.freeze({
  inputs: {
    open: false,
    state: {
      disabled: false,
      loading: false,
      reset: false,
      tooltip: false,
      error: false,
      readOnly: false
    },
    values: {
      text: '',
      number: 0,
      date: '',
      select: '',
      checkbox: false,
      switch: false,
      slider: 0
    }
  }
});

export const { FormProvider, useForm } = createFormContext<LibraryFormStore>({
  defaultValues: structuredClone(LIBRARY_FORM_STORE)
});
