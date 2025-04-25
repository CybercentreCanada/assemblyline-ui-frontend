import type { TooltipProps } from '@mui/material';
import { Tooltip, styled } from '@mui/material';
import { darken } from '@mui/material/styles';
import { EnrichedChip } from 'borealis-ui';
import type { CustomChipProps } from 'components/visual/CustomChip';
import { COLOR_MAP, SIZE_MAP } from 'components/visual/CustomChip';
import type { FC } from 'react';
import { memo } from 'react';

export const BOREALIS_TYPE_MAP = {
  'network.static.ip': 'ip',
  'network.dynamic.ip': 'ip',
  'network.static.domain': 'domain',
  'network.dynamic.domain': 'domain',
  'network.static.uri': 'url',
  'network.dynamic.uri': 'url',
  md5: 'md5',
  sha1: 'sha1',
  sha256: 'sha256',
  'email.address': 'eml_address'
} as const;

export type StyledEnrichedChipProps = CustomChipProps & {
  dataType: string;
  dataValue: string;
  dataClassification?: string;
  contextIcon?: boolean;
  counters?: boolean;
  hideDetails?: boolean;
  showPreview?: boolean;
  hideLoading?: boolean;
  forceDetails?: boolean;
  setForceDetails?: (value: boolean) => void;
};

const StyledEnrichedChip: FC<StyledEnrichedChipProps> = memo(
  styled(
    ({
      color = 'default',
      contextIcon = false,
      counters = false,
      dataClassification,
      dataType,
      dataValue,
      forceDetails = false,
      hideDetails = false,
      hideLoading = false,
      setForceDetails = null,
      showPreview = false,
      size = 'medium',
      variant = 'outlined',
      ...props
    }: StyledEnrichedChipProps) => (
      <EnrichedChip
        type={dataType}
        value={dataValue}
        classification={dataClassification}
        contextIcon={contextIcon}
        counters={counters}
        hideDetails={hideDetails}
        showPreview={showPreview}
        hideLoading={hideLoading}
        color={COLOR_MAP?.[color]}
        size={SIZE_MAP?.[size]}
        variant={variant}
        forceDetails={forceDetails}
        setForceDetails={setForceDetails}
        sx={{ '& .iconify': { marginLeft: '8px', flexShrink: 0 } }}
        {...props}
      />
    )
  )<StyledEnrichedChipProps>(
    ({
      color = 'default',
      fullWidth = false,
      mono = false,
      size = 'medium',
      theme,
      type = 'round',
      variant = 'outlined',
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
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: darken(theme.palette.mode === 'dark' ? '#616161' : '#999', 0.2)
              }
            },
            primary: {
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: theme.palette.primary.dark
              }
            },
            secondary: {
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: theme.palette.secondary.dark
              }
            },
            success: {
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: theme.palette.success.dark
              }
            },
            warning: {
              backgroundColor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText,
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: theme.palette.warning.dark
              }
            },
            error: {
              backgroundColor: theme.palette.error.dark,
              color: theme.palette.error.contrastText,
              ['[role=button]&:hover, [role=button]&:focus']: {
                backgroundColor: darken(theme.palette.error.dark, 0.25)
              }
            },
            info: {
              backgroundColor: theme.palette.info.main,
              color: theme.palette.info.contrastText,
              ['[role=button]&:hover, [role=button]&:focus']: {
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

export type EnrichmentCustomChipProps = StyledEnrichedChipProps & {
  tooltip?: TooltipProps['title'];
  tooltipPlacement?: TooltipProps['placement'];
};

export const EnrichmentCustomChip: FC<EnrichmentCustomChipProps> = memo(
  ({ tooltip = null, tooltipPlacement = 'bottom', ...chipProps }: EnrichmentCustomChipProps) =>
    tooltip ? (
      <Tooltip
        title={tooltip}
        placement={tooltipPlacement}
        disableInteractive
        slotProps={{ popper: { disablePortal: true } }}
      >
        <StyledEnrichedChip {...chipProps} />
      </Tooltip>
    ) : (
      <StyledEnrichedChip {...chipProps} />
    )
);

export default EnrichmentCustomChip;
