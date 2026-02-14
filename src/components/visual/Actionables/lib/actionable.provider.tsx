import type { ActionableProps, ActionableStates } from 'components/visual/Actionables/lib/actionable.models';
import { ACTIONABLE_PROPS, ACTIONABLE_STATES } from 'components/visual/Actionables/lib/actionable.models';
import { createPropContext } from 'components/visual/Inputs/lib/inputs.provider';

export const { PropProvider, usePropStore } = createPropContext<ActionableProps & ActionableStates>({
  ...ACTIONABLE_PROPS,
  ...ACTIONABLE_STATES
});
