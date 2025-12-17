import { createPropContext } from 'components/visual/Inputs/lib/inputs.provider';
import type { ListInputProps, ListInputStates } from 'components/visual/ListInputs/lib/listinputs.model';
import {
  DEFAULT_LIST_INPUT_PROPS,
  DEFAULT_LIST_INPUT_STATES,
  DEFAULT_LIST_INPUT_VALUES
} from 'components/visual/ListInputs/lib/listinputs.model';

export const { PropProvider, usePropStore } = createPropContext<ListInputProps & ListInputStates>({
  ...DEFAULT_LIST_INPUT_VALUES,
  ...DEFAULT_LIST_INPUT_PROPS,
  ...DEFAULT_LIST_INPUT_STATES
});
