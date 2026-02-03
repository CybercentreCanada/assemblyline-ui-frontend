import type { ListItemTextProps, MenuItemProps, SelectProps } from '@mui/material';
import { ListItemText, MenuItem, Select, useTheme } from '@mui/material';
import { PropProvider, usePropStore } from 'components/core/PropProvider/PropProvider';
import {
  PasswordInputAdornment,
  ResetInputAdornment
} from 'components/visual/Inputs/components/inputs.component.adornment';
import { InputListItemText } from 'components/visual/Inputs/components/inputs.component.form';
import { useInputBlur, useInputChange, useInputFocus } from 'components/visual/Inputs/hooks/inputs.hook.event_handlers';
import { useInputId } from 'components/visual/Inputs/hooks/inputs.hook.renderer';
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
import type { ListInputOptions } from 'components/visual/ListInputs/lib/listinputs.model';
import { DEFAULT_LIST_INPUT_CONTROLLER_PROPS } from 'components/visual/ListInputs/lib/listinputs.model';
import React from 'react';

export type Option = {
  primary: ListItemTextProps['primary'];
  secondary?: ListItemTextProps['secondary'];
  value: MenuItemProps['value'] | boolean;
};

export type SelectListInputProps<O extends readonly Option[]> = InputValueModel<
  O[number]['value'],
  O[number]['value']
> &
  ListInputOptions & {
    displayEmpty?: SelectProps['displayEmpty'];
    options?: O;
  };

type SelectListInputController<O extends readonly Option[]> = SelectListInputProps<O> & InputRuntimeState;

const WrappedSelectListInput = <O extends readonly Option[]>() => {
  const theme = useTheme();

  const [get, setStore] = usePropStore<SelectListInputController<O>>();

  const capitalize = get('capitalize');
  const disabled = get('disabled');
  const displayEmpty = get('displayEmpty');
  const id = useInputId();
  const isMenuOpen = get('isMenuOpen');
  const isPasswordVisible = get('isPasswordVisible');
  const loading = get('loading');
  const monospace = get('monospace');
  const options = get('options');
  const overflowHidden = get('overflowHidden');
  const password = get('password');
  const rawValue = get('rawValue');
  const readOnly = get('readOnly');
  const tiny = get('tiny');
  const validationStatus = get('validationStatus');
  const value = get('value');
  const width = get('width');

  const handleBlur = useInputBlur<O[number]['value']>();
  const handleChange = useInputChange<O[number]['value']>();
  const handleFocus = useInputFocus<O[number]['value']>();

  return (
    <ListInputRoot>
      <ListInputWrapper>
        <ListInputInner>
          <ListInputText />

          {loading ? (
            <ListInputLoading />
          ) : (
            <>
              <PasswordInputAdornment />
              <ResetInputAdornment />
              <Select
                disabled={disabled}
                displayEmpty={displayEmpty}
                error={validationStatus === 'error'}
                fullWidth
                id={id}
                readOnly={readOnly}
                size="small"
                open={isMenuOpen}
                value={options?.some(o => o.value === rawValue) ? rawValue : ''}
                onChange={event => handleChange(event as React.SyntheticEvent, event.target.value, event.target.value)}
                onFocus={handleFocus}
                onBlur={e => handleBlur(e, value, value)}
                onClose={() => setStore({ isMenuOpen: false })}
                onOpen={() => setStore({ isMenuOpen: true })}
                renderValue={option => (
                  <ListItemText
                    primary={options?.find(o => o.value === option)?.primary || ''}
                    sx={{
                      margin: 0,
                      '&:hover>*': {
                        overflow: 'auto',
                        whiteSpace: 'wrap'
                      }
                    }}
                    slotProps={{
                      primary: {
                        ...(tiny && { variant: 'body2' }),
                        sx: {
                          ...(overflowHidden
                            ? {
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            : {
                                whiteSpace: 'wrap',
                                overflow: 'auto',
                                textOverflow: 'ellipsis'
                              })
                        },
                        style: {
                          paddingRight: '0px',
                          cursor: 'pointer',
                          ...(disabled && { cursor: 'default', userSelect: 'text' }),
                          ...(capitalize && { textTransform: 'capitalize' }),
                          ...(readOnly && { cursor: 'default', userSelect: 'text' }),
                          ...(monospace && { fontFamily: 'monospace' }),
                          ...(password &&
                            isPasswordVisible && {
                              fontFamily: 'password',
                              WebkitTextSecurity: 'disc',
                              MozTextSecurity: 'disc',
                              textSecurity: 'disc'
                            })
                        }
                      }
                    }}
                  />
                )}
                slotProps={{ input: { id: id } }}
                sx={{
                  maxWidth: width,
                  minWidth: width,
                  '&.MuiInputBase-root': {
                    ...(!tiny && { minHeight: '40px' })
                  },
                  '& .MuiSelect-select': {
                    ...(tiny && {
                      padding: '4.5px 8px 4.5px 14px !important'
                    })
                  }
                }}
              >
                {options.map((option, i) => (
                  <MenuItem
                    key={i}
                    value={option.value as MenuItemProps['value']}
                    sx={{
                      '&>label': { margin: 0, cursor: 'pointer !important', maxWidth: theme.breakpoints.values.sm },
                      ...(capitalize && { textTransform: 'capitalize' })
                    }}
                  >
                    <InputListItemText
                      primary={option.primary ? option.primary : '\u00A0'}
                      secondary={option.secondary}
                      slotProps={{
                        primary: {
                          overflow: 'auto',
                          textOverflow: 'initial',
                          whiteSpace: 'normal',
                          maxWidth: theme.breakpoints.values.sm
                        },
                        secondary: {
                          overflow: 'auto',
                          textOverflow: 'initial',
                          whiteSpace: 'normal',
                          maxWidth: theme.breakpoints.values.sm
                        }
                      }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </ListInputInner>

        <ListInputHelperText />
      </ListInputWrapper>
    </ListInputRoot>
  );
};

export const SelectListInput = <O extends readonly Option[]>({
  preventRender = false,
  value,
  ...props
}: SelectListInputProps<O>) => {
  const { status: validationStatus, message: validationMessage } = useInputValidation<O[number]['value']>({
    value: value ?? '',
    rawValue: value ?? '',
    ...props
  });

  return preventRender ? null : (
    <PropProvider<SelectListInputController<O>>
      initialProps={DEFAULT_LIST_INPUT_CONTROLLER_PROPS as SelectListInputController<O>}
      props={{
        capitalize: false,
        displayEmpty: false,
        rawValue: value,
        options: [] as unknown as O,
        overflowHidden: true,
        preventRender,
        validationStatus,
        validationMessage,
        value,
        ...props
      }}
    >
      <WrappedSelectListInput<O> />
    </PropProvider>
  );
};

SelectListInput.displayName = 'SelectListInput';
