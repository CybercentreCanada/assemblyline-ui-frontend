import { useTheme } from '@mui/material';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import SearchBar from 'components/visual/SearchBar/search-bar';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import FilesTable, { FileResult } from 'components/visual/SearchResult/files';
import 'moment/locale/fr';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEFAULT_RETROHUNT, Retrohunt } from '.';

const PAGE_SIZE = 25;

type SearchResults = {
  items: FileResult[];
  offset: number;
  rows: number;
  total: number;
};

type Props = {
  retrohunt: Retrohunt;
};

export const WrappedRetrohuntResults = ({ retrohunt = { ...DEFAULT_RETROHUNT } }: Props) => {
  const { t } = useTranslation(['retrohunt']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes, user: currentUser, configuration } = useALContext();

  const [pageSize] = useState(PAGE_SIZE);
  const [query, setQuery] = useState<SimpleSearchQuery>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<string[]>(null);
  const [searching, setSearching] = useState(false);
  const queryValue = useRef<string>('');

  const [fileResults, setFileResults] = useState<SearchResults>({ items: [], offset: 0, rows: 0, total: 25 });

  useEffect(() => {
    // On index change we need to update the search suggestion
    setSearchSuggestion([
      ...Object.keys(indexes?.retrohunt || {}).filter(name => indexes.retrohunt[name].indexed),
      ...DEFAULT_SUGGESTION
    ]);
  }, [indexes]);

  useEffect(() => {
    if (!query) return;
    query.set('query', '*');
  }, [query]);

  useEffect(() => {
    if (!query) return;
    queryValue.current = query.get('query', '*');
    apiCall({
      method: 'POST',
      url: `/api/v4/search/file/`,
      body: { ...query.getParams(), rows: pageSize, offset: 0 },
      onSuccess: api_data => {
        console.log(api_data);
      },
      onFailure: api_data => {
        // if (index || id || !api_data.api_error_message.includes('Rewrite first')) {
        //   showErrorMessage(api_data.api_error_message);
        // } else {
        //   stateMap[searchIndex]({ total: 0, offset: 0, items: [], rows: pageSize });
        // }
      },
      onFinalize: () => {
        // if (index || id) {
        //   setSearching(false);
        // }
      }
    });
    // eslint-disable-next-line
  }, [query]);

  const onFilterValueChange = (inputValue: string) => {
    queryValue.current = inputValue;
  };

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

  return (
    <>
      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchBar
            initValue={query ? query.get('query', '') : ''}
            searching={searching}
            // placeholder={t(`search_${index || id || 'all'}`)}
            suggestions={searchSuggestion}
            onValueChange={onFilterValueChange}
            onClear={onClear}
            onSearch={onSearch}
            buttons={[]}
          />
        </div>
      </PageHeader>
      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        {query && query.get('query') && fileResults && <FilesTable fileResults={fileResults} allowSort={true} />}
      </div>
    </>
  );
};

export const RetrohuntResults = React.memo(WrappedRetrohuntResults);
