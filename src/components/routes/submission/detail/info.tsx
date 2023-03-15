import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import Priority from 'components/visual/Priority';
import Verdict from 'components/visual/Verdict';
import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';

const useStyles = makeStyles(theme => ({
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type InfoSectionProps = {
  submission: any;
};

const WrappedInfoSection: React.FC<InfoSectionProps> = ({ submission }) => {
  const { t } = useTranslation(['submissionDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        <span>{t('information')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container>
                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('params.description')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {submission ? submission.params.description : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('params.groups')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {submission ? submission.params.groups.join(' | ') : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('params.services.selected')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {submission ? (
                    submission.params.services.rescan ? (
                      [
                        ...submission.params.services.selected,
                        ...submission.params.services.rescan.filter(
                          word => submission.params.services.selected.indexOf(word) === -1
                        )
                      ]
                        .sort((a: string, b: string) => a.localeCompare(b))
                        .join(' | ')
                    ) : (
                      submission.params.services.selected.sort((a: string, b: string) => a.localeCompare(b)).join(' | ')
                    )
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                {submission && Object.keys(submission.params.service_spec).length !== 0 && (
                  <>
                    <Grid item xs={4} sm={3} lg={2}>
                      <span style={{ fontWeight: 500 }}>{t('params.services.service_spec')}</span>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                      {Object.keys(submission.params.service_spec).map(service => (
                        <div key={service}>
                          <i>{service}</i>:
                          {Object.keys(submission.params.service_spec[service]).map(service_var => (
                            <div key={service_var} style={{ paddingLeft: '1.5rem' }}>
                              {service_var} &rarr; {String(submission.params.service_spec[service][service_var])}
                            </div>
                          ))}
                        </div>
                      ))}
                    </Grid>
                  </>
                )}

                {[
                  'generate_alert',
                  'deep_scan',
                  'ignore_cache',
                  'ignore_dynamic_recursion_prevention',
                  'ignore_filtering'
                ].map((k, i) => (
                  <Fragment key={i}>
                    <Grid item xs={4} sm={3} lg={2} style={{ paddingTop: theme.spacing(0.5) }}>
                      <span style={{ fontWeight: 500 }}>{t(`params.${k}`)}</span>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10} style={{ height: theme.spacing(3.75) }}>
                      {submission ? (
                        submission.params[k] ? (
                          <CheckBoxOutlinedIcon />
                        ) : (
                          <CheckBoxOutlineBlankOutlinedIcon />
                        )
                      ) : (
                        <Skeleton variant="rectangular" style={{ width: theme.spacing(3), height: theme.spacing(3) }} />
                      )}
                    </Grid>
                  </Fragment>
                ))}

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('params.submitter')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                  {submission ? submission.params.submitter : <Skeleton />}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('max_score')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {submission ? (
                    <Verdict score={submission.max_score} />
                  ) : (
                    <Skeleton variant="rectangular" style={{ width: theme.spacing(8), height: theme.spacing(2.5) }} />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('params.priority')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {submission ? (
                    <Priority priority={submission.params.priority} />
                  ) : (
                    <Skeleton variant="rectangular" style={{ width: theme.spacing(8), height: theme.spacing(2.5) }} />
                  )}
                </Grid>

                {submission && submission.params.ttl !== 0 && (
                  <>
                    <Grid item xs={4} sm={3} lg={2}>
                      <span style={{ fontWeight: 500 }}>{t('params.dtl')}</span>
                    </Grid>
                    <Grid item xs={8} sm={9} lg={10} style={{ wordBreak: 'break-word' }}>
                      {submission.params.ttl}
                    </Grid>
                  </>
                )}

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('times.submitted')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {submission ? (
                    <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.submitted}</Moment>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid item xs={4} sm={3} lg={2}>
                  <span style={{ fontWeight: 500 }}>{t('times.completed')}</span>
                </Grid>
                <Grid item xs={8} sm={9} lg={10}>
                  {submission && submission.times.completed ? (
                    <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.completed}</Moment>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>
              </Grid>
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [submission, t]
        )}
      </Collapse>
    </div>
  );
};
const InfoSection = React.memo(WrappedInfoSection);

export default InfoSection;
