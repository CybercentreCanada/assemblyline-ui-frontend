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
import PageFullSize from 'commons/components/pages/PageFullSize';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
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
import CustomChip from 'components/visual/CustomChip';
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
  code: string;
};

type Props = {
  code?: string;
  isDrawer?: boolean;
};

const PAGE_SIZE = 10;

const MAX_TRACKED_RECORDS = 10000;

const RELOAD_DELAY = 5000;

const DEFAULT_PARAMS: object = {
  fl: 'seen.last,seen.count,sha256,type,size,classification,from_archive',
  offset: 0,
  query: '*',
  rows: PAGE_SIZE,
  sort: 'seen.last+desc'
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

function WrappedRetrohuntDetail({ code: propCode = null, isDrawer = false }: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { setGlobalDrawer } = useDrawer();
  const { indexes } = useALContext();

  const { c12nDef, configuration } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>(null);
  const [hits, setHits] = useState<RetrohuntHitResult>(null);
  const [isErrorOpen, setIsErrorOpen] = useState<boolean>(false);
  const [types, setTypes] = useState<{ [k: string]: number }>(null);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(
    new SimpleSearchQuery(isDrawer ? '' : location.search, DEFAULT_QUERY)
  );

  const filterValue = useRef<string>('');
  const timer = useRef<boolean>(false);

  const DEFAULT_RETROHUNT = useMemo<RetrohuntResult>(
    () => ({
      archive_only: false,
      classification: c12nDef.UNRESTRICTED,
      code: null,
      created: '2020-01-01T00:00:00.000000Z',
      creator: null,
      description: '',
      errors: {
        items: [],
        offset: 0,
        rows: PAGE_SIZE,
        total: null
      },
      finished: false,
      hits: {
        items: [],
        offset: 0,
        rows: PAGE_SIZE,
        total: null
      },
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

  const progress = useMemo<number>(() => {
    if (!phase || !retrohunt || !Array.isArray(retrohunt?.progress) || retrohunt?.progress.length !== 2) return null;
    else if (phase === 'finished') return 100;
    else if (phase === 'yara')
      return Math.floor((100 * (retrohunt.progress[0] - retrohunt.progress[1])) / retrohunt.progress[0]);
    else if (phase === 'filtering') return Math.floor((100 * retrohunt.progress[0]) / retrohunt.progress[1]);
    else return null;
  }, [phase, retrohunt]);

  const hitPageCount = useMemo<number>(
    () => (hits && 'total' in hits ? Math.ceil(Math.min(hits.total, MAX_TRACKED_RECORDS) / PAGE_SIZE) : 0),
    [hits]
  );

  const PageLayout = useCallback<React.FC<any>>(
    props => (isDrawer ? <PageFullSize margin={2} {...props} /> : <PageFullWidth margin={4} {...props} />),
    [isDrawer]
  );

  const reloadData = useCallback(
    (curCode: string) => {
      if (currentUser.roles.includes('retrohunt_view')) {
        apiCall({
          url: `/api/v4/retrohunt/${curCode}/`,
          onSuccess: api_data => setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response }),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser.roles, retrohunt?.code]
  );

  const reloadHits = useCallback(
    (curCode: string, searchParam: string) => {
      const curQuery = new SimpleSearchQuery(searchParam, DEFAULT_QUERY);

      if (currentUser.roles.includes('retrohunt_view')) {
        apiCall({
          url: `/api/v4/retrohunt/hits/${curCode}/?${curQuery.toString()}`,
          onSuccess: api_data => setHits(api_data.api_response),
          onEnter: () => setIsReloading(true),
          onExit: () => setIsReloading(false)
        });
        apiCall({
          url: `/api/v4/retrohunt/types/${curCode}/?${curQuery.toString([
            'rows',
            'offset',
            'sort',
            'track_total_hits'
          ])}`,
          onSuccess: api_data => {
            let newTypes: { [k: string]: number } = api_data.api_response;
            newTypes = Object.fromEntries(
              Object.keys(newTypes)
                .sort((a, b) => newTypes[b] - newTypes[a])
                .map(k => [k, newTypes[k]])
            );
            setTypes(newTypes);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser.roles, retrohunt?.code]
  );

  const handleQueryChange = useCallback((key: string, value: string | number) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.set(key, value);
      return q;
    });
  }, []);

  const handleQueryRemove = useCallback((key: string | string[]) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      if (typeof key === 'string') q.delete(key);
      else key.forEach(k => q.delete(k));
      return q;
    });
  }, []);

  const handleFilterAdd = useCallback((filter: string) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.add('filters', `type:${safeFieldValue(filter)}`);
      return q;
    });
  }, []);

  const handleFilterChange = useCallback((filter: string) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.replace(
        'filters',
        filter,
        filter.indexOf('NOT ') === 0 ? filter.substring(5, filter.length - 1) : `NOT (${filter})`
      );
      return q;
    });
  }, []);

  const handleFilterRemove = useCallback((filter: string) => {
    setQuery(prev => {
      const q = new SimpleSearchQuery(prev.toString(), DEFAULT_QUERY);
      q.remove('filters', filter);
      return q;
    });
  }, []);

  const handleHitRowClick = useCallback(
    (file: FileResult) => {
      if (isDrawer) navigate(`/file/detail/${file.sha256}`);
      else navigate(`${location.pathname}${location.search}#${file.sha256}`);
    },
    [isDrawer, location, navigate]
  );

  useEffect(() => {
    reloadData(isDrawer ? propCode : paramCode);
  }, [isDrawer, paramCode, propCode, reloadData]);

  useEffect(() => {
    reloadHits(isDrawer ? propCode : paramCode, query.toString());
  }, [isDrawer, paramCode, propCode, query, reloadHits]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        reloadData(retrohunt.code);
        reloadHits(retrohunt.code, isDrawer ? query.toString() : location.search);
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [reloadData, reloadHits, isDrawer, location.search, query, retrohunt]);

  useEffect(() => {
    if (!isDrawer && query) {
      const search = query.getDeltaString() === '' ? '' : `?${query.getDeltaString()}`;
      navigate(`${location.pathname}${search}${location.hash}`);
    }
  }, [isDrawer, location.hash, location.pathname, navigate, query]);

  useEffect(() => {
    if (!isDrawer && location.hash) {
      setGlobalDrawer(<FileDetail sha256={location.hash.substr(1)} />);
    }
  }, [isDrawer, location.hash, setGlobalDrawer]);

  if (!configuration?.datastore?.retrohunt?.enabled) return <NotFoundPage />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <ForbiddenPage />;
  else
    return (
      <PageLayout>
        <RetrohuntErrors retrohunt={retrohunt} open={isErrorOpen} onClose={() => setIsErrorOpen(false)} />
        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={1} marginBottom={theme.spacing(4)}>
          {c12nDef.enforce && (
            <Grid item>
              <Classification
                format="long"
                type="pill"
                c12n={retrohunt && 'classification' in retrohunt ? retrohunt.classification : null}
              />
            </Grid>
          )}

          <Grid item>
            <Grid container flexDirection="row">
              <Grid item flexGrow={1}>
                <Typography variant="h4" children={!retrohunt ? <Skeleton width="30rem" /> : t('header.view')} />
                <Typography variant="caption" children={!retrohunt ? <Skeleton width="20rem" /> : retrohunt.code} />
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

            {retrohunt && 'finished' in retrohunt && !retrohunt.finished && (
              <Grid item paddingTop={2}>
                <Grid container flexDirection="row" justifyContent="center">
                  <Grid item xs={12} sm={11} lg={10}>
                    <SteppedProgress
                      activeStep={['filtering', 'yara', 'finished'].indexOf(phase)}
                      progress={progress}
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

          <Grid item>
            <Typography variant="subtitle2">{t('details.description')}</Typography>
            {retrohunt ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {retrohunt?.description}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
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
                placeholder={t('filter')}
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
                  {hits && 'total' in hits && hits.total !== 0 && (
                    <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                      {isReloading ? (
                        <span>{t('searching')}</span>
                      ) : (
                        <span>
                          <SearchResultCount count={hits.total} />
                          {query.get('query')
                            ? t(`hits.filtered${hits.total === 1 ? '' : 's'}`)
                            : t(`hits.total${hits.total === 1 ? '' : 's'}`)}
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
                      items={query.getAll('filters', []).map(v => ({
                        variant: 'outlined',
                        label: `${v}`,
                        color: v.indexOf('NOT ') === 0 ? 'error' : null,
                        onClick: () => handleFilterChange(v),
                        onDelete: () => handleFilterRemove(v)
                      }))}
                    />
                  </div>
                )}
              </SearchBar>
            )}
          </Grid>

          <Grid item>
            <LineGraph
              dataset={types}
              height="200px"
              title={t('graph.type.title')}
              datatype={t('graph.type.datatype')}
              onClick={(evt, element) => {
                if (!isReloading && element.length > 0) {
                  var ind = element[0].index;
                  handleFilterAdd(Object.keys(types)[ind]);
                }
              }}
            />
          </Grid>

          <Grid item>
            {!hits ? (
              <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
            ) : hits.total === 0 ? (
              <div style={{ width: '100%' }}>
                <InformativeAlert>
                  <AlertTitle>{t('no_results_title')}</AlertTitle>
                  {t('no_results_desc')}
                </InformativeAlert>
              </div>
            ) : (
              <TableContainer id="hits-table" component={Paper}>
                <DivTable stickyHeader>
                  <DivTableHead>
                    <DivTableRow>
                      <SortableHeaderCell
                        query={query}
                        children={t('details.lasttimeseen')}
                        sortName="sort"
                        sortField="seen.last"
                        disableNavigation={isDrawer}
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.count')}
                        sortName="sort"
                        sortField="seen.count"
                        disableNavigation={isDrawer}
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.sha256')}
                        sortName="sort"
                        sortField="sha256"
                        disableNavigation={isDrawer}
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.filetype')}
                        sortName="sort"
                        sortField="type"
                        disableNavigation={isDrawer}
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      <SortableHeaderCell
                        query={query}
                        children={t('details.size')}
                        sortName="sort"
                        sortField="size"
                        disableNavigation={isDrawer}
                        onSort={(e, { name, field }) => handleQueryChange(name, field)}
                        sx={{ zIndex: 'auto' }}
                      />
                      {c12nDef.enforce && (
                        <SortableHeaderCell
                          query={query}
                          children={t('details.classification')}
                          sortName="sort"
                          sortField="classification"
                          disableNavigation={isDrawer}
                          onSort={(e, { name, field }) => handleQueryChange(name, field)}
                          sx={{ zIndex: 'auto' }}
                        />
                      )}
                      <DivTableCell sx={{ zIndex: 'auto' }} />
                    </DivTableRow>
                  </DivTableHead>
                  <DivTableBody id="hit-body">
                    {hits.items.map((file, id) => (
                      <LinkRow
                        key={id}
                        component={Link}
                        to={`/file/detail/${file.sha256}`}
                        hover
                        style={{ textDecoration: 'none' }}
                        onClick={event => {
                          event.preventDefault();
                          handleHitRowClick(file);
                        }}
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
  code: null,
  isDrawer: false
};
WrappedRetrohuntDetail.defaultProps = defaultProps;
export default WrappedRetrohuntDetail;
