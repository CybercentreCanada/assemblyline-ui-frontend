import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Card,
  Collapse,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  styled,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAPIQuery } from 'core/api';
import { useAppConfig } from 'core/config';
import { useAppHashParams, useAppPathParams, useAppSearchParams } from 'core/router';
import { createAppRoute } from 'core/router/route/route.utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomChip } from 'ui/CustomChip';
import { PageFullWidth, PageHeader } from 'ui/pages';

const apiHeight = '48px';

type MethodType = 'DELETE' | 'GET' | 'POST' | 'PUT';

type APIItem = {
  count_towards_quota?: boolean;
  complete?: boolean;
  description?: string;
  methods?: string[];
  name: string;
  path: string;
  protected?: boolean;
  require_role?: string[];
};

type APIDefinition = {
  apis: APIItem[];
  blueprints: Record<string, string>;
};

const METHOD_COLORS: Record<MethodType, 'error' | 'info' | 'success' | 'warning'> = {
  DELETE: 'error',
  GET: 'info',
  POST: 'success',
  PUT: 'warning'
};

const USER_COLORS: Record<string, 'default' | 'error' | 'info' | 'success' | 'warning'> = {
  signature_import: 'success',
  signature_manage: 'info',
  signature_view: 'default',
  signature_download: 'warning',
  administration: 'error',
  alert_view: 'default',
  alert_manage: 'info',
  archive_view: 'default',
  archive_download: 'warning',
  archive_trigger: 'warning',
  archive_manage: 'info',
  self_manage: 'info',
  safelist_view: 'default',
  safelist_manage: 'info',
  badlist_view: 'default',
  badlist_manage: 'info',
  workflow_view: 'default',
  workflow_manage: 'info',
  apikey_access: 'default',
  obo_access: 'default',
  bundle_download: 'warning',
  submission_create: 'success',
  submission_view: 'default',
  submission_delete: 'error',
  submission_manage: 'info',
  file_detail: 'default',
  file_download: 'warning',
  replay_trigger: 'warning',
  replay_system: 'info'
};

const SKELETON_ROWS = [...Array(21)];

const Expand = memo(
  styled(ExpandMoreIcon)<{ open?: boolean }>(({ theme, open = false }) => ({
    transform: 'rotate(0deg)',
    marginLeft: theme.spacing(2),
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    }),

    ...(open && {
      transform: 'rotate(180deg)'
    })
  }))
);

//*****************************************************************************************
// HelpAPI Page
//*****************************************************************************************

export const HelpAPIPage = React.memo(() => {
  const theme = useTheme();
  const { t } = useTranslation(['helpAPI']);

  const [apiSelected, setApiSelected] = useState<string>('');
  const [expandMap, setExpandMap] = useState<Record<string, boolean>>({});

  const configuration = useAppConfig(s => s?.configuration);

  const sp1 = useMemo(() => theme.spacing(1), [theme]);
  const sp2 = useMemo(() => theme.spacing(2), [theme]);

  const downSM = useMediaQuery(theme.breakpoints.down('md'));
  const xs = useMediaQuery(theme.breakpoints.only('xs'));
  const isDark = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const pathParams = useAppPathParams('/submissions/:query', s => s.query);
  const searchParams = useAppSearchParams('/help/api/:id', s => s.toObject());
  const hashParams = useAppHashParams('/help/api/:id', s => s);

  const { data: apiListData, isLoading: isLoadingApiList } = useAPIQuery<string[]>({
    method: 'GET',
    url: '/api/'
  });

  const apiList = useMemo(() => apiListData ?? [], [apiListData]);

  useEffect(() => {
    if (!apiSelected && apiList.length > 0) {
      setApiSelected(apiList[0]);
    }
  }, [apiList, apiSelected]);

  const { data: apiDefinition, isLoading: isLoadingApiDefinition } = useAPIQuery<APIDefinition>({
    disabled: !apiSelected,
    method: 'GET',
    url: `/api/${apiSelected}/`
  });

  const compareAPIs = useCallback((a: APIItem, b: APIItem) => a.name.localeCompare(b.name), []);

  const toggleBlueprintExpand = useCallback((bp: string) => {
    setExpandMap(prev => ({ ...prev, [bp]: !prev[bp] }));
  }, []);

  const getBlueprintAPIs = useCallback(
    (bp: string) => {
      if (!apiDefinition || !apiSelected) return [];

      return apiDefinition.apis
        .filter(item => {
          if (bp === 'documentation') {
            return item.path === `/api/${apiSelected}/`;
          }

          return item.path.startsWith(`/api/${apiSelected}/${bp}/`);
        })
        .sort(compareAPIs);
    },
    [apiDefinition, apiSelected, compareAPIs]
  );

  const onSelectApiVersion = useCallback((event: SelectChangeEvent<string>) => {
    setApiSelected(event.target.value);
    setExpandMap({});
  }, []);

  const getMethodColor = useCallback((method: string) => METHOD_COLORS[method as MethodType] ?? 'info', []);

  const getUserColor = useCallback((role: string) => USER_COLORS[role] ?? 'default', []);

  const blueprintKeys = useMemo(() => Object.keys(apiDefinition?.blueprints ?? {}), [apiDefinition]);
  const isLoading = useMemo(
    () => isLoadingApiList || isLoadingApiDefinition,
    [isLoadingApiDefinition, isLoadingApiList]
  );
  const enforceQuota = useMemo(() => Boolean(configuration?.ui?.enforce_quota), [configuration?.ui?.enforce_quota]);

  return (
    <PageFullWidth sx={{ margin: theme.spacing(4) }}>
      <div style={{ textAlign: 'left' }}>
        <PageHeader
          primary={t('title')}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(4) } },
            actions: { spacing: 1 }
          }}
          actions={
            apiList && apiSelected ? (
              <FormControl size="small">
                <Select
                  id="api"
                  value={apiSelected}
                  onChange={event => setApiSelected(event.target.value)}
                  variant="outlined"
                >
                  {apiList.map((version, index) => (
                    <MenuItem key={index} value={version}>
                      {version.replace('v', t('version')) + t('version_end')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <Skeleton variant="rectangular" style={{ display: 'inline-block', height: '2rem', width: '14rem' }} />
            )
          }
        />

        {!isLoading && apiDefinition ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {blueprintKeys.map(bp => (
              <div key={bp}>
                <Box
                  onClick={() => toggleBlueprintExpand(bp)}
                  sx={{
                    alignItems: 'center',
                    borderBottom: 1,
                    minHeight: apiHeight,
                    borderColor: theme.palette.action.disabledBackground,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    px: 1,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected
                    }
                  }}
                >
                  <Typography variant="body2" color="textSecondary" style={{ fontWeight: 800, lineHeight: 2 }}>
                    {`/api/${apiSelected}/`}&nbsp;
                  </Typography>
                  <div style={{ flexGrow: 1 }}>
                    <Typography variant="h6" style={{ fontWeight: 800, lineHeight: 2 }} color="secondary">
                      {bp}
                    </Typography>
                  </div>
                  <div style={{ display: 'inline-flex', width: downSM ? '100%' : null, justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="textSecondary" align="right" style={{ lineHeight: 2 }}>
                      {apiDefinition.blueprints[bp]}
                    </Typography>
                    <Expand open={expandMap?.[bp]} />
                  </div>
                </Box>
                <Collapse in={expandMap[bp]} timeout="auto" unmountOnExit>
                  <div
                    style={{
                      backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.grey[100]
                    }}
                  >
                    {getBlueprintAPIs(bp).map(api => (
                      <div key={api.name}>
                        <Box
                          onClick={() => toggleBlueprintExpand(api.name)}
                          sx={{
                            alignItems: xs ? 'flex-start' : 'center',
                            display: 'flex',
                            flexDirection: xs ? 'column' : 'row',
                            flexWrap: 'wrap',
                            minHeight: apiHeight,
                            px: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: theme.palette.action.selected
                            }
                          }}
                        >
                          <div>
                            {(api.methods || []).map((method, midx) => (
                              <CustomChip
                                color={getMethodColor(method)}
                                type="rounded"
                                size="small"
                                key={midx}
                                label={method}
                              />
                            ))}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              style={{ wordBreak: 'break-word', lineHeight: 2 }}
                            >
                              {api.path}
                            </Typography>
                          </div>
                          <div
                            style={{
                              display: 'inline-flex',
                              width: downSM ? '100%' : null,
                              justifyContent: 'flex-end'
                            }}
                          >
                            <Typography align="right" variant="caption" style={{ lineHeight: 2 }}>
                              {api.name}
                            </Typography>

                            <Expand open={expandMap?.[api.name]} />
                          </div>
                        </Box>
                        <Collapse in={expandMap[api.name]} timeout="auto" unmountOnExit>
                          <div
                            style={{
                              border: 1,
                              borderTop: 0,
                              borderBottom: 0,
                              padding: sp1,
                              borderColor: isDark ? theme.palette.grey[900] : theme.palette.grey[100],
                              backgroundColor: theme.palette.background.default
                            }}
                          >
                            <Grid container sx={{ alignItems: 'center' }}>
                              <>
                                <Grid size={{ xs: 8, sm: 4, md: 3, lg: 2 }}>
                                  <div style={{ fontWeight: 500 }}>{t('complete')}:</div>
                                </Grid>
                                <Grid size={{ xs: 4, sm: 8, md: 9, lg: 4 }}>
                                  {api.complete ? (
                                    <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                                  ) : (
                                    <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                                  )}
                                </Grid>
                              </>
                              <>
                                <Grid size={{ xs: 8, sm: 4, md: 3, lg: 2 }}>
                                  <div style={{ fontWeight: 500 }}>{t('protected')}:</div>
                                </Grid>
                                <Grid size={{ xs: 4, sm: 8, md: 9, lg: 4 }}>
                                  {api.protected ? (
                                    <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                                  ) : (
                                    <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                                  )}
                                </Grid>
                              </>
                              {enforceQuota && (
                                <>
                                  <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }}>
                                    <div style={{ fontWeight: 500 }}>{t('quota')}:</div>
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 8, md: 9, lg: 4 }}>
                                    {api.count_towards_quota ? (
                                      <CheckOutlinedIcon htmlColor={theme.palette.success.main} />
                                    ) : (
                                      <ClearOutlinedIcon htmlColor={theme.palette.error.main} />
                                    )}
                                  </Grid>
                                </>
                              )}
                              <>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }}>
                                  <div style={{ fontWeight: 500 }}>{t('require_role')}:</div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8, md: 9, lg: 4 }}>
                                  {(api.require_role || []).map((utype, uidx) => (
                                    <CustomChip
                                      key={uidx}
                                      color={getUserColor(utype)}
                                      type="rounded"
                                      size="tiny"
                                      label={t(`role.${utype}`)}
                                    />
                                  ))}
                                </Grid>
                              </>
                              <>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }}>
                                  <div style={{ fontWeight: 500 }}>{t('methods')}:</div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8, md: 9, lg: 4 }}>
                                  {(api.methods || []).map((met, metid) => (
                                    <CustomChip
                                      key={metid}
                                      color={getMethodColor(met)}
                                      type="rounded"
                                      size="tiny"
                                      label={t(met)}
                                    />
                                  ))}
                                </Grid>
                              </>
                              <>
                                <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2 }}>
                                  <div style={{ fontWeight: 500 }}>{t('path')}:</div>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 8, md: 9, lg: 4 }}>
                                  <div style={{ lineHeight: 2, fontFamily: 'Monospace', wordBreak: 'break-word' }}>
                                    {api.path}
                                  </div>
                                </Grid>
                              </>
                              <>
                                <Grid size={{ xs: 12 }}>
                                  <div style={{ fontWeight: 500, lineHeight: 2 }}>{t('description')}:</div>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Card variant="outlined" style={{ overflowX: 'auto' }}>
                                    <pre style={{ paddingLeft: sp2, paddingRight: sp2 }}>{api.description || ''}</pre>
                                  </Card>
                                </Grid>
                              </>
                            </Grid>
                          </div>
                        </Collapse>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SKELETON_ROWS.map((_, i) => (
              <div
                key={i}
                style={{
                  paddingLeft: sp1,
                  paddingRight: sp1,
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  borderBottom: 1,
                  minHeight: apiHeight,
                  alignItems: 'center',
                  borderColor: theme.palette.action.disabledBackground
                }}
              >
                <Typography variant="body2" style={{ paddingRight: '8px' }}>
                  <Skeleton width="2rem" />
                </Typography>
                <div style={{ flexGrow: 1 }}>
                  <Typography variant="h6">
                    <Skeleton width="12rem" />
                  </Typography>
                </div>
                <div style={{ display: 'inline-flex', width: downSM ? '100%' : null, justifyContent: 'flex-end' }}>
                  <Typography variant="body2" style={{ paddingRight: '16px', lineHeight: 2 }}>
                    <Skeleton width="14rem" />
                  </Typography>
                  <Skeleton width="1rem" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageFullWidth>
  );
});

HelpAPIPage.displayName = 'HelpAPIPage';

//*****************************************************************************************
// HelpAPI Route
//*****************************************************************************************

export const HelpAPIRoute = createAppRoute({
  component: HelpAPIPage,
  path: '/help/api/:id',
  params: s => ({
    id: s.boolean()
  }),
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).origin('snapshot').ephemeral(),
    rows: s.number(25).locked().origin('snapshot').ephemeral(),
    sort: s.string('times.submitted desc').ephemeral(),
    filters: s.filters([]),
    track_total_hits: s.number(null).origin('snapshot').nullable().ephemeral()
  }),
  hash: s => s
});

export default HelpAPIRoute;
