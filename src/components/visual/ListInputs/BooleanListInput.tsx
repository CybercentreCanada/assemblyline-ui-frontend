import { Switch } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import { useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import {
  StyledHelperText,
  StyledListInputButtonRoot,
  StyledListInputInner,
  StyledListInputLoading,
  StyledListInputText,
  StyledListInputWrapper,
  StyledPasswordAdornment,
  StyledResetAdornment
} from 'components/visual/ListInputs/lib/listinputs.components';
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus,
  usePropID
} from 'components/visual/ListInputs/lib/listinputs.hook';
import type {
  ListInputOptions,
  ListInputRuntimeState,
  ListInputValueModel
} from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type SwitchListInputProps = ListInputValueModel<boolean, boolean, React.MouseEvent<HTMLDivElement, MouseEvent>> &
  ListInputOptions;

type SwitchListInputController = SwitchListInputProps & ListInputRuntimeState;

const WrappedSwitchListInput = React.memo(() => {
  const [get] = usePropStore<SwitchListInputController>();

  const id = usePropID();
  const rawValue = Boolean(get('rawValue'));
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const value = get('value');
  const disabled = get('disabled');

  const handleBlur = useInputClickBlur<boolean>();
  const handleClick = useInputClick<boolean>();
  const handleFocus = useInputFocus<boolean>();

  return (
    <StyledListInputButtonRoot
      onFocus={handleFocus}
      onBlur={e => handleBlur(e, value, value)}
      onClick={event => handleClick(event, !value, !value)}
    >
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText />

          {loading ? (
            <StyledListInputLoading />
          ) : (
            <>
              <StyledPasswordAdornment />
              <StyledResetAdornment />
              <div style={{ minHeight: '41px' }}>
                <Switch
                  id={id}
                  name={id}
                  checked={rawValue}
                  disabled={disabled}
                  disableFocusRipple
                  disableRipple
                  disableTouchRipple
                  edge="end"
                  sx={{
                    minWidth: '40px',
                    '& .Mui-disabled': {
                      ...((preventDisabledColor || readOnly) && { color: 'inherit !important' })
                    }
                  }}
                />
              </div>
            </>
          )}
        </StyledListInputInner>

        <StyledHelperText />
      </StyledListInputWrapper>
    </StyledListInputButtonRoot>
  );
});

export const SwitchListInput = ({ preventRender = false, value, ...props }: SwitchListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<boolean>({
    value: Boolean(value),
    rawValue: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SwitchListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as SwitchListInputController}
      props={{ preventRender, rawValue: value, value, validationStatus, validationMessage, ...props }}
    >
      <WrappedSwitchListInput />
    </PropProvider>
  );
};

SwitchListInput.displayName = 'SwitchListInput';

export const BooleanListInput = SwitchListInput;
