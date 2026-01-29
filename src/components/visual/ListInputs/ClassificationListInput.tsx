import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import { useValidation } from 'components/visual/Inputs/lib/inputs.hook';
import {
  StyledHelperText,
  StyledListInputInner,
  StyledListInputLoading,
  StyledListInputText,
  StyledListInputWrapper,
  StyledListItemRoot,
  StyledPasswordAdornment,
  StyledResetAdornment
} from 'components/visual/ListInputs/lib/listinputs.components';
import { useInputChange } from 'components/visual/ListInputs/lib/listinputs.hook';
import type {
  ListInputOptions,
  ListInputRuntimeState,
  ListInputValueModel
} from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type ClassificationListInputProps = ListInputValueModel<ClassificationProps['c12n']> &
  ListInputOptions &
  Omit<ClassificationProps, 'c12n' | 'setClassification'>;

type ClassificationListInputController = ClassificationListInputProps & ListInputRuntimeState;

const WrappedClassificationListInput = React.memo(() => {
  const [get] = usePropStore<ClassificationListInputController>();

  const disabled = get('disabled') ?? false;
  const loading = get('loading') ?? false;
  const readOnly = get('readOnly') ?? false;
  const value = get('value');
  const width = get('width');

  const handleChange = useInputChange<ClassificationProps['c12n']>();

  return (
    <StyledListItemRoot>
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText noLabel />

          {loading ? (
            <StyledListInputLoading />
          ) : (
            <>
              <StyledPasswordAdornment />
              <StyledResetAdornment />
              <div style={{ maxWidth: width, minWidth: width, width: '100%' }}>
                <Classification
                  type={!disabled && !readOnly ? 'picker' : 'pill'}
                  size="small"
                  c12n={value}
                  disabled={disabled}
                  setClassification={c => handleChange(null, c, c)}
                />
              </div>
            </>
          )}
        </StyledListInputInner>

        <StyledHelperText />
      </StyledListInputWrapper>
    </StyledListItemRoot>
  );
});

export const ClassificationListInput = ({ preventRender = false, value, ...props }: ClassificationListInputProps) => {
  const { status: validationStatus, message: validationMessage } = useValidation<ClassificationProps['c12n']>({
    value: value,
    rawValue: value,
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
