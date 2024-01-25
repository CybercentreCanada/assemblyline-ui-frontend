import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AIMarkdown from 'components/visual/AiMarkdown';
import React from 'react';
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
  alert: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD',
      color: '#888'
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    color: theme.palette.text.secondary,
    margin: '0.25rem 0',
    padding: '16px 8px',
    textAlign: 'left',
    whiteSpace: 'pre-wrap'
  }
}));

type AISummarySectionProps = {
  summary: string;
};

const WrappedAISummarySection: React.FC<AISummarySectionProps> = ({ summary }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

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
        {summary ? (
          <Collapse in={!open} timeout="auto">
            <AIMarkdown markdown={summary} />
          </Collapse>
        ) : (
          <Skeleton variant="rectangular" style={{ height: '12rem', borderRadius: '4px' }} />
        )}
      </div>
    </div>
  );
};
const AISummarySection = React.memo(WrappedAISummarySection);

export default AISummarySection;
