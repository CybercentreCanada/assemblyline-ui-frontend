import { Grid, Skeleton, Typography } from '@mui/material';
import type { Seen } from 'components/models/base/file';
import Moment from 'components/visual/Moment';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  seen: Seen;
  nocollapse?: boolean;
};

const WrappedFrequencySection: React.FC<Props> = ({ seen = null, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  return (
    <SectionContainer title={t('frequency')} nocollapse={nocollapse}>
      <Grid container size="grow">
        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('seen.first')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
          {seen ? (
            <>
              <Typography component="span" variant="body2">
                <Moment variant="fromNow">{seen?.first}</Moment>
              </Typography>
              <Typography color="textSecondary" component="span" variant="body2">
                {` (`}
                <Moment format="YYYY-MM-DD HH:mm:ss">{seen?.first}</Moment>)
              </Typography>
            </>
          ) : (
            <Skeleton />
          )}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('seen.last')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
          {seen ? (
            <>
              <Typography component="span" variant="body2">
                <Moment variant="fromNow">{seen?.last}</Moment>
              </Typography>
              <Typography color="textSecondary" component="span" variant="body2">
                {` (`}
                <Moment format="YYYY-MM-DD HH:mm:ss">{seen?.last}</Moment>)
              </Typography>
            </>
          ) : (
            <Skeleton />
          )}
        </Grid>

        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
          <span style={{ fontWeight: 500 }}>{t('seen.count')}</span>
        </Grid>
        <Grid size={{ xs: 8, sm: 9, lg: 10 }}>{seen ? seen?.count : <Skeleton />}</Grid>
      </Grid>
    </SectionContainer>
  );
};

const FrequencySection = React.memo(WrappedFrequencySection);
export default FrequencySection;
