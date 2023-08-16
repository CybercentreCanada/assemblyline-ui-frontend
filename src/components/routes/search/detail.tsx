import { Grid, Theme, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import Paper from '@mui/material/Paper';
import TableContainer from '@mui/material/TableContainer';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import PageFullSize from 'commons/components/pages/PageFullSize';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import useMySnackbar from 'components/hooks/useMySnackbar';
import ForbiddenPage from 'components/routes/403';
import Classification from 'components/visual/Classification';
import CustomChip from 'components/visual/CustomChip';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import Histogram from 'components/visual/Histogram';
import LineGraph from 'components/visual/LineGraph';
import { CheckmarkSelector } from 'components/visual/Search2/CheckmarkSelector';
import DateSelector from 'components/visual/Search2/DateSelector';
import FieldSelector from 'components/visual/Search2/FieldSelector';
import { Field } from 'components/visual/Search2/models';
import SearchSelector from 'components/visual/Search2/SearchSelector';
import SearchBar from 'components/visual/SearchBar/search-bar';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import { getValueFromPath } from 'helpers/utils';
import 'moment/locale/fr';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';

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

type Index = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

type SearchProps = {
  index?: string | null;
  facet?: string | null;
  histogram?: string | null;
};

type ParamProps = {
  index: string;
  facet: string;
  histogram: string;
};

type Results = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

const DEFAULTS: {
  [index in Index]: {
    defaultFacetField: string;
    defaultHistogramField: string;
    defaultSort: string;
    permission: string;
  };
} = {
  submission: {
    defaultFacetField: 'classification',
    defaultHistogramField: 'times.submitted',
    permission: 'submission_view',
    defaultSort: 'times.submitted desc'
  },
  file: {
    defaultFacetField: 'type',
    defaultHistogramField: 'seen.first',
    permission: 'submission_view',
    defaultSort: 'seen.last desc'
  },
  result: {
    defaultFacetField: 'type',
    defaultHistogramField: 'created',
    permission: 'submission_view',
    defaultSort: 'created desc'
  },
  signature: {
    defaultFacetField: 'type',
    defaultHistogramField: 'last_modified',
    permission: 'signature_view',
    defaultSort: 'last_modified desc'
  },
  alert: {
    defaultFacetField: 'type',
    defaultHistogramField: 'reporting_ts',
    permission: 'alert_view',
    defaultSort: 'reporting_ts desc'
  },
  retrohunt: {
    defaultFacetField: 'creator',
    defaultHistogramField: 'created',
    permission: 'retrohunt_view',
    defaultSort: 'created desc'
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
  mincount: 0,
  fl: ''
};

const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

function SearchDetail({
  index: propIndex = null,
  facet: propFacet = null,
  histogram: propHistogram = null
}: SearchProps) {
  const { t, i18n } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const downSM = useMediaQuery(theme.breakpoints.down('md'));

  const location = useLocation();
  const navigate = useNavigate();
  const { showErrorMessage } = useMySnackbar();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser, configuration, c12nDef } = useALContext();
  const { index: paramIndex, facet: paramFacet, histogram: paramHistogram } = useParams<ParamProps>();

  const [results, setResults] = useState<Results>(null);
  const [dataset, setDataset] = useState<{ [set: string]: number }>(null);
  const [histogram, setHistogram] = useState<any>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [query, setQuery] = useState<SimpleSearchQuery>(new SimpleSearchQuery(DEFAULT_QUERY, DEFAULT_QUERY));
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);

  const queryValue = useRef<string>('');

  const indexOptions = useMemo(
    () => Object.keys(DEFAULTS).filter(key => currentUser.roles.includes(DEFAULTS[key].permission)),
    [currentUser.roles]
  );

  const index = useMemo<Index | null>(
    () =>
      propIndex && indexOptions.includes(propIndex)
        ? (propIndex as Index)
        : paramIndex && indexOptions.includes(paramIndex)
        ? (paramIndex as Index)
        : null,
    [indexOptions, paramIndex, propIndex]
  );

  const facetFields = useMemo<{ [key: string]: Field }>(
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

  const facetField = useMemo<string>(
    () =>
      !index
        ? null
        : propFacet && propFacet in facetFields
        ? propFacet
        : paramFacet && paramFacet in facetFields
        ? paramFacet
        : null,
    [facetFields, index, paramFacet, propFacet]
  );

  const histogramFields = useMemo<{ [key: string]: Field }>(
    () =>
      index
        ? Object.fromEntries(
            Object.keys(indexes[index])
              .filter(key => indexes[index][key].indexed && indexes[index][key].type === 'date')
              .map(key => [key, indexes[index][key]])
          )
        : {},
    [index, indexes]
  );

  const histogramField = useMemo<string>(
    () =>
      !index
        ? null
        : propHistogram && propHistogram in histogramFields
        ? propHistogram
        : paramHistogram && paramHistogram in histogramFields
        ? paramHistogram
        : null,
    [histogramFields, index, paramHistogram, propHistogram]
  );

  const getPathsFromObject = useCallback((obj: object, path: string[] = []) => {
    let paths = [];

    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v == 'object' && ![null, undefined].includes(v))
        paths = [...paths, ...getPathsFromObject(obj[k], [...path, k])];
      else paths = [...paths, [...path, k].join('.')];
    });

    return paths;
  }, []);

  const tableFields = useMemo<{ [key: string]: Field }>(() => {
    if (index && results && results.items.length > 0) {
      const paths = getPathsFromObject(results.items[0]);

      return Object.fromEntries(
        Object.keys(indexes[index])
          .filter(key => paths.includes(key))
          .map(key => [key, indexes[index][key]])
      );
    } else return {};
  }, [getPathsFromObject, index, indexes, results]);

  const onClear = () => {
    query.delete('query');
    navigate(`${location?.pathname}?${query.toString()}${location.hash}`);
  };

  const onSearch = () => {
    if (queryValue.current !== '') {
      query.set('query', queryValue.current);
      navigate(`${location?.pathname}?${query.toString()}${location.hash}`);
    } else {
      onClear();
    }
  };

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

  const handleIndexChange = useCallback(
    (value: keyof typeof indexes) => {
      query.set(
        'fl',
        Object.entries(indexes[value])
          .filter(([k, v]) => v.stored)
          .map(([k, v]) => k)
          .join(',')
      );
      navigate(
        `/search2/detail/${value}/${DEFAULTS[value].defaultFacetField}/${DEFAULTS[value].defaultHistogramField}?${
          query ? query.toString() : ''
        }${location.hash}`
      );
    },
    [indexes, location.hash, navigate, query]
  );

  const handleFacetFieldChange = useCallback(
    (value: any) => {
      navigate(`/search2/detail/${index}/${value}/${histogramField}?${query ? query.toString() : ''}${location.hash}`);
    },
    [histogramField, index, location.hash, navigate, query]
  );

  const handleHistogramFieldChange = useCallback(
    (value: any) => {
      navigate(`/search2/detail/${index}/${facetField}/${value}?${query ? query.toString() : ''}${location.hash}`);
    },
    [facetField, index, location.hash, navigate, query]
  );

  useEffect(() => {
    if (query && index && facetField && currentUser.is_admin) {
      apiCall({
        method: 'POST',
        url: `/api/v4/search/${index}/`,
        body: {
          ...Object.fromEntries(
            Object.entries(query.getParams()).filter(([k, v]) => ['query', 'rows', 'offset', 'fl', 'sort'].includes(k))
          ),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setResults(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, facetField, index, query]);

  useEffect(() => {
    if (query && index && facetField && currentUser.is_admin) {
      apiCall({
        method: 'POST',
        url: `/api/v4/search/facet/${index}/${facetField}/`,
        body: {
          ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setDataset(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, facetField, index, query]);

  useEffect(() => {
    if (query && index && histogramField && currentUser.is_admin) {
      apiCall({
        method: 'POST',
        url: `/api/v4/search/histogram/${index}/${histogramField}/`,
        body: {
          ...Object.fromEntries(
            Object.entries(query.getParams()).filter(([k, v]) =>
              ['query', 'mincount', 'start', 'end', 'gap'].includes(k)
            )
          ),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setHistogram(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, histogramField, index, query]);

  useEffect(() => {
    if (query && index && histogramField && currentUser.is_admin) {
      apiCall({
        method: 'POST',
        url: `/api/v4/search/histogram/${index}/${'result.score'}/`,
        body: {
          ...Object.fromEntries(Object.entries(query.getParams()).filter(([k, v]) => ['query'].includes(k))),
          filters: query.getAll('filters', []),
          gap: 1000,
          mincount: 0,
          start: 0,
          end: 5000
        },
        // onSuccess: api_data => setHistogram(api_data.api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin, histogramField, index, query]);

  useEffect(() => {
    setQuery(new SimpleSearchQuery(location.search, DEFAULT_QUERY));
  }, [location.search]);

  useEffect(() => {
    if (!index && indexOptions.length > 0)
      navigate(
        `/search2/detail/${indexOptions[0]}/${DEFAULTS[indexOptions[0]].defaultFacetField}/${
          DEFAULTS[indexOptions[0]].defaultHistogramField
        }${location.search}${location.hash}`
      );
  }, [index, indexOptions, location.hash, location.search, navigate]);

  useEffect(() => {
    if (!facetField && index)
      navigate(
        `/search2/detail/${index}/${DEFAULTS[index].defaultFacetField}/${histogramField}${location.search}${location.hash}`
      );
  }, [facetField, histogramField, index, location.hash, location.search, navigate]);

  useEffect(() => {
    if (!histogramField && index)
      navigate(
        `/search2/detail/${index}/${facetField}/${DEFAULTS[index].defaultHistogramField}${location.search}${location.hash}`
      );
  }, [facetField, histogramField, index, location.hash, location.search, navigate]);

  useEffect(() => {
    if (index) {
      setQuery(q => {
        q.set('sort', DEFAULTS[index].defaultSort);
        q.set(
          'fl',
          Object.entries(indexes[index])
            .filter(([k, v]) => indexes[index][k].stored)
            .map(([k, v]) => k)
            .join(',')
        );
        return q;
      });
    }
  }, [index, indexes]);

  return !index || !facetField || !histogramField ? (
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
            suggestions={[]}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
          />
          <div style={{ display: 'flex', flexDirection: 'row', columnGap: theme.spacing(1) }}>
            <SearchSelector value={index} label="Index: " options={indexOptions} onChange={handleIndexChange} />
            <FieldSelector
              value={facetField}
              label="Facet field: "
              fields={facetFields}
              onChange={handleFacetFieldChange}
            />
            <FieldSelector
              value={histogramField}
              label="Histogram field: "
              fields={histogramFields}
              onChange={handleHistogramFieldChange}
            />
            <DateSelector
              value={query.get('start', DEFAULT_PARAMS.start)}
              label="Start: "
              onChange={v => {
                query.set('start', v);
                query.add('filters', `${histogramField}:[${v} TO ${query.get('end', DEFAULT_PARAMS.end)}]`);
                navigate(
                  `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                    location.hash
                  }`
                );
              }}
            />
            <DateSelector
              value={query.get('end', DEFAULT_PARAMS.end)}
              label="End: "
              onChange={v => {
                query.set('end', v);
                query.add('filters', `${histogramField}:${v}`);
                query.add('filters', `${histogramField}:[${query.get('start', DEFAULT_PARAMS.start)} TO ${v}]`);
                navigate(
                  `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                    location.hash
                  }`
                );
              }}
            />
            <SearchSelector
              value={query.get('gap', DEFAULT_PARAMS.gap)}
              label="Gap: "
              options={GAP_OPTIONS}
              onChange={v => {
                query.set('gap', v);
                navigate(
                  `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                    location.hash
                  }`
                );
              }}
            />
            <CheckmarkSelector
              value={query.get('fl')}
              label="Fields: "
              fields={facetFields}
              onChange={v => {
                query.set('fl', v);
                navigate(
                  `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                    location.hash
                  }`
                );
              }}
            />
          </div>
          <div
            style={{ display: 'flex', flexDirection: 'row', columnGap: theme.spacing(1), marginTop: theme.spacing(1) }}
          >
            {query &&
              query.getAll('filters', []).map((f, i) => (
                <CustomChip
                  key={i}
                  type="rounded"
                  variant="outlined"
                  size="small"
                  label={f}
                  color={f.indexOf('NOT ') === 0 ? 'error' : null}
                  onClick={() => {
                    query.replace('filters', f, f.indexOf('NOT ') === 0 ? f.substring(5, f.length - 1) : `NOT (${f})`);
                    navigate(
                      `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                        location.hash
                      }`
                    );
                  }}
                  onDelete={() => {
                    query.remove('filters', f);
                    navigate(
                      `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                        location.hash
                      }`
                    );
                  }}
                />
              ))}
          </div>
        </div>
      </PageHeader>
      <Grid item>
        <Grid container paddingTop={2} paddingLeft={0.5} paddingRight={0.5} paddingBottom={2}>
          <Grid item sm={12} md={6}>
            <LineGraph
              dataset={dataset}
              height={`400px`}
              title={t('graph.name.title')}
              datatype={t('graph.datatype')}
              onClick={(evt, element) => {
                if (!searching && element.length > 0) {
                  var ind = element[0].index;
                  query.add('filters', `${facetField}:${Object.keys(dataset)[ind]}`);
                  navigate(
                    `/search2/detail/${index}/${facetField}/${histogramField}?${query ? query.getDeltaString() : ''}${
                      location.hash
                    }`
                  );
                }
              }}
            />
          </Grid>
          <Grid item sm={12} md={6}>
            <Histogram
              dataset={histogram}
              height={`400px`}
              title={t('graph.name.title')}
              datatype={t('graph.datatype')}
              isDate
              verticalLine
            />
          </Grid>
          <Grid item sm={12} md={12}>
            {results && results.items.length > 0 && (
              <TableContainer component={Paper}>
                <DivTable>
                  <DivTableHead>
                    <DivTableRow>
                      {Object.entries(tableFields).map(([k, v]) => (
                        <SortableHeaderCell key={k} sortField={k} allowSort>
                          {t(`header.${k}`)}
                        </SortableHeaderCell>
                      ))}
                    </DivTableRow>
                  </DivTableHead>
                  <DivTableBody>
                    {results.items.map((result, i) => (
                      <LinkRow
                        key={i}
                        to={`/search2/detail/${index}/${facetField}/${histogramField}?${
                          query ? query.getDeltaString() : ''
                        }${location.hash}`}
                        hover
                        component={Link}
                        onClick={event => {
                          // if (setService) {
                          //   event.preventDefault();
                          //   setService(result.name);
                          // }
                        }}
                      >
                        {Object.entries(tableFields).map(([k, v]) => {
                          const value = getValueFromPath(result, k);
                          return !value ? (
                            <DivTableCell key={k} />
                          ) : k === 'classification' && c12nDef.enforce ? (
                            <DivTableCell key={k}>
                              <Classification type="text" size="tiny" c12n={`${value}`} format="short" />
                            </DivTableCell>
                          ) : v.type === 'date' ? (
                            <DivTableCell key={k}>
                              <Tooltip title={`${value}`}>
                                <>
                                  <Moment fromNow locale={i18n.language}>
                                    {`${value}`}
                                  </Moment>
                                </>
                              </Tooltip>
                            </DivTableCell>
                          ) : (
                            <DivTableCell key={k}>{`${getValueFromPath(result, k)}`}</DivTableCell>
                          );
                        })}
                      </LinkRow>
                    ))}
                  </DivTableBody>
                </DivTable>
              </TableContainer>
            )}
          </Grid>
        </Grid>
      </Grid>
    </PageFullSize>
  );
}

SearchDetail.defaultProps = {
  index: null
};

export default SearchDetail;
