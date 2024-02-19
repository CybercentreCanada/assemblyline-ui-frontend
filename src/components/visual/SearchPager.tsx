import { Pagination, PaginationProps } from '@mui/material';
import useMyAPI from 'components/hooks/useMyAPI';
import { SearchResult } from 'components/models/ui/search';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React from 'react';

const MAX_TRACKED_RECORDS = 10000;

interface Props extends PaginationProps {
  total: number;
  pageSize: number;
  index: string;
  method?: 'POST' | 'GET';
  query: SimpleSearchQuery;
  scrollToTop?: boolean;
  size?: 'small' | 'large' | null;
  url?: string;
  setSearching?: (value: boolean) => void | null;
  setResults: (data: SearchResult<any>) => void;
}

const WrappedSearchPager: React.FC<Props> = ({
  total,
  pageSize,
  index,
  method = 'POST',
  query,
  setResults,
  scrollToTop = true,
  size = 'small',
  setSearching = null,
  url = null,
  ...otherProps
}) => {
  const { apiCall } = useMyAPI();
  const count = Math.ceil(Math.min(total, MAX_TRACKED_RECORDS) / pageSize);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (setSearching) {
      setSearching(true);
    }
    const pageQuery = new SimpleSearchQuery(query.toString(), query.getDefaultString());
    pageQuery.set('rows', pageSize);
    pageQuery.set('offset', (value - 1) * pageSize);

    apiCall({
      method,
      url: `${url || `/api/v4/search/${index}/`}${method === 'GET' ? `?${pageQuery.toString()}` : ''}`,
      body: method === 'POST' ? pageQuery.getParams() : null,
      onSuccess: api_data => {
        setResults(api_data.api_response);
        if (scrollToTop) {
          window.scrollTo(0, 0);
        }
      },
      onFinalize: () => {
        if (setSearching) {
          setSearching(false);
        }
      }
    });
  };

  return count > 1 ? (
    <Pagination {...otherProps} count={count} onChange={handleChange} shape="rounded" size={size} />
  ) : null;
};

const SearchPager = React.memo(WrappedSearchPager);
export default SearchPager;
