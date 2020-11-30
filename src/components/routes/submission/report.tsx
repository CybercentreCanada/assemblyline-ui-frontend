import {
  Divider,
  Grid,
  Hidden,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@material-ui/core';
import BugReportOutlinedIcon from '@material-ui/icons/BugReportOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ListAltOutlinedIcon from '@material-ui/icons/ListAltOutlined';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import VerifiedUserOutlinedIcon from '@material-ui/icons/VerifiedUserOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import TextVerdict from 'components/visual/TextVerdict';
import Verdict from 'components/visual/Verdict';
import VerdictGauge from 'components/visual/VerdictGauge';
import { bytesToSize, scoreToVerdict } from 'helpers/utils';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory, useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

const useStyles = makeStyles(theme => ({
  avatar: {
    display: 'inline-flex',
    width: theme.spacing(16),
    height: theme.spacing(16),
    marginRight: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      width: theme.spacing(12),
      height: theme.spacing(12),
      marginRight: 0
    }
  },
  banner_title: {
    fontWeight: 500,
    fontSize: '200%',
    [theme.breakpoints.down('xs')]: {
      fontSize: '180%'
    }
  },
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  file_details: {
    fontFamily: 'monospace',
    color: theme.palette.text.secondary,
    wordBreak: 'break-word',
    paddingBottom: '4px',
    '@media print': {
      color: 'rgba(0, 0, 0, 0.54)'
    }
  },
  icon: {
    marginLeft: '24px',
    marginRight: '36px',
    fontSize: '400%',
    [theme.breakpoints.down('xs')]: {
      marginLeft: '16px',
      marginRight: '20px',
      fontSize: '350%'
    },
    '@media print': {
      marginLeft: '24px',
      marginRight: '36px',
      fontSize: '400%'
    }
  },
  malicious_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#f2000015 !important',
    borderBottom: '1px solid #d9534f !important'
  },
  suspicious_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#ff970015 !important',
    borderBottom: '1px solid #f0ad4e !important'
  },
  info_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#6e6e6e15 !important',
    borderBottom: '1px solid #aaa !important'
  }
}));

function AttributionBanner({ report }) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  const sp1 = theme.spacing(1);
  const classes = useStyles();
  const score = report ? report.max_score : 0;

  const BANNER_COLOR_MAP = {
    info: {
      icon: <HelpOutlineIcon className={classes.icon} />,
      bgColor: '#6e6e6e15',
      textColor: theme.palette.type === 'dark' ? '#AAA' : '#888'
    },
    safe: {
      icon: <VerifiedUserOutlinedIcon className={classes.icon} />,
      bgColor: '#00f20015',
      textColor: theme.palette.type !== 'dark' ? theme.palette.success.dark : theme.palette.success.light
    },
    suspicious: {
      icon: <MoodBadIcon className={classes.icon} />,
      bgColor: '#ff970015',
      textColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    highly_suspicious: {
      icon: <MoodBadIcon className={classes.icon} />,
      bgColor: '#ff970015',
      textColor: theme.palette.type !== 'dark' ? theme.palette.warning.dark : theme.palette.warning.light
    },
    malicious: {
      icon: <BugReportOutlinedIcon className={classes.icon} />,
      bgColor: '#f2000015',
      textColor: theme.palette.type !== 'dark' ? theme.palette.error.dark : theme.palette.error.light
    }
  };

  const { bgColor, icon, textColor } = BANNER_COLOR_MAP[scoreToVerdict(score)];
  const implant =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.implant']
      ? Object.keys(report.tags.attributions['attribution.implant']).join(' | ')
      : null;
  const family =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.family']
      ? Object.keys(report.tags.attributions['attribution.family']).join(' | ')
      : null;
  const actor =
    report && report.tags && report.tags.attributions && report.tags.attributions['attribution.actor']
      ? Object.keys(report.tags.attributions['attribution.actor']).join(' | ')
      : null;

  return (
    <div
      style={{
        marginBottom: sp2,
        marginTop: sp2,
        padding: sp1,
        backgroundColor: bgColor,
        border: `solid 1px ${textColor}`,
        borderRadius: '4px'
      }}
    >
      <Grid container alignItems="center" justify="center">
        <Hidden smDown>
          <Grid item xs style={{ color: textColor }}>
            {icon}
          </Grid>
        </Hidden>
        <Grid item xs style={{ flexGrow: 10 }}>
          <div className={classes.banner_title}>
            {report ? <Verdict type="text" size="medium" score={report.max_score} /> : <Skeleton />}
          </div>
          <table width={report ? null : '100%'} style={{ borderSpacing: 0 }}>
            <tbody>
              <tr>
                {report ? (
                  implant && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('implant')}: `}
                      </td>
                      <td style={{ fontWeight: 500, paddingLeft: sp1 }}>
                        {Object.keys(report.tags.attributions['attribution.implant']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
              <tr>
                {report ? (
                  family && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('family')}: `}
                      </td>
                      <td style={{ fontWeight: 500, paddingLeft: sp1 }}>
                        {Object.keys(report.tags.attributions['attribution.family']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
              <tr>
                {report ? (
                  actor && (
                    <>
                      <td style={{ whiteSpace: 'nowrap', fontStyle: 'italic', verticalAlign: 'top' }}>
                        {`${t('actor')}: `}
                      </td>
                      <td style={{ fontWeight: 500, paddingLeft: sp1 }}>
                        {Object.keys(report.tags.attributions['attribution.actor']).join(' | ')}
                      </td>
                    </>
                  )
                ) : (
                  <td>
                    <Skeleton />
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </Grid>
        <Grid item xs style={{ color: textColor, paddingLeft: sp1, paddingRight: sp1 }}>
          {report ? (
            <VerdictGauge verdicts={report.verdict} />
          ) : (
            <Skeleton variant="circle" height="100px" width="100px" />
          )}
        </Grid>
      </Grid>
    </div>
  );
}

function TagTable({ group, items }) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const orderedItems = {};
  const sp2 = theme.spacing(2);
  const sp1 = theme.spacing(1);
  const classes = useStyles();

  Object.keys(items).map(tagType =>
    Object.keys(items[tagType]).map(tagValue => {
      const key = `${items[tagType][tagValue].h_type}_${tagType}`;
      if (!Object.hasOwnProperty.call(orderedItems, key)) {
        orderedItems[key] = { verdict: items[tagType][tagValue].h_type, type: tagType, values: [] };
      }
      orderedItems[key].values.push(tagValue);
      return null;
    })
  );

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
      <Typography variant="h6">{t(`tag.${group}`)}</Typography>
      <Divider className={classes.divider} />
      <div
        style={{
          paddingTop: sp2,
          paddingBottom: sp2,
          paddingLeft: sp1,
          paddingRight: sp1
        }}
      >
        <Grid container spacing={1}>
          {Object.keys(orderedItems).map((k, idx) => {
            return (
              <Grid key={idx} style={{ marginBottom: sp2, paddingLeft: sp1, paddingRight: sp1, minWidth: '21rem' }}>
                <Grid container spacing={1}>
                  <Grid item>
                    <div style={{ display: 'flex', minWidth: '5rem' }}>
                      <TextVerdict verdict={orderedItems[k].verdict} mono />
                      <Tooltip title={orderedItems[k].type}>
                        <span style={{ fontSize: '110%', flexGrow: 1, textTransform: 'capitalize' }}>
                          {orderedItems[k].type.split('.').pop().replace('_', ' ')}
                        </span>
                      </Tooltip>
                    </div>
                  </Grid>
                  <Grid item>
                    {orderedItems[k].values.map((v, vidx) => {
                      return (
                        <div
                          key={vidx}
                          style={{
                            paddingBottom: '5px',
                            wordBreak: 'break-word'
                          }}
                        >
                          {v}
                        </div>
                      );
                    })}
                  </Grid>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </div>
  );
}

function AttackMatrixBlock({ attack, items }) {
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid',
        paddingBottom: sp2
      }}
    >
      <span style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{attack.replace(/-/g, ' ')}</span>
      {Object.keys(items).map((cat, idx) => {
        return (
          <div key={idx}>
            <TextVerdict verdict={items[cat].h_type} mono />
            <span style={{ verticalAlign: 'middle' }}>{cat}</span>
          </div>
        );
      })}
    </div>
  );
}

function AttackMatrixSkel() {
  return (
    <div
      style={{
        paddingBottom: '1rem',
        height: '100%',
        width: '100%',
        display: 'inline-block',
        pageBreakInside: 'avoid'
      }}
    >
      <Skeleton style={{ height: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '8px' }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '8px' }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
    </div>
  );
}

function HeuristicsList({ verdict, items }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const sp1 = theme.spacing(1);
  const classMap = {
    malicious: classes.malicious_heur,
    suspicious: classes.suspicious_heur,
    info: classes.info_heur
  };

  return (
    <div
      style={{
        flexGrow: 1,
        minWidth: '200px'
      }}
    >
      <div className={classMap[verdict]} style={{ marginBottom: sp2, marginTop: sp2, fontSize: '1.2rem' }}>
        {t(`verdict.${verdict}`)}
      </div>
      <div style={{ paddingLeft: sp1, paddingRight: sp1 }}>
        {Object.keys(items).map((heur, idx) => {
          return (
            <div key={idx} style={{ fontSize: '1rem', verticalAlign: 'middle', paddingBottom: '2px' }}>
              {heur}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeuristicsListSkel() {
  return (
    <div
      style={{
        flexGrow: 1,
        margin: 5
      }}
    >
      <Skeleton style={{ height: '3.5rem' }} />

      <Skeleton style={{ height: '2rem' }} />
      <Skeleton style={{ height: '2rem' }} />
      <Skeleton style={{ height: '2rem' }} />
    </div>
  );
}

function FileTree({ tree, important_files }) {
  const classes = useStyles();

  return (
    <div>
      {Object.keys(tree).map((f, i) => {
        return important_files.indexOf(f) !== -1 ? (
          <div key={i} style={{ pageBreakInside: 'avoid' }}>
            <table style={{ borderSpacing: 0 }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top' }}>
                    <Verdict score={tree[f].score} short mono />
                  </td>
                  <td>
                    <b style={{ fontSize: '110%', wordBreak: 'break-word' }}>{tree[f].name.join(' | ')}</b>
                  </td>
                </tr>
                <tr>
                  <td />
                  <td>
                    <div className={classes.file_details}>
                      {`${tree[f].sha256} - ${tree[f].type} - `}
                      <b>{tree[f].size}</b>
                      <span style={{ fontWeight: 300 }}> ({bytesToSize(tree[f].size)})</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td />
                  <td>
                    <FileTree tree={tree[f].children} important_files={important_files} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null;
      })}
    </div>
  );
}

function FileTreeSkel() {
  function FileItemSkel() {
    return (
      <>
        <div style={{ display: 'flex' }}>
          <Skeleton style={{ height: '2rem', width: '2rem' }} />
          <Skeleton style={{ height: '2rem', marginLeft: '1rem', flexGrow: 1 }} />
        </div>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    );
  }

  return (
    <div>
      <FileItemSkel />
      <div style={{ marginLeft: '2rem' }}>
        <FileItemSkel />
      </div>
    </div>
  );
}

export default function SubmissionReport() {
  const { t } = useTranslation(['submissionReport']);
  const { id } = useParams<ParamProps>();
  const history = useHistory();
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const apiCall = useMyAPI();
  const sp1 = theme.spacing(1);
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const classes = useStyles();
  const { showErrorMessage, showWarningMessage } = useMySnackbar();
  const isPrinting = useMediaQuery('print');

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/report/${id}/`,
      onSuccess: api_data => {
        setReport(api_data.api_response);
      },
      onFailure: api_data => {
        if (api_data.api_status_code === 425) {
          showWarningMessage(t('error.too_early'));
          history.replace(`/submission/detail/${id}`);
        } else if (api_data.api_status_code === 404) {
          showErrorMessage(t('error.notfound'));
          history.replace('/notfound');
        } else {
          showErrorMessage(api_data.api_error_message);
        }
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter ml={isPrinting ? 2 : 4} mr={isPrinting ? 2 : 4} width="100%">
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={report ? report.classification : null} />
        </div>

        <div className="print-footer print-only">
          {`${t('title')} :: ${id} :: `}
          <Classification type="text" size="tiny" c12n={report ? report.classification : null} />
        </div>
        <div style={{ paddingBottom: sp2 }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <div>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {report ? report.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </div>
            </Grid>
            <Grid item className="print-only">
              <img src="images/banner.svg" alt="Assemblyline Banner" style={{ height: '72px' }} />
            </Grid>
            <Grid item xs={12} sm={3} className="no-print">
              <div style={{ textAlign: 'right' }}>
                <Tooltip title={t('print')}>
                  <IconButton onClick={() => window.print()}>
                    <PrintOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('detail_view')}>
                  <IconButton component={Link} to={`/submission/detail/${report ? report.sid : id}`}>
                    <ListAltOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </div>
            </Grid>
          </Grid>
        </div>

        <AttributionBanner report={report} />

        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          <Typography variant="h6">{t('general')}</Typography>
          <Divider className={classes.divider} />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            <Grid container spacing={1}>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.name')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {report ? report.files[0].name : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.description')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                {report ? report.params.description : <Skeleton />}
              </Grid>

              <Grid item xs={12}>
                <div style={{ height: sp2 }} />
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.date')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? <Moment date={report.times.submitted} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.user')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.params.submitter : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.services')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.params.services.selected.join(' | ') : <Skeleton />}
              </Grid>

              {report && report.params.services.errors.length !== 0 && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('submission.services.errors')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    <span
                      style={{
                        color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                    >
                      {report.params.services.errors.join(' | ')}
                    </span>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <div style={{ height: sp2 }} />
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.type')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.file_info.type : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.mime')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.file_info.mime : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.magic')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.file_info.magic : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.size')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report ? report.file_info.size : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.md5')}</span>
              </Grid>
              <Grid
                item
                xs={8}
                md={9}
                lg={10}
                style={{ fontFamily: 'monospace', fontSize: 'larger', wordBreak: 'break-word' }}
              >
                {report ? report.file_info.md5 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha1')}</span>
              </Grid>
              <Grid
                item
                xs={8}
                md={9}
                lg={10}
                style={{ fontFamily: 'monospace', fontSize: 'larger', wordBreak: 'break-word' }}
              >
                {report ? report.file_info.sha1 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha256')}</span>
              </Grid>
              <Grid
                item
                xs={8}
                md={9}
                lg={10}
                style={{ fontFamily: 'monospace', fontSize: 'larger', wordBreak: 'break-word' }}
              >
                {report ? report.file_info.sha256 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.ssdeep')}</span>
              </Grid>
              <Grid
                item
                xs={8}
                md={9}
                lg={10}
                style={{ fontFamily: 'monospace', fontSize: 'larger', wordBreak: 'break-word' }}
              >
                {report ? report.file_info.ssdeep : <Skeleton />}
              </Grid>
            </Grid>
          </div>
        </div>

        {(!report || Object.keys(report.metadata).length !== 0) && (
          <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider className={classes.divider} />
            <table style={{ paddingBottom: sp2, paddingTop: sp2, width: '100%' }}>
              <tbody>
                {report
                  ? Object.keys(report.metadata).map((meta, i) => {
                      return (
                        <tr key={i}>
                          <td style={{ width: '20%' }}>
                            <span style={{ fontWeight: 500 }}>{meta}</span>
                          </td>
                          <td style={{ paddingLeft: sp1, width: '80%', wordBreak: 'break-word' }}>
                            {report.metadata[meta]}
                          </td>
                        </tr>
                      );
                    })
                  : [...Array(3)].map((_, i) => {
                      return (
                        <tr key={i} style={{ width: '100%' }}>
                          <td width="33%">
                            <Skeleton />
                          </td>
                          <td width="67%">
                            <Skeleton />
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}

        {(!report || Object.keys(report.attack_matrix).length !== 0) && (
          <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
            <Typography variant="h6">{t('attack')}</Typography>
            <Divider className={classes.divider} />
            <div
              style={{
                paddingTop: sp2,
                paddingBottom: sp2,
                columnWidth: '21rem',
                columnGap: '1rem'
              }}
            >
              {report
                ? Object.keys(report.attack_matrix).map((att, i) => {
                    return <AttackMatrixBlock key={i} attack={att} items={report.attack_matrix[att]} />;
                  })
                : [...Array(5)].map((_, i) => {
                    return <AttackMatrixSkel key={i} />;
                  })}
            </div>
          </div>
        )}

        {(!report ||
          Object.keys(report.heuristics.malicious).length !== 0 ||
          Object.keys(report.heuristics.suspicious).length !== 0 ||
          Object.keys(report.heuristics.info).length !== 0) && (
          <div style={{ paddingBottom: sp2, paddingTop: sp2, pageBreakInside: 'avoid' }}>
            <Typography variant="h6">{t('heuristics')}</Typography>
            <Divider className={classes.divider} />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap'
              }}
            >
              {report ? (
                <>
                  {Object.keys(report.heuristics.malicious).length !== 0 && (
                    <HeuristicsList verdict="malicious" items={report.heuristics.malicious} />
                  )}
                  {Object.keys(report.heuristics.suspicious).length !== 0 && (
                    <HeuristicsList verdict="suspicious" items={report.heuristics.suspicious} />
                  )}
                  {Object.keys(report.heuristics.info).length !== 0 && (
                    <HeuristicsList verdict="info" items={report.heuristics.info} />
                  )}
                </>
              ) : (
                [...Array(3)].map((_, i) => {
                  return <HeuristicsListSkel key={i} />;
                })
              )}
            </div>
          </div>
        )}

        {report &&
          Object.keys(report.tags).length !== 0 &&
          Object.keys(report.tags).map((tagGroup, groupIdx) => {
            return <TagTable key={groupIdx} group={tagGroup} items={report.tags[tagGroup]} />;
          })}

        {(!report || report.important_files.length !== 0) && (
          <div style={{ paddingTop: sp2, pageBreakInside: 'avoid' }}>
            <Typography variant="h6">{t('important_files')}</Typography>
            <Divider className={classes.divider} />
            <div
              style={{
                paddingTop: sp2,
                paddingBottom: sp2
              }}
            >
              {report ? (
                <FileTree
                  tree={report.file_tree[report.files[0].sha256].children}
                  important_files={report.important_files}
                />
              ) : (
                <FileTreeSkel />
              )}
            </div>
          </div>
        )}
      </div>
    </PageCenter>
  );
}
