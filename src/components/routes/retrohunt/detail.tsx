import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  AlertTitle,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageCenter from 'commons/components/pages/PageCenter';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import { RetrohuntPhase, RetrohuntResult } from 'components/routes/retrohunt';
import RetrohuntErrors from 'components/routes/retrohunt/errors';
import { ChipList } from 'components/visual/ChipList';
import Classification from 'components/visual/Classification';
import CustomChip, { CustomChipProps } from 'components/visual/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import FileDetail from 'components/visual/FileDetail';
import InformativeAlert from 'components/visual/InformativeAlert';
import LineGraph from 'components/visual/LineGraph';
import MonacoEditor from 'components/visual/MonacoEditor';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { FileResult } from 'components/visual/SearchResult/files';
import SearchResultCount from 'components/visual/SearchResultCount';
import SteppedProgress from 'components/visual/SteppedProgress';
import { safeFieldValue } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  title: {
    fontWeight: 500,
    marginRight: theme.spacing(0.5),
    display: 'flex'
  },
  value: {
    fontFamily: 'monospace',
    wordBreak: 'break-word'
  },
  collapse: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  containerSpacer: {
    marginTop: theme.spacing(2)
  },
  tableContainer: {
    maxHeight: `50vh`
  },
  results: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  },
  skeletonButton: {
    height: '2.5rem',
    width: '2.5rem',
    margin: theme.spacing(0.5)
  },
  skeletonCustomChip: {
    height: '1.5rem',
    width: '2rem',
    borderRadius: '4px',
    display: 'inline-block',
    verticalAlign: 'middle'
  },
  errorButton: {
    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
  },
  preview: {
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: 'inherit'
  }
}));

type RetrohuntHitResult = {
  items: FileResult[];
  offset: number;
  rows: number;
  total: number;
};

type ParamProps = {
  id: string;
};

type Props = {
  id?: string;
  isDrawer?: boolean;
};

const PAGE_SIZE = 10;

const MAX_TRACKED_RECORDS = 10000;

const RELOAD_DELAY = 5000;

const DEFAULT_PARAMS = {
  query: '*',
  offset: 0,
  rows: PAGE_SIZE,
  sort: 'seen.last+desc'
  // fl: 'seen.last,seen.count,sha256,type,size,classification,from_archive'
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

function WrappedRetrohuntDetail({ id: propId = null, isDrawer = false }: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer, subscribeCloseDrawer } = useDrawer();
  const { indexes } = useALContext();

  const { c12nDef, configuration } = useALContext();
  const { id: paramId } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>(null);
  const [hitResults, setHitResults] = useState<RetrohuntHitResult>(null);
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [typeDataSet, setTypeDataSet] = useState<{ [k: string]: number }>(null);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);

  const filterValue = useRef<string>('');
  const timer = useRef<boolean>(false);

  const DEFAULT_RETROHUNT = useMemo<RetrohuntResult>(
    () => ({
      indices: null,
      created_time: null,
      started_time: null,
      completed_time: null,
      key: null,

      archive_only: false,
      classification: c12nDef.UNRESTRICTED,
      code: null,
      created: '2020-01-01T00:00:00.000000Z',
      creator: null,
      description: '',
      errors: [],
      expiry_ts: null,
      finished: false,
      hits: [],
      pending_candidates: 0,
      pending_indices: 0,
      phase: 'finished',
      progress: [1, 1],
      raw_query: null,
      tags: {},
      total_errors: 0,
      total_hits: 0,
      total_indices: 0,
      truncated: false,
      yara_signature: ''
    }),
    [c12nDef.UNRESTRICTED]
  );

  const id = useMemo<string>(() => (isDrawer ? propId.split('?')[0] : paramId), [isDrawer, paramId, propId]);

  const suggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.file).filter(name => indexes.file[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.file]
  );

  const phase = useMemo<RetrohuntPhase>(
    () =>
      retrohunt && 'phase' in retrohunt && ['filtering', 'yara', 'finished'].includes(retrohunt.phase)
        ? retrohunt.phase
        : null,
    [retrohunt]
  );

  const hitPageCount = useMemo<number>(
    () =>
      hitResults && 'total' in hitResults ? Math.ceil(Math.min(hitResults.total, MAX_TRACKED_RECORDS) / PAGE_SIZE) : 0,
    [hitResults]
  );

  const PageLayout = useCallback<React.FC<any>>(
    props =>
      isDrawer ? (
        <PageFullSize margin={2} {...props} />
      ) : (
        <PageCenter mb={4} ml={0} mr={0} mt={4} width="100%" textAlign="left" {...props} />
      ),
    [isDrawer]
  );

  const handleNavigate = useCallback(
    (searchQuery: SimpleSearchQuery) => {
      const search = new SimpleSearchQuery(searchQuery.toString(), DEFAULT_QUERY);
      if (isDrawer) {
        const delta = search.getDeltaString();
        const searchParam = delta && delta !== '' ? `?${delta}` : '';
        navigate(`${location.pathname}${location.search}#${id}${searchParam}`);
      } else navigate(`${location.pathname}?${search.getDeltaString()}${location.hash}`);
    },
    [id, isDrawer, location.hash, location.pathname, location.search, navigate]
  );

  const handleQueryChange = useCallback(
    (key: string, value: string | number) => {
      query.set(key, value);
      handleNavigate(query);
    },
    [handleNavigate, query]
  );

  const handleQueryRemove = useCallback(
    (key: string | string[]) => {
      if (typeof key === 'string') query.delete(key);
      else key.forEach(k => query.delete(k));
      handleNavigate(query);
    },
    [handleNavigate, query]
  );

  const reloadData = useCallback(
    () => {
      if (currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          url: `/api/v4/retrohunt/${id}/`,
          onSuccess: api_data => setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response }),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, configuration?.retrohunt?.enabled, currentUser.roles, id]
  );

  const reloadHits = useCallback(
    (curQuery: SimpleSearchQuery) => {
      if (currentUser.roles.includes('retrohunt_view') && configuration?.retrohunt?.enabled) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/hits/${id}/`,
          body: {
            ...curQuery.getParams(),
            filters: curQuery.getAll('filters', [])
          },
          onSuccess: api_data => {
            const { items, total, rows, offset } = api_data.api_response;
            if (items.length === 0 && offset !== 0 && offset >= total) {
              curQuery.set('offset', Math.floor(total / rows) * rows);
              reloadHits(curQuery);
            } else {
              setHitResults(api_data.api_response);
            }
          },
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/types/${id}/`,
          body: {
            query: curQuery.get('query', DEFAULT_PARAMS?.query),
            filters: curQuery.getAll('filters', [])
          },
          onSuccess: api_data => {
            let dataset: { [k: string]: number } = api_data.api_response;
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
    [configuration?.retrohunt?.enabled, currentUser.roles, id]
  );

  const handleHitRowClick = useCallback(
    (file: FileResult) => {
      if (isDrawer) navigate(`/file/detail/${file.sha256}${location.hash}`);
      else navigate(`${location.pathname}${location.search}#${file.sha256}`);
    },
    [isDrawer, location.hash, location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (isDrawer) {
      const url = new URL(`${window.location.origin}/${location.hash.slice(1)}`);
      setQuery(new SimpleSearchQuery(url.search, DEFAULT_QUERY));
    }
  }, [isDrawer, location.hash]);

  useEffect(() => {
    if (!isDrawer) setQuery(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  }, [isDrawer, location.search]);

  useEffect(() => {
    reloadData();
  }, [id, reloadData]);

  useEffect(() => {
    if (query) reloadHits(query);
  }, [query, reloadHits]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        reloadData();
        reloadHits(query);
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [reloadData, reloadHits, isDrawer, location.search, query, retrohunt]);

  useEffect(() => {
    if (!isDrawer && location.hash) {
      setGlobalDrawer(<FileDetail sha256={location.hash.substr(1)} />);
    }
  }, [isDrawer, location.hash, setGlobalDrawer]);

  useEffect(() => {
    if (hitResults !== null && !globalDrawerOpened && location.hash) {
      navigate(`${location.pathname}${location.search ? location.search : ''}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (isDrawer) {
      subscribeCloseDrawer(() =>
        navigate(`${window.location.pathname}${window.location.search ? window.location.search : ''}`)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawer, subscribeCloseDrawer]);

  useEffect(() => {
    if (!['/retrohunt', '/file/detail'].some(p => location.pathname.startsWith(p))) closeGlobalDrawer();
  }, [closeGlobalDrawer, location.pathname]);

  if (!configuration?.retrohunt?.enabled) return <NotFoundPage />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <ForbiddenPage />;
  else
    return (
      <PageLayout>
        <RetrohuntErrors retrohunt={retrohunt} open={isErrorOpen} onClose={() => setIsErrorOpen(false)} />
        <Grid
          container
          flexDirection="column"
          flexWrap="nowrap"
          flex={1}
          rowSpacing={1}
          marginBottom={theme.spacing(4)}
        >
          {c12nDef.enforce && (
            <Grid item paddingBottom={4}>
              <Classification
                format="long"
                type="pill"
                size="tiny"
                c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              />
            </Grid>
          )}

          <Grid item>
            <Grid container flexDirection="row">
              <Grid item flexGrow={1}>
                <Typography variant="h4" children={!retrohunt ? <Skeleton width="30rem" /> : t('header.view')} />
                <Typography variant="caption" children={!retrohunt ? <Skeleton width="20rem" /> : retrohunt.key} />
              </Grid>
              {!retrohunt ? (
                <Grid item>
                  <Skeleton className={classes.skeletonButton} variant="circular" />
                </Grid>
              ) : (
                'total_errors' in retrohunt &&
                retrohunt?.total_errors > 0 && (
                  <Grid item>
                    <Tooltip
                      title={
                        'total_errors' in retrohunt
                          ? retrohunt.total_errors > 1
                            ? `${retrohunt.total_errors} ${t('errors.totals')}`
                            : `${retrohunt.total_errors} ${t('errors.total')}`
                          : t('errors.tooltip')
                      }
                    >
                      <IconButton className={classes.errorButton} size="large" onClick={() => setIsErrorOpen(true)}>
                        <ErrorOutlineOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                )
              )}
            </Grid>

            {retrohunt &&
              'finished' in retrohunt &&
              !retrohunt.finished &&
              'percentage' in retrohunt &&
              'phase' in retrohunt && (
                <Grid item paddingTop={2}>
                  <Grid container flexDirection="row" justifyContent="center">
                    <Grid item xs={12} sm={11} lg={10}>
                      <SteppedProgress
                        activeStep={['filtering', 'yara', 'finished'].indexOf(phase)}
                        percentage={retrohunt?.percentage}
                        loading={!retrohunt}
                        steps={[
                          { label: t('phase.filtering'), icon: <FilterAltOutlinedIcon /> },
                          { label: t('phase.yara'), icon: <DataObjectOutlinedIcon /> },
                          { label: t('phase.finished'), icon: <DoneOutlinedIcon /> }
                        ]}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}
          </Grid>

          <Grid item style={{ textAlign: 'center' }}>
            {retrohunt ? (
              retrohunt.creator && (
                <Typography variant="subtitle2" color="textSecondary">
                  {`${t('created_by')} ${retrohunt.creator} `}
                  <Moment fromNow locale={i18n.language}>
                    {retrohunt.created}
                  </Moment>
                </Typography>
              )
            ) : (
              <Skeleton />
            )}
          </Grid>

          <Grid item style={{ textAlign: 'center' }}>
            {retrohunt ? (
              retrohunt.expiry_ts && (
                <Typography variant="subtitle2" color="textSecondary">
                  {`${t('expire')} `}
                  <Moment fromNow locale={i18n.language}>
                    {retrohunt.expiry_ts}
                  </Moment>
                </Typography>
              )
            ) : (
              <Skeleton />
            )}
          </Grid>

          <Grid item>
            <Grid container flexDirection="row" rowGap={1} columnGap={3}>
              <Grid item flex={1}>
                <Typography variant="subtitle2">{t('details.description')}</Typography>
                {!retrohunt ? (
                  <Skeleton style={{ height: '2.5rem' }} />
                ) : (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {retrohunt?.description}
                  </Paper>
                )}
              </Grid>

              <Grid item sm={12} md={5}>
                <Typography variant="subtitle2">{t('details.search')}</Typography>
                {!retrohunt ? (
                  <Skeleton style={{ height: '2.5rem' }} />
                ) : (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {retrohunt?.archive_only ? t('details.archive_only') : t('details.all')}
                  </Paper>
                )}
              </Grid>
            </Grid>
          </Grid>

          <Grid item>
            {!retrohunt ? (
              <Skeleton
                style={{ height: '100%', minHeight: '450px', transform: 'none', marginTop: theme.spacing(1) }}
              />
            ) : (
              <Grid container flexDirection="column" height="100%" minHeight="450px" marginTop={theme.spacing(1)}>
                <MonacoEditor
                  language="yara"
                  value={'yara_signature' in retrohunt ? retrohunt.yara_signature : ''}
                  options={{ readOnly: true }}
                />
              </Grid>
            )}
          </Grid>

          <Grid item>
            <Grid container gap={1}>
              <Grid item xs={12} marginTop={2}>
                <Typography variant="h6">{t('header.results')}</Typography>
              </Grid>
              {!retrohunt ? (
                <Grid item>
                  <Skeleton className={classes.skeletonCustomChip} variant="rectangular" />
                </Grid>
              ) : (
                'truncated' in retrohunt &&
                retrohunt.truncated && (
                  <Grid item>
                    <Tooltip title={t('truncated.tooltip')}>
                      <span>
                        <CustomChip type="round" size="small" variant="outlined" color="error" label={t('truncated')} />
                      </span>
                    </Tooltip>
                  </Grid>
                )
              )}

              {!retrohunt ? (
                <Grid item>
                  <Skeleton className={classes.skeletonCustomChip} variant="rectangular" />
                </Grid>
              ) : (
                'tags' in retrohunt &&
                Object.keys(retrohunt.tags).length > 0 &&
                Object.keys(retrohunt.tags).map((key, i) => (
                  <Grid item>
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

          <Grid item marginTop={1}>
            {!retrohunt ? (
              <Skeleton style={{ height: '100%', transform: 'none', marginTop: theme.spacing(1) }} />
            ) : (
              <SearchBar
                initValue={query ? query.get('query', '') : ''}
                placeholder={t('hits.filter')}
                searching={isReloading}
                suggestions={suggestions}
                onValueChange={value => {
                  filterValue.current = value;
                }}
                onClear={() => handleQueryRemove(['query', 'rows', 'offset'])}
                onSearch={() => {
                  if (filterValue.current !== '') {
                    handleQueryChange('query', filterValue.current);
                    handleQueryChange('offset', 0);
                  } else handleQueryRemove(['query', 'rows', 'offset']);
                }}
              >
                <div className={classes.results}>
                  {hitResults && 'total' in hitResults && hitResults.total !== 0 && (
                    <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                      {isReloading ? (
                        <span>{t('searching')}</span>
                      ) : (
                        <span>
                          <SearchResultCount count={hitResults.total} />
                          {query.get('query') || query.get('filters')
                            ? t(`hits.filtered${hitResults.total === 1 ? '' : 's'}`)
                            : t(`hits.total${hitResults.total === 1 ? '' : 's'}`)}
                          {retrohunt?.total_hits && (
                            <>
                              {` (`}
                              <SearchResultCount count={retrohunt.total_hits} />
                              {t(`total_hits.total${retrohunt.total_hits === 1 ? '' : 's'}`)}
                              {')'}
                            </>
                          )}
                        </span>
                      )}
                    </Typography>
                  )}
                  {hitPageCount > 1 && (
                    <Pagination
                      page={Math.ceil(1 + query.get('offset') / PAGE_SIZE)}
                      onChange={(e, value) => handleQueryChange('offset', (value - 1) * PAGE_SIZE)}
                      count={hitPageCount}
                      shape="rounded"
                      size="small"
                    />
                  )}
                </div>
                {query && (
                  <div>
                    <ChipList
                      items={query.getAll('filters', []).map(
                        f =>
                          ({
                            color: f.indexOf('NOT ') === 0 ? 'error' : null,
                            label: `${f}`,
                            variant: 'outlined',
                            onClick: () => {
                              query.replace(
                                'filters',
                                f,
                                f.indexOf('NOT ') === 0 ? f.substring(5, f.length - 1) : `NOT (${f})`
                              );
                              handleNavigate(query);
                            },
                            onDelete: () => {
                              query.remove('filters', f);
                              handleNavigate(query);
                            }
                          } as CustomChipProps)
                      )}
                    />
                  </div>
                )}
              </SearchBar>
            )}
          </Grid>

          <Grid item>
            <LineGraph
              dataset={typeDataSet}
              height="200px"
              title={t('graph.type.title')}
              datatype={t('graph.type.datatype')}
              onClick={(evt, element) => {
                if (!isReloading && element.length > 0) {
                  var ind = element[0].index;
                  query.add('filters', `type:${safeFieldValue(Object.keys(typeDataSet)[ind])}`);
                  handleNavigate(query);
                }
              }}
            />
          </Grid>

          <Grid item>
            {!hitResults ? (
              <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
            ) : hitResults.total === 0 ? (
              <div style={{ width: '100%' }}>
                <InformativeAlert>
                  <AlertTitle>{t('no_results_title')}</AlertTitle>
                  {t('no_results_desc')}
                </InformativeAlert>
              </div>
            ) : (
              <TableContainer
                id="hits-table"
                component={Paper}
                sx={{ border: isDrawer && `1px solid ${theme.palette.divider}` }}
              >
                <DivTable stickyHeader>
                  <DivTableHead>
                    <DivTableRow>
                      <SortableHeaderCell
                        query={query}
                        children={t('details.lasttimeseen')}
                        sortName="sort"
                        sortField="seen.last"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.count')}
                        sortName="sort"
                        sortField="seen.count"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.sha256')}
                        sortName="sort"
                        sortField="sha256"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.filetype')}
                        sortName="sort"
                        sortField="type"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.size')}
                        sortName="sort"
                        sortField="size"
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      {c12nDef.enforce && (
                        <SortableHeaderCell
                          query={query}
                          children={t('details.classification')}
                          sortName="sort"
                          sortField="classification"
                          onSort={(e, { name, field }) => handleQueryChange(name, field)}
                          sx={{ zIndex: 'auto' }}
                        />
                      )}
                      <DivTableCell sx={{ zIndex: 'auto' }} />
                    </DivTableRow>
                  </DivTableHead>
                  <DivTableBody id="hit-body">
                    {hitResults.items.map((file, i) => (
                      <LinkRow
                        key={i}
                        component={Link}
                        to={`/file/detail/${file.sha256}`}
                        hover
                        style={{ textDecoration: 'none' }}
                        onClick={event => {
                          event.preventDefault();
                          handleHitRowClick(file);
                        }}
                        selected={
                          isDrawer
                            ? location.pathname.endsWith(`/${file?.sha256}`)
                            : location.hash.startsWith(`#${file?.sha256}`)
                        }
                      >
                        <DivTableCell>
                          <Tooltip title={file.seen.last}>
                            <>
                              <Moment fromNow locale={i18n.language}>
                                {file.seen.last}
                              </Moment>
                            </>
                          </Tooltip>
                        </DivTableCell>
                        <DivTableCell>{file.seen.count}</DivTableCell>
                        <DivTableCell breakable>{file.sha256}</DivTableCell>
                        <DivTableCell>{file.type}</DivTableCell>
                        <DivTableCell>{file.size}</DivTableCell>
                        {c12nDef.enforce && (
                          <DivTableCell>
                            <Classification type="text" size="tiny" c12n={file.classification} format="short" />
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
        </Grid>
      </PageLayout>
    );
}

export const RetrohuntDetail = React.memo(WrappedRetrohuntDetail);

const defaultProps: Props = {
  id: null,
  isDrawer: false
};
WrappedRetrohuntDetail.defaultProps = defaultProps;
export default WrappedRetrohuntDetail;
