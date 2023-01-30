import { Card, CardHeader, Grid, Typography, useTheme } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function ServiceCard({ service }) {
  const { t } = useTranslation(['helpServices']);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const minCardHeight = '240px';
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);

  return (
    <Card
      style={{
        minHeight: minCardHeight,
        backgroundColor: service.enabled ? null : isDark ? '#ff000017' : '#FFE4E4',
        border: `solid 1px ${
          service.enabled ? theme.palette.divider : isDark ? theme.palette.error.light : theme.palette.error.dark
        }`
      }}
    >
      <CardHeader
        title={service.name}
        subheader={service.version}
        action={
          service.enabled ? null : (
            <div style={{ padding: sp2 }}>
              <CustomChip type="rounded" variant="outlined" size="small" color="error" label={t('disabled')} />
            </div>
          )
        }
        style={{ padding: theme.spacing(1) }}
      />
      <div style={{ padding: sp1 }}>
        <div style={{ minHeight: '110px', whiteSpace: 'pre-wrap', paddingBottom: theme.spacing(1) }}>
          {service.description}
        </div>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <label style={{ fontWeight: 500 }}>{t('accepts')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.accepts}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <label style={{ fontWeight: 500 }}>{t('rejects')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.rejects}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <label style={{ fontWeight: 500 }}>{t('category')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.category}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <label style={{ fontWeight: 500 }}>{t('stage')}:&nbsp;&nbsp;</label>
            <Typography variant="caption" style={{ overflowWrap: 'anywhere', display: 'inline-block' }}>
              {service.stage}
            </Typography>
          </Grid>
        </Grid>
      </div>
    </Card>
  );
}

export default function Services() {
  const { apiCall } = useMyAPI();
  const { t } = useTranslation(['helpServices']);
  const theme = useTheme();
  const [services, setServices] = useState(null);
  const minCardHeight = '240px';

  useEffect(() => {
    // Load all services on start
    apiCall({
      url: '/api/v4/service/all/',
      onSuccess: api_data => {
        setServices(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);
  return (
    <PageFullWidth margin={4}>
      <div style={{ marginBottom: theme.spacing(4) }}>
        <Typography variant="h4">{t('title')}</Typography>
        {services ? (
          <Typography variant="caption">{`${services.length} ${t('count')}`}</Typography>
        ) : (
          <Skeleton width="8rem" />
        )}
      </div>
      {services ? (
        <Grid container spacing={2}>
          {services.map((s, i) => (
            <Grid key={i} item xs={12} md={6} xl={4}>
              <ServiceCard service={s} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid key={i} item xs={12} md={6} xl={4}>
              <Skeleton variant="rectangular" style={{ height: minCardHeight }} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageFullWidth>
  );
}
