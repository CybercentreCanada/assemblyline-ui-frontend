import type { ClassificationProps } from 'components/visual/Classification';
import Classification from 'components/visual/Classification';
import { useErrorCallback } from 'components/visual/Inputs/lib/inputs.hook';
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
import type { ListInputProps, ListInputValues } from 'components/visual/ListInputs/lib/listinputs.model';
import { PropProvider, usePropStore } from 'components/visual/ListInputs/lib/listinputs.provider';
import React from 'react';

export type ClassificationListInputProps = ListInputValues<ClassificationProps['c12n']> &
  ListInputProps &
  Omit<ClassificationProps, 'c12n' | 'setClassification'>;

const WrappedClassificationListInput = React.memo(() => {
  const [get] = usePropStore<ClassificationListInputProps>();

  const disabled = get('disabled') ?? false;
  const loading = get('loading') ?? false;
  const readOnly = get('readOnly') ?? false;
  const value = get('value');
  const width = get('width');

  const handleChange = useInputChange<ClassificationListInputProps>();

  return (
    <StyledListItemRoot>
      <StyledListInputWrapper>
        <StyledListInputInner>
          <StyledListInputText />

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
  const errorMessage = useErrorCallback({ preventRender, value, ...props });

  return preventRender ? null : (
    <PropProvider<ClassificationListInputProps>
      props={{
        dynGroup: null,
        errorMessage,
        format: 'short',
        fullWidth: true,
        inline: false,
        inputValue: value,
        isUser: false,
        preventRender,
        value,
        ...props
      }}
    >
      <WrappedClassificationListInput />
    </PropProvider>
  );
};

ClassificationListInput.displayName = 'ClassificationListInput';
