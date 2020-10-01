import { Box, Divider, Grid, IconButton, Typography, useTheme } from '@material-ui/core';
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
      <Box textAlign="left">
        <Box pt={2} pb={4}>
          <Classification size="tiny" c12n={report ? report.classification : null} />
        </Box>

        <Box pb={4}>
          <Grid container>
            <Grid item xs={12} sm>
              <Box>
                <Typography variant="h4">{t('title')}</Typography>
                <Typography variant="caption">
                  {report ? report.sid : <Skeleton style={{ width: '10rem' }} />}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm>
              <Box textAlign="right">
                <IconButton>
                  <PrintOutlinedIcon />
                </IconButton>
                <Link to={`/submission/detail/${report ? report.sid : id}`}>
                  <IconButton>
                    <ListAltOutlinedIcon />
                  </IconButton>
                </Link>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box pb={2}>
          <Typography variant="h6">{t('general')}</Typography>
          <Divider />
          <Box py={2}>
            <Grid container spacing={1}>
              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.name')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.files[0].name : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.description')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.description : <Skeleton />}
              </Grid>

              <Grid item xs={12}>
                <Box p={1} />
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.verdict')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? <Verdict score={report.max_score} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('user.verdict')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? (
                  <Box>
                    {`${t('malicious')}: `}
                    <Box
                      component="span"
                      fontWeight={600}
                      color={theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark}
                    >
                      {report.verdict.malicious.length}
                    </Box>
                    {` / ${t('non_malicious')}: `}
                    <Box
                      component="span"
                      fontWeight={600}
                      color={theme.palette.type === 'dark' ? theme.palette.success.light : theme.palette.success.dark}
                    >
                      {report.verdict.non_malicious.length}
                    </Box>
                  </Box>
                ) : (
                  <Skeleton />
                )}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('submission.date')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? <Moment date={report.times.submitted} /> : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('submission.user')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.submitter : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('submission.services')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.params.services.selected.join(' | ') : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('submission.services.errors')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                <Box
                  component="span"
                  color={theme.palette.type === 'dark' ? theme.palette.error.light : theme.palette.error.dark}
                >
                  {report ? report.params.services.errors.join(' | ') : <Skeleton />}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box p={1} />
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.type')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.type : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.mime')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.mime : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.magic')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.magic : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.size')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10}>
                {report ? report.file_info.size : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.md5')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.md5 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.sha1')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.sha1 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.sha256')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.sha256 : <Skeleton />}
              </Grid>

              <Grid item xs={4} md={3} lg={2}>
                <Box fontWeight={500}>{t('file.ssdeep')}</Box>
              </Grid>
              <Grid item xs={8} md={9} lg={10} style={{ fontFamily: 'monospace', fontSize: 'larger' }}>
                {report ? report.file_info.ssdeep : <Skeleton />}
              </Grid>
            </Grid>
          </Box>
        </Box>

        {report && report.metadata ? (
          <Box pb={2}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider />
            <Box py={2}>
              {Object.keys(report.metadata).map((meta, i) => {
                return (
                  <Grid key={i} container spacing={1}>
                    <Grid item xs={4} md={3} lg={2}>
                      <Box fontWeight={500}>{meta}</Box>
                    </Grid>
                    <Grid item xs={8} md={9} lg={10}>
                      {report.metadata[meta]}
                    </Grid>
                  </Grid>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box pb={2}>
            <Typography variant="h6">{t('metadata')}</Typography>
            <Divider />
            <Box py={2}>
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
            </Box>
          </Box>
        )}

        {report && report.attack_matrix ? (
          <Box pb={2}>
            <Typography variant="h6">{t('attack')}</Typography>
            <Divider />
            <Box
              py={2}
              style={{
                columnWidth: '21rem',
                columnGap: '1rem',
                columnRuleWidth: '1px',
                columnRuleStyle: 'dotted',
                columnRuleColor: theme.palette.divider
              }}
            >
              {Object.keys(report.attack_matrix).map((att, i) => {
                return (
                  <Box
                    key={i}
                    height="100%"
                    width="100%"
                    display="inline-block"
                    pb={2}
                    style={{ pageBreakInside: 'avoid' }}
                  >
                    <Box fontSize="1.2rem">{att}</Box>
                    {Object.keys(report.attack_matrix[att]).map((cat, idx) => {
                      return (
                        <Box key={idx}>
                          <TextVerdict verdict={report.attack_matrix[att][cat].h_type} mono />
                          <Box display="inline" fontSize="1rem" style={{ verticalAlign: 'middle' }}>
                            {cat}
                          </Box>
                          <ul style={{ marginBlockStart: 0, fontSize: '80%' }}>
                            {report.attack_matrix[att][cat].files.map((file, fidx) => {
                              return <li key={fidx}>{file[0]}</li>;
                            })}
                          </ul>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box pb={2}>
            <Typography variant="h6">{t('attack')}</Typography>
            <Divider />
            <Box
              py={2}
              style={{
                columnWidth: '21rem',
                columnGap: '1rem',
                columnRuleWidth: '1px',
                columnRuleStyle: 'dotted',
                columnRuleColor: theme.palette.divider
              }}
            >
              {[...Array(5)].map((_, i) => {
                return (
                  <Box key={i} pb={2} height="100%" width="100%" display="inline-block">
                    <Skeleton style={{ height: '2rem' }} />
                    <Box display="flex" flexDirection="row">
                      <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '8px' }} />
                      <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
                    </Box>
                    <Skeleton style={{ marginLeft: '2rem' }} />
                    <Skeleton style={{ marginLeft: '2rem' }} />
                    <Skeleton style={{ marginLeft: '2rem' }} />
                    <Box display="flex" flexDirection="row">
                      <Skeleton style={{ height: '2rem', width: '1.5rem', marginRight: '8px' }} />
                      <Skeleton style={{ height: '2rem', flexGrow: 1 }} />
                    </Box>
                    <Skeleton style={{ marginLeft: '2rem' }} />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </PageCenter>
  );
}
