import { Switch } from '@mui/material';
import { useErrorCallback } from 'components/visual/Inputs/lib/inputs.hook';
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
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React from 'react';

export type SwitchListInputProps = ListInputValues<boolean, boolean, React.MouseEvent<HTMLDivElement, MouseEvent>> &
  ListInputProps;

const WrappedSwitchListInput = React.memo(() => {
  const [get] = usePropStore<SwitchListInputProps>();

  const id = usePropID();
  const inputValue = Boolean(get('inputValue'));
  const loading = get('loading');
  const preventDisabledColor = get('preventDisabledColor');
  const readOnly = get('readOnly');
  const value = get('value');
  const disabled = get('disabled');

  const handleBlur = useInputClickBlur<SwitchListInputProps>();
  const handleClick = useInputClick<SwitchListInputProps>();
  const handleFocus = useInputFocus<SwitchListInputProps>();

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
                  checked={inputValue}
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
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<SwitchListInputProps> props={{ preventRender, inputValue: value, value, errorMessage, ...props }}>
      <WrappedSwitchListInput />
    </PropProvider>
  );
};

SwitchListInput.displayName = 'SwitchListInput';

export const BooleanListInput = SwitchListInput;
