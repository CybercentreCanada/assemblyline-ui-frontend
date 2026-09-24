import { Switch } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  HelpInputAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { InputHelperText } from 'components/visual/Inputs/components/inputs.component.form';
import {
  useInputClick,
  useInputClickBlur,
  useInputFocus
} from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  ListInputButtonRoot,
  ListInputInner,
  ListInputLoading,
  ListInputText,
  ListInputWrapper
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions, ListInputSlotProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type SwitchListInputProps = InputValueModel<boolean, React.MouseEvent<HTMLDivElement, MouseEvent>> &
  ListInputOptions &
  ListInputSlotProps;

type SwitchListInputController = SwitchListInputProps & InputRuntimeState<boolean>;

const WrappedSwitchListInput = React.memo(() => {
  const [get] = usePropStore<SwitchListInputController>();

  const id = useInputId();
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
    <ListInputButtonRoot
      onFocus={handleFocus}
      onBlur={e => handleBlur(e, value, rawValue)}
      onClick={event => handleClick(event, !rawValue)}
    >
      <ListInputWrapper>
        <ListInputInner>
          <ListInputText />

          {loading ? (
            <ListInputLoading />
          ) : (
            <>
              <HelpInputAdornment />
              <PasswordInputAdornment />
              <ProgressInputAdornment />
              <ResetInputAdornment />
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
        </ListInputInner>

        <InputHelperText sx={{ width: '100%', justifyContent: 'flex-end', margin: 0 }} />
      </ListInputWrapper>
    </ListInputButtonRoot>
  );
});

export const SwitchListInput = ({ preventRender = false, value, ...props }: SwitchListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<boolean>({
    value: Boolean(value),
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SwitchListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as SwitchListInputController}
      props={{ preventRender, rawValue: Boolean(value), value, validationStatus, validationMessage, ...props }}
    >
      <WrappedSwitchListInput />
    </PropProvider>
  );
};

SwitchListInput.displayName = 'SwitchListInput';

export const BooleanListInput = SwitchListInput;
