import type { InputModel } from 'components/visual/Inputs2/models/inputs-main.models';
import { DEFAULT_INPUT_PROPS, DEFAULT_INPUT_SLOT_PROPS } from 'components/visual/Inputs2/models/inputs-props.models';

/**********************************************************************************************************************
 * useInputValues
 *********************************************************************************************************************/
export const useInputValues = <Props extends InputModel<unknown, unknown>>({ slotProps, ...props }: Props) => {
  return {
    ...DEFAULT_INPUT_PROPS,
    ...props,
    slotProps: { ...DEFAULT_INPUT_SLOT_PROPS, ...slotProps }
  } as unknown as Props;
};
