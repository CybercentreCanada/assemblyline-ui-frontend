import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

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

type Props = {
  seen: {
    count: number;
    first: string;
    last: string;
  };
};

const WrappedFrequencySection: React.FC<Props> = ({ seen = null }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        <span>{t('frequency')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Grid container>
            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.first')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {seen ? (
                <div>
                  <Moment fromNow>{seen?.first}</Moment> (<Moment format="YYYY-MM-DD HH:mm:ss">{seen?.first}</Moment>)
                </div>
              ) : (
                <Skeleton />
              )}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.last')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {seen ? (
                <div>
                  <Moment fromNow>{seen?.last}</Moment> (<Moment format="YYYY-MM-DD HH:mm:ss">{seen?.last}</Moment>)
                </div>
              ) : (
                <Skeleton />
              )}
            </Grid>

            <Grid item xs={4} sm={3} lg={2}>
              <span style={{ fontWeight: 500 }}>{t('seen.count')}</span>
            </Grid>
            <Grid item xs={8} sm={9} lg={10}>
              {seen ? seen?.count : <Skeleton />}
            </Grid>
          </Grid>
        </div>
      </Collapse>
    </div>
  );
};

const FrequencySection = React.memo(WrappedFrequencySection);
export default FrequencySection;
