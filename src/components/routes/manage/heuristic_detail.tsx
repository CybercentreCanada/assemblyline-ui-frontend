import { Grid, IconButton, makeStyles, Paper, Tooltip, Typography, useTheme } from '@material-ui/core';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import Histogram from 'components/visual/Histogram';
import ResultsTable from 'components/visual/SearchResult/results';
import 'moment/locale/fr';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { Link, useParams } from 'react-router-dom';

export type Heuristic = {
  attack_id: string[];
  avg: number;
  classification: string;
  count: number;
  description: string;
  filetype: string;
  heur_id: string;
  max: number;
  max_score: number;
  min: number;
  name: string;
  score: number;
  signature_score_map: {
    [key: string]: number;
  };
  stats: Statistics;
};

export type Statistics = {
  avg: number;
  min: number;
  max: number;
  count: number;
  sum: number;
  last_hit: string;
  first_hit: string;
};

type ParamProps = {
  id: string;
};

type HeuristicDetailProps = {
  heur_id?: string;
};

const useStyles = makeStyles(theme => ({
  preview: {
    margin: 0,
    padding: `${theme.spacing(0.75)}px ${theme.spacing(1)}px`,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word'
  },
  drawerPaper: {
    maxWidth: '1200px',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
}));

const HeuristicDetail = ({ heur_id }: HeuristicDetailProps) => {
  const { t, i18n } = useTranslation(['manageHeuristicDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [heuristic, setHeuristic] = useState<Heuristic>(null);
  const [stats, setStats] = useState<Statistics>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const { apiCall } = useMyAPI();
  const classes = useStyles();
  const { c12nDef } = useALContext();

  useEffect(() => {
    apiCall({
      url: `/api/v4/heuristics/${heur_id || id}/`,
      onSuccess: api_data => {
        setHeuristic(api_data.api_response);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heur_id, id]);

  useEffect(() => {
    if (heuristic) {
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
          const chartData = {
            labels: Object.keys(api_data.api_response).map((key: string) => key.replace('T00:00:00.000Z', '')),
            datasets: [
              {
                label: heur_id || id,
                data: Object.values(api_data.api_response)
              }
            ]
          };
          setHistogram(chartData);
        }
      });
      apiCall({
        method: 'GET',
        url: `/api/v4/search/result/?query=result.sections.heuristic.heur_id:${heur_id || id}&rows=10`,
        onSuccess: api_data => {
          setResults(api_data.api_response);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heuristic]);

  return (
    <PageCenter margin={!id ? 2 : 4} width="100%">
      {c12nDef.enforce && (
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Classification size="tiny" c12n={heuristic ? heuristic.classification : null} />
        </div>
      )}
      <div style={{ textAlign: 'left' }}>
        <div style={{ paddingBottom: theme.spacing(4) }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography variant="h4">{t('title')}</Typography>
              <Typography variant="caption">
                {heuristic ? heuristic.heur_id : <Skeleton style={{ width: '10rem' }} />}
              </Typography>
            </Grid>
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              {heuristic ? (
                <Tooltip title={t('usage')}>
                  <IconButton
                    component={Link}
                    style={{ color: theme.palette.action.active }}
                    to={`/search/result/?query=result.sections.heuristic.heur_id:"${heuristic.heur_id}"`}
                  >
                    <YoutubeSearchedForIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Skeleton variant="circle" height="2.5rem" width="2.5rem" style={{ margin: theme.spacing(0.5) }} />
              )}
            </Grid>
          </Grid>
        </div>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('name')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.name}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">{t('filetype')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.filetype}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('desc')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.description}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2">{t('score')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.score}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2">{t('max_score')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.max_score || t('no_max')}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2">{t('attack_id')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.attack_id && heuristic.attack_id.length !== 0
                  ? heuristic.attack_id.join(', ')
                  : t('no_attack_id')}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">{t('signature_score_map')}</Typography>
            {heuristic ? (
              <Paper component="pre" variant="outlined" className={classes.preview}>
                {heuristic.signature_score_map && Object.keys(heuristic.signature_score_map).length !== 0 ? (
                  <Grid container spacing={1}>
                    {Object.keys(heuristic.signature_score_map).map((key, i) => (
                      <Grid key={i} item xs={12} sm={6} md={4}>
                        {`${key} = ${heuristic.signature_score_map[key]}`}
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  t('no_sigs')
                )}
              </Paper>
            ) : (
              <Skeleton style={{ height: '2.5rem' }} />
            )}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t('statistics')}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('hits')}
            </Typography>
            <Grid container>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('hit.count')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? stats.count : <Skeleton />}
              </Grid>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('hit.first')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? (
                  stats.first_hit ? (
                    <Moment fromNow locale={i18n.language}>
                      {stats.first_hit}
                    </Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('hit.last')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? (
                  stats.last_hit ? (
                    <Moment fromNow locale={i18n.language}>
                      {stats.last_hit}
                    </Moment>
                  ) : (
                    t('hit.none')
                  )
                ) : (
                  <Skeleton />
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" style={{ fontWeight: 600, fontStyle: 'italic' }}>
              {t('contribution')}
            </Typography>
            <Grid container>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('score.min')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? stats.min : <Skeleton />}
              </Grid>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('score.avg')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? Number(stats.avg).toFixed(0) : <Skeleton />}
              </Grid>
              <Grid item xs={3} sm={4} md={3} lg={2}>
                <span style={{ fontWeight: 500 }}>{t('score.max')}</span>
              </Grid>
              <Grid item xs={9} sm={8} md={9} lg={10}>
                {heuristic && stats ? stats.max : <Skeleton />}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Histogram data={histogram} height={300} isDate title={t('chart.title')} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t('last10')}</Typography>
          </Grid>
          <Grid item xs={12}>
            <ResultsTable resultResults={results} allowSort={false} />
          </Grid>
        </Grid>
      </div>
    </PageCenter>
  );
};

HeuristicDetail.defaultProps = {
  heur_id: null
};

export default HeuristicDetail;
