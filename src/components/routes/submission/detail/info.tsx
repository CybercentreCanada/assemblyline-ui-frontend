import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Button, Collapse, Divider, Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import useALContext from 'components/hooks/useALContext';
import type { SelectedService } from 'components/models/base/service';
import type { ParsedSubmission } from 'components/models/base/submission';
import Moment from 'components/visual/Moment';
import Priority from 'components/visual/Priority';
import Verdict from 'components/visual/Verdict';
import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  submission: ParsedSubmission;
};

const WrappedInfoSection: React.FC<Props> = ({ submission }) => {
  const { t } = useTranslation(['submissionDetail']);
  const theme = useTheme();
  const { classificationAliases, settings } = useALContext();

  const [open, setOpen] = useState<boolean>(true);
  const [expanded, setExpanded] = useState<boolean>(false);

  const sp2 = theme.spacing(2);
  const isDownMD = useMediaQuery(theme.breakpoints.down('md'));

  const groupedServices = useMemo<[string, string[], string[]][]>(() => {
    if (!submission) return [];

    const { selected = [], rescan = [], excluded = [] } = submission.params.services;

    const excludedSet = new Set(excluded);
    const includedSet = new Set([...selected, ...rescan]);

    const classifyService = (service: SelectedService, included: string[], excluded: string[]) => {
      const isExcluded = excludedSet.has(service.category) || excludedSet.has(service.name);
      const isIncluded = includedSet.has(service.category) || includedSet.has(service.name);
      if (isIncluded && !isExcluded) included.push(service.name);
      else excluded.push(service.name);
    };

    return settings.services
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(category => {
        const included: string[] = [];
        const excluded: string[] = [];
        category.services.forEach(service => classifyService(service, included, excluded));
        return [category.name, included, excluded];
      });
  }, [settings.services, submission]);

  const executedServices = useMemo<string[]>(() => {
    if (!groupedServices || groupedServices.length === 0) return [];

    return groupedServices
      .flatMap(([category, included, excluded]) =>
        included.length > 0 && excluded.length === 0 ? [category] : included
      )
      .sort((a, b) => a.localeCompare(b));
  }, [groupedServices]);

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
              <Button
                color="inherit"
                onClick={() => setExpanded(e => !e)}
                sx={{
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: `${theme.spacing(0.5)} ${theme.spacing(1)} ${theme.spacing(0.5)} ${theme.spacing(0)}`
                }}
                endIcon={
                  <ExpandMore
                    fontSize="small"
                    sx={{
                      transition: theme.transitions.create('transform', {
                        duration: theme.transitions.duration.shortest
                      }),
                      transform: 'rotate(0deg)',
                      ...(expanded && { transform: 'rotate(180deg)' })
                    }}
                  />
                }
              >
                {t('params.services.executed')}
              </Button>
            </Grid>
            <Grid
              size={{ xs: 8, sm: 9, lg: 10 }}
              sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              style={{ wordBreak: 'break-word' }}
            >
              {submission ? (
                <>
                  <Collapse in={!expanded} timeout="auto">
                    {executedServices.join(' | ')}
                  </Collapse>
                  <Collapse in={expanded} timeout="auto">
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        rowGap: theme.spacing(0.25),
                        ...(isDownMD && { gridTemplateColumns: '1fr' })
                      }}
                    >
                      {groupedServices.map(([cat, included, excluded]) => (
                        <>
                          <i {...(included.length === 0 && { style: { color: theme.palette.text.disabled } })}>
                            {`${cat}:`}
                          </i>
                          <div style={{ marginLeft: '1.5rem' }}>
                            <span>{included.join(' | ')}</span>
                            {included.length > 0 && excluded.length > 0 && <span>{' | '}</span>}
                            <span style={{ color: theme.palette.text.disabled }}>{excluded.join(' | ')}</span>
                          </div>
                        </>
                      ))}
                    </div>
                  </Collapse>
                </>
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
                      <Skeleton variant="rectangular" style={{ width: theme.spacing(3), height: theme.spacing(3) }} />
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
              {submission ? <Moment format="YYYY-MM-DD HH:mm:ss">{submission.times.submitted}</Moment> : <Skeleton />}
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
      </Collapse>
    </div>
  );
};
const InfoSection = React.memo(WrappedInfoSection);

export default InfoSection;
