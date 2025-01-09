import { createFormContext } from 'components/core/form/createFormContext';
import { INPUTS_LIBRARY_STATE, type InputsLibraryState } from 'components/routes/developer/library/sections/Inputs';
import { LAYOUT_LIBRARY_STATE, type LayoutLibraryState } from 'components/routes/developer/library/sections/Layout';
import {
  LIST_INPUTS_LIBRARY_STATE,
  type ListInputsLibraryState
} from 'components/routes/developer/library/sections/ListInputs';

type LibraryFormStore = ListInputsLibraryState & InputsLibraryState & LayoutLibraryState;

const LIBRARY_FORM_STORE: LibraryFormStore = Object.freeze({
  ...INPUTS_LIBRARY_STATE,
  ...LAYOUT_LIBRARY_STATE,
  ...LIST_INPUTS_LIBRARY_STATE
});

export const { FormProvider, useForm } = createFormContext<LibraryFormStore>({
  defaultValues: structuredClone(LIBRARY_FORM_STORE)
});
