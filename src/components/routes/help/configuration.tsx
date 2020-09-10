import { Box, Grid, Typography } from '@material-ui/core';
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
  const { t } = useTranslation();

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
      url: '/api/v4/help/configuration/',
      onSuccess: api_data => {
        setConfiguration(api_data.api_response);
      }
    });
    apiCall({
      url: '/api/v4/help/constants/',
      onSuccess: api_data => {
        setConstants(api_data.api_response);
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <Box textAlign="left">
        <Box display="flex" flexDirection="column">
          <Typography variant="h6" gutterBottom>
            {t('page.help.configuration.tags')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.tags.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.tags.desc_list')}
          </Typography>
          <Box pt={1} pb={2} display="flex" flexDirection="row" flexWrap="wrap">
            {constants
              ? constants.tag_types.map((tag, id) => {
                  return <CustomChip type="square" size="tiny" key={id} label={tag} style={{ padding: '5px' }} />;
                })
              : [...Array(192)].map((_, i) => {
                  return <Skeleton key={i} style={{ height: '2rem', width: '10rem', margin: '5px' }} />;
                })}
          </Box>

          <Typography variant="h6" gutterBottom>
            {t('page.help.configuration.priorities')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.priorities.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.priorities.desc_list')}
          </Typography>
          <Box pt={1} pb={2}>
            <Grid container>
              {constants ? (
                <>
                  {Object.keys(constants.priorities).map((priority, id) => {
                    return (
                      <Grid key={id} item xs={12} sm={6} md={4} lg={3}>
                        <Box display="inline-block" fontWeight={500}>
                          {priority}:&nbsp;&nbsp;
                        </Box>
                        <Box display="inline-block" fontWeight="fontWeightLight">
                          {constants.priorities[priority]}
                        </Box>
                      </Grid>
                    );
                  })}

                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Box display="inline-block" fontWeight={500}>
                      {t('page.help.configuration.priorities.max')}:&nbsp;&nbsp;
                    </Box>
                    <Box display="inline-block" fontWeight="fontWeightLight">
                      {constants.max_priority}
                    </Box>
                  </Grid>
                </>
              ) : (
                [...Array(8)].map((_, i) => {
                  return (
                    <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
                      <Box display="inline-block" fontWeight={500}>
                        <Skeleton key={i} style={{ height: '2rem', width: '5rem', margin: '2px' }} />
                      </Box>
                      <Box display="inline-block">
                        <Skeleton key={i} style={{ height: '2rem', width: '3rem', margin: '2px' }} />
                      </Box>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>

          <Typography variant="h6" gutterBottom>
            {t('page.help.configuration.file_types')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.file_types.desc')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.file_types.specific')}
          </Typography>
          <Box pt={1} pb={2}>
            <Grid container>
              {constants
                ? constants.file_types.map((type, id) => {
                    return type[0] !== '*' && type[1].length !== 0 ? (
                      <Grid key={id} item xs={12} md={6} lg={4}>
                        <Box display="inline-block" fontWeight={500}>
                          {type[0]}
                        </Box>
                        <Box display="inline-block" fontWeight="fontWeightLight">
                          &nbsp;::&nbsp;{type[1].join(', ')}
                        </Box>
                      </Grid>
                    ) : null;
                  })
                : [...Array(40)].map((_, i) => {
                    return (
                      <Grid key={i} item xs={12} md={6} lg={4}>
                        <Box display="inline-block" fontWeight={500}>
                          <Skeleton style={{ height: '2rem', width: '4rem', margin: '2px' }} />
                        </Box>
                        <Box display="inline-block">
                          <Skeleton style={{ height: '2rem', width: '8rem', margin: '2px' }} />
                        </Box>
                      </Grid>
                    );
                  })}
            </Grid>
          </Box>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.file_types.non_specific')}
          </Typography>
          <Box pt={1} pb={2}>
            <Grid container>
              {constants
                ? constants.file_types.map((type, id) => {
                    return type[0] !== '*' && type[1].length === 0 ? (
                      <Grid key={id} item xs={12} sm={6} md={4}>
                        <Box display="inline-block" fontWeight={500}>
                          {type[0]}
                        </Box>
                      </Grid>
                    ) : null;
                  })
                : [...Array(60)].map((_, i) => {
                    return (
                      <Grid key={i} item xs={12} sm={6} md={4}>
                        <Box display="inline-block" fontWeight={500}>
                          <Skeleton style={{ height: '2rem', width: '8rem', margin: '2px' }} />
                        </Box>
                      </Grid>
                    );
                  })}
            </Grid>
          </Box>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.file_types.non_specific_service')}
          </Typography>
          <Box pt={1} pb={2}>
            {constants ? (
              <Box fontWeight={500}>{constants.file_types[0][1].join(', ')}</Box>
            ) : (
              <Skeleton style={{ height: '2rem' }} />
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            {t('page.help.configuration.config')}
          </Typography>
          <Typography variant="body2" gutterBottom>
            {t('page.help.configuration.config.desc')}
          </Typography>
          <Box pt={1} pb={2}>
            {configuration
              ? Object.keys(configuration).map((key, idx) => {
                  return (
                    <Grid key={idx} container spacing={1}>
                      <Grid item xs={12} sm={5} md={4}>
                        <Box display="inline-block" fontWeight={500}>
                          {key}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={7} md={8}>
                        <Box fontWeight="fontWeightLight">
                          {typeof configuration[key] !== 'object' ? (
                            <Box>{String(configuration[key])}</Box>
                          ) : isArrayOfArray(configuration[key]) ? (
                            configuration[key].map((sub_key, sub_idx) => {
                              return (
                                <Box key={sub_idx}>
                                  <Box display="inline-block" fontWeight={500}>
                                    {sub_key[0]}
                                  </Box>
                                  <Box display="inline-block">: {sub_key[1].join(', ')}</Box>
                                </Box>
                              );
                            })
                          ) : (
                            <Box>{configuration[key].join(' | ')}</Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  );
                })
              : null}
          </Box>
        </Box>
      </Box>
    </PageCenter>
  );
}
