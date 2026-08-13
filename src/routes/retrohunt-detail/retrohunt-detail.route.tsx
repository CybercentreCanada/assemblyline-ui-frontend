import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import { AlertTitle, Divider, Grid, Paper, Skeleton, styled, Tooltip, Typography, useTheme } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppPathParams, useAppSearchSnapshot } from 'core/routes';
import { AppPageFullSize } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { FileIndexed } from 'models/base/file';
import type { Retrohunt, RetrohuntProgress } from 'models/base/retrohunt';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ForbiddenPage } from 'routes/forbidden/forbidden';
import { NotFoundPage } from 'routes/not-found/not-found';
import { RetrohuntErrors } from 'routes/retrohunt-detail/components/errors';
import { RetrohuntRepeat } from 'routes/retrohunt-detail/components/repeat';
import { safeFieldValue } from 'shared/utils/utils';
import { io } from 'socket.io-client';
import Classification from 'ui/Classification';
import CustomChip from 'ui/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'ui/DivTable';
import InformativeAlert from 'ui/InformativeAlert';
import { PageHeader } from 'ui/layouts/PageHeader';
import LineGraph from 'ui/LineGraph';
import Moment from 'ui/Moment';
import MonacoEditor from 'ui/MonacoEditor';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';
import SteppedProgress from 'ui/SteppedProgress';
import { TabContainer } from 'ui/TabContainer';

const SkeletonCustomChip = memo(
  styled(Skeleton)(() => ({
    height: '1.5rem',
    width: '2rem',
    borderRadius: '4px',
    display: 'inline-block',
    verticalAlign: 'middle'
  }))
);

const SOCKETIO_NAMESPACE = '/retrohunt';

const PAGE_SIZE = 10;
const MAX_TRACKED_RECORDS = 10000;
const DEFAULT_QUERY = '';

export const RetrohuntDetailPage = memo(() => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const navigate = useAppNavigate<'/retrohunt/detail/:id'>();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { c12nDef, configuration, user: currentUser } = useALContext();
  const paramKey = useAppPathParams<'/retrohunt/detail/:id'>()?.id;
  const search = useAppSearchSnapshot<'/retrohunt/detail/:id'>();

  const [retrohunt, setRetrohunt] = useState<Retrohunt>(null);
  const [hitResults, setHitResults] = useState<SearchResult<FileIndexed>>(null);
  const [typeDataSet, setTypeDataSet] = useState<Record<string, number>>(null);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const DEFAULT_RETROHUNT = useMemo<Partial<Retrohunt>>(
    () => ({
      classification: c12nDef.UNRESTRICTED,
      completed_time: null,
      created_time: null,
      creator: null,
      description: '',
      end_group: null,
      errors: [],
      expiry_ts: null,
      finished: null,
      indices: null,
      key: null,
      progress: 0,
      raw_query: null,
      search_classification: currentUser.classification,
      start_group: null,
      started_time: null,
      step: 'Starting',
      total_errors: 0,
      total_hits: 0,
      total_indices: 0,
      truncated: null,
      warnings: [],
      yara_signature: ''
    }),
    [c12nDef.UNRESTRICTED, currentUser.classification]
  );

  const suggestions = useMemo<IndexDefinition>(() => ({ ...indexes.file, ...DEFAULT_SUGGESTION }), [indexes.file]);

  const reloadData = useCallback(
    () => {
      if (currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          url: `/api/v4/retrohunt/${paramKey}/`,
          onSuccess: api_data => setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response }),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, configuration?.retrohunt?.enabled, paramKey, DEFAULT_RETROHUNT]
  );

  const reloadHits = useCallback(
    (curQuery: typeof search) => {
      if (currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/hits/${paramKey}/`,
          body: curQuery.toObject(),
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              navigate.here().update(s => ({
                ...s,
                search: { ...s.search, offset: Math.floor(total / rows) * rows }
              }));
            } else {
              setHitResults(api_data.api_response);
            }
          },
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/types/${paramKey}/`,
          body: {
            query: curQuery.get('query') ?? '',
            filters: curQuery.get('filters') ?? []
          },
          onSuccess: api_data => {
            let dataset: Record<string, number> = api_data.api_response;
            dataset = Object.fromEntries(
              Object.keys(dataset)
                .sort((a, b) => dataset[b] - dataset[a])
                .map(k => [k, dataset[k]])
            );
            setTypeDataSet(dataset);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles, configuration?.retrohunt?.enabled, paramKey, navigate]
  );

  const handleRepeat = useCallback(
    (value: Retrohunt) => {
      setRetrohunt(r => ({ ...DEFAULT_RETROHUNT, ...value }));
    },
    [DEFAULT_RETROHUNT]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsInitialized(true);
    }, theme.transitions.duration.complex);

    return () => clearTimeout(timeoutId);
  }, [theme.transitions.duration.complex]);

  useEffect(() => {
    reloadData();
  }, [paramKey, reloadData]);

  useEffect(() => {
    if (search && retrohunt?.finished) reloadHits(search);
  }, [search, reloadHits, retrohunt?.finished]);

  useEffect(() => {
    const socket = io(SOCKETIO_NAMESPACE);

    if (!paramKey || !retrohunt || retrohunt?.finished) return;

    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/detail (connect)`);

      socket.emit('listen', { key: paramKey });
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/detail (listen) :: ${paramKey}`);
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.debug(`Socket-IO :: /retrohunt/detail (disconnect)`);
    });

    socket.on('status', (data: RetrohuntProgress) => {
      const progress = data.type === 'Filtering' || data.type === 'Yara' ? data.progress : 0;
      // eslint-disable-next-line no-console
      console.debug(
        `Socket-IO :: /retrohunt/detail (status) :: ${data.type} - ${Math.floor(100 * progress)}% - ${data.key}`
      );

      setRetrohunt(prev =>
        prev.key !== data.key
          ? prev
          : {
              ...prev,
              ...(data.type === 'Finished' && {
                ...data.search,
                total_errors: data.search.errors.length,
                total_warnings: data.search.warnings.length
              }),
              finished: data.type === 'Finished',
              step: data.type,
              progress: data.type === 'Filtering' || data.type === 'Yara' ? data.progress : 0
            }
      );
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrohunt?.finished, paramKey]);

  if (!configuration?.retrohunt?.enabled) return <NotFoundPage />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <ForbiddenPage />;
  else
    return (
      <AppPageFullSize>
        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} rowGap={2} marginBottom={theme.spacing(4)}>
          {c12nDef.enforce && (
            <Grid paddingBottom={1}>
              <Classification
                format="long"
                type="pill"
                size="small"
                c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              />
            </Grid>
          )}

          <PageHeader
            primary={t('header.view')}
            secondary={() => retrohunt.key}
            secondaryLoading={!retrohunt}
            slotProps={{
              root: { style: { marginBottom: theme.spacing(2) } }
            }}
            actions={<RetrohuntRepeat key="repeat" retrohunt={retrohunt} onRepeat={handleRepeat} />}
          />

          {!retrohunt || retrohunt?.finished ? null : (
            <Grid paddingTop={2}>
              <Grid container flexDirection="row" justifyContent="center">
                <Grid size={{ xs: 12, sm: 11, lg: 10 }}>
                  <SteppedProgress
                    activeStep={['Filtering', 'Yara', 'Finished'].indexOf(retrohunt.step || 'Starting')}
                    percentage={Math.ceil(100 * retrohunt.progress)}
                    steps={[
                      { label: t('step.filtering'), icon: <FilterAltOutlinedIcon /> },
                      { label: t('step.yara'), icon: <DataObjectOutlinedIcon /> },
                      { label: t('step.finished'), icon: <DoneOutlinedIcon /> }
                    ]}
                  />
                </Grid>
              </Grid>
            </Grid>
          )}

          <TabContainer
            style={{ marginTop: theme.spacing(1), marginBottom: theme.spacing(1) }}
            tabs={{
              details: {
                label: t('details'),
                inner: (
                  <>
                    <Grid>
                      <Typography variant="h6">{t('header.information')}</Typography>
                      <Divider />
                    </Grid>

                    <Grid>
                      <Grid container size="grow">
                        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                          <span style={{ fontWeight: 500 }}>{t('details.description')}</span>
                        </Grid>
                        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                          {retrohunt ? retrohunt.description : <Skeleton />}
                        </Grid>

                        {configuration?.datastore?.archive?.enabled && (
                          <>
                            <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                              <span style={{ fontWeight: 500 }}>{t('details.search')}</span>
                            </Grid>
                            <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                              {retrohunt ? (
                                (() => {
                                  switch (retrohunt?.indices) {
                                    case 'hot':
                                      return t('details.hot');
                                    case 'archive':
                                      return t('details.archive');
                                    case 'hot_and_archive':
                                      return t('details.hot_and_archive');
                                    default:
                                      return null;
                                  }
                                })()
                              ) : (
                                <Skeleton />
                              )}
                            </Grid>
                          </>
                        )}

                        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                          <span style={{ fontWeight: 500 }}>{t('details.creator')}</span>
                        </Grid>
                        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                          {retrohunt ? retrohunt.creator : <Skeleton />}
                        </Grid>

                        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                          <span style={{ fontWeight: 500 }}>{t('details.created')}</span>
                        </Grid>
                        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                          {retrohunt ? (
                            <>
                              <Moment variant="localeDate">{retrohunt.created_time}</Moment>
                              {' ('}
                              <Moment variant="fromNow">{retrohunt.created_time}</Moment>)
                            </>
                          ) : (
                            <Skeleton />
                          )}
                        </Grid>

                        <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                          <span style={{ fontWeight: 500 }}>{t('details.expiry')}</span>
                        </Grid>
                        <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                          {retrohunt ? (
                            <>
                              <Moment variant="localeDate">{retrohunt.expiry_ts}</Moment>
                              {' ('}
                              <Moment variant="fromNow">{retrohunt.expiry_ts}</Moment>)
                            </>
                          ) : (
                            <Skeleton />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid>
                      <Tooltip
                        title={t('tooltip.search_classification')}
                        placement="top"
                        slotProps={{ tooltip: { style: { backgroundColor: theme.palette.grey[700] } } }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: theme.spacing(1),
                            marginBottom: theme.spacing(0.5)
                          }}
                        >
                          <Typography variant="subtitle2">{t('details.search_classification')}</Typography>
                          <InfoOutlinedIcon />
                        </div>
                      </Tooltip>
                      <Classification
                        format="long"
                        type="pill"
                        size="small"
                        c12n={
                          retrohunt && 'search_classification' in retrohunt ? retrohunt.search_classification : null
                        }
                      />
                    </Grid>

                    <Grid>
                      <Grid container gap={1}>
                        <Grid size={{ xs: 12 }} marginTop={1}>
                          <Typography variant="h6">{t('header.hits')}</Typography>
                          <Divider />
                        </Grid>
                        {!retrohunt ? (
                          <Grid>
                            <SkeletonCustomChip variant="rectangular" />
                          </Grid>
                        ) : (
                          'truncated' in retrohunt &&
                          retrohunt.truncated && (
                            <Grid>
                              <Tooltip title={t('truncated.tooltip')}>
                                <span>
                                  <CustomChip
                                    type="round"
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    label={t('truncated')}
                                  />
                                </span>
                              </Tooltip>
                            </Grid>
                          )
                        )}

                        {!retrohunt ? (
                          <Grid>
                            <SkeletonCustomChip variant="rectangular" />
                          </Grid>
                        ) : (
                          'tags' in retrohunt &&
                          Object.keys(retrohunt.tags).length > 0 &&
                          Object.keys(retrohunt.tags).map((key, i) => (
                            <Grid key={i}>
                              <CustomChip
                                key={'tag-' + i}
                                type="round"
                                size="small"
                                variant="outlined"
                                color="default"
                                label={key}
                              />
                            </Grid>
                          ))
                        )}
                      </Grid>
                    </Grid>

                    {!retrohunt ? null : !retrohunt?.finished ? (
                      <div style={{ width: '100%' }}>
                        <InformativeAlert>
                          <AlertTitle>{t('in_progress_title')}</AlertTitle>
                          {t('in_progress_desc')}
                        </InformativeAlert>
                      </div>
                    ) : (
                      <>
                        <Grid>
                          {isInitialized && (
                            <SearchHeader
                              params={search.toParams()}
                              loading={isReloading}
                              results={hitResults}
                              resultLabel={
                                search.get('query')
                                  ? t(`filtered${hitResults?.total === 1 ? '' : 's'}`)
                                  : t(`total${hitResults?.total === 1 ? '' : 's'}`)
                              }
                              onChange={v =>
                                navigate.here().update(s => ({
                                  ...s,
                                  search: { ...s.search, ...RetrohuntDetailRoute.search.delta(v).toObject() }
                                }))
                              }
                              paramDefaults={search.defaults().toObject()}
                              searchInputProps={{ placeholder: t('filter'), options: suggestions }}
                            />
                          )}
                        </Grid>

                        <Grid>
                          <LineGraph
                            dataset={typeDataSet}
                            height="200px"
                            title={t('graph.type.title')}
                            datatype={t('graph.type.datatype')}
                            onClick={(evt, element) => {
                              if (!isReloading && element.length > 0) {
                                const ind = element[0].index;
                                navigate.here().update(s => ({
                                  ...s,
                                  search: {
                                    ...s.search,
                                    filters: [
                                      ...s.search.filters,
                                      `type:${safeFieldValue(Object.keys(typeDataSet)[ind])}`
                                    ]
                                  }
                                }));
                              }
                            }}
                          />
                        </Grid>

                        <Grid>
                          {!hitResults ? (
                            <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
                          ) : hitResults.total === 0 ? (
                            <div style={{ width: '100%' }}>
                              <InformativeAlert>
                                <AlertTitle>{t('no_files_title')}</AlertTitle>
                                {t('no_files_desc')}
                              </InformativeAlert>
                            </div>
                          ) : (
                            <TableContainer id="hits-table" component={Paper}>
                              <DivTable stickyHeader>
                                <DivTableHead>
                                  <DivTableRow>
                                    <SortableHeaderCell children={t('details.lasttimeseen')} sortField="seen.last" />
                                    <SortableHeaderCell children={t('details.count')} sortField="seen.count" />
                                    <SortableHeaderCell children={t('details.sha256')} sortField="sha256" />
                                    <SortableHeaderCell children={t('details.filetype')} sortField="type" />
                                    <SortableHeaderCell children={t('details.size')} sortField="size" />
                                    {c12nDef.enforce && (
                                      <SortableHeaderCell
                                        children={t('details.classification')}
                                        sortField="classification"
                                      />
                                    )}
                                    <DivTableCell sx={{ zIndex: 'auto' }} />
                                  </DivTableRow>
                                </DivTableHead>
                                <DivTableBody id="hit-body">
                                  {hitResults.items.map((file, i) => (
                                    <LinkRow
                                      key={`${file.sha256}-${i}`}
                                      nav={nav =>
                                        nav.to().create({ route: '/file/detail/:id', path: { id: file.sha256 } })
                                      }
                                      hover
                                      style={{ textDecoration: 'none' }}
                                    >
                                      <DivTableCell>
                                        <Tooltip title={file.seen.last}>
                                          <div>
                                            <Moment variant="fromNow">{file.seen.last}</Moment>
                                          </div>
                                        </Tooltip>
                                      </DivTableCell>
                                      <DivTableCell>{file.seen.count}</DivTableCell>
                                      <DivTableCell breakable>{file.sha256}</DivTableCell>
                                      <DivTableCell>{file.type}</DivTableCell>
                                      <DivTableCell>{file.size}</DivTableCell>
                                      {c12nDef.enforce && (
                                        <DivTableCell>
                                          <Classification
                                            type="text"
                                            size="tiny"
                                            c12n={file.classification}
                                            format="short"
                                          />
                                        </DivTableCell>
                                      )}
                                      <DivTableCell style={{ textAlign: 'center' }}>
                                        {file.from_archive && (
                                          <Tooltip title={t('archive')}>
                                            <ArchiveOutlinedIcon />
                                          </Tooltip>
                                        )}
                                      </DivTableCell>
                                    </LinkRow>
                                  ))}
                                </DivTableBody>
                              </DivTable>
                            </TableContainer>
                          )}
                        </Grid>

                        <Grid style={{ height: theme.spacing(8) }}></Grid>
                      </>
                    )}
                  </>
                )
              },
              yara: {
                label: t('yara_rule'),
                inner: (
                  <>
                    {!retrohunt ? (
                      <Grid>
                        <Skeleton style={{ height: '100%', minHeight: '450px', transform: 'none' }} />
                      </Grid>
                    ) : (
                      <MonacoEditor
                        language="yara"
                        value={'yara_signature' in retrohunt ? retrohunt.yara_signature : ''}
                        options={{ readOnly: true }}
                      />
                    )}
                  </>
                )
              },
              errors: {
                label: t('errors'),
                preventRender: !(
                  retrohunt &&
                  (retrohunt.total_warnings > 0 || retrohunt.total_errors > 0) &&
                  currentUser.is_admin
                ),
                inner: <RetrohuntErrors retrohunt={retrohunt} isDrawer={false} />
              }
            }}
          />
        </Grid>
      </AppPageFullSize>
    );
});

export const RetrohuntDetailRoute = createAppRoute({
  component: RetrohuntDetailPage,

  path: '/retrohunt/detail/:id',
  params: s => ({
    id: s.string()
  }),
  search: s => ({
    query: s.string(''),
    offset: s.number(0).min(0).source('transient').ephemeral(),
    rows: s.number(10).locked().source('transient').ephemeral(),
    sort: s.string('seen.last+desc'),
    filters: s.filters([]),
    track_total_hits: s.number(null).source('transient').nullable().ephemeral()
  }),

  ancestor: '/retrohunt',
  shortname: location => ({ i18nKey: location?.path?.id ?? 'breadcrumb.retrohunt.detail', ns: 'app' }),
  fullname: () => ({ i18nKey: 'breadcrumb.retrohunt.detail', ns: 'app' }),
  shorticon: () => <ListOutlinedIcon />,
  fullicon: () => <ListOutlinedIcon />,

  disabled: (_location, config) => !config.configuration?.retrohunt?.enabled,
  forbidden: (_location, config) => !config.user.roles.includes('retrohunt_view')
});
