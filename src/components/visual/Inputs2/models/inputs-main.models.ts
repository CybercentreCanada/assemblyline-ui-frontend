import type { InputProps } from 'components/visual/Inputs2/models/inputs-props.models';
import type { InputStates } from 'components/visual/Inputs2/models/inputs-states.models';
import type { InputValues } from 'components/visual/Inputs2/models/inputs-values.models';

export type InputModel<Value, InputValue = Value, Event = React.SyntheticEvent> = InputValues<
  Value,
  InputValue,
  Event
> &
  InputProps &
  InputStates;

export type InputModelWithChildren<Value, InputValue = Value, Event = React.SyntheticEvent> = {
  children: React.ReactNode;
} & InputModel<Value, InputValue, Event>;
