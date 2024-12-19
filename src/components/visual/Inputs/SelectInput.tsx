import type { IconButtonProps, SelectChangeEvent, SelectProps, TypographyProps } from '@mui/material';
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, Skeleton, Typography } from '@mui/material';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SelectProps, 'onChange'> & {
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventRender?: boolean;
  items: string[];
  reset?: boolean;
  resetProps?: ResetInputProps;
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectInput = ({
  label,
  labelProps,
  loading = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  items = [],
  value,
  disabled,
  onChange = () => null,
  onReset = () => null,
  ...selectProps
}: Props) =>
  preventRender ? null : (
    <div>
      <Typography
        component={InputLabel}
        htmlFor={label}
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
            inputProps={{ id: label }}
            value={items.includes(value as string) ? value : ''}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => onChange(event, event.target.value as string)}
            endAdornment={
              !reset ? null : (
                <InputAdornment position="end">
                  <ResetInput label={label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
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
