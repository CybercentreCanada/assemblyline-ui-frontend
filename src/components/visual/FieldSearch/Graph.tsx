import { Grid, Paper, Theme, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import LineGraph from 'components/visual/LineGraph';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import 'moment/locale/fr';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { DEFAULTS, DEFAULT_QUERY, Index, Params } from './models';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2)
  }
}));

type Props = {};

export const WrappedGraph = (props: Props) => {
  const { t } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { index: paramIndex, field: paramField } = useParams<Params>();

  const [dataset, setDataset] = useState<{ [set: string]: number }>(null);

  const indices = useMemo<Index[]>(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)) as Index[],
    [currentUser.roles]
  );

  useEffect(() => {
    if (paramIndex && paramField && currentUser.is_admin) {
      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      apiCall({
        method: 'POST',
        url: `/api/v4/search/facet/${paramIndex}/${paramField}/`,
        body: {
          ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setDataset(api_data.api_response)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, location.search, paramField, paramIndex]);

  return (
    <Grid className={classes.root} container component={Paper}>
      <Grid item xs={12}>
        <LineGraph
          dataset={dataset}
          height={`250px`}
          title={t('graph.name.title')}
          datatype={t('graph.datatype')}
          // onClick={(evt, element) => {
          //   if (!searching && element.length > 0) {
          //     var ind = element[0].index;
          //     query.add('filters', `${facetField}:${Object.keys(dataset)[ind]}`);
          //     navigate(
          //       `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
          //         location.hash
          //       }`
          //     );
          //   }
          // }}
        />
      </Grid>
    </Grid>
  );
};

export const Graph = React.memo<Props>(WrappedGraph);
