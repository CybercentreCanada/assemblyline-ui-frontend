import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Box, Collapse, useTheme } from '@mui/material';
import type { Error } from 'components/models/base/error';
import Moment from 'components/visual/Moment';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  error: Error;
};

const ErrorCard: React.FC<Props> = ({ error }) => {
  const { t } = useTranslation(['adminErrorViewer']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div
      style={{
        marginBottom: sp2,
        backgroundColor: theme.palette.mode === 'dark' ? '#371a1a' : '#fce9e9',
        border: `solid 1px ${theme.palette.mode === 'dark' ? '#502121' : '#ffcbcb'}`,
        borderRadius: '4px'
      }}
    >
      <Box
        onClick={handleClick}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#502121' : '#ffd9d9',
          padding: '6px',
          borderRadius: '4px 4px 0px 0px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#6e2b2b' : '#ffc5c5',
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
            whiteSpace: 'pre-wrap'
          }}
        >
          {error.response.message}
        </pre>
      </Collapse>
    </div>
  );
};

export default ErrorCard;
