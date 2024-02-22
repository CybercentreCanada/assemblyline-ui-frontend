import { Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { TSubmissionReport } from 'components/models/ui/submission_report';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

const useStyles = makeStyles(theme => ({
  divider: {
    '@media print': {
      backgroundColor: '#0000001f !important'
    }
  },
  section_title: {
    marginTop: theme.spacing(4),
    pageBreakAfter: 'avoid',
    pageBreakInside: 'avoid'
  },
  section_content: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    pageBreakBefore: 'avoid',
    pageBreakInside: 'avoid'
  },
  section: {
    pageBreakInside: 'avoid'
  }
}));

type Props = {
  report: TSubmissionReport;
};

function WrappedGeneralInformation({ report }: Props) {
  const { t } = useTranslation(['submissionReport']);
  const theme = useTheme();
  const classes = useStyles();

  return (
    <div className={classes.section}>
      <div className={classes.section_title}>
        <Typography variant="h6">{t('general')}</Typography>
        <Divider className={classes.divider} />
      </div>
      <div className={classes.section_content}>
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
            <div style={{ height: theme.spacing(2) }} />
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
            {report ? (
              report.params.services.rescan ? (
                [
                  ...report.params.services.selected,
                  ...report.params.services.rescan.filter(word => report.params.services.selected.indexOf(word) === -1)
                ]
                  .sort((a: string, b: string) => a.localeCompare(b))
                  .join(' | ')
              ) : (
                report.params.services.selected.sort((a: string, b: string) => a.localeCompare(b)).join(' | ')
              )
            ) : (
              <Skeleton />
            )}
          </Grid>

          {report && report.params.services.errors.length !== 0 && (
            <>
              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('submission.services.errors')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                <span
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.error.light : theme.palette.error.dark
                  }}
                >
                  {report.params.services.errors.join(' | ')}
                </span>
              </Grid>
            </>
          )}

          {(!report || report.file_info) && report?.file_info?.type.startsWith('uri/') ? (
            <>
              <Grid item xs={12}>
                <div style={{ height: theme.spacing(2) }} />
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.scheme')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report.file_info?.uri_info ? report.file_info.uri_info.scheme : <Skeleton />}
              </Grid>

              {report.file_info?.uri_info?.username && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.username')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.username}
                  </Grid>
                </>
              )}

              {report.file_info?.uri_info?.password && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.password')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.password}
                  </Grid>
                </>
              )}

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.hostname')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10}>
                {report.file_info.uri_info.hostname}
              </Grid>

              {report.file_info?.uri_info?.port && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.port')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.port}
                  </Grid>
                </>
              )}

              {report.file_info?.uri_info?.path && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.path')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.path}
                  </Grid>
                </>
              )}

              {report.file_info?.uri_info?.params && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.params')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.params}
                  </Grid>
                </>
              )}

              {report.file_info?.uri_info?.query && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.query')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.query}
                  </Grid>
                </>
              )}

              {report.file_info?.uri_info?.fragment && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.fragment')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10}>
                    {report.file_info.uri_info.fragment}
                  </Grid>
                </>
              )}
            </>
          ) : (
            <>
              <Grid item xs={12}>
                <div style={{ height: theme.spacing(2) }} />
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
              <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {report ? report.file_info.md5 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha1')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {report ? report.file_info.sha1 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.sha256')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {report ? report.file_info.sha256 : <Skeleton />}
              </Grid>

              <Grid item xs={4} sm={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('file.ssdeep')}</span>
              </Grid>
              <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                {report ? report.file_info.ssdeep : <Skeleton />}
              </Grid>

              {report && report.file_info.tlsh && (
                <>
                  <Grid item xs={4} sm={3} lg={2}>
                    <span style={{ fontWeight: 500 }}>{t('file.tlsh')}</span>
                  </Grid>
                  <Grid item xs={8} sm={9} lg={10} style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                    {report.file_info.tlsh}
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </div>
    </div>
  );
}

const GeneralInformation = React.memo(WrappedGeneralInformation);
export default GeneralInformation;
