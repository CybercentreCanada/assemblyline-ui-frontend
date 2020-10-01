import { Divider, Grid, IconButton, Typography, useTheme } from '@material-ui/core';
import ListAltOutlinedIcon from '@material-ui/icons/ListAltOutlined';
import PrintOutlinedIcon from '@material-ui/icons/PrintOutlined';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import TextVerdict from 'components/visual/TextVerdict';
import Verdict from 'components/visual/Verdict';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useParams } from 'react-router-dom';

type ParamProps = {
  id: string;
};

export default function SubmissionReport() {
  const { t } = useTranslation(['submissionReport']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [report, setReport] = useState(null);
  const apiCall = useMyAPI();
  const sp2 = theme.spacing(2);
  const sp4 = theme.spacing(4);

  useEffect(() => {
    apiCall({
      url: `/api/v4/submission/report/${id}/`,
      onSuccess: api_data => {
        setReport(api_data.api_response);
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

              <Grid item xs={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.services.errors')}</span>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                <span
                  style={{
                    color: theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                  }}
                >
                  {report ? report.params.services.errors.join(' | ') : <Skeleton />}
                </span>
              </Grid>

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

        {report && report.metadata ? (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider />
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {Object.keys(report.metadata).map((meta, i) => {
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
              })}
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider />
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {[...Array(3)].map((_, i) => {
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

        {report && report.attack_matrix ? (
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
              {Object.keys(report.attack_matrix).map((att, i) => {
                return (
                  <div
                    key={i}
                    style={{
                      height: '100%',
                      width: '100%',
                      display: 'inline-block',
                      pageBreakInside: 'avoid',
                      paddingBottom: sp2
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{att}</span>
                    {Object.keys(report.attack_matrix[att]).map((cat, idx) => {
                      return (
                        <div key={idx}>
                          <TextVerdict verdict={report.attack_matrix[att][cat].h_type} mono />
                          <span style={{ fontSize: '1rem', verticalAlign: 'middle' }}>{cat}</span>
                          <ul style={{ marginBlockStart: 0, fontSize: '80%' }}>
                            {report.attack_matrix[att][cat].files.map((file, fidx) => {
                              return <li key={fidx}>{file[0]}</li>;
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: sp2 }}>
            <Typography variant="h6">{t('attack')}</Typography>
            <Divider />
            <div
              style={{
                paddingBottom: sp2,
                paddingTop: sp2,
                columnWidth: '21rem',
                columnGap: '1rem',
                columnRuleWidth: '1px',
                columnRuleStyle: 'dotted',
                columnRuleColor: theme.palette.divider
              }}
            >
              {[...Array(5)].map((_, i) => {
                return (
                  <div key={i} style={{ paddingBottom: sp2, height: '100%', width: '100%', display: 'inline-block' }}>
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
              })}
            </div>
          </div>
        )}
      </div>
    </PageCenter>
  );
}
