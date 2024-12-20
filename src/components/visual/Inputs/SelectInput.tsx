import type { IconButtonProps, SelectChangeEvent, SelectProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SelectProps, 'onChange'> & {
  items: string[];
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectInput = ({
  disabled,
  id = null,
  items = [],
  label,
  labelProps,
  loading = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  ...selectProps
}: Props) =>
  preventRender ? null : (
    <div>
      <Typography
        component={InputLabel}
        htmlFor={id || label}
        variant="body2"
        whiteSpace="nowrap"
        gutterBottom
        {...labelProps}
        children={label}
      />
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <Select
            variant="outlined"
            size="small"
            fullWidth
            displayEmpty
            inputProps={{ id: id || label }}
            value={items.includes(value as string) ? value : ''}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => onChange(event, event.target.value as string)}
            endAdornment={
              !reset ? null : (
                <InputAdornment position="end">
                  <ResetInput id={id || label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
                </InputAdornment>
              )
            }
            {...selectProps}
          >
            <MenuItem value="" sx={{ height: '36px' }}></MenuItem>
            {items.map((item, i) => (
              <MenuItem key={i} value={item} sx={{ textTransform: 'capitalize' }}>
                {item.replaceAll('_', ' ')}
              </MenuItem>
            ))}
          </Select>
        )}
      </FormControl>
    </div>
  );

export const SelectInput = React.memo(WrappedSelectInput);
