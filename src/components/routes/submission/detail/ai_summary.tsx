import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Alert, Collapse, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import AIMarkdown from 'components/visual/AiMarkdown';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  watermark: {
    textAlign: 'right',
    color: theme.palette.text.disabled,
    fontSize: 'smaller'
  }
}));

type AISummarySectionProps = {
  type: 'submission' | 'file';
  id: string;
};

const WrappedAISummarySection: React.FC<AISummarySectionProps> = ({ type, id }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const { configuration } = useALContext();
  const { apiCall } = useMyAPI();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (configuration.ui.ai.enabled && id) {
      apiCall({
        allowCache: true,
        url: `/api/v4/${type}/ai/${id}/`,
        onSuccess: api_data => {
          if (error !== null) setError(null);
          setSummary(api_data.api_response);
        },
        onFailure: api_data => {
          setError(api_data.api_error_message);
          if (summary !== null) setSummary(null);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuration, id, type]);

  return (
    <div style={{ paddingTop: theme.spacing(2) }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('ai_summary')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <div style={{ paddingTop: theme.spacing(2) }}>
        <Collapse in={!open} timeout="auto">
          {summary ? (
            <div className={classes.container}>
              <AIMarkdown markdown={summary} />
              <div className={classes.watermark}>{t('powered_by_ai')}</div>
            </div>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Skeleton variant="rectangular" style={{ height: '12rem', borderRadius: '4px' }} />
          )}
        </Collapse>
      </div>
    </div>
  );
};
const AISummarySection = React.memo(WrappedAISummarySection);

export default AISummarySection;
