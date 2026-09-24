import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import type { PaperProps } from '@mui/material';
import { Grid, Paper, Skeleton, styled, Typography, useTheme } from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageCenter from 'commons/components/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { Heuristic } from 'components/models/base/heuristic';
import { DEFAULT_STATS, type Statistic } from 'components/models/base/statistic';
import type { CustomUser } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import { IconButton } from 'components/visual/Buttons/IconButton';
import Classification from 'components/visual/Classification';
import Histogram from 'components/visual/Histogram';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import Moment from 'components/visual/Moment';
import ResultsTable from 'components/visual/SearchResult/results';
import { safeFieldValueURI } from 'helpers/utils';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

const Preview = memo(
  styled(({ component = 'pre', variant = 'outlined', ...props }: PaperProps) => (
    <Paper component={component} variant={variant} {...props} />
  ))<PaperProps>(({ theme }) => ({
    margin: 0,
    padding: theme.spacing(0.75, 1),
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  }))
);

type ParamProps = {
  id: string;
};

type HeuristicDetailProps = {
  heur_id?: string;
};

const HeuristicDetail = ({ heur_id = null }: HeuristicDetailProps) => {
  const { t, i18n } = useTranslation(['manageHeuristicDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [heuristic, setHeuristic] = useState<Heuristic>(null);
  const [stats, setStats] = useState<Statistic>(DEFAULT_STATS);
  const [histogram, setHistogram] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const { apiCall } = useMyAPI();
  const { c12nDef } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();

  useEffect(() => {
    if (currentUser.roles.includes('heuristic_view')) {
      apiCall({
        url: `/api/v4/heuristics/${heur_id || id}/`,
        onSuccess: api_data => {
          setHeuristic(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heur_id, id]);

  useEffect(() => {
    if (heuristic) {
      if (currentUser.roles.includes('submission_view')) {
        if (!heuristic.stats) {
          apiCall({
            method: 'POST',
            url: '/api/v4/search/stats/result/result.score/',
            body: { query: `result.sections.heuristic.heur_id:${heur_id || id}` },
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
            query: `result.sections.heuristic.heur_id:${heur_id || id}`,
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
          url: `/api/v4/search/result/?query=result.sections.heuristic.heur_id:${heur_id || id}&rows=10`,
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

  return currentUser.roles.includes('heuristic_view') ? (
    <PageCenter margin={!id ? 2 : 4} width="100%">
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
              to={() =>
                `/search/result/?query=result.sections.heuristic.heur_id:${safeFieldValueURI(heuristic.heur_id)}`
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
                  datatype={heur_id || id}
                  verticalLine
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6">{t('last10')}</Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <ResultsTable resultResults={results} allowSort={false} allowHash />
              </Grid>
            </>
          )}
        </Grid>
      </div>
    </PageCenter>
  ) : (
    <ForbiddenPage />
  );
};

export default HeuristicDetail;
