import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { useMemo, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { LeftNavChildRenderProps, LeftNavItemProps } from '.';
import { useAppLeftNav } from '../../app';

export const LeftNavItem: FC<LeftNavItemProps & LeftNavChildRenderProps> = ({
  icon,
  label,
  i18nKey,
  tooltipI18nKey,
  level,
  active,
  activeParent,
  context,
  children
}) => {
  const { t: clientT } = useTranslation();
  const { open: navopen } = useAppLeftNav();

  const tooltip = useMemo(() => {
    if (tooltipI18nKey) {
      return clientT(tooltipI18nKey);
    }
    return !navopen && level === 0 ? (i18nKey ? clientT(i18nKey) : label) : '';
  }, [navopen, clientT, level, i18nKey, label, tooltipI18nKey]);

  return (
    <Tooltip title={tooltip} placement="right">
      <Stack direction="row" alignItems="center" position="relative" width="100%">
        <Stack
          direction="row"
          alignItems="center"
          pt={1.5}
          pb={1.5}
          pl={context === 'accordion' ? (level === 0 ? 0 : 2 * level) : 0}
          pr={context === 'accordion' ? 2 : 0}
          width="100%"
          className={`${active ? 'active' : ''} ${activeParent ? 'active_parent' : ''}`}
          position="relative"
          zIndex={0}
          sx={theme => ({
            '& > *': {
              zIndex: 1
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: theme.spacing(1.5),
              left: theme.spacing(0.75),
              bottom: theme.spacing(1.5),
              width: '4px',
              borderRadius: 1,
              bgcolor: 'transparent',
              zIndex: 0
            },
            '&.active_parent::before': {
              bgcolor: 'primary.main',
              top: '50%',
              bottom: 'auto',
              height: theme.spacing(0.5),
              width: theme.spacing(0.5),
              borderRadius: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 0,
              opacity: 0,
              zIndex: 0
            },
            '&.active::after': {
              opacity: 0.1,
              top: theme.spacing(1),
              right: context === 'popper' || navopen ? theme.spacing(1.5) : theme.spacing(1.25),
              bottom: theme.spacing(1),
              left: theme.spacing(1.375),
              borderRadius: 1,
              bgcolor: theme.palette.primary.main
            },
            '&:hover::after': {
              opacity: 1,
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 0,
              background: theme.palette.action.hover
            }
          })}
        >
          <Box
            sx={theme => ({
              display: icon ? 'inline-flex' : 'none',
              flexShrink: 0,
              minWidth: `max(${theme.spacing(7)}, 42px)`,
              justifyContent: 'center'
            })}
          >
            {icon}
          </Box>
          <Typography ml={icon && level > 0 ? 0 : 2} mr={i18nKey || label ? 1 : 0}>
            {i18nKey ? clientT(i18nKey) : label}
          </Typography>
          {children}
        </Stack>
      </Stack>
    </Tooltip>
  );
};
