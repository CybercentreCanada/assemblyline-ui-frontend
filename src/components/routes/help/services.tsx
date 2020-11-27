import { Card, CardHeader, Chip, Grid, Typography, useTheme } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import Skeleton from '@material-ui/lab/Skeleton';
import PageFullWidth from 'commons/components/layout/pages/PageFullWidth';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function ServiceCard({ service }) {
  const { t } = useTranslation(['helpServices']);
  const theme = useTheme();
  const isDark = theme.palette.type === 'dark';
  const minCardHeight = '240px';
  const darkBCRed = '#543838';
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);

  return (
    <Card
      style={{
        minHeight: minCardHeight,
        backgroundColor: service.enabled ? null : isDark ? darkBCRed : red[50]
      }}
    >
      <CardHeader
        title={service.name}
        subheader={service.version}
        action={
          service.enabled ? null : (
            <div style={{ padding: sp2 }}>
              <Chip
                style={{
                  backgroundColor: isDark ? theme.palette.error.dark : theme.palette.error.light,
                  color: theme.palette.common.white
                }}
                label={t('disabled')}
              />
            </div>
          )
        }
        style={{ padding: theme.spacing(1) }}
      />
      <div style={{ padding: sp1 }}>
        <div style={{ minHeight: '110px', whiteSpace: 'pre-wrap', paddingBottom: theme.spacing(1) }}>
          {service.description}
        </div>
        <Grid container>
          <Grid item xs={12} sm={6}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="subtitle2">{t('accepts')}:&nbsp;&nbsp;</Typography>
              <div style={{ alignSelf: 'center' }}>
                <Typography variant="body2">{service.accepts}</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="subtitle2">{t('rejects')}:&nbsp;&nbsp;</Typography>
              <div style={{ alignSelf: 'center' }}>
                <Typography variant="body2">{service.rejects}</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="subtitle2">{t('category')}:&nbsp;&nbsp;</Typography>
              <div style={{ alignSelf: 'center' }}>
                <Typography variant="body2">{service.category}</Typography>
              </div>
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Typography variant="subtitle2">{t('stage')}:&nbsp;&nbsp;</Typography>
              <div style={{ alignSelf: 'center' }}>
                <Typography variant="body2">{service.stage}</Typography>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </Card>
  );
}

export default function Services() {
  const apiCall = useMyAPI();
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
      </div>
      {services ? (
        <Grid container spacing={2}>
          {services.map((s, i) => (
            <Grid key={i} item xs={12} md={6} lg={4} xl={3}>
              <ServiceCard service={s} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid key={i} item xs={12} md={6} lg={4} xl={3}>
              <Skeleton variant="rect" style={{ height: minCardHeight }} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageFullWidth>
  );
}
