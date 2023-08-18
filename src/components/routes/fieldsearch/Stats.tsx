import { Grid, Paper, Theme, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { DEFAULTS, DEFAULT_QUERY, Index, Params } from './models';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    minWidth: '100%',
    padding: theme.spacing(2),
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto 1fr',
    gridTemplateRows: 'auto auto auto auto ',
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2),
    gridTemplateAreas: `
      "title title title title"
      "kMin vMin kMax vMax"
    `
  },
  title: { gridArea: 'title' }
}));

type Props = {};

export const WrappedStats = (props: Props) => {
  const { t } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { index: paramIndex, field: paramField } = useParams<Params>();

  const [totals, setTotals] = useState<Record<Index, number> | object>({});

  const indices = useMemo<Index[]>(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)) as Index[],
    [currentUser.roles]
  );

  const handleIndexChange = useCallback(
    (e, newIndex) => {
      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      query.delete('fl');
      navigate(`/fieldsearch/${newIndex}/${DEFAULTS[newIndex].field}/?${query.toString()}${location.hash}`);
    },
    [location.hash, location.search, navigate]
  );

  useEffect(() => {
    const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);

    apiCall({
      method: 'POST',
      url: `/api/v4/search/stats/${paramIndex}/${paramField}`,
      body: {
        ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
        filters: query.getAll('filters', [])
      },
      onSuccess: api_data => setTotals(api_data.api_response)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  return (
    <Grid className={classes.root} component={Paper}>
      <div style={{ gridArea: 'title' }}>
        <Typography variant="body1" color={theme.palette.text.primary}>
          {t('Field Stats')}
        </Typography>
        <Typography variant="body2" color={theme.palette.text.secondary}>
          {paramField}
        </Typography>
      </div>
      <div style={{ gridArea: 'kMin' }}>Min:</div>
    </Grid>
  );
};

export const Stats = React.memo<Props>(WrappedStats);
