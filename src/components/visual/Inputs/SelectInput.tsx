import type { IconButtonProps, SelectChangeEvent, SelectProps, TooltipProps, TypographyProps } from '@mui/material';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useTheme
} from '@mui/material';
import { Tooltip } from 'components/visual/Tooltip';
import React from 'react';
import type { ResetInputProps } from './components/ResetInput';
import { ResetInput } from './components/ResetInput';

type Props = Omit<SelectProps, 'onChange'> & {
  hasEmpty?: boolean;
  items: string[];
  label?: string;
  labelProps?: TypographyProps;
  loading?: boolean;
  preventDisabledColor?: boolean;
  preventRender?: boolean;
  reset?: boolean;
  resetProps?: ResetInputProps;
  tooltip?: TooltipProps['title'];
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
  onChange?: (event: SelectChangeEvent<unknown>, value: string) => void;
  onReset?: IconButtonProps['onClick'];
};

const WrappedSelectInput = ({
  disabled,
  hasEmpty = false,
  id = null,
  items = [],
  label,
  labelProps,
  loading = false,
  preventDisabledColor = false,
  preventRender = false,
  reset = false,
  resetProps = null,
  tooltip = null,
  tooltipProps = null,
  value,
  onChange = () => null,
  onReset = () => null,
  ...selectProps
}: Props) => {
  const theme = useTheme();

  return preventRender ? null : (
    <div>
      <Tooltip title={tooltip} {...tooltipProps}>
        <Typography
          component={InputLabel}
          htmlFor={id || label}
          variant="body2"
          whiteSpace="nowrap"
          gutterBottom
          sx={{
            ...(disabled &&
              !preventDisabledColor && {
                WebkitTextFillColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.38)'
              })
          }}
          {...labelProps}
          children={label}
        />
      </Tooltip>
      <FormControl fullWidth>
        {loading ? (
          <Skeleton sx={{ height: '40px', transform: 'unset' }} />
        ) : (
          <Select
            variant="outlined"
            size="small"
            fullWidth
            disabled={disabled}
            displayEmpty
            inputProps={{ id: id || label }}
            value={items.includes(value as string) ? value : ''}
            sx={{ textTransform: 'capitalize' }}
            onChange={event => onChange(event, event.target.value as string)}
            endAdornment={
              !reset ? null : (
                <InputAdornment position="end" style={{ marginRight: theme.spacing(2) }}>
                  <ResetInput id={id || label} preventRender={!reset || disabled} onReset={onReset} {...resetProps} />
                </InputAdornment>
              )
            }
            {...selectProps}
          >
            {hasEmpty && <MenuItem value="" sx={{ height: '36px' }}></MenuItem>}
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
};

export const SelectInput = React.memo(WrappedSelectInput);
