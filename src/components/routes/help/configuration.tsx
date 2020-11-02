import { Grid, Typography, useTheme } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Configuration() {
  const apiCall = useMyAPI();
  const [configuration, setConfiguration] = useState(null);
  const [constants, setConstants] = useState(null);
  const { t } = useTranslation(['helpConfiguration']);
  const theme = useTheme();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);

  function isArrayOfArray(val) {
    if (Array.isArray(val)) {
      if (Array.isArray(val[0])) {
        return true;
      }
    }
    return false;
  }

  useEffect(() => {
    // Load all services on start
    apiCall({
      url: '/api/v4/help/constants/',
      onSuccess: api_data => {
        setConstants(api_data.api_response);
      }
    });
    apiCall({
      url: '/api/v4/help/configuration/',
      onSuccess: api_data => {
        setConfiguration(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <div style={{ textAlign: 'left', paddingBottom: sp2 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            {t('tags')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('tags.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('tags.desc_list')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2, display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {constants
              ? constants.tag_types.map((tag, id) => {
                  return <CustomChip type="square" size="tiny" key={id} label={tag} style={{ padding: '5px' }} />;
                })
              : [...Array(192)].map((_, i) => {
                  return <Skeleton key={i} style={{ height: '2rem', width: '8rem', marginRight: '3px' }} />;
                })}
          </div>

          <Typography variant="h6" gutterBottom>
            {t('priorities')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('priorities.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('priorities.desc_list')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2 }}>
            <Grid container>
              {constants ? (
                <>
                  {Object.keys(constants.priorities).map((priority, id) => {
                    return (
                      <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
                        <div style={{ display: 'inline-block', fontWeight: 500 }}>{priority}:&nbsp;&nbsp;</div>
                        <div style={{ display: 'inline-block', fontWeight: 300 }}>{constants.priorities[priority]}</div>
                      </Grid>
                    );
                  })}

                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <div style={{ display: 'inline-block', fontWeight: 500 }}>{t('priorities.max')}:&nbsp;&nbsp;</div>
                    <div style={{ display: 'inline-block', fontWeight: 300 }}>{constants.max_priority}</div>
                  </Grid>
                </>
              ) : (
                [...Array(8)].map((_, i) => {
                  return (
                    <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                      <div style={{ display: 'inline-block', fontWeight: 500 }}>
                        <Skeleton key={i} style={{ height: '2rem', width: '5rem', margin: '2px' }} />
                      </div>
                      <div style={{ display: 'inline-block' }}>
                        <Skeleton key={i} style={{ height: '2rem', width: '3rem', margin: '2px' }} />
                      </div>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </div>

          <Typography variant="h6" gutterBottom>
            {t('file_types')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('file_types.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('file_types.specific')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2 }}>
            <Grid container>
              {constants
                ? constants.file_types.map((type, id) => {
                    return type[0] !== '*' && type[1].length !== 0 ? (
                      <Grid key={id} item xs={12} md={6} lg={4}>
                        <div style={{ display: 'inline-block', fontWeight: 500 }}>{type[0]}</div>
                        <div style={{ display: 'inline-block', fontWeight: 300 }}>
                          &nbsp;::&nbsp;{type[1].join(', ')}
                        </div>
                      </Grid>
                    ) : null;
                  })
                : [...Array(40)].map((_, i) => {
                    return (
                      <Grid key={i} item xs={12} md={6} lg={4}>
                        <div style={{ display: 'inline-block', fontWeight: 500 }}>
                          <Skeleton style={{ height: '2rem', width: '4rem', margin: '2px' }} />
                        </div>
                        <div style={{ display: 'inline-block' }}>
                          <Skeleton style={{ height: '2rem', width: '8rem', margin: '2px' }} />
                        </div>
                      </Grid>
                    );
                  })}
            </Grid>
          </div>
          <Typography variant="body2" gutterBottom>
            {t('file_types.non_specific')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2 }}>
            <Grid container>
              {constants
                ? constants.file_types.map((type, id) => {
                    return type[0] !== '*' && type[1].length === 0 ? (
                      <Grid key={id} item xs={12} sm={6} md={4}>
                        <div style={{ display: 'inline-block', fontWeight: 500 }}>{type[0]}</div>
                      </Grid>
                    ) : null;
                  })
                : [...Array(60)].map((_, i) => {
                    return (
                      <Grid key={i} item xs={12} sm={6} md={4}>
                        <div style={{ display: 'inline-block', fontWeight: 500 }}>
                          <Skeleton style={{ height: '2rem', width: '8rem', margin: '2px' }} />
                        </div>
                      </Grid>
                    );
                  })}
            </Grid>
          </div>
          <Typography variant="body2" gutterBottom>
            {t('file_types.non_specific_service')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2 }}>
            {constants ? (
              <div style={{ fontWeight: 500 }}>{constants.file_types[0][1].join(', ')}</div>
            ) : (
              <Skeleton style={{ height: '2rem' }} />
            )}
          </div>

          <Typography variant="h6" gutterBottom>
            {t('config')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('config.desc')}
          </Typography>
          <div style={{ paddingTop: sp1, paddingBottom: sp2 }}>
            {configuration
              ? Object.keys(configuration).map((key, idx) => {
                  return (
                    <Grid key={idx} container spacing={1}>
                      <Grid
                        item
                        xs={12}
                        sm={5}
                        md={4}
                        style={{
                          overflowX: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{key}</span>
                      </Grid>
                      <Grid item xs={12} sm={7} md={8}>
                        <div style={{ fontWeight: 300 }}>
                          {typeof configuration[key] !== 'object' ? (
                            <div>{String(configuration[key])}</div>
                          ) : isArrayOfArray(configuration[key]) ? (
                            configuration[key].map((sub_key, sub_idx) => {
                              return (
                                <div key={sub_idx} style={{ display: 'flex' }}>
                                  <div style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{sub_key[0]}:&nbsp;</div>
                                  <div>{sub_key[1].join(', ')}</div>
                                </div>
                              );
                            })
                          ) : (
                            <div>{configuration[key].join(' | ')}</div>
                          )}
                        </div>
                      </Grid>
                    </Grid>
                  );
                })
              : [...Array(10)].map((_, i) => {
                  return (
                    <Grid key={i} container spacing={1}>
                      <Grid key={i} item xs={12} sm={5} md={4}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                      <Grid item xs={12} sm={7} md={8}>
                        <Skeleton style={{ height: '2rem' }} />
                      </Grid>
                    </Grid>
                  );
                })}
          </div>
        </div>
      </div>
    </PageCenter>
  );
}
