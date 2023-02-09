import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { Skeleton } from '@mui/material';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

const useStyles = makeStyles(theme => ({
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type FrequencySectionProps = {
  fileinfo: any;
};

const WrappedFrequencySection: React.FC<FrequencySectionProps> = ({ fileinfo }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('frequency')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('seen.first')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <div>
                      <Moment fromNow>{fileinfo.seen.first}</Moment> (
                      <Moment format="YYYY-MM-DD HH:mm:ss">{fileinfo.seen.first}</Moment>)
                    </div>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('seen.last')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? (
                    <div>
                      <Moment fromNow>{fileinfo.seen.last}</Moment> (
                      <Moment format="YYYY-MM-DD HH:mm:ss">{fileinfo.seen.last}</Moment>)
                    </div>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('seen.count')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {fileinfo ? fileinfo.seen.count : <Skeleton />}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [fileinfo]
        )}
      </Collapse>
    </div>
  );
};

const FrequencySection = React.memo(WrappedFrequencySection);
export default FrequencySection;
