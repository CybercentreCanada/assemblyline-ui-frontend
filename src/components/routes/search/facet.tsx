import { Theme, Typography, useMediaQuery, useTheme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PageFullSize from 'commons/components/pages/PageFullSize';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import { SearchSelector } from 'components/visual/Search2/CollectionSelector';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation, useParams } from 'react-router-dom';
import ForbiddenPage from '../403';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tweaked_tabs: {
      minHeight: 'unset',
      [theme.breakpoints.up('md')]: {
        '& [role=tab]': {
          padding: '8px 20px',
          fontSize: '13px',
          minHeight: 'unset',
          minWidth: 'unset'
        }
      },
      [theme.breakpoints.down('sm')]: {
        minHeight: 'unset',
        '& [role=tab]': {
          fontSize: '12px',
          minHeight: 'unset',
          minWidth: 'unset'
        }
      }
    },
    searchresult: {
      paddingLeft: theme.spacing(1),
      color: theme.palette.primary.main,
      fontStyle: 'italic'
    }
  })
);

type IndexType = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

type SearchProps = {
  index?: string | null;
  field?: string | null;
};

type ParamProps = {
  id: string;
  fl: string;
};

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

const DEFAULTS = {
  submission: {
    defaultField: 'classification',
    permission: 'submission_view'
  },
  file: {
    defaultField: 'type',
    permission: 'submission_view'
  },
  result: {
    defaultField: 'type',
    permission: 'submission_view'
  },
  signature: {
    defaultField: 'type',
    permission: 'signature_view'
  },
  alert: {
    defaultField: 'type',
    permission: 'alert_view'
  },
  retrohunt: {
    defaultField: 'creator',
    permission: 'retrohunt_view'
  }
};

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

function SearchFacet({ index: propIndex = null, field: propField = null }: SearchProps) {
  const { t } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const location = useLocation();
  const navigate = useNavigate();
  const { showErrorMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser, configuration } = useALContext();
  const { id: paramIndex, fl: paramField } = useParams<ParamProps>();

  const [dataset, setDataset] = useState<{ [set: string]: number }>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery('query=*', ''));
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
  const [tab, setTab] = useState(null);

  const tc = useMemo(() => '1y', []);

  const queryValue = useRef<string>('');

  const indexOptions = useMemo(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)),
    [currentUser.roles]
  );

  const index = useMemo(
    () =>
      propIndex && indexOptions.includes(propIndex)
        ? propIndex
        : paramIndex && indexOptions.includes(paramIndex)
        ? paramIndex
        : null,
    [indexOptions, paramIndex, propIndex]
  );

  const fieldOptions = useMemo(
    () => (index ? Object.keys(indexes[index]).filter(key => indexes[index][key].indexed) : []),
    [index, indexes]
  );

  const field = useMemo(
    () =>
      !index
        ? null
        : propField && fieldOptions.includes(propField)
        ? propField
        : paramField && fieldOptions.includes(paramField)
        ? paramField
        : null,
    [fieldOptions, index, paramField, propField]
  );

  const onClear = () => {
    query.delete('query');
    navigate(`${location.pathname}?${query.toString()}${location.hash}`);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      query.set('query', queryValue.current);
      navigate(`${location.pathname}?${query.toString()}${location.hash}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

  const handleIndexChange = useCallback(
    (value: keyof typeof indexes) => {
      navigate(
        `/search2/facet/${value}/${DEFAULTS[value].defaultField}?${query ? query.toString() : ''}${location.hash}`
      );
    },
    [location.hash, navigate, query]
  );

  const handleFacetFieldChange = useCallback(
    (value: any) => {
      navigate(`/search2/facet/${index}/${value}?${query ? query.toString() : ''}${location.hash}`);
    },
    [index, location.hash, navigate, query]
  );

  useEffect(() => {
    if (query && index && field && currentUser.is_admin) {
      apiCall({
        url: `/api/v4/search/facet/${index}/${field}/?${query.toString([
          'rows',
          'offset',
          'sort',
          'track_total_hits'
        ])}`,
        onSuccess: api_data => setDataset(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, field, index, query]);

  useEffect(() => {
    if (query && index && field && currentUser.is_admin) {
      apiCall({
        url: `/api/v4/search/histogram/${index}/${field}/?start=${START_MAP[tc]}&end=now&gap=${
          GAP_MAP[tc]
        }&mincount=0&${query.toString(['rows', 'offset', 'sort', 'track_total_hits'])}`,
        onSuccess: api_data => setHistogram(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, field, index, query]);

  useEffect(() => {
    if (!index && indexOptions.length > 0)
      navigate(
        `/search2/facet/${indexOptions[0]}/${DEFAULTS[indexOptions[0]].defaultField}${location.search}${location.hash}`
      );
  }, [index, indexOptions, location.hash, location.search, navigate]);

  useEffect(() => {
    if (!field && index)
      navigate(`/search2/facet/${index}/${DEFAULTS[index].defaultField}${location.search}${location.hash}`);
  }, [field, index, location.hash, location.search, navigate]);

  return !index || !field ? (
    <ForbiddenPage />
  ) : (
    <PageFullSize margin={4}>
      <div style={{ paddingBottom: theme.spacing(2), textAlign: 'left', width: '100%' }}>
        <Typography variant="h4">{t(`title_${index || paramIndex || 'all'}`)}</Typography>
      </div>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            searching={searching}
            placeholder={t(`search_${index || paramIndex || 'all'}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
          />
          <div style={{ display: 'flex', flexDirection: 'row', columnGap: theme.spacing(1) }}>
            <SearchSelector value={index} label="Index: " options={indexOptions} onChange={handleIndexChange} />
            <SearchSelector
              value={facetField}
              label="Facet field: "
              options={facetFieldOptions}
              onChange={handleFacetFieldChange}
            />
            <SearchSelector
              value={histogramField}
              label="Histogram field: "
              options={HistogramFieldOptions}
              onChange={handleHistogramFieldChange}
            />
          </div>
        </div>
      </PageHeader>
      <div
        style={{
          paddingTop: theme.spacing(2),
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5),
          paddingBottom: theme.spacing(2),
          flex: 1
        }}
      >
        <LineGraph
          dataset={dataset}
          height={`100%`}
          title={t('graph.name.title')}
          datatype={t('graph.datatype')}
          onClick={(evt, element) => {
            if (!searching && element.length > 0) {
              var ind = element[0].index;
              query.add('filters', `response.service_name:${Object.keys(dataset)[ind]}`);
              navigate(`${location.pathname}?${query.getDeltaString()}`);
            }
          }}
        />
      </div>
      <div
        style={{
          paddingTop: theme.spacing(2),
          paddingLeft: theme.spacing(0.5),
          paddingRight: theme.spacing(0.5),
          paddingBottom: theme.spacing(2),
          flex: 1
        }}
      >
        <Histogram
          dataset={histogram}
          height={`100%`}
          title={t('graph.name.title')}
          datatype={t('graph.datatype')}
          isDate
          verticalLine
          onClick={(evt, element) => {
            if (!searching && element.length > 0) {
              var ind = element[0].index;
              query.add('filters', `response.service_name:${Object.keys(dataset)[ind]}`);
              navigate(`${location.pathname}?${query.getDeltaString()}`);
            }
          }}
        />
      </div>
    </PageFullSize>
  );
}

SearchFacet.defaultProps = {
  index: null
};

export default SearchFacet;
