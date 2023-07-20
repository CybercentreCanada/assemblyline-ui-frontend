import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import {
  AlertTitle,
  Collapse,
  Divider,
  Grid,
  Pagination,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import { RetrohuntPhase, RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
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
import MonacoEditor from 'components/visual/MonacoEditor';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { FileResult } from 'components/visual/SearchResult/files';
import SearchResultCount from 'components/visual/SearchResultCount';
import SteppedProgress from 'components/visual/SteppedProgress';
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
  tableCell: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  windowCell: {
    display: 'block',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  results: {
    fontStyle: 'italic',
    paddingTop: theme.spacing(0.5),
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap'
  }
}));

type OpenSection = { [K in 'information' | 'signature' | 'results' | 'errors']: boolean };

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
  'errors.offset': 0,
  'errors.query': '.*',
  'errors.rows': PAGE_SIZE,
  'hits.fl': 'seen.last,seen.count,sha256,type,size,classification,from_archive',
  'hits.offset': 0,
  'hits.query': '*',
  'hits.rows': PAGE_SIZE,
  'hits.sort': 'seen.last+desc'
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
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [query, setQuery] = useState<SimpleSearchQuery>(
    new SimpleSearchQuery(isDrawer ? '' : location.search, DEFAULT_QUERY)
  );
  const [isOpen, setIsOpen] = useState<OpenSection>({
    information: true,
    signature: false,
    results: true,
    errors: false
  });

  const prevQuery = useRef<SimpleSearchQuery>(null);
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
      total_indices: 0,
      truncated: false,
      yara_signature: ''
    }),
    [c12nDef.UNRESTRICTED]
  );

  const hitsSuggestions = useMemo<string[]>(
    () => [...Object.keys(indexes.file).filter(name => indexes.file[name].indexed), ...DEFAULT_SUGGESTION],
    [indexes.file]
  );

  const momentFormat = useMemo(
    () => (i18n.language === 'fr' ? 'dddd D MMMM YYYY [à] h[h]mm' : 'dddd, MMMM D, YYYY [at] h:mm'),
    [i18n.language]
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
    () =>
      retrohunt && 'hits' in retrohunt && 'total' in retrohunt.hits
        ? Math.ceil(Math.min(retrohunt.hits.total, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [retrohunt]
  );

  const errorPageCount = useMemo<number>(
    () =>
      retrohunt && 'errors' in retrohunt && 'total' in retrohunt.errors
        ? Math.ceil(Math.min(retrohunt.errors.total, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [retrohunt]
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

  const handleReload = useCallback(
    (curCode: string, searchParam: string) => {
      const curQuery = new SimpleSearchQuery(searchParam, DEFAULT_QUERY);
      const sameQuery = Object.is(curQuery?.toString(), prevQuery.current?.toString());

      if (currentUser.roles.includes('retrohunt_view') && (!sameQuery || curCode !== retrohunt?.code)) {
        apiCall({
          method: 'POST',
          url: `/api/v4/retrohunt/${curCode}/`,
          body: curQuery.getParams(),
          onSuccess: api_data => {
            setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
            prevQuery.current = curQuery;
          },
          onEnter: () => {
            setIsReloading(true);
          },
          onExit: () => {
            setIsReloading(false);
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser.roles, retrohunt?.code]
  );

  const handleIsOpenChange = useCallback(
    (key: keyof OpenSection) => () => setIsOpen(o => ({ ...o, [key]: !o[key] })),
    []
  );

  const handleHitRowClick = useCallback(
    (file: FileResult) => {
      if (isDrawer) navigate(`/file/detail/${file.sha256}`);
      else navigate(`${location.pathname}${location.search}#${file.sha256}`);
    },
    [isDrawer, location, navigate]
  );

  useEffect(() => {
    if (isDrawer) handleReload(propCode, query.toString());
    else handleReload(paramCode, query.toString());
  }, [handleReload, isDrawer, paramCode, propCode, query]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        if (isDrawer) handleReload(retrohunt.code, query.toString());
        else handleReload(retrohunt.code, location.search);
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [handleReload, isDrawer, location.search, query, retrohunt]);

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
      <PageFullSize margin={isDrawer ? 2 : 4}>
        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2} marginBottom={theme.spacing(4)}>
          {c12nDef.enforce && (
            <Grid item paddingBottom={theme.spacing(2)}>
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
              {/* <Grid item>
                {(!retrohunt || (retrohunt && 'finished' in retrohunt && retrohunt.finished)) && (
                  <CustomChip
                    icon={
                      !retrohunt ? (
                        <Skeleton variant="circular" width="1rem" height="1rem" />
                      ) : (
                        'finished' in retrohunt && retrohunt.finished && <DoneOutlinedIcon color="primary" />
                      )
                    }
                    label={
                      !retrohunt ? (
                        <Skeleton width="5rem" />
                      ) : (
                        'finished' in retrohunt && retrohunt.finished && t('status.completed')
                      )
                    }
                    color={retrohunt && 'finished' in retrohunt && retrohunt.finished ? 'primary' : 'default'}
                    variant="outlined"
                  />
                )}
              </Grid> */}
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

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('information')}>
              <span>{t('header.information')}</span>
              {isOpen.information ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.information} timeout="auto">
              <div className={classes.collapse}>
                <Grid container>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.creator')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? <Skeleton width="auto" /> : 'creator' in retrohunt ? retrohunt.creator : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.created')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? (
                      <Skeleton width="auto" />
                    ) : 'created' in retrohunt ? (
                      <Moment locale={i18n.language} format={momentFormat}>
                        {retrohunt.created}
                      </Moment>
                    ) : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.search')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? (
                      <Skeleton width="auto" />
                    ) : !('archive_only' in retrohunt) ? null : retrohunt.archive_only ? (
                      t('details.archive_only')
                    ) : (
                      t('details.all')
                    )}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.tags')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? (
                      <Skeleton width="auto" />
                    ) : 'tags' in retrohunt && Object.keys(retrohunt.tags).length > 0 ? (
                      Object.keys(retrohunt.tags).join(', ')
                    ) : (
                      t('details.none')
                    )}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.truncated')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? (
                      <Skeleton width="auto" />
                    ) : !('truncated' in retrohunt) ? null : retrohunt.truncated ? (
                      t('details.yes')
                    ) : (
                      t('details.no')
                    )}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.description')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? <Skeleton width="auto" /> : 'description' in retrohunt ? retrohunt.description : null}
                  </Grid>
                </Grid>
              </div>
            </Collapse>
          </Grid>

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('signature')}>
              <span>{t('header.signature')}</span>
              {isOpen.signature ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.signature} timeout="auto">
              <div className={classes.collapse}>
                {!retrohunt ? (
                  <Skeleton style={{ height: '10rem', transform: 'none', marginTop: theme.spacing(1) }} />
                ) : (
                  <Grid container flexDirection="column" height="100%" minHeight="500px">
                    <MonacoEditor
                      language="yara"
                      value={'yara_signature' in retrohunt ? retrohunt.yara_signature : ''}
                      options={{ readOnly: true }}
                    />
                  </Grid>
                )}
              </div>
            </Collapse>
          </Grid>

          <Grid item>
            <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('results')}>
              <span>{t('header.results')}</span>
              {isOpen.results ? <ExpandLess /> : <ExpandMore />}
            </Typography>
            <Divider />
            <Collapse in={isOpen.results} timeout="auto">
              <Grid container className={classes.collapse} justifyContent="center">
                <Grid item xs={4} sm={3} lg={2}>
                  <span className={classes.title}>{t('details.total')}</span>
                </Grid>
                <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                  {!retrohunt ? <Skeleton width="auto" /> : 'total_hits' in retrohunt ? retrohunt.total_hits : null}
                </Grid>

                <Grid className={clsx(classes.value)} item xs={12}>
                  {!retrohunt ? (
                    <Skeleton
                      className={classes.containerSpacer}
                      variant="rectangular"
                      style={{ height: '6rem', borderRadius: '4px' }}
                    />
                  ) : (
                    <>
                      <div style={{ paddingTop: theme.spacing(1) }}>
                        <SearchBar
                          initValue={query ? query.get('hits.query', '') : ''}
                          placeholder={t('hits.filter')}
                          searching={isReloading}
                          suggestions={hitsSuggestions}
                          onValueChange={value => {
                            filterValue.current = value;
                          }}
                          onClear={() => handleQueryRemove(['hits.query', 'hits.rows', 'hits.offset'])}
                          onSearch={() => {
                            if (filterValue.current !== '') {
                              handleQueryChange('hits.query', filterValue.current);
                              handleQueryChange('hits.offset', 0);
                            } else handleQueryRemove(['hits.query', 'hits.rows', 'hits.offset']);
                          }}
                        >
                          <div className={classes.results}>
                            {retrohunt.hits.total !== 0 && (
                              <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                                {isReloading ? (
                                  <span>{t('searching')}</span>
                                ) : (
                                  <span>
                                    <SearchResultCount count={retrohunt.hits.total} />
                                    {query.get('query')
                                      ? t(`hits.filtered${retrohunt.hits.total === 1 ? '' : 's'}`)
                                      : t(`hits.total${retrohunt.hits.total === 1 ? '' : 's'}`)}
                                  </span>
                                )}
                              </Typography>
                            )}
                            {hitPageCount > 1 && (
                              <Pagination
                                page={Math.ceil(1 + query.get('hits.offset') / PAGE_SIZE)}
                                onChange={(e, value) => handleQueryChange('hits.offset', (value - 1) * PAGE_SIZE)}
                                count={hitPageCount}
                                shape="rounded"
                                size="small"
                              />
                            )}
                          </div>
                        </SearchBar>
                      </div>
                      {!('hits' in retrohunt) || retrohunt.hits.total === 0 ? (
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
                                  sortName="hits.sort"
                                  sortField="seen.last"
                                  disableNavigation={isDrawer}
                                  onSort={(e, { name, field }) => handleQueryChange(name, field)}
                                  sx={{ zIndex: 'auto' }}
                                />
                                <SortableHeaderCell
                                  query={query}
                                  children={t('details.count')}
                                  sortName="hits.sort"
                                  sortField="seen.count"
                                  disableNavigation={isDrawer}
                                  onSort={(e, { name, field }) => handleQueryChange(name, field)}
                                  sx={{ zIndex: 'auto' }}
                                />
                                <SortableHeaderCell
                                  query={query}
                                  children={t('details.sha256')}
                                  sortName="hits.sort"
                                  sortField="sha256"
                                  disableNavigation={isDrawer}
                                  onSort={(e, { name, field }) => handleQueryChange(name, field)}
                                  sx={{ zIndex: 'auto' }}
                                />
                                <SortableHeaderCell
                                  query={query}
                                  children={t('details.filetype')}
                                  sortName="hits.sort"
                                  sortField="type"
                                  disableNavigation={isDrawer}
                                  onSort={(e, { name, field }) => handleQueryChange(name, field)}
                                  sx={{ zIndex: 'auto' }}
                                />
                                <SortableHeaderCell
                                  query={query}
                                  children={t('details.size')}
                                  sortName="hits.sort"
                                  sortField="size"
                                  disableNavigation={isDrawer}
                                  onSort={(e, { name, field }) => handleQueryChange(name, field)}
                                  sx={{ zIndex: 'auto' }}
                                />
                                {c12nDef.enforce && (
                                  <SortableHeaderCell
                                    query={query}
                                    children={t('details.classification')}
                                    sortName="hits.sort"
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
                              {retrohunt.hits.items.map((file, id) => (
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
                    </>
                  )}
                </Grid>
              </Grid>
            </Collapse>
          </Grid>

          {retrohunt && 'errors' in retrohunt && retrohunt.errors.total !== 0 && (
            <Grid item>
              <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('errors')}>
                <span>{t('header.errors')}</span>
                {isOpen.errors ? <ExpandLess /> : <ExpandMore />}
              </Typography>
              <Divider />
              <Collapse in={isOpen.errors} timeout="auto">
                <Grid container className={classes.collapse} justifyContent="center">
                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.total')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {retrohunt.errors?.total}
                  </Grid>

                  <Grid className={clsx(classes.value)} item xs={12}>
                    <div style={{ paddingTop: theme.spacing(1) }}>
                      <SearchBar
                        initValue={query ? query.get('errors.query', '') : ''}
                        placeholder={t('errors.filter')}
                        searching={isReloading}
                        suggestions={[]}
                        onValueChange={value => (filterValue.current = value)}
                        onClear={() => handleQueryRemove(['errors.query', 'errors.rows', 'errors.offset'])}
                        onSearch={() => {
                          if (filterValue.current !== '') {
                            handleQueryChange('errors.query', filterValue.current);
                            handleQueryChange('errors.offset', 0);
                          } else handleQueryRemove(['errors.query', 'errors.rows', 'errors.offset']);
                        }}
                      >
                        <div className={classes.results}>
                          {retrohunt.errors.total !== 0 && (
                            <Typography variant="subtitle1" color="secondary" style={{ flexGrow: 1 }}>
                              {isReloading ? (
                                <span>{t('searching')}</span>
                              ) : (
                                <span>
                                  <SearchResultCount count={retrohunt.errors.total} />
                                  {query.get('query')
                                    ? t(`errors.filtered${retrohunt.errors.total === 1 ? '' : 's'}`)
                                    : t(`errors.total${retrohunt.errors.total === 1 ? '' : 's'}`)}
                                </span>
                              )}
                            </Typography>
                          )}
                          {errorPageCount > 1 && (
                            <Grid className={clsx(classes.value)} item>
                              <Pagination
                                page={Math.ceil(1 + query.get('errors.offset') / PAGE_SIZE)}
                                onChange={(e, value) => handleQueryChange('errors.offset', (value - 1) * PAGE_SIZE)}
                                count={errorPageCount}
                                shape="rounded"
                                size="small"
                                sx={{ textAlign: 'center', justifySelf: 'center' }}
                              />
                            </Grid>
                          )}
                        </div>
                      </SearchBar>
                    </div>

                    <TableContainer className={classes.tableContainer} component={Paper} style={{ overflow: 'hidden' }}>
                      <DivTable style={{ overflow: 'hidden' }}>
                        <DivTableHead>
                          <DivTableRow>
                            <SortableHeaderCell
                              query={query}
                              children={t('details.error')}
                              sortName="errors.sort"
                              sortField="error"
                              disableNavigation={isDrawer}
                              onSort={(e, { name, field }) => handleQueryChange(name, field)}
                            />
                          </DivTableRow>
                        </DivTableHead>
                        <DivTableBody id="error-body">
                          {retrohunt.errors.items.map((error, id) => (
                            <DivTableRow key={id} hover style={{ textDecoration: 'none' }}>
                              <DivTableCell>{error}</DivTableCell>
                            </DivTableRow>
                          ))}
                        </DivTableBody>
                      </DivTable>
                    </TableContainer>
                  </Grid>
                </Grid>
              </Collapse>
            </Grid>
          )}
        </Grid>
      </PageFullSize>
    );
}

export const RetrohuntDetail = React.memo(WrappedRetrohuntDetail);

const defaultProps: Props = {
  code: null,
  isDrawer: false
};
WrappedRetrohuntDetail.defaultProps = defaultProps;
export default WrappedRetrohuntDetail;
