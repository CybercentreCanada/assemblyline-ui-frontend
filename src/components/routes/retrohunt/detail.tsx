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
  LinearProgress,
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
import useMyAPI from 'components/hooks/useMyAPI';
import { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import NotFoundPage from 'components/routes/404';
import { RetrohuntPhase, RetrohuntResult } from 'components/routes/retrohunt';
import Classification from 'components/visual/Classification';
import { DivTable, DivTableBody, DivTableCell, DivTableHead, DivTableRow, LinkRow } from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import MonacoEditor from 'components/visual/MonacoEditor';
import SteppedProgress from 'components/visual/SteppedProgress';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useParams } from 'react-router-dom';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';

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

function WrappedRetrohuntDetail({ code: propCode = null, isDrawer = false }: Props) {
  const { t, i18n } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const classes = useStyles();
  const { apiCall } = useMyAPI();

  const { c12nDef, configuration } = useALContext();
  const { code: paramCode } = useParams<ParamProps>();
  const { user: currentUser } = useAppUser<CustomUser>();

  const [retrohunt, setRetrohunt] = useState<RetrohuntResult>(null);
  const [offset, setOffset] = useState<number>(0);
  const [isReloading, setIsReloading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<OpenSection>({
    information: true,
    signature: false,
    results: true,
    errors: false
  });

  const timer = useRef<boolean>(false);

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

  const nbOfPages = useMemo<number>(
    () =>
      retrohunt && 'total_hits' in retrohunt
        ? Math.ceil(Math.min(retrohunt.total_hits, MAX_TRACKED_RECORDS) / PAGE_SIZE)
        : 0,
    [retrohunt]
  );

  const handleReload: (prop: { code: string; offset?: number }) => void = useCallback(
    prop => {
      if (currentUser.roles.includes('retrohunt_view')) {
        apiCall({
          url: `/api/v4/retrohunt/${prop.code}/?offset=${prop.offset}&rows=${PAGE_SIZE}`,
          onSuccess: api_data => {
            setRetrohunt({ ...DEFAULT_RETROHUNT, ...api_data.api_response });
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
    [DEFAULT_RETROHUNT, currentUser.roles]
  );

  const handleIsOpenChange = useCallback(
    (key: keyof OpenSection) => () => setIsOpen(o => ({ ...o, [key]: !o[key] })),
    []
  );

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setOffset((value - 1) * PAGE_SIZE);
  }, []);

  useEffect(() => {
    handleReload({ code: propCode || paramCode, offset: offset });
  }, [handleReload, offset, paramCode, propCode]);

  useEffect(() => {
    if (!timer.current && retrohunt && 'finished' in retrohunt && !retrohunt.finished) {
      timer.current = true;
      setTimeout(() => {
        handleReload({ code: retrohunt.code, offset: offset });
        timer.current = false;
      }, RELOAD_DELAY);
    }
  }, [handleReload, offset, retrohunt]);

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
                  <span className={classes.title}>{t('details.hit-count')}</span>
                </Grid>
                <Grid className={classes.value} item xs={8} sm={9} lg={10}>
                  {!retrohunt ? <Skeleton width="auto" /> : 'total_hits' in retrohunt ? retrohunt.total_hits : null}
                </Grid>

                <Grid className={clsx(classes.value, classes.containerSpacer)} item marginBottom={theme.spacing(0.25)}>
                  {nbOfPages > 1 && (
                    <Pagination
                      count={nbOfPages}
                      onChange={handlePageChange}
                      shape="rounded"
                      size="small"
                      sx={{ textAlign: 'center', justifySelf: 'center' }}
                    />
                  )}
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
                      <div style={{ height: '4px' }}>{isReloading && <LinearProgress />}</div>
                      {'total_hits' in retrohunt && retrohunt.total_hits > 0 ? (
                        <TableContainer id="hits-table" component={Paper}>
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
                              {retrohunt.hits.map((file, id) => (
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
                      ) : (
                        <div style={{ width: '100%' }}>
                          <InformativeAlert>
                            <AlertTitle>{t('no_results_title')}</AlertTitle>
                            {t('no_results_desc')}
                          </InformativeAlert>
                        </div>
                      )}
                    </>
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
                        <DivTableBody style={{ height: '50vh', overflow: 'hidden' }}>
                          <AutoSizer>
                            {({ height, width }) => (
                              <List height={height} width={width} itemSize={32.75} itemCount={retrohunt.errors.length}>
                                {({ index, style }) => (
                                  <DivTableRow key={`${index}`} style={{ ...style }}>
                                    <DivTableCell className={clsx(classes.tableCell, classes.windowCell)}>
                                      {retrohunt.errors[index]}
                                    </DivTableCell>
                                  </DivTableRow>
                                )}
                              </List>
                            )}
                          </AutoSizer>
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
