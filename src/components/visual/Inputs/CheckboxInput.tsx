import type { ButtonProps } from '@mui/material';
import { Checkbox } from '@mui/material';
import { createStoreContext } from 'components/core/store/createStoreContext';
import {
  ExpandInput,
  HelperText,
  PasswordInput,
  ResetInput,
  StyledEndAdornmentBox,
  StyledFormButton,
  StyledFormControl,
  StyledFormControlLabel
} from 'components/visual/Inputs/lib/inputs.components';
import { useInputUpdater } from 'components/visual/Inputs/lib/inputs.hook';
import type { InputProps, InputStates } from 'components/visual/Inputs/lib/inputs.model';
import { DEFAULT_INPUT_DATA } from 'components/visual/Inputs/lib/inputs.model';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type CheckboxInputProps = Omit<
  ButtonProps,
  'onChange' | 'onClick' | 'value' | 'error' | 'onBlur' | 'onFocus' | 'defaultValue' | 'onError'
> &
  InputProps<boolean>;

const { StoreProvider, useStore } = createStoreContext<CheckboxInputProps & InputStates<boolean>>({
  ...DEFAULT_INPUT_DATA
});

const WrappedCheckboxInput = () => {
  const { t } = useTranslation('inputs');

  const [error, setStore] = useStore(s => s.error);
  const [indeterminate] = useStore(s => s.indeterminate);
  const [loading] = useStore(s => s.loading);
  const [preventDisabledColor] = useStore(s => s.preventDisabledColor);
  const [preventRender] = useStore(s => s.preventRender);
  const [required] = useStore(s => s.required);
  const [readOnly] = useStore(s => s.readOnly);
  const [tooltip] = useStore(s => s.tooltip);
  const [tooltipProps] = useStore(s => s.tooltipProps);
  const [value] = useStore(s => s.value);

  // useEffect(() => {
  //   if (error(value)) setStore({ errorMsg: error(value) });
  //   else if (required && !isValidValue(value)) setStore({ errorMsg: t('error.required') });
  //   else setStore({ errorMsg: null });
  // }, [error, required, setStore, t, value]);

  useInputUpdater(useStore);

  return preventRender ? null : (
    <Tooltip title={loading ? null : tooltip} {...tooltipProps}>
      <StyledFormControl useStore={useStore}>
        <StyledFormButton useStore={useStore}>
          <StyledFormControlLabel useStore={useStore}>
            <Checkbox
              checked={value}
              indeterminate={indeterminate}
              disableFocusRipple
              disableRipple
              disableTouchRipple
              size="small"
              sx={{
                paddingTop: '0px',
                paddingBottom: '0px',
                minWidth: '40px',
                ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
              }}
            />
          </StyledFormControlLabel>
        </StyledFormButton>

        <HelperText useStore={useStore} />

        <StyledEndAdornmentBox useStore={useStore}>
          <PasswordInput useStore={useStore} />
          <ResetInput useStore={useStore} />
          <ExpandInput useStore={useStore} />
        </StyledEndAdornmentBox>
      </StyledFormControl>
    </Tooltip>
  );
};

export const CheckboxInput: React.FC<CheckboxInputProps> = React.memo((props: CheckboxInputProps) => (
  <StoreProvider data={props}>
    <WrappedCheckboxInput />
  </StoreProvider>
));
