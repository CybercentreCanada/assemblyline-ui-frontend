import { createFormContext } from 'components/core/form/createFormContext';
import { INPUTS_LIBRARY_STATE, type InputsLibraryState } from 'components/routes/development/library/sections/Inputs';
import { LAYOUT_LIBRARY_STATE, type LayoutLibraryState } from 'components/routes/development/library/sections/Layout';
import { LIST_LIBRARY_STATE, type ListLibraryState } from 'components/routes/development/library/sections/List';
import {
  LIST_INPUTS_LIBRARY_STATE,
  type ListInputsLibraryState
} from 'components/routes/development/library/sections/ListInputs';

type LibraryComponents = ListInputsLibraryState & InputsLibraryState & LayoutLibraryState & ListLibraryState;

type LibraryFormStore = {
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
    ...INPUTS_LIBRARY_STATE,
    ...LAYOUT_LIBRARY_STATE,
    ...LIST_INPUTS_LIBRARY_STATE,
    ...LIST_LIBRARY_STATE
  }
});

export const { FormProvider, useForm } = createFormContext<LibraryFormStore>({
  defaultValues: structuredClone(LIBRARY_FORM_STORE)
});
