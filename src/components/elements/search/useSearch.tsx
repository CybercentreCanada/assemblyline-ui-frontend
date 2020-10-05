import useAppContext from 'components/hooks/useAppContext';
import useMyAPI, { APIResponseProps } from 'components/hooks/useMyAPI';
import { ALField } from 'components/hooks/useMyUser';
import { AlertItem } from 'components/routes/alerts/hooks/useAlerts';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SearchQuery from './search-query';

export enum SearchBucket {
  ALERT = 'alert'
}

export interface SearchResult {
  bucket: SearchBucket;
  query: SearchQuery;
  countedTotal: number;
  total: number;
  items: AlertItem[];
}

interface UsingSearch {
  fields: ALField[];
  query: SearchQuery;
  onSearch: (onSuccess: (result: SearchResult) => void, onFailure: (api_data: APIResponseProps) => void) => void;
}

export default function useSearch(bucket: SearchBucket, pageSize: number): UsingSearch {
  const location = useLocation();
  const apiCall = useMyAPI();
  const { indexes: fieldIndexes } = useAppContext();
  const [fields, setFields] = useState<ALField[]>([]);
  const [query] = useState<SearchQuery>(new SearchQuery(location.pathname, location.search, pageSize));

  // parse list of result: add an index field and it field.
  const parseResult = (responseItems, offset) => {
    const resultItems = responseItems.map((item, index) => {
      const { value, total, items } = item;
      return {
        id: value,
        index: index + offset,
        group_count: total,
        ...items[0]
      };
    });
    return resultItems;
  };

  // format alert api url using specified indexes.
  const buildUrl = () => {
    return `/api/v4/search/grouped/${bucket.valueOf()}/${query.getGroupBy()}/?${query.buildQueryString()}&limit=1`;
  };

  //
  const onSearch = (onSuccess: (result: SearchResult) => void, onFailure: (api_data: APIResponseProps) => void) => {
    apiCall({
      url: buildUrl(),
      onSuccess: api_data => {
        const { items, countedTotal, total } = api_data.api_response;
        onSuccess({
          bucket,
          query,
          countedTotal,
          total,
          items: parseResult(items, query.getOffsetNumber())
        });
      },
      onFailure
    });
  };

  // transform alert fields into array.
  useEffect(() => {
    if (fieldIndexes) {
      const aFields = Object.keys(fieldIndexes.alert).map(name => {
        const o = fieldIndexes.alert[name];
        return { ...o, name };
      });
      setFields(aFields);
    }
  }, [fieldIndexes]);

  //
  return { query, fields, onSearch };
}
