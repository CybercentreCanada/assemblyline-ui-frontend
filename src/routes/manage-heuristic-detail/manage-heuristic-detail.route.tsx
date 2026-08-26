import ListOutlinedIcon from '@mui/icons-material/ListOutlined';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import type { PaperProps } from '@mui/material';
import { Grid, Paper, Skeleton, styled, Typography, useTheme } from '@mui/material';
import { createAppRoute, useAppPathParams } from 'core/routes';
import { AppPageCenter } from 'core/template';
import useALContext from 'deprecated/hooks/useALContext';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import type { Heuristic } from 'models/base/heuristic';
import type { Statistic } from 'models/base/statistic';
import { DEFAULT_STATS } from 'models/base/statistic';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ResultsTable } from 'routes/search/components/results';
import { safeFieldValueURI } from 'shared/utils/utils';
import { IconButton } from 'ui/buttons/IconButton';
import Classification from 'ui/Classification';
import Histogram from 'ui/Histogram';
import { PageHeader } from 'ui/layouts/PageHeader';
import Moment from 'ui/Moment';

const Preview = memo(
  styled(({ component = 'pre', variant = 'outlined', ...props }: PaperProps) => (
    <Paper component={component} variant={variant} {...props} />
  ))<PaperProps>(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    backgroundColor: theme.palette.background.default
  }))
);

export const ManageHeuristicDetailPage = memo(() => {
  const { t } = useTranslation(['manageHeuristicDetail']);
  const heuristicID = useAppPathParams<'/manage/heuristic/detail/:id'>()?.id;
  const theme = useTheme();
  const [heuristic, setHeuristic] = useState<Heuristic>(null);
  const [stats, setStats] = useState<Statistic>(DEFAULT_STATS);
  const [histogram, setHistogram] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const { apiCall } = useMyAPI();
  const { c12nDef, user: currentUser } = useALContext();

  useEffect(() => {
    if (currentUser.roles.includes('heuristic_view')) {
      apiCall({
        url: `/api/v4/heuristics/${heuristicID}/`,
        onSuccess: api_data => {
          setHeuristic(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heuristicID]);

  useEffect(() => {
    if (heuristic) {
      if (currentUser.roles.includes('submission_view')) {
        if (!heuristic.stats) {
          apiCall({
            method: 'POST',
            url: '/api/v4/search/stats/result/result.score/',
            body: { query: `result.sections.heuristic.heur_id:${heuristicID}` },
            onSuccess: api_data => {
              setStats(api_data.api_response);
            }
          });
        } else {
          setStats(heuristic.stats);
        }
        apiCall({
          method: 'POST',
          url: '/api/v4/search/histogram/result/created/',
          body: {
            query: `result.sections.heuristic.heur_id:${heuristicID}`,
            mincount: 0,
            start: 'now-30d/d',
            end: 'now+1d/d-1s',
            gap: '+1d'
          },
          onSuccess: api_data => {
            setHistogram(api_data.api_response);
          }
        });
        apiCall({
          method: 'GET',
          url: `/api/v4/search/result/?query=result.sections.heuristic.heur_id:${heuristicID}&rows=10`,
          onSuccess: api_data => {
            setResults(api_data.api_response);
          }
        });
      } else if (heuristic.stats) {
        setStats(heuristic.stats);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heuristic]);

  return (
    <AppPageCenter>
      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification size="tiny" c12n={heuristic ? heuristic.classification : null} />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <PageHeader
          primary={t('title')}
          secondary={() => heuristic.heur_id}
          secondaryLoading={!heuristic}
          slotProps={{
            root: { style: { marginBottom: theme.spacing(4) } }
          }}
          actions={
            <IconButton
              loading={!heuristic}
              preventRender={!currentUser.roles.includes('submission_view')}
              size="large"
              sx={{ color: theme.palette.action.active }}
              nav={nav =>
                nav.to().create({
                  route: '/search/:index',
                  path: { index: 'result' },
                  search: { query: `result.sections.heuristic.heur_id:${safeFieldValueURI(heuristic.heur_id)}` }
                })
              }
              tooltip={t('usage')}
            >
              <YoutubeSearchedForIcon />
            </IconButton>
          }
        />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">{t('name')}</Typography>
            {heuristic ? <Preview>{heuristic.name}</Preview> : <Skeleton style={{ height: '2.5rem' }} />}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2">{t('filetype')}</Typography>
            {heuristic ? <Preview>{heuristic.filetype}</Preview> : <Skeleton style={{ height: '2.5rem' }} />}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">{t('desc')}</Typography>
            {heuristic ? <Preview>{heuristic.description}</Preview> : <Skeleton style={{ height: '2.5rem' }} />}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">{t('score')}</Typography>
            {heuristic ? <Preview>{heuristic.score}</Preview> : <Skeleton style={{ height: '2.5rem' }} />}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">{t('max_score')}</Typography>
            {heuristic ? (
              <Preview>{heuristic.max_score || t('no_max')}</Preview>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="subtitle2">{t('attack_id')}</Typography>
            {heuristic ? (
              <Preview>
                {heuristic.attack_id && heuristic.attack_id.length !== 0
                  ? heuristic.attack_id.join(', ')
                  : t('no_attack_id')}
              </Preview>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2">{t('signature_score_map')}</Typography>
            {heuristic ? (
              <Preview>
                {heuristic.signature_score_map && Object.keys(heuristic.signature_score_map).length !== 0 ? (
                  <Grid container spacing={1}>
                    {Object.keys(heuristic.signature_score_map).map((key, i) => (
                      <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                        {`${key} = ${heuristic.signature_score_map[key]}`}
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  t('no_sigs')
                )}
              </Preview>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6">{t('statistics')}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('hits')}
            </Typography>
            <Grid container size="grow">
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.count')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{heuristic && stats ? stats.count : <Skeleton />}</Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.first')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {heuristic && stats ? (
                  stats.first_hit ? (
                    <Moment variant="fromNow">{stats.first_hit}</Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('hit.last')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {heuristic && stats ? (
                  stats.last_hit ? (
                    <Moment variant="fromNow">{stats.last_hit}</Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('contribution')}
            </Typography>
            <Grid container size="grow">
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.min')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{heuristic && stats ? stats.min : <Skeleton />}</Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.avg')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>
                {heuristic && stats ? Number(stats.avg).toFixed(0) : <Skeleton />}
              </Grid>
              <Grid size={{ xs: 3, sm: 4, md: 3, lg: 2 }}>
                <span style={{ fontWeight: 500 }}>{t('score.max')}</span>
              </Grid>
              <Grid size={{ xs: 9, sm: 8, md: 9, lg: 10 }}>{heuristic && stats ? stats.max : <Skeleton />}</Grid>
            </Grid>
          </Grid>
          {currentUser.roles.includes('submission_view') && (
            <>
              <Grid size={{ xs: 12 }}>
                <Histogram
                  dataset={histogram}
                  height="300px"
                  isDate
                  title={t('chart.title')}
                  datatype={heuristicID}
                  verticalLine
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">{t('last10')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ResultsTable resultResults={results} allowSort={false} />
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </AppPageCenter>
  );
});

export const ManageHeuristicDetailRoute = createAppRoute({
  component: ManageHeuristicDetailPage,

  path: '/manage/heuristic/detail/:id',
  params: s => ({
    id: s.string()
  }),

  ancestor: '/manage/heuristics',
  shortname: location => [
    'app_route.manage_heuristic_detail.shortname',
    { ns: 'manageHeuristicDetail', id: location.path.id }
  ],
  fullname: location => [
    'app_route.manage_heuristic_detail.fullname',
    { ns: 'manageHeuristicDetail', id: location.path.id }
  ],
  shorticon: () => <ListOutlinedIcon />,
  fullicon: () => <ListOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.roles.includes('heuristic_view')
});
