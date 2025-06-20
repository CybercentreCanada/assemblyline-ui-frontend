import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { ParsedSubmission } from 'components/models/base/submission';
import Moment from 'components/visual/Moment';
import Priority from 'components/visual/Priority';
import Verdict from 'components/visual/Verdict';
import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  submission: ParsedSubmission;
  serviceCategories: [string, string[]][];
};

const WrappedInfoSection: React.FC<Props> = ({ submission, serviceCategories }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const { classificationAliases } = useALContext();
  const [open, setOpen] = useState<boolean>(true);

  const sp2 = theme.spacing(2);

  // Calculate selected services by combining selected and rescan services, excluding any that are in the excluded list
  const selectedServices = useMemo(() => {
    if (!submission) return [];
    const selected = new Set([...submission.params.services.selected, ...submission.params.services.rescan]);
    const excluded = new Set(submission.params.services.excluded);

    // Account for services that were excluded but the category is still selected
    serviceCategories.forEach(tuple => {
      const [category, services] = tuple;

      if (submission.params.services.excluded.includes(category) && selected.has(category)) {
        // Remove category from selected
        selected.delete(category);
      }

      // If the category is selected, check to see if any of its services are excluded
      else if (!Array.from(services).every(service => excluded.has(service))) {
        // If not all services are excluded, substitute the category for the services that should be selected
        selected.delete(category);
        services.forEach(service => {
          if (!excluded.has(service)) {
            selected.add(service);
          }
        });
      }
    });

    return Array.from(selected);
  }, [submission, serviceCategories]);

  return (
    <div style={{ paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          '&:hover, &:focus': {
            color: theme.palette.text.secondary
          }
        }}
      >
        <span>{t('information')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              <Grid container size="grow">
                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('params.description')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                  {submission ? submission.params.description : <Skeleton />}
                </Grid>

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('params.groups')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                  {submission ? (
                    submission.params.groups
                      .map(group =>
                        group in classificationAliases
                          ? classificationAliases?.[group]?.name || classificationAliases?.[group]?.short_name || group
                          : group
                      )
                      .join(' | ')
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('params.services.selected')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                  {submission ? (
                    selectedServices.sort((a: string, b: string) => a.localeCompare(b)).join(' | ')
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                {submission && Object.keys(submission.params.service_spec).length !== 0 && (
                  <>
                    <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                      <span style={{ fontWeight: 500 }}>{t('params.services.service_spec')}</span>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
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

                {['generate_alert', 'deep_scan', 'ignore_cache', 'ignore_recursion_prevention', 'ignore_filtering'].map(
                  (k, i) => (
                    <Fragment key={i}>
                      <Grid size={{ xs: 4, sm: 3, lg: 2 }} style={{ paddingTop: theme.spacing(0.5) }}>
                        <span style={{ fontWeight: 500 }}>{t(`params.${k}`)}</span>
                      </Grid>
                      <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ height: theme.spacing(3.75) }}>
                        {submission ? (
                          submission.params[k] ? (
                            <CheckBoxOutlinedIcon />
                          ) : (
                            <CheckBoxOutlineBlankOutlinedIcon />
                          )
                        ) : (
                          <Skeleton
                            variant="rectangular"
                            style={{ width: theme.spacing(3), height: theme.spacing(3) }}
                          />
                        )}
                      </Grid>
                    </Fragment>
                  )
                )}

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('params.submitter')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                  {submission ? submission.params.submitter : <Skeleton />}
                </Grid>

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('max_score')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
                  {submission ? (
                    <Verdict score={submission.max_score} />
                  ) : (
                    <Skeleton variant="rectangular" style={{ width: theme.spacing(8), height: theme.spacing(2.5) }} />
                  )}
                </Grid>

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('params.priority')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
                  {submission ? (
                    <Priority priority={submission.params.priority} />
                  ) : (
                    <Skeleton variant="rectangular" style={{ width: theme.spacing(8), height: theme.spacing(2.5) }} />
                  )}
                </Grid>

                {submission && submission.params.ttl !== 0 && (
                  <>
                    <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                      <span style={{ fontWeight: 500 }}>{t('params.dtl')}</span>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 9, lg: 10 }} style={{ wordBreak: 'break-word' }}>
                      {submission.params.ttl}
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('times.submitted')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
                  {submission ? (
                    <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.submitted}</Moment>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>

                <Grid size={{ xs: 4, sm: 3, lg: 2 }}>
                  <span style={{ fontWeight: 500 }}>{t('times.completed')}</span>
                </Grid>
                <Grid size={{ xs: 8, sm: 9, lg: 10 }}>
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
