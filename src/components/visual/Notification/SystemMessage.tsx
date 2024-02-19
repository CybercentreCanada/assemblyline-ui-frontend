import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Badge, BadgeProps, Box, BoxProps, styled, SvgIconProps } from '@mui/material';
import { blue } from '@mui/material/colors';
import { Severity, SeveritySchema } from 'components/models/system_message';
import 'moment-timezone';
import 'moment/locale/fr';
import { FC, forwardRef, memo } from 'react';

interface SeverityIconProps extends SvgIconProps {
  severity: Severity;
}

export const SeverityIcon: FC<SeverityIconProps> = memo(
  styled(
    ({ severity, ...other }: SeverityIconProps) =>
      !SeveritySchema.parse(severity) ? (
        <NotificationsOutlinedIcon {...other} />
      ) : (
        {
          success: <CheckCircleOutlinedIcon {...other} />,
          info: <InfoOutlinedIcon {...other} />,
          warning: <ReportProblemOutlinedIcon {...other} />,
          error: <ErrorOutlineOutlinedIcon {...other} />
        }[severity]
      ),
    {
      shouldForwardProp: prop => prop !== 'severity'
    }
  )<SeverityIconProps>(({ theme, severity }) => ({
    color: 'inherit',
    backgroundColor: 'inherit',
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    ...(SeveritySchema.parse(severity) && {
      color: {
        success: theme.palette.success.main,
        info: blue[500],
        warning: theme.palette.warning.main,
        error: theme.palette.error.main
      }[severity]
    })
  }))
);

interface SeverityBadgeProps extends BadgeProps {
  severity: Severity;
}

export const SeverityBadge: FC<SeverityBadgeProps> = memo(
  styled(({ ...other }: SeverityBadgeProps) => <Badge {...other} />, {
    shouldForwardProp: prop => prop !== 'severity'
  })<SeverityIconProps>(({ theme, severity }) => ({
    '& .MuiBadge-badge': {
      color: theme.palette.getContrastText(theme.palette.primary.main),
      backgroundColor: theme.palette.primary.main,
      ...(SeveritySchema.parse(severity) && {
        backgroundColor: {
          success: theme.palette.success.main,
          info: blue[500],
          warning: theme.palette.warning.main,
          error: theme.palette.error.main
        }[severity]
      })
    }
  }))
);

interface StyledSeverityProps extends BoxProps {
  component?: any;
  severity?: Severity;
  setColor?: boolean;
  setBackgroundColor?: boolean;
  faded?: boolean;
  color?: any;
}

export const StyledSeverity = memo(
  styled(
    forwardRef(
      (
        { component: Component = null, severity, setColor, setBackgroundColor, faded, ...other }: StyledSeverityProps,
        ref
      ) => <Box {...other} ref={ref} />
    ),
    {
      shouldForwardProp: props =>
        props !== 'severity' &&
        props !== 'setColor' &&
        props !== 'setBackgroundColor' &&
        props !== 'faded' &&
        props !== 'color'
    }
  )<StyledSeverityProps>(({ theme, severity, setColor = false, setBackgroundColor = false, faded = false, color }) => ({
    color: color,
    ...(setColor &&
      SeveritySchema.parse(severity) && {
        color: {
          0: {
            success: `${theme.palette.success.main} !important`,
            info: `${blue[500]} !important`,
            warning: `${theme.palette.warning.main} !important`,
            error: `${theme.palette.error.main} !important`
          },
          1: {
            success: `${theme.palette.mode === 'dark' ? 'rgb(183, 223, 185)' : 'rgb(30, 70, 32)'} !important`,
            info: `${theme.palette.mode === 'dark' ? 'rgb(166, 213, 250)' : 'rgb(13, 60, 97)'} !important`,
            warning: `${theme.palette.mode === 'dark' ? 'rgb(255, 213, 153)' : 'rgb(102, 60, 0)'} !important`,
            error: `${theme.palette.mode === 'dark' ? 'rgb(250, 179, 174)' : 'rgb(97, 26, 21)'} !important`
          },
          2: {
            success: `${theme.palette.getContrastText(theme.palette.success.main)} !important`,
            info: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
            warning: `${theme.palette.getContrastText(theme.palette.warning.main)} !important`,
            error: `${theme.palette.getContrastText(theme.palette.error.main)} !important`
          }
        }[faded ? 1 : 0][severity]
      }),
    ...(setBackgroundColor &&
      SeveritySchema.parse(severity) && {
        backgroundColor: {
          0: {
            success: `${theme.palette.success.main} !important`,
            info: `${blue[500]} !important`,
            warning: `${theme.palette.warning.main} !important`,
            error: `${theme.palette.error.main} !important`
          },
          1: {
            success: `${theme.palette.mode === 'dark' ? 'rgb(7, 17, 7)' : 'rgb(237, 247, 237)'} !important`,
            info: `${theme.palette.mode === 'dark' ? 'rgb(3, 14, 24)' : 'rgb(232, 244, 253)'} !important`,
            warning: `${theme.palette.mode === 'dark' ? 'rgb(25, 15, 0)' : 'rgb(255, 244, 229)'} !important`,
            error: `${theme.palette.mode === 'dark' ? 'rgb(24, 6, 5)' : 'rgb(253, 236, 234)'} !important`
          },
          2: {
            success: `${theme.palette.getContrastText(theme.palette.success.main)} !important`,
            info: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
            warning: `${theme.palette.getContrastText(theme.palette.warning.main)} !important`,
            error: `${theme.palette.getContrastText(theme.palette.error.main)} !important`
          }
        }[faded ? 1 : 0][severity]
      })
  }))
);
