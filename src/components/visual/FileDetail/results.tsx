import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useSafeResults from 'components/hooks/useSafeResults';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ResultCard, { AlternateResult } from '../ResultCard';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type ResultSectionProps = {
  results: any;
  sid: string;
  alternates?: {
    [serviceName: string]: AlternateResult[];
  };
  force?: boolean;
};

const WrappedResultSection: React.FC<ResultSectionProps> = ({ results, sid, alternates, force = false }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const { showSafeResults } = useSafeResults();

  return !results || results.some(i => i.result.score >= 0) || (results.length > 0 && (showSafeResults || force)) ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('results')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {results
            ? results.map((result, i) => (
                <ResultCard
                  key={i}
                  result={result}
                  sid={sid}
                  alternates={alternates ? alternates[result.response.service_name] : null}
                  force={force}
                />
              ))
            : [...Array(2)].map((_, i) => (
                <Skeleton
                  variant="rectangular"
                  key={i}
                  style={{ height: '12rem', marginBottom: '8px', borderRadius: '4px' }}
                />
              ))}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ResultSection = React.memo(WrappedResultSection);
export default ResultSection;
