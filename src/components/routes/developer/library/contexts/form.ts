import { createFormContext } from 'components/core/form/createFormContext';
import { INPUTS_LIBRARY_STATE, type InputsLibraryState } from 'components/routes/developer/library/sections/Inputs';
import { LAYOUT_LIBRARY_STATE, type LayoutLibraryState } from 'components/routes/developer/library/sections/Layout';
import { LIST_LIBRARY_STATE, type ListLibraryState } from 'components/routes/developer/library/sections/List';
import {
  LIST_INPUTS_LIBRARY_STATE,
  type ListInputsLibraryState
} from 'components/routes/developer/library/sections/ListInputs';

type LibraryComponents = ListInputsLibraryState & InputsLibraryState & LayoutLibraryState & ListLibraryState;

type LibraryFormStore = {
  state: {
    active: keyof LibraryComponents;
  };
  components: LibraryComponents;
};

const LIBRARY_FORM_STORE: LibraryFormStore = Object.freeze({
  state: {
    active: null
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
