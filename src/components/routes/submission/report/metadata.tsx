import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Button, Collapse, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(theme => ({
  alert: {
    '@media print': {
      backgroundColor: '#00000005',
      border: '1px solid #DDD',
      color: '#888'
    },
    backgroundColor: theme.palette.mode === 'dark' ? '#ffffff05' : '#00000005',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '4px',
    color: theme.palette.text.secondary,
    margin: '0.25rem 0',
    padding: '16px 8px',
    textAlign: 'center',
    whiteSpace: 'pre-wrap'
  },
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

function WrappedMetadata({ report }) {
  const { t } = useTranslation(['submissionReport']);
  const { configuration } = useALContext();
  const theme = useTheme();
  const classes = useStyles();
  const [metaOpen, setMetaOpen] = useState(false);

  return (
    (!report || Object.keys(report.metadata).length !== 0) && (
      <div
        className={
          Object.keys(report.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
            .length === 0
            ? 'no-print'
            : classes.section
        }
      >
        <div className={classes.section_title}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="h6">{t('metadata')}</Typography>
            {report &&
              report.metadata &&
              Object.keys(report.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                .length !== 0 && (
                <Button
                  size="small"
                  onClick={() => setMetaOpen(!metaOpen)}
                  style={{ color: theme.palette.text.secondary }}
                  className="no-print"
                >
                  {!metaOpen ? (
                    <>
                      {t('meta.more')}
                      <KeyboardArrowDownIcon style={{ marginLeft: theme.spacing(1) }} />
                    </>
                  ) : (
                    <>
                      {t('meta.less')}
                      <KeyboardArrowUpIcon style={{ marginLeft: theme.spacing(1) }} />
                    </>
                  )}
                </Button>
              )}
          </div>
          <Divider className={classes.divider} />
        </div>
        <div className={classes.section_content}>
          {report ? (
            Object.keys(report.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
              .length !== 0 ? (
              <table width="100%">
                <tbody>
                  {Object.keys(report.metadata)
                    .filter(k => configuration.ui.alerting_meta.important.indexOf(k) !== -1)
                    .map((meta, i) => (
                      <tr key={i}>
                        <td style={{ width: '20%' }}>
                          <span style={{ fontWeight: 500 }}>{meta}</span>
                        </td>
                        <td style={{ marginLeft: theme.spacing(1), width: '80%', wordBreak: 'break-word' }}>
                          {report.metadata[meta]}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <Collapse in={!metaOpen} timeout="auto">
                <pre className={classes.alert}>{t('meta.empty')}</pre>
              </Collapse>
            )
          ) : (
            <table width="100%">
              <tbody>
                {[...Array(3)].map((_, i) => (
                  <tr key={i} style={{ width: '100%' }}>
                    <td width="33%">
                      <Skeleton />
                    </td>
                    <td width="67%">
                      <Skeleton />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {report &&
            Object.keys(report.metadata).filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
              .length !== 0 && (
              <Collapse in={metaOpen} timeout="auto">
                <table width="100%">
                  <tbody>
                    {Object.keys(report.metadata)
                      .filter(k => configuration.ui.alerting_meta.important.indexOf(k) === -1)
                      .map((meta, i) => (
                        <tr key={i}>
                          <td style={{ width: '20%' }}>
                            <span style={{ fontWeight: 500 }}>{meta}</span>
                          </td>
                          <td style={{ marginLeft: theme.spacing(1), width: '80%', wordBreak: 'break-word' }}>
                            {report.metadata[meta]}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Collapse>
            )}
        </div>
      </div>
    )
  );
}

const Metadata = React.memo(WrappedMetadata);
export default Metadata;
