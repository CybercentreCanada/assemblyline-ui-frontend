import { Collapse, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ResultCard from '../ResultCard';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type EmptySectionProps = {
  emptys: any;
  sid: string;
};

const WrappedEmptySection: React.FC<EmptySectionProps> = ({ emptys, sid }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return !emptys || emptys.length !== 0 ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('emptys')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {emptys
            ? emptys.map((result, i) => <ResultCard key={i} result={result} sid={sid} />)
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

const EmptySection = React.memo(WrappedEmptySection);
export default EmptySection;
