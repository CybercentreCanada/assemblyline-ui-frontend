import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse, useTheme } from '@mui/material';
import type { Error } from 'components/models/base/error';
import Moment from 'components/visual/Moment';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  error: Error;
};

type CardColors = {
  background: string;
  border: string;
  header: string;
  headerHover: string;
};

const ERROR_COLORS: CardColors = {
  background: '#fce9e9',
  border: '#ffcbcb',
  header: '#ffd9d9',
  headerHover: '#ffc5c5'
};

const ERROR_COLORS_DARK: CardColors = {
  background: '#371a1a',
  border: '#502121',
  header: '#502121',
  headerHover: '#6e2b2b'
};

// Match the red card tone but on a yellow/amber hue for warnings.
const WARNING_COLORS: CardColors = {
  background: '#fcf7e9',
  border: '#ffebcb',
  header: '#fff1d9',
  headerHover: '#ffe6c0'
};

const WARNING_COLORS_DARK: CardColors = {
  background: '#372f1a',
  border: '#504321',
  header: '#504321',
  headerHover: '#6e5a2b'
};

const getCardColors = (severity: Error['severity'], isDarkMode: boolean): CardColors => {
  const bySeverity =
    severity === 'warning'
      ? isDarkMode
        ? WARNING_COLORS_DARK
        : WARNING_COLORS
      : isDarkMode
        ? ERROR_COLORS_DARK
        : ERROR_COLORS;

  return bySeverity;
};

const ErrorCard: React.FC<Props> = ({ error }) => {
  const { t } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);

  const colors = useMemo(
    () => getCardColors(error.severity, theme.palette.mode === 'dark'),
    [error.severity, theme.palette.mode]
  );

  const handleClick = useCallback(() => {
    setOpen(o => !o);
  }, []);

  return (
    <div
      style={{
        marginBottom: theme.spacing(2),
        backgroundColor: colors.background,
        border: `solid 1px ${colors.border}`,
        borderRadius: '4px'
      }}
    >
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: colors.header,
          padding: '6px',
          borderRadius: '4px 4px 0px 0px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          '&:hover': {
            backgroundColor: colors.headerHover,
            cursor: 'pointer'
          }
        }}
      >
        <span>
          <b>{error.response.service_name}</b>&nbsp;
        </span>
        <span>[{t(`type.${error.type}`)}]&nbsp;</span>
        {error.response.service_version !== '0' ? (
          <>
            <small style={{ color: theme.palette.text.secondary }}>{` :: ${error.response.service_version}`}</small>
            <small style={{ color: theme.palette.text.secondary, flexGrow: 1 }}>
              &nbsp;
              {error.response.service_tool_version && error.response.service_tool_version !== '0'
                ? `(${error.response.service_tool_version})`
                : ''}
            </small>
          </>
        ) : (
          <small style={{ flexGrow: 1 }}></small>
        )}
        <small style={{ color: theme.palette.text.secondary }}>
          <Moment variant="fromNow">{error.created}</Moment>
        </small>
        {open ? (
          <ExpandLess style={{ color: theme.palette.text.secondary }} />
        ) : (
          <ExpandMore style={{ color: theme.palette.text.secondary }} />
        )}
      </Box>
      <Collapse in={open} timeout="auto">
        <pre
          style={{
            fontSize: '1rem',
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {error.response.message}
        </pre>
      </Collapse>
    </div>
  );
};

export default ErrorCard;
