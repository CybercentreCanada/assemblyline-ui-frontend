import { Box, Card, Chip, Collapse, Grid, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Skeleton from '@material-ui/lab/Skeleton';
import clsx from 'clsx';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const apiHeight = '48px';
const useStyles = makeStyles(theme => ({
  api: {
    minHeight: apiHeight,
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  },
  blueprint: {
    minHeight: apiHeight,
    alignItems: 'center',
    borderColor: theme.palette.action.disabledBackground,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  },
  blueprintSkel: {
    minHeight: apiHeight,
    alignItems: 'center',
    borderColor: theme.palette.action.disabledBackground
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: theme.spacing(2),
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}));

export default function ApiDoc() {
  const apiCall = useMyAPI();
  const [apiList, setApiList] = useState(null);
  const [apiSelected, setApiSelected] = useState(null);
  const [apiDefinition, setApiDefinition] = useState(null);
  const classes = useStyles();
  const [expandMap, setExpandMap] = useState({});
  const theme = useTheme();
  const { t } = useTranslation();

  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.type === 'dark';
  const methodBGColor = {
    DELETE: isDark ? theme.palette.error.dark : theme.palette.error.light,
    GET: isDark ? theme.palette.info.dark : theme.palette.info.light,
    POST: isDark ? theme.palette.success.dark : theme.palette.success.light,
    PUT: isDark ? theme.palette.warning.dark : theme.palette.warning.light
  };

  function toggleBlueprintExpand(bp) {
    const newValue = {};
    newValue[bp] = !expandMap[bp];
    setExpandMap({ ...expandMap, ...newValue });
  }

  function blueprintAPIs(bp) {
    const out = [];
    if (apiDefinition) {
      for (const item of apiDefinition.apis) {
        if (bp === 'documentation') {
          if (item.path === `/api/${apiSelected}/`) {
            out.push(item);
          }
        } else if (item.path.indexOf(`/api/${apiSelected}/${bp}/`) === 0) {
          out.push(item);
        }
      }
    }
    return out.sort(compare);
  }

  function compare(a, b) {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  useEffect(() => {
    if (apiList) {
      apiCall({
        url: `/api/${apiSelected}/`,
        onSuccess: api_data => {
          setApiDefinition(api_data.api_response);
        }
      });
    } else {
      apiCall({
        url: '/api/',
        onSuccess: api_data => {
          setApiList(api_data.api_response);
          setApiSelected(api_data.api_response[0]);
        }
      });
    }
    // eslint-disable-next-line
  }, [apiSelected]);

  return apiDefinition ? (
    <Box display="flex" flexDirection="column">
      {Object.keys(apiDefinition.blueprints).map((bp, i) => {
        return (
          <Box key={i}>
            <Box
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              className={classes.blueprint}
              borderBottom={1}
              px={1}
              onClick={() => toggleBlueprintExpand(bp)}
            >
              <Typography variant="body2" color="textSecondary" style={{ fontWeight: 800 }}>
                {`/api/${apiSelected}/`}&nbsp;
              </Typography>
              <Box flexGrow={1}>
                <Typography variant="h6" style={{ fontWeight: 800 }} color="secondary">
                  {bp}
                </Typography>
              </Box>
              <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
                <Typography variant="body2" color="textSecondary" align="right">
                  {apiDefinition.blueprints[bp]}
                </Typography>
                <ExpandMoreIcon
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: expandMap[bp]
                  })}
                />
              </Box>
            </Box>
            <Collapse in={expandMap[bp]} timeout="auto" unmountOnExit>
              <Box
                py={1}
                style={{
                  backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.grey[100]
                }}
              >
                {blueprintAPIs(bp).map((api, idx) => {
                  return (
                    <>
                      <Box
                        className={classes.api}
                        px={1}
                        key={idx}
                        display="flex"
                        flexDirection="row"
                        flexWrap="wrap"
                        alignItems="center"
                        onClick={() => toggleBlueprintExpand(api.name)}
                      >
                        <Box>
                          {api.methods.map((method, midx) => {
                            return (
                              <Chip
                                style={{
                                  backgroundColor: methodBGColor[method],
                                  color: theme.palette.common.white,
                                  marginRight: '4px'
                                }}
                                size="small"
                                key={midx}
                                label={method}
                              />
                            );
                          })}
                        </Box>
                        <Box flexGrow={1}>
                          <Typography variant="body2" color="textSecondary">
                            {api.path}
                          </Typography>
                        </Box>
                        <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
                          <Typography align="right" variant="caption">
                            {api.name}
                          </Typography>

                          <ExpandMoreIcon
                            className={clsx(classes.expand, {
                              [classes.expandOpen]: expandMap[api.name]
                            })}
                          />
                        </Box>
                      </Box>
                      <Collapse in={expandMap[api.name]} timeout="auto" unmountOnExit>
                        <Box
                          border={1}
                          borderTop={0}
                          borderBottom={0}
                          p={1}
                          borderColor={isDark ? theme.palette.grey[900] : theme.palette.grey[100]}
                          bgcolor={theme.palette.background.default}
                        >
                          <Grid container>
                            {!api.complete ? (
                              <>
                                <Grid item xs={4} sm={3}>
                                  {t('page.help.api.complete')}:
                                </Grid>
                                <Grid item xs={8} sm={9}>
                                  {t('page.help.api.incomplete')}
                                </Grid>
                              </>
                            ) : null}
                            {api.protected ? (
                              <>
                                <Grid item xs={4} sm={3}>
                                  {t('page.help.api.requirements')}:
                                </Grid>
                                <Grid item xs={8} sm={9}>
                                  {t('page.help.api.require_login')}
                                </Grid>
                              </>
                            ) : null}
                            <Grid item xs={4} sm={3}>
                              {t('page.help.api.allowed_users')}:
                            </Grid>
                            <Grid item xs={8} sm={9}>
                              {api.require_type}
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              {t('page.help.api.api_key_req')}:
                            </Grid>
                            <Grid item xs={8} sm={9}>
                              {api.required_priv}
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              {t('page.help.api.abs_path')}:
                            </Grid>
                            <Grid item xs={8} sm={9}>
                              {api.path}
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              {t('page.help.api.allowed_methods')}:
                            </Grid>
                            <Grid item xs={8} sm={9}>
                              {api.methods}
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              {t('page.help.api.internal_func')}:
                            </Grid>
                            <Grid item xs={8} sm={9}>
                              {api.function}
                            </Grid>
                            <Grid item xs={12}>
                              {t('page.help.api.description')}:
                            </Grid>
                            <Grid item xs={12}>
                              <Card variant="outlined">
                                <Box component="pre" p={1}>
                                  {api.description}
                                </Box>
                              </Card>
                            </Grid>
                          </Grid>
                        </Box>
                      </Collapse>
                    </>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  ) : (
    <Box display="flex" flexDirection="column">
      {[...Array(21)].map((_, i) => {
        return (
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            className={classes.blueprintSkel}
            borderBottom={1}
            px={1}
          >
            <Typography variant="body2" style={{ paddingRight: '8px' }}>
              <Skeleton width="2rem" />
            </Typography>
            <Box flexGrow={1}>
              <Typography variant="h6">
                <Skeleton width="12rem" />
              </Typography>
            </Box>
            <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
              <Typography variant="body2" style={{ paddingRight: '16px' }}>
                <Skeleton width="14rem" />
              </Typography>
              <Skeleton width="1rem" />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
