import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import UpdateOutlinedIcon from '@mui/icons-material/UpdateOutlined';
import { AlertTitle, Collapse, Divider, Grid, Paper, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import { RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import MonacoEditor from 'components/visual/MonacoEditor';
import { FileResult } from 'components/visual/SearchResult/files';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useParams } from 'react-router-dom';

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
  circularProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  containerSpacer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  tableContainer: {
    // maxHeight: `calc(${10} * 32.34px)`
    maxHeight: `50vh`
  },
  tableCell: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
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

const RELOAD_DELAY = 5000;

// const PHASE_MAP: { [K in Phase]: { color: PossibleColors; label: string; icon: React.ReactNode } } = {
//   submitted: { color: 'default', label: 'submitted', icon: <UpdateIcon color="action" /> },
//   error: { color: 'error', label: 'error', icon: <ClearIcon color="error" /> },
//   finished: { color: 'primary', label: 'completed', icon: <DoneIcon color="primary" /> }
// };

function WrappedRetrohuntDetail({ code: propCode = null, isDrawer = false }: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const { c12nDef, configuration } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>(null);
  const [hits, setHits] = useState<FileResult[]>([]);
  const [isOpen, setIsOpen] = useState<OpenSection>({
    information: true,
    signature: false,
    results: true,
    errors: false
  });

  const previousHits = useRef<FileResult[]>([]);
  const timer = useRef<boolean>(false);
  const isFetching = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);

  const momentFormat = useMemo(
    () => (i18n.language === 'fr' ? 'dddd D MMMM YYYY [à] h[h]mm' : 'dddd, MMMM D, YYYY [at] h:mm'),
    [i18n.language]
  );

  const DEFAULT_RETROHUNT = useMemo<RetrohuntResult>(
    () => ({
      archive_only: false,
      classification: c12nDef.UNRESTRICTED,
      code: null,
      created: '2020-01-01T00:00:00.000000Z',
      creator: null,
      description: '',
      errors: [],
      finished: false,
      hits: [],
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

  // const phase = useMemo<RetrohuntPhase>(
  //   () => (retrohunt && 'phase' in retrohunt ? (retrohunt.phase as RetrohuntPhase) : null),
  //   [retrohunt]
  // );

  // const progress = useMemo<[number, number]>(
  //   () =>
  //     retrohunt && 'progress' in retrohunt && Array.isArray(retrohunt.progress) && retrohunt.progress.length === 2
  //       ? retrohunt.progress
  //       : [0, 0],
  //   [retrohunt]
  // );

  const handleIsOpenChange = useCallback(
    (key: keyof OpenSection) => () => setIsOpen(o => ({ ...o, [key]: !o[key] })),
    []
  );

  const handleReload = useCallback(
    (resultCode: string) => {
      if (currentUser.roles.includes('retrohunt_view')) {
        isFetching.current = true;
        apiCall({
          url: `/api/v4/retrohunt/${resultCode}/?offset=${offsetRef.current}&rows=${PAGE_SIZE}`,
          onSuccess: api_data => {
            const result: RetrohuntResult = api_data.api_response;
            setRetrohunt({ ...DEFAULT_RETROHUNT, ...result });
            setHits([...previousHits.current, ...result?.hits]);
            offsetRef.current = offsetRef.current + PAGE_SIZE;
          },
          onExit: () => {
            isFetching.current = false;
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [DEFAULT_RETROHUNT, currentUser]
  );

  const handleShouldFetch = useCallback((total_hits: number): boolean => {
    if (offsetRef.current + PAGE_SIZE >= total_hits) return false;

    const tableEl = document.getElementById('hits-table');
    if (!tableEl) return false;

    const tableRect = tableEl.getBoundingClientRect();
    const lastEl = document.getElementById('hit-body').lastElementChild;
    if (!lastEl) return true;

    const lastRect = lastEl.getBoundingClientRect();
    if (tableRect.bottom > lastRect.top && lastRect.bottom > tableRect.top) return true;

    return false;
  }, []);

  const handleHitsScroll = useCallback(() => {
    if (!isFetching.current && retrohunt && 'total_hits' in retrohunt && handleShouldFetch(retrohunt?.total_hits)) {
      previousHits.current = hits;
      handleReload(retrohunt?.code);
    }
  }, [handleReload, handleShouldFetch, hits, retrohunt]);

  useEffect(() => {
    previousHits.current = [];
    offsetRef.current = 0;
    handleReload(propCode || paramCode);
  }, [handleReload, propCode, paramCode]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        previousHits.current = [];
        offsetRef.current = 0;
        handleReload(retrohunt?.code);
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [handleReload, retrohunt]);

  useEffect(() => {
    handleHitsScroll();
  }, [handleHitsScroll]);

  if (!configuration?.datastore?.retrohunt?.enabled) return <NotFoundPage />;
  else if (!currentUser.roles.includes('retrohunt_view')) return <ForbiddenPage />;
  else
    return (
      <PageFullSize margin={isDrawer ? 2 : 4}>
        <Grid container flexDirection="column" flexWrap="nowrap" flex={1} spacing={2}>
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
              <Grid item>
                <CustomChip
                  icon={
                    !retrohunt ? (
                      <Skeleton variant="circular" width="1rem" height="1rem" />
                    ) : 'finished' in retrohunt ? (
                      retrohunt.finished ? (
                        <DoneOutlinedIcon color="primary" />
                      ) : (
                        <UpdateOutlinedIcon color="action" />
                      )
                    ) : (
                      <ClearOutlinedIcon color="error" />
                    )
                  }
                  label={
                    !retrohunt ? (
                      <Skeleton width="5rem" />
                    ) : 'finished' in retrohunt && retrohunt.finished ? (
                      t('status.completed')
                    ) : (
                      t('status.submitted')
                    )
                  }
                  color={retrohunt && 'finished' in retrohunt && retrohunt.finished ? 'primary' : 'default'}
                  variant="outlined"
                />
                {/* <CustomChip
                  icon={isLoading ? <Skeleton variant="circular" width="1rem" height="1rem" /> : PHASE_MAP[phase]?.icon}
                  label={isLoading ? <Skeleton width="5rem" /> : `${pourcentage}% ${t(`phase.${phase}`)} `}
                  color={isLoading ? 'default' : PHASE_MAP[phase]?.color}
                  variant="outlined"
                /> */}
              </Grid>
            </Grid>
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
                    <span className={classes.title}>{t('details.phase')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? <Skeleton width="auto" /> : 'phase' in retrohunt ? retrohunt.phase : null}
                  </Grid>

                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.progress')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {!retrohunt ? (
                      <Skeleton width="auto" />
                    ) : 'progress' in retrohunt ? (
                      retrohunt.progress.join(', ')
                    ) : null}
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
                    {!retrohunt ? <Skeleton width="auto" /> : 'truncated' in retrohunt ? retrohunt.truncated : null}
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
              <Grid container className={classes.collapse}>
                <Grid item xs={4} sm={3} lg={2}>
                  <span className={classes.title}>{t('details.hit-count')}</span>
                </Grid>
                <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                  {!retrohunt ? <Skeleton width="auto" /> : 'total_hits' in retrohunt ? retrohunt.total_hits : null}
                </Grid>

                <Grid className={clsx(classes.value, classes.containerSpacer)} item xs={12}>
                  {retrohunt && 'total_hits' in retrohunt && retrohunt.total_hits > 0 ? (
                    <TableContainer
                      id="hits-table"
                      className={classes.tableContainer}
                      component={Paper}
                      onScroll={handleHitsScroll}
                    >
                      <DivTable stickyHeader>
                        <DivTableHead>
                          <DivTableRow>
                            <DivTableCell children={t('details.lasttimeseen')} />
                            <DivTableCell children={t('details.count')} />
                            <DivTableCell children={t('details.sha256')} />
                            <DivTableCell children={t('details.filetype')} />
                            <DivTableCell children={t('details.size')} />
                            {c12nDef.enforce && <DivTableCell children={t('details.classification')} />}
                            <DivTableCell />
                          </DivTableRow>
                        </DivTableHead>
                        <DivTableBody id="hit-body">
                          {hits.map((file, id) => (
                            <LinkRow
                              key={id}
                              component={Link}
                              to={`/file/detail/${file.sha256}`}
                              hover
                              style={{ textDecoration: 'none' }}
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
                  ) : (
                    <div style={{ width: '100%' }}>
                      <InformativeAlert>
                        <AlertTitle>{t('no_results_title')}</AlertTitle>
                        {t('no_results_desc')}
                      </InformativeAlert>
                    </div>
                  )}
                </Grid>
              </Grid>
            </Collapse>
          </Grid>

          {retrohunt && 'errors' in retrohunt && Array.isArray(retrohunt.errors) && retrohunt.errors.length > 0 && (
            <Grid item>
              <Typography className={classes.header} variant="h6" onClick={handleIsOpenChange('errors')}>
                <span>{t('header.errors')}</span>
                {isOpen.errors ? <ExpandLess /> : <ExpandMore />}
              </Typography>
              <Divider />
              <Collapse in={isOpen.errors} timeout="auto">
                <Grid container className={classes.collapse}>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span className={classes.title}>{t('details.error-count')}</span>
                  </Grid>
                  <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                    {retrohunt.errors.length}
                  </Grid>

                  <Grid className={clsx(classes.value, classes.containerSpacer)} item xs={12}>
                    <TableContainer className={classes.tableContainer} component={Paper}>
                      <DivTable>
                        <DivTableBody>
                          {retrohunt.errors.map((error, i) => (
                            <DivTableRow key={`${i}`}>
                              <DivTableCell className={classes.tableCell}>{error}</DivTableCell>
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

WrappedRetrohuntDetail.defaultProps = {
  pageType: 'page',
  retrohuntCode: null,
  retrohuntRef: null
} as Props;

export default WrappedRetrohuntDetail;
