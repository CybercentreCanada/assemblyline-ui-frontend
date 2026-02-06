import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import {
  HelpInputAdornment,
  PasswordInputAdornment,
  ProgressInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { useInputChange } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputValidation } from 'components/visual/Inputs/hooks/inputs.hook.validation';
import type { InputRuntimeState, InputValueModel } from 'components/visual/Inputs/models/inputs.model';
import {
  ListInputHelperText,
  ListInputInner,
  ListInputLoading,
  ListInputRoot,
  ListInputText,
  ListInputWrapper
} from 'components/visual/ListInputs/lib/listinputs.components';
import type { ListInputOptions, ListInputSlotProps } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type ClassificationListInputProps = InputValueModel<ClassificationProps['c12n']> &
  ListInputOptions &
  ListInputSlotProps &
  Omit<ClassificationProps, 'c12n' | 'setClassification'>;

type ClassificationListInputController = ClassificationListInputProps & InputRuntimeState<ClassificationProps['c12n']>;

const WrappedClassificationListInput = React.memo(() => {
  const [get] = usePropStore<ClassificationListInputController>();

  const disabled = get('disabled') ?? false;
  const loading = get('loading') ?? false;
  const readOnly = get('readOnly') ?? false;
  const value = get('value');
  const width = get('width');

  const handleChange = useInputChange<ClassificationProps['c12n']>();

  return (
    <ListInputRoot>
      <ListInputWrapper>
        <ListInputInner>
          <ListInputText noLabel />

          {loading ? (
            <ListInputLoading />
          ) : (
            <>
              <HelpInputAdornment />
              <PasswordInputAdornment />
              <ProgressInputAdornment />
              <ResetInputAdornment />
              <div style={{ maxWidth: width, minWidth: width, width: '100%' }}>
                <Classification
                  type={!disabled && !readOnly ? 'picker' : 'pill'}
                  size="small"
                  c12n={value}
                  disabled={disabled}
                  setClassification={c => handleChange(null, c)}
                />
              </div>
            </>
          )}
        </ListInputInner>

        <ListInputHelperText />
      </ListInputWrapper>
    </ListInputRoot>
  );
});

export const ClassificationListInput = ({ preventRender = false, value, ...props }: ClassificationListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<ClassificationProps['c12n']>({
    value: value,
    ...props
  });

  return preventRender ? null : (
    <PropProvider<ClassificationListInputController>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as ClassificationListInputController}
      props={{
        dynGroup: null,
        format: 'short',
        fullWidth: true,
        inline: false,
        rawValue: value,
        isUser: false,
        preventRender,
        value,
        validationStatus,
        validationMessage,
        ...props
      }}
    >
      <WrappedClassificationListInput />
    </PropProvider>
  );
};

ClassificationListInput.displayName = 'ClassificationListInput';
