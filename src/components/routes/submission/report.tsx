import {
  createStyles,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
  useTheme,
  withStyles
} from '@material-ui/core';
import ListAltOutlinedIcon from '@material-ui/icons/ListAltOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Classification from 'components/visual/Classification';
import TextVerdict from 'components/visual/TextVerdict';
import Verdict from 'components/visual/Verdict';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useHistory, useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: '#6e6e6e25 !important',
      borderBottom: '1px solid #aaa !important'
    }
  })
)(TableCell);

const useStyles = makeStyles({
  malicious_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#f2000025 !important',
    borderBottom: '1px solid #d9534f !important'
  },
  suspicious_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#ff970025 !important',
    borderBottom: '1px solid #f0ad4e !important'
  },
  info_heur: {
    textTransform: 'capitalize',
    fontWeight: 700,
    padding: '5px',
    WebkitPrintColorAdjust: 'exact',
    backgroundColor: '#6e6e6e25 !important',
    borderBottom: '1px solid #aaa !important'
  }
});

function TagTable({ group, items }) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const sp2 = theme.spacing(2);
  return (
    <div style={{ paddingBottom: sp2 }}>
      <Typography variant="h6">{t(`tag.${group}`)}</Typography>
      <Divider />
      <div
        style={{
          paddingTop: sp2,
          paddingBottom: sp2
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <StyledTableCell />
                <StyledTableCell>{t('tag.table.type')}</StyledTableCell>
                <StyledTableCell>{t('tag.table.value')}</StyledTableCell>
                <StyledTableCell>{t('tag.table.files')}</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(items).map((tagType, typeIdx) =>
                Object.keys(items[tagType]).map((tagValue, valueIdx) => (
                  <TableRow key={`${typeIdx}_${valueIdx}`} style={{ verticalAlign: 'top' }}>
                    <TableCell>
                      <TextVerdict verdict={items[tagType][tagValue].h_type} mono />
                    </TableCell>
                    <TableCell style={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                      <Tooltip title={tagType}>
                        <span>{tagType.split('.').pop().replace('_', ' ')}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{tagValue}</TableCell>
                    <TableCell>
                      <ul
                        style={{
                          fontSize: '80%',
                          margin: 0,
                          paddingInlineStart: '12px',
                          overflowWrap: 'anywhere'
                        }}
                      >
                        {items[tagType][tagValue].files.map((f, fidx) => {
                          return <li key={fidx}>{f[0]}</li>;
                        })}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
      <span style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{attack.replaceAll('-', ' ')}</span>
      {Object.keys(items).map((cat, idx) => {
        return (
          <div key={idx}>
            <TextVerdict verdict={items[cat].h_type} mono />
            <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>{cat}</span>
            <ul style={{ marginBlockStart: 0, fontSize: '80%', overflowWrap: 'anywhere' }}>
              {items[cat].files.map((file, fidx) => {
                return <li key={fidx}>{file[0]}</li>;
              })}
            </ul>
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
      <Skeleton style={{ marginLeft: '2rem' }} />
      <Skeleton style={{ marginLeft: '2rem' }} />
      <Skeleton style={{ marginLeft: '2rem' }} />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '8px' }} />
        <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
      </div>
      <Skeleton style={{ marginLeft: '2rem' }} />
    </div>
  );
}

function HeuristicsList({ verdict, items }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const classMap = {
    malicious: classes.malicious_heur,
    suspicious: classes.suspicious_heur,
    info: classes.info_heur
  };

  return (
    <div
      style={{
        flexGrow: 1
      }}
    >
      <div className={classMap[verdict]} style={{ marginBottom: sp2, marginTop: sp2, fontSize: '1.2rem' }}>
        {t(`verdict.${verdict}`)}
      </div>
      {Object.keys(items).map((heur, idx) => {
        return (
          <div key={idx}>
            <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>{heur}</span>
            <ul style={{ marginBlockStart: 0, fontSize: '80%', overflowWrap: 'anywhere' }}>
              {items[heur].map((file, fidx) => {
                return <li key={fidx}>{file[0]}</li>;
              })}
            </ul>
          </div>
        );
      })}
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
      <Skeleton style={{ marginLeft: '2rem' }} />
      <Skeleton style={{ marginLeft: '2rem' }} />
      <Skeleton style={{ marginLeft: '2rem' }} />

      <Skeleton style={{ height: '2rem' }} />
      <Skeleton style={{ marginLeft: '2rem' }} />
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
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);
  const { showErrorMessage, showWarningMessage } = useMySnackbar();

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/report/${id}/`,
      onSuccess: api_data => {
        // setTimeout(() => {
        setReport(api_data.api_response);
        // }, 5000);
      },
      onFailure: api_data => {
        if (api_data.api_status_code === 425) {
          showWarningMessage(t('error.too_early'));
          history.replace(`/submission/detail/${id}`);
        } else {
          showErrorMessage(api_data.api_error_message);
        }
      }
    });
    // eslint-disable-next-line
  }, []);

  return (
    <PageCenter>
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: sp4, paddingTop: sp2 }}>
          <Classification size="tiny" c12n={report ? report.classification : null} />
        </div>

        <div style={{ paddingBottom: sp4 }}>
          <Grid container>
            <Grid item xs={12} sm>
              <div>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {report ? report.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm>
              <div style={{ textAlign: 'right' }}>
                <IconButton>
                  <PrintOutlinedIcon />
                </IconButton>
                <Link to={`/submission/detail/${report ? report.sid : id}`}>
                  <IconButton>
                    <ListAltOutlinedIcon />
                  </IconButton>
                </Link>
              </div>
            </Grid>
          </Grid>
        </div>

        <div style={{ paddingBottom: sp2 }}>
          <Typography variant="h6">{t('general')}</Typography>
          <Divider />
          <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
            <Grid container spacing={1}>
              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.name')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.files[0].name : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.description')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.description : <Skeleton />}
              </Grid>

              <Grid item xs={12}>
                <div style={{ height: sp2 }} />
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.verdict')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? <Verdict score={report.max_score} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('user.verdict')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? (
                  <>
                    {`${t('malicious')}: `}
                    <span
                      style={{
                        fontWeight: 600,
                        color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                      }}
                    >
                      {report.verdict.malicious.length}
                    </span>
                    {` / ${t('non_malicious')}: `}
                    <span
                      style={{
                        fontWeight: 600,
                        color: theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                      }}
                    >
                      {report.verdict.non_malicious.length}
                    </span>
                  </>
                ) : (
                  <Skeleton />
                )}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.date')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? <Moment date={report.times.submitted} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.user')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.submitter : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.services')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.services.selected.join(' | ') : <Skeleton />}
              </Grid>

              {report && report.params.services.errors.length !== 0 && (
                <>
                  <Grid item xs={4} md={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('submission.services.errors')}</span>
                  </Grid>
                  <Grid item xs={8} md={9} lg={10}>
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

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.type')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.type : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.mime')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.mime : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.magic')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.magic : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.size')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.size : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.md5')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.md5 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha1')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.sha1 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha256')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.sha256 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.ssdeep')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.ssdeep : <Skeleton />}
              </Grid>
            </Grid>
          </div>
        </div>

        {(!report || Object.keys(report.metadata).length !== 0) && (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider />
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {report
                ? Object.keys(report.metadata).map((meta, i) => {
                    return (
                      <Grid key={i} container spacing={1}>
                        <Grid item xs={4} md={3} lg={2}>
                          <span style={{ fontWeight: 500 }}>{meta}</span>
                        </Grid>
                        <Grid item xs={8} md={9} lg={10}>
                          {report.metadata[meta]}
                        </Grid>
                      </Grid>
                    );
                  })
                : [...Array(3)].map((_, i) => {
                    return (
                      <Grid key={i} container spacing={1}>
                        <Grid item xs={4} md={3} lg={2}>
                          <Skeleton />
                        </Grid>
                        <Grid item xs={8} md={9} lg={10}>
                          <Skeleton />
                        </Grid>
                      </Grid>
                    );
                  })}
            </div>
          </div>
        )}

        {(!report || Object.keys(report.attack_matrix).length !== 0) && (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('attack')}</Typography>
            <Divider />
            <div
              style={{
                paddingTop: sp2,
                paddingBottom: sp2,
                columnWidth: '21rem',
                columnGap: '1rem',
                columnRuleWidth: '1px',
                columnRuleStyle: 'dotted',
                columnRuleColor: theme.palette.divider
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
          Object.keys(report.heuristics.info.length !== 0)) && (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('heuristics')}</Typography>
            <Divider />
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
      </div>
    </PageCenter>
  );
}
