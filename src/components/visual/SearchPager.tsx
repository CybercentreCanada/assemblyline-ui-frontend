import { Pagination } from '@material-ui/lab';
import SimpleSearchQuery from 'components/elements/search/simple-search-query';
import useMyAPI from 'components/hooks/useMyAPI';
import React from 'react';

type SearchResults = {
  items: any[];
  offset: number;
  rows: number;
  total: number;
};

export interface SearchPagerProps {
  total: number;
  pageSize: number;
  index: string;
  method?: 'POST' | 'GET';
  query: SimpleSearchQuery;
  setResults: (data: SearchResults) => void;
  scrollToTop?: boolean;
  size?: 'small' | 'large' | null;
  setSearching?: (value: boolean) => void | null;
  url?: string;
  [propName: string]: any;
}

const WrappedSearchPager: React.FC<SearchPagerProps> = ({
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
  children,
  ...otherProps
}) => {
  const apiCall = useMyAPI();
  const count = Math.ceil(total / pageSize);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (setSearching) {
      setSearching(true);
    }
    query.set('rows', pageSize);
    query.set('offset', (value - 1) * pageSize);

    apiCall({
      method,
      url: `${url || `/api/v4/search/${index}/`}${method === 'GET' ? `?${query.toString()}` : ''}`,
      body: method === 'POST' ? query.getParams() : null,
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
