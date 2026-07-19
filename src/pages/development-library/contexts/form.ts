import { createFormContext } from 'features/form/createFormContext';
import type { DateTimeLibraryState } from 'pages/development-library/sections/DateTime';
import { DATETIME_LIBRARY_STATE } from 'pages/development-library/sections/DateTime';
import type { InputsLibraryState } from 'pages/development-library/sections/Inputs';
import { INPUTS_LIBRARY_STATE } from 'pages/development-library/sections/Inputs';
import type { LayoutLibraryState } from 'pages/development-library/sections/Layout';
import { LAYOUT_LIBRARY_STATE } from 'pages/development-library/sections/Layout';
import type { ListLibraryState } from 'pages/development-library/sections/List';
import { LIST_LIBRARY_STATE } from 'pages/development-library/sections/List';
import type { ListInputsLibraryState } from 'pages/development-library/sections/ListInputs';
import { LIST_INPUTS_LIBRARY_STATE } from 'pages/development-library/sections/ListInputs';

type LibraryComponents = DateTimeLibraryState &
  InputsLibraryState &
  LayoutLibraryState &
  ListInputsLibraryState &
  ListLibraryState;

export type LibraryFormStore = {
  state: {
    tab: keyof LibraryComponents;
  };
  components: LibraryComponents;
};

const LIBRARY_FORM_STORE: LibraryFormStore = Object.freeze({
  state: {
    tab: null
  },
  components: {
    ...DATETIME_LIBRARY_STATE,
    ...INPUTS_LIBRARY_STATE,
    ...LAYOUT_LIBRARY_STATE,
    ...LIST_INPUTS_LIBRARY_STATE,
    ...LIST_LIBRARY_STATE
  }
});

export const { FormProvider, useForm } = createFormContext<LibraryFormStore>({
  defaultValues: structuredClone(LIBRARY_FORM_STORE)
});
