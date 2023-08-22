import { AlertTitle, Pagination, Paper, Skeleton, Theme, Tooltip, useTheme } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';
import makeStyles from '@mui/styles/makeStyles';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import Classification from 'components/visual/Classification';
import {
  DivTable,
  DivTableBody,
  DivTableCell,
  DivTableHead,
  DivTableRow,
  LinkRow,
  SortableHeaderCell
} from 'components/visual/DivTable';
import InformativeAlert from 'components/visual/InformativeAlert';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import SearchResultCount from 'components/visual/SearchResultCount';
import { getValueFromPath } from 'helpers/utils';
import 'moment/locale/fr';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Moment from 'react-moment';
import { useNavigate } from 'react-router';
import { Link, useLocation, useParams } from 'react-router-dom';
import { DEFAULTS, DEFAULT_QUERY, Field, MAX_TRACKED_RECORDS, PAGE_SIZE, Params } from './models';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  item: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  title: {
    paddingLeft: theme.spacing(2)
  },
  list: {
    // width: '100%',
    // bgcolor: 'background.paper',
    // paddingTop: theme.spacing(2),
    // borderRadius: '4px',
    // height: '100%',
    // overflowY: 'auto'
  },
  searchresult: {
    paddingLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    fontStyle: 'italic'
  },
  chipRoot: {
    paddingTop: '6px'
  },
  chipLabel: {
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    fontSize: '18px'
  }
}));

type Props = {};

type Results = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

export const WrappedTable = (props: Props) => {
  const { t, i18n } = useTranslation(['search']);
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { index: paramIndex, field: paramField } = useParams<Params>();
  const { indexes, user: currentUser, configuration, c12nDef } = useALContext();

  const [results, setResults] = useState<Results>(null);
  const lastIndexRef = useRef<string>(null);

  const getPathsFromObject = useCallback((obj: object, path: string[] = []) => {
    let paths = [];
    Object.entries(obj).forEach(([k, v]) => {
      if (typeof v == 'object' && ![null, undefined].includes(v))
        paths = [...paths, ...getPathsFromObject(obj[k], [...path, k])];
      else paths = [...paths, [...path, k].join('.')];
    });
    return paths;
  }, []);

  const tableFields = useMemo<{ [key: string]: Field }>(
    () =>
      paramIndex && results && results.items.length > 0
        ? Object.fromEntries(
            Object.keys(indexes[paramIndex])
              .filter(key => getPathsFromObject(results.items[0]).includes(key))
              .map(key => [key, indexes[paramIndex][key]])
          )
        : {},
    [getPathsFromObject, paramIndex, indexes, results]
  );

  // const sortField = useMemo<Record<string, null>>(() => {
  //   const sort = new SimpleSearchQuery(location.search, DEFAULT_QUERY).get('sort', null);

  //   if (sort && in) return Object.fromEntries(fl.split(',').map(key => [key, null]));
  //   else
  //     return Object.fromEntries(
  //       Object.entries(indexes[paramIndex])
  //         .filter(([key, value]: [string, Field]) => value.stored)
  //         .map(([key, value]) => [key, null])
  //     );
  // }, [indexes, location.search, paramIndex]);

  useEffect(() => {
    if (paramIndex) {
      const query = new SimpleSearchQuery(location.search, `${DEFAULT_QUERY}&sort=${DEFAULTS[paramIndex].sort}`);
      apiCall({
        method: 'POST',
        url: `/api/v4/search/${paramIndex}/`,
        body: {
          ...Object.fromEntries(
            Object.entries(query.getParams()).filter(([k, v]) => ['query', 'rows', 'offset', 'fl', 'sort'].includes(k))
          ),
          filters: query.getAll('filters', [])
        },
        onSuccess: api_data => setResults(api_data.api_response),
        onEnter: () => paramIndex !== lastIndexRef.current && setResults(null),
        onExit: () => {
          lastIndexRef.current = paramIndex;
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, paramIndex]);

  // useEffect(() => {
  //   const query = new SimpleSearchQuery(location.search, `${DEFAULT_QUERY}&sort=${DEFAULTS[paramIndex].sort}`);
  //   const sort = query.get('sort');
  //   if (!(sort in indexes[paramIndex])) {
  //     query.delete('sort');
  //     navigate(`/fieldsearch/${paramIndex}/${paramField}/?${query.toString()}${location.hash}`);
  //   }
  // }, [indexes, location.hash, location.search, navigate, paramField, paramIndex]);

  const pageCount = useMemo<number>(
    () => (results && 'total' in results ? Math.ceil(Math.min(results.total, MAX_TRACKED_RECORDS) / PAGE_SIZE) : 0),
    [results]
  );

  const handlePageChange = useCallback(
    (key: string, value: string | number) => {
      const query = new SimpleSearchQuery(location.search, DEFAULT_QUERY);
      query.set(key, value);
      navigate(`/fieldsearch/${paramIndex}/${paramField}/?${query.toString()}${location.hash}`);
    },
    [location.hash, location.search, navigate, paramField, paramIndex]
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: theme.spacing(0.5),
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        {results && results.total !== 0 && paramIndex && (
          <div className={classes.searchresult}>
            <SearchResultCount count={results.total} />
            {t(results.total === 1 ? 'matching_result' : 'matching_results')}
          </div>
        )}
        <div style={{ flexGrow: 1 }} />
        {results && pageCount > 1 && (
          <Pagination
            page={Math.ceil(1 + results.offset / PAGE_SIZE)}
            onChange={(e, value) => handlePageChange('offset', (value - 1) * PAGE_SIZE)}
            count={pageCount}
            shape="rounded"
            size="small"
          />
        )}
      </div>
      {results ? (
        results.total !== 0 ? (
          <TableContainer component={Paper}>
            <DivTable>
              <DivTableHead>
                <DivTableRow>
                  {Object.entries(tableFields).map(([k, v]) => (
                    <SortableHeaderCell key={k} sortField={k} allowSort>
                      {t(`${k}`)}
                    </SortableHeaderCell>
                  ))}
                </DivTableRow>
              </DivTableHead>
              <DivTableBody>
                {results.items.map((result, i) => (
                  <LinkRow
                    key={i}
                    to={`${location.pathname}?${location.search}${location.hash}`}
                    hover
                    component={Link}
                    onClick={event => {}}
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
        ) : (
          <div style={{ width: '100%' }}>
            <InformativeAlert>
              <AlertTitle>{t('no_alerts_title')}</AlertTitle>
              {t('no_results_desc')}
            </InformativeAlert>
          </div>
        )
      ) : (
        <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
      )}
    </>
  );
};

export const Table = React.memo<Props>(WrappedTable);
