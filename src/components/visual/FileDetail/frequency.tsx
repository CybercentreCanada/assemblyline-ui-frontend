import { Grid, Skeleton } from '@mui/material';
import SectionContainer from 'components/visual/SectionContainer';
import moment from 'moment';
import React from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  seen: {
    count: number;
    first: string;
    last: string;
  };
  nocollapse?: boolean;
};

const WrappedFrequencySection: React.FC<Props> = ({ seen = null, nocollapse = false }) => {
  const { t } = useTranslation(['fileDetail']);

  return (
    <SectionContainer title={t('frequency')} nocollapse={nocollapse}>
      <Grid container>
        <Grid item xs={4} sm={3} lg={2}>
          <span style={{ fontWeight: 500 }}>{t('seen.first')}</span>
        </Grid>
        <Grid item xs={8} sm={9} lg={10}>
          {seen ? (
            <div>
              {moment(seen?.first).fromNow()} ({moment(seen?.first).format('YYYY-MM-DD HH:mm:ss')})
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
              {moment(seen?.last).fromNow()} ({moment(seen?.last).format('YYYY-MM-DD HH:mm:ss')})
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
    </SectionContainer>
  );
};

const FrequencySection = React.memo(WrappedFrequencySection);
export default FrequencySection;
