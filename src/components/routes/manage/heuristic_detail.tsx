import { Grid, IconButton, makeStyles, Paper, Tooltip, Typography, useTheme } from '@material-ui/core';
import YoutubeSearchedForIcon from '@material-ui/icons/YoutubeSearchedFor';
import { Skeleton } from '@material-ui/lab';
import PageCenter from 'commons/components/layout/pages/PageCenter';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['manageHeuristicDetail']);
  const { id } = useParams<ParamProps>();
  const theme = useTheme();
  const [heuristic, setHeuristic] = useState<Heuristic>(null);
  const apiCall = useMyAPI();
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
                    to={`/search/result/?query=result.sections.heuristic.name:"${heuristic.name}"`}
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
        <Grid container spacing={4}>
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
                    {Object.keys(heuristic.signature_score_map).map((key, i) => {
                      return (
                        <Grid key={i} item xs>
                          {`${key} = ${heuristic.signature_score_map[key]}`}
                        </Grid>
                      );
                    })}
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
            <Typography variant="subtitle2">{t('section_stat_contrib')}</Typography>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('count')}</Typography>
                {heuristic ? (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {heuristic.count}
                  </Paper>
                ) : (
                  <Skeleton style={{ height: '2.5rem' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('min')}</Typography>
                {heuristic ? (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {heuristic.min}
                  </Paper>
                ) : (
                  <Skeleton style={{ height: '2.5rem' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('avg')}</Typography>
                {heuristic ? (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {heuristic.avg}
                  </Paper>
                ) : (
                  <Skeleton style={{ height: '2.5rem' }} />
                )}
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="caption">{t('max')}</Typography>
                {heuristic ? (
                  <Paper component="pre" variant="outlined" className={classes.preview}>
                    {heuristic.max}
                  </Paper>
                ) : (
                  <Skeleton style={{ height: '2.5rem' }} />
                )}
              </Grid>
            </Grid>
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
