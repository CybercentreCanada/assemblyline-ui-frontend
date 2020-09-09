import {
  Box,
  Card,
  Collapse,
  Grid,
  makeStyles,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import ClearOutlinedIcon from '@material-ui/icons/ClearOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Skeleton from '@material-ui/lab/Skeleton';
import clsx from 'clsx';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import CustomChip from 'components/visual/CustomChip';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const apiHeight = '48px';
const useStyles = makeStyles(theme => ({
  api: {
    minHeight: apiHeight,
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
  },
  test: {
    height: '100px'
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
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const isDark = theme.palette.type === 'dark';
  const methodBGColor = {
    DELETE: isDark ? theme.palette.error.dark : theme.palette.error.light,
    GET: isDark ? theme.palette.info.dark : theme.palette.info.light,
    POST: isDark ? theme.palette.success.dark : theme.palette.success.light,
    PUT: isDark ? theme.palette.warning.dark : theme.palette.warning.light
  };
  const privBGColor = {
    E: isDark ? theme.palette.error.dark : theme.palette.error.light,
    R: isDark ? theme.palette.success.dark : theme.palette.success.light,
    W: isDark ? theme.palette.warning.dark : theme.palette.warning.light
  };
  const userBGColor = {
    admin: isDark ? theme.palette.error.dark : theme.palette.error.light,
    signature_manager: isDark ? theme.palette.info.dark : theme.palette.info.light,
    user: null,
    signature_importer: isDark ? theme.palette.warning.dark : theme.palette.warning.light
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

  return (
    <PageCenter width="90%" maxWidth="1350px">
      <Box textAlign="left">
        {apiList && apiSelected ? (
          <Select
            id="api"
            value={apiSelected}
            onChange={event => setApiSelected(event.target.value)}
            variant="outlined"
            margin="dense"
          >
            {apiList.map((version, index) => {
              return (
                <MenuItem key={index} value={version}>
                  {version.replace('v', t('page.help.api.version')) + t('page.help.api.version_end')}
                </MenuItem>
              );
            })}
          </Select>
        ) : (
          <Skeleton variant="rect" style={{ height: '2rem', width: '14rem' }} />
        )}
        {apiDefinition ? (
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
                    <Typography variant="body2" color="textSecondary" style={{ fontWeight: 800, lineHeight: 2 }}>
                      {`/api/${apiSelected}/`}&nbsp;
                    </Typography>
                    <Box flexGrow={1}>
                      <Typography variant="h6" style={{ fontWeight: 800, lineHeight: 2 }} color="secondary">
                        {bp}
                      </Typography>
                    </Box>
                    <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
                      <Typography variant="body2" color="textSecondary" align="right" style={{ lineHeight: 2 }}>
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
                          <Box key={idx}>
                            <Box
                              className={classes.api}
                              px={1}
                              display="flex"
                              flexDirection={xs ? 'column' : 'row'}
                              flexWrap="wrap"
                              alignItems={xs ? 'flex-start' : 'center'}
                              onClick={() => toggleBlueprintExpand(api.name)}
                            >
                              <Box>
                                {api.methods.map((method, midx) => {
                                  return (
                                    <CustomChip
                                      style={{
                                        backgroundColor: methodBGColor[method],
                                        color: isDark ? theme.palette.common.white : null
                                      }}
                                      type="square"
                                      size="small"
                                      key={midx}
                                      label={method}
                                    />
                                  );
                                })}
                              </Box>
                              <Box flexGrow={1}>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  style={{ wordBreak: 'break-word', lineHeight: 2 }}
                                >
                                  {api.path}
                                </Typography>
                              </Box>
                              <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
                                <Typography align="right" variant="caption" style={{ lineHeight: 2 }}>
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
                                <Grid container alignItems="center">
                                  <>
                                    <Grid item xs={8} sm={4} md={3} lg={2}>
                                      <Box fontWeight="fontWeightMedium">{t('page.help.api.complete')}:</Box>
                                    </Grid>
                                    <Grid item xs={4} sm={8} md={9} lg={4}>
                                      {api.complete ? (
                                        <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                                      ) : (
                                        <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                                      )}
                                    </Grid>
                                  </>
                                  <>
                                    <Grid item xs={8} sm={4} md={3} lg={2}>
                                      <Box fontWeight="fontWeightMedium">{t('page.help.api.protected')}:</Box>
                                    </Grid>
                                    <Grid item xs={4} sm={8} md={9} lg={4}>
                                      {api.protected ? (
                                        <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                                      ) : (
                                        <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                                      )}
                                    </Grid>
                                  </>
                                  <>
                                    <Grid item xs={12} sm={4} md={3} lg={2}>
                                      <Box fontWeight="fontWeightMedium">{t('page.help.api.require_type')}:</Box>
                                    </Grid>
                                    <Grid item xs={12} sm={8} md={9} lg={4}>
                                      {api.require_type.map((utype, uidx) => {
                                        return (
                                          <CustomChip
                                            key={uidx}
                                            style={{
                                              backgroundColor: userBGColor[utype],
                                              color: isDark ? theme.palette.common.white : null
                                            }}
                                            type="square"
                                            size="tiny"
                                            label={t(`page.help.api.user_type.${utype}`)}
                                          />
                                        );
                                      })}
                                    </Grid>
                                  </>
                                  {api.required_priv ? (
                                    <>
                                      <Grid item xs={12} sm={4} md={3} lg={2}>
                                        <Box fontWeight="fontWeightMedium">{t('page.help.api.required_priv')}:</Box>
                                      </Grid>
                                      <Grid item xs={12} sm={8} md={9} lg={4}>
                                        {api.required_priv.map((ptype, pidx) => {
                                          return (
                                            <CustomChip
                                              key={pidx}
                                              style={{
                                                backgroundColor: privBGColor[ptype],
                                                color: isDark ? theme.palette.common.white : null
                                              }}
                                              type="square"
                                              size="tiny"
                                              label={t(`page.help.api.priv.${ptype}`)}
                                            />
                                          );
                                        })}
                                      </Grid>
                                    </>
                                  ) : null}
                                  <>
                                    <Grid item xs={12} sm={4} md={3} lg={2}>
                                      <Box fontWeight="fontWeightMedium">{t('page.help.api.methods')}:</Box>
                                    </Grid>
                                    <Grid item xs={12} sm={8} md={9} lg={4}>
                                      {api.methods.map((met, metid) => {
                                        return (
                                          <CustomChip
                                            key={metid}
                                            style={{
                                              backgroundColor: methodBGColor[met],
                                              color: isDark ? theme.palette.common.white : null
                                            }}
                                            type="square"
                                            size="tiny"
                                            label={met}
                                          />
                                        );
                                      })}
                                    </Grid>
                                  </>
                                  <>
                                    <Grid item xs={12} sm={4} md={3} lg={2}>
                                      <Box fontWeight="fontWeightMedium">{t('page.help.api.path')}:</Box>
                                    </Grid>
                                    <Grid item xs={12} sm={8} md={9} lg={4}>
                                      <Box lineHeight={2} fontFamily="Monospace" style={{ wordBreak: 'break-word' }}>
                                        {api.path}
                                      </Box>
                                    </Grid>
                                  </>
                                  <>
                                    <Grid item xs={12}>
                                      <Box fontWeight="fontWeightMedium" lineHeight={2}>
                                        {t('page.help.api.description')}:
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12}>
                                      <Card variant="outlined" style={{ overflowX: 'auto' }}>
                                        <Box component="pre" px={2}>
                                          {api.description}
                                        </Box>
                                      </Card>
                                    </Grid>
                                  </>
                                </Grid>
                              </Box>
                            </Collapse>
                          </Box>
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
                  key={i}
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
                    <Typography variant="body2" style={{ paddingRight: '16px', lineHeight: 2 }}>
                      <Skeleton width="14rem" />
                    </Typography>
                    <Skeleton width="1rem" />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </PageCenter>
  );
}
