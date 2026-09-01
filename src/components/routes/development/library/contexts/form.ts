import { createFormContext } from 'components/core/form/createFormContext';
import {
  ACTIONABLE_LIBRARY_STATE,
  type ActionableLibraryState
} from 'components/routes/development/library/sections/Actionable';
import type { DateTimeLibraryState } from 'components/routes/development/library/sections/DateTime';
import { DATETIME_LIBRARY_STATE } from 'components/routes/development/library/sections/DateTime';
import { INPUTS_LIBRARY_STATE, type InputsLibraryState } from 'components/routes/development/library/sections/Inputs';
import { LAYOUT_LIBRARY_STATE, type LayoutLibraryState } from 'components/routes/development/library/sections/Layout';
import { LIST_LIBRARY_STATE, type ListLibraryState } from 'components/routes/development/library/sections/List';
import {
  LIST_INPUTS_LIBRARY_STATE,
  type ListInputsLibraryState
} from 'components/routes/development/library/sections/ListInputs';

type LibraryComponents = ActionableLibraryState &
  DateTimeLibraryState &
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
    ...ACTIONABLE_LIBRARY_STATE,
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
