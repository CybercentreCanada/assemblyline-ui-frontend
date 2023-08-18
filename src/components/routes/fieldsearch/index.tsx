import { Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import PageFullSize from 'commons/components/pages/PageFullSize';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ForbiddenPage from 'components/routes/403';
import 'moment/locale/fr';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import { Fields } from './Fields';
import { Graph } from './Graph';
import { DEFAULTS } from './models';
import { Stats } from './Stats';
import { Table } from './Table';
import { Tabs } from './Tabs';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: '100%',
    width: '100%',

    display: 'grid',
    gridTemplateColumns: 'auto auto 1fr',
    gridTemplateRows: 'auto auto auto auto 1fr',
    rowGap: theme.spacing(2),
    columnGap: theme.spacing(2),
    gridTemplateAreas: `
      "title title title"
      "tabs tabs tabs"
      "query query query"
      "fields stats graph"
      "fields table table"
    `
  },
  title: {
    gridArea: 'title',
    textAlign: 'left',
    width: '100%'
  },
  tabs: {
    gridArea: 'tabs'
  },
  query: {
    gridArea: 'query'
  },
  fields: {
    gridArea: 'fields'
  },
  stats: {
    gridArea: 'stats'
  },
  graph: {
    gridArea: 'graph',
    minWidth: 0
  },
  table: {
    gridArea: 'table'
  }
}));

type Index = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

type Props = {
  index?: Index;
  field?: string;
};

type Params = {
  index?: Index;
  field?: string;
};

type Results = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

// const DEFAULTS: Record<
//   Index,
//   {
//     defaultField: string;
//     defaultFacetField: string;
//     defaultHistogramField: string;
//     defaultSort: string;
//     permission: string;
//   }
// > = {
//   submission: {
//     defaultField: 'classification',
//     defaultFacetField: 'classification',
//     defaultHistogramField: 'times.submitted',
//     permission: 'submission_view',
//     defaultSort: 'times.submitted desc'
//   },
//   file: {
//     defaultField: 'type',
//     defaultFacetField: 'type',
//     defaultHistogramField: 'seen.first',
//     permission: 'submission_view',
//     defaultSort: 'seen.last desc'
//   },
//   result: {
//     defaultField: 'type',
//     defaultFacetField: 'type',
//     defaultHistogramField: 'created',
//     permission: 'submission_view',
//     defaultSort: 'created desc'
//   },
//   signature: {
//     defaultField: 'type',
//     defaultFacetField: 'type',
//     defaultHistogramField: 'last_modified',
//     permission: 'signature_view',
//     defaultSort: 'last_modified desc'
//   },
//   alert: {
//     defaultField: 'type',
//     defaultFacetField: 'type',
//     defaultHistogramField: 'reporting_ts',
//     permission: 'alert_view',
//     defaultSort: 'reporting_ts desc'
//   },
//   retrohunt: {
//     defaultField: 'creator',
//     defaultFacetField: 'creator',
//     defaultHistogramField: 'created',
//     permission: 'retrohunt_view',
//     defaultSort: 'created desc'
//   }
// };

const START_MAP = {
  '24h': 'now-1d',
  '4d': 'now-4d',
  '7d': 'now-7d',
  '1m': 'now-1M',
  '1y': 'now-1y'
};

const GAP_MAP = {
  '24h': '1h',
  '4d': '2h',
  '7d': '4h',
  '1m': '1d',
  '1y': '15d'
};

const GAP_OPTIONS = ['1h', '2h', '4h', '1d', '15d', '1M', '7d'];

const PAGE_SIZE = 20;

const MAX_TRACKED_RECORDS = 10000;

const DEFAULT_PARAMS = {
  query: '*',
  offset: 0,
  rows: PAGE_SIZE,
  sort: '',
  start: 'now-1y',
  end: 'now',
  gap: '15d',
  mincount: 0
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

function SearchDetail({ index: propIndex = null, field: propField = null }: Props) {
  const { t, i18n } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const location = useLocation();
  const navigate = useNavigate();
  const { showErrorMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser, configuration, c12nDef } = useALContext();
  const { index: paramIndex, field: paramField } = useParams<Params>();

  const indices = useMemo<Index[]>(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)) as Index[],
    [currentUser.roles]
  );

  const index = useMemo<Index | null>(
    () =>
      (propIndex && indices.includes(propIndex)
        ? propIndex
        : paramIndex && indices.includes(paramIndex)
        ? paramIndex
        : null) as Index,
    [indices, paramIndex, propIndex]
  );

  const fields = useMemo<{ [k: string]: any }>(
    () =>
      index
        ? Object.fromEntries(
            Object.keys(indexes[index])
              .filter(key => indexes[index][key].indexed)
              .map(key => [key, indexes[index][key]])
          )
        : {},
    [index, indexes]
  );

  const field = useMemo<string>(
    () =>
      !index
        ? null
        : propField && propField in fields
        ? propField
        : paramField && paramField in fields
        ? paramField
        : null,
    [fields, index, paramField, propField]
  );

  useEffect(() => {
    if (!index && indices.length > 0) {
      navigate(`/fieldsearch/${indices[0]}/${DEFAULTS[indices[0]].field}/${location.search}${location.hash}`);
    }
  }, [index, indices, location.hash, location.search, navigate]);

  useEffect(() => {
    if (!field && index) {
      navigate(`/fieldsearch/${index}/${DEFAULTS[index].field}/${location.search}${location.hash}`);
    }
  }, [field, index, location.hash, location.search, navigate]);

  return indices.length === 0 || Object.keys(fields).length === 0 || !currentUser.is_admin ? (
    <ForbiddenPage />
  ) : (
    <PageFullSize margin={4}>
      <div className={classes.root}>
        <div className={classes.title}>
          <Typography variant="h4">{t(`title_${index || paramIndex || 'all'}`)}</Typography>
        </div>
        <div className={classes.tabs}>
          <Tabs />
        </div>
        <div className={classes.fields}>
          <Fields />
        </div>
        <div className={classes.stats}>
          <Stats />
        </div>
        <div className={classes.graph}>
          <Graph />
        </div>
        <div className={classes.table}>
          <Table />
        </div>
      </div>
    </PageFullSize>
  );
}

SearchDetail.defaultProps = {
  index: null
};

export default SearchDetail;
