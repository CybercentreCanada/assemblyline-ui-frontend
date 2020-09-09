import { Box, Card, CardHeader, Chip, Grid, Typography, useTheme } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import Skeleton from '@material-ui/lab/Skeleton';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Services() {
  const apiCall = useMyAPI();
  const [services, setServices] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const isDark = theme.palette.type === 'dark';
  const minCardHeight = '240px';
  const darkBCRed = '#543838';

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
    <PageCenter>
      <Box textAlign="left">
        {services ? (
          <Grid container spacing={2}>
            {services.map((s, i) => {
              return (
                <Grid key={i} item xs={12} md={6} xl={4}>
                  <Card
                    style={{
                      minHeight: minCardHeight,
                      backgroundColor: s.enabled ? null : isDark ? darkBCRed : red[50]
                    }}
                  >
                    <CardHeader
                      title={s.name}
                      subheader={s.version}
                      action={
                        s.enabled ? null : (
                          <Box p={2}>
                            <Chip
                              style={{
                                backgroundColor: isDark ? theme.palette.error.dark : theme.palette.error.light,
                                color: theme.palette.common.white
                              }}
                              label={t('page.help.services.disabled')}
                            />
                          </Box>
                        )
                      }
                      style={{ padding: theme.spacing(1) }}
                    />
                    <Box p={1}>
                      <Box minHeight="110px">
                        <Typography variant="overline">{s.description}</Typography>
                      </Box>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" flexDirection="row">
                            <Typography variant="subtitle2">{t('page.help.services.accepts')}:&nbsp;&nbsp;</Typography>
                            <Box alignSelf="center">
                              <Typography variant="body2">{s.accepts}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" flexDirection="row">
                            <Typography variant="subtitle2">{t('page.help.services.rejects')}:&nbsp;&nbsp;</Typography>
                            <Box alignSelf="center">
                              <Typography variant="body2">{s.rejects}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" flexDirection="row">
                            <Typography variant="subtitle2">{t('page.help.services.category')}:&nbsp;&nbsp;</Typography>
                            <Box alignSelf="center">
                              <Typography variant="body2">{s.category}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" flexDirection="row">
                            <Typography variant="subtitle2">{t('page.help.services.stage')}:&nbsp;&nbsp;</Typography>
                            <Box alignSelf="center">
                              <Typography variant="body2">{s.stage}</Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {[...Array(8)].map((_, i) => {
              return (
                <Grid key={i} item xs={12} md={6} xl={4}>
                  <Skeleton variant="rect" style={{ height: minCardHeight }} />
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </PageCenter>
  );
}
