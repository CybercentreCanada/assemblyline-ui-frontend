import type { ChipProps, TooltipProps } from '@mui/material';
import { Chip, Tooltip, styled } from '@mui/material';
import { darken } from '@mui/material/styles';
import type { PossibleColor } from 'helpers/colors';
import type { FC } from 'react';
import { memo } from 'react';

export const SIZE_MAP: Record<ChipProps['size'], ChipProps['size']> = {
  small: 'small',
  medium: 'medium'
} as const;

export const COLOR_MAP: Partial<Record<string, PossibleColor>> = {
  'label-default': 'default',
  'label-primary': 'primary',
  'label-secondary': 'secondary',
  'label-info': 'info',
  'label-success': 'success',
  'label-warning': 'warning',
  'label-error': 'error',
  default: 'default',
  primary: 'primary',
  secondary: 'secondary',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error'
} as const;

type StyledChipProps = Omit<ChipProps, 'color' | 'size'> & {
  color?: PossibleColor;
  fullWidth?: boolean;
  mono?: boolean;
  size?: ChipProps['size'] | 'tiny';
  type?: 'round' | 'square' | 'rounded';
  wrap?: boolean;
};

const StyledChip: FC<StyledChipProps> = memo(
  styled(
    ({ color = 'default', size = 'medium', variant = 'filled', ...props }: StyledChipProps) => (
      <Chip
        color={color in COLOR_MAP ? COLOR_MAP[color] : 'default'}
        size={size in SIZE_MAP ? SIZE_MAP[size as keyof typeof SIZE_MAP] : 'medium'}
        variant={variant}
        {...props}
      />
    ),
    {
      shouldForwardProp: prop =>
        prop !== 'fullWidth' && prop !== 'mono' && prop !== 'size' && prop !== 'type' && prop !== 'wrap'
    }
  )<StyledChipProps>(
    ({
      color = 'default',
      fullWidth = false,
      mono = false,
      size = 'medium',
      theme,
      type = 'round',
      variant = 'filled',
      wrap = false
    }) => ({
      ...(!mono
        ? null
        : size === 'tiny'
          ? { fontFamily: 'monospace', fontSize: '1rem' }
          : { fontFamily: 'monospace', fontSize: '1.15rem' }),

      ...(!wrap ? null : { height: 'auto' }),
      ...(!fullWidth ? null : { width: '100%' }),

      ...{
        square: { borderRadius: '0px', margin: '2px 4px 2px 0' },
        rounded: { borderRadius: '3px', margin: '2px 4px 2px 0' },
        round: null
      }?.[type],

      ...{
        tiny: { height: '20px', fontSize: '0.775rem' },
        small: null,
        medium: null
      }?.[size],

      ...(variant === 'outlined'
        ? {
            default: {},
            primary: {},
            secondary: {},
            success: {
              borderColor: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light,
              color: theme.palette.mode !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
            },
            warning: {
              borderColor: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light,
              color: theme.palette.mode !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
            },
            error: {
              borderColor: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light,
              color: theme.palette.mode !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
            },
            info: {
              borderColor: theme.palette.mode !== 'dark' ? theme.palette.info.dark : theme.palette.info.light,
              color: theme.palette.mode !== 'dark' ? theme.palette.info.dark : theme.palette.info.light
            }
          }?.[color]
        : {
            default: {
              backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#999',
              color: theme.palette.common.white,
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: darken(theme.palette.mode === 'dark' ? '#616161' : '#999', 0.2)
              }
            },
            primary: {
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: theme.palette.primary.dark
              }
            },
            secondary: {
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: theme.palette.secondary.dark
              }
            },
            success: {
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: theme.palette.success.dark
              }
            },
            warning: {
              backgroundColor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText,
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: theme.palette.warning.dark
              }
            },
            error: {
              backgroundColor: theme.palette.error.dark,
              color: theme.palette.error.contrastText,
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: darken(theme.palette.error.dark, 0.25)
              }
            },
            info: {
              backgroundColor: theme.palette.info.main,
              color: theme.palette.info.contrastText,
              '[role=button]&:hover, [role=button]&:focus': {
                backgroundColor: theme.palette.info.dark
              }
            }
          }?.[color]),

      ['& .MuiChip-label']: {
        ...{
          tiny: { paddingLeft: '6px', paddingRight: '6px' },
          small: null,
          medium: null
        }?.[size],

        ...(!wrap
          ? null
          : {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              paddingTop: '2px',
              paddingBottom: '2px'
            })
      },

      ['& .MuiChip-icon']: {
        ...(variant === 'outlined' ? null : { color: theme.palette.common.white })
      }
    })
  )
);

export type CustomChipProps = StyledChipProps & {
  tooltip?: TooltipProps['title'];
  tooltipPlacement?: TooltipProps['placement'];
};

export const CustomChip: FC<CustomChipProps> = memo(
  ({ tooltip = null, tooltipPlacement = 'bottom', ...chipProps }: CustomChipProps) =>
    tooltip ? (
      <Tooltip
        title={tooltip}
        placement={tooltipPlacement}
        disableInteractive
        slotProps={{ popper: { disablePortal: true } }}
      >
        <StyledChip {...chipProps} />
      </Tooltip>
    ) : (
      <StyledChip {...chipProps} />
    )
);

export default CustomChip;
