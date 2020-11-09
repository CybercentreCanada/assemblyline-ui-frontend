import { Pagination } from '@material-ui/lab';
import SearchQuery from 'components/elements/search/search-query';
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
  query: SearchQuery;
  setResults: (data: SearchResults) => void;
  scrollToTop?: boolean;
  size?: 'small' | 'large' | null;
  setSearching?: (value: boolean) => void | null;
  [propName: string]: any;
}

const WrappedSearchPager: React.FC<SearchPagerProps> = ({
  total,
  pageSize,
  index,
  query,
  setResults,
  scrollToTop = true,
  size = 'small',
  setSearching = null,
  children,
  ...otherProps
}) => {
  const apiCall = useMyAPI();
  const count = Math.ceil(total / pageSize);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    if (setSearching) {
      setSearching(true);
    }
    const body = { query: '*', ...query.getParams(), rows: pageSize, offset: (value - 1) * pageSize };
    apiCall({
      method: 'POST',
      url: `/api/v4/search/${index}/`,
      body,
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
