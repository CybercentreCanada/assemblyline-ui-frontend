import BlockIcon from '@mui/icons-material/Block';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Grid, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import { SearchHeader } from 'components/visual/SearchBar/SearchHeader';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams';
import { createSearchParams } from 'components/visual/SearchBar/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext';
import type { SearchResult } from 'components/visual/SearchBar/SearchParser';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import type { UserResult } from 'components/visual/SearchResult/users';
import UsersTable from 'components/visual/SearchResult/users';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { AddUserPage } from './users_add';

type SearchResults = {
  items: UserResult[];
  offset: number;
  rows: number;
  total: number;
};

const USERS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string(null).nullable().ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  refresh: p.boolean(false).hidden().ignored()
}));

type UsersParams = SearchParams<typeof USERS_PARAMS>;

const UsersSearch = () => {
  const { t } = useTranslation(['adminUsers']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams<UsersParams>();

  const [userResults, setUserResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);

  const handleReload = useCallback(
    (body: SearchResult<UsersParams>) => {
      if (!currentUser.is_admin) return;

      const param = body
        .set(o => ({ ...o, query: [o.query || '*', ...o.filters].join(' && ') }))
        .omit(['filters', 'refresh'])
        .toString();

      apiCall({
        url: `/api/v4/user/list/?${param}`,
        onSuccess: ({ api_response }) => setUserResults(api_response as SearchResults),
        onEnter: () => setSearching(true),
        onFinalize: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.is_admin]
  );

  useEffect(() => {
    handleReload(search);
  }, [handleReload, search]);

  useEffect(() => {
    if (!currentUser.is_admin) return;
    apiCall({
      url: '/api/v4/search/fields/user/',
      onSuccess: ({ api_response }) =>
        setSuggestions([...Object.keys(api_response).filter(name => api_response[name].indexed), ...DEFAULT_SUGGESTION])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.is_admin]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadUsers', reload);
    return () => {
      window.removeEventListener('reloadUsers', reload);
    };
  }, [setSearchObject]);

  return !currentUser.is_admin ? (
    <Navigate to="/forbidden" replace />
  ) : (
    <PageFullWidth margin={4}>
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          <Grid item xs style={{ textAlign: 'right' }}>
            <AddUserPage />
          </Grid>
        </Grid>
      </div>

      <PageHeader isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={userResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${userResults?.total === 1 ? '' : 's'}`)
                : t(`total${userResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: { title: t('admins') },
                icon: { children: <SupervisorAccountIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'type:admin'] }))
                }
              },
              {
                tooltip: { title: t('disabled') },
                icon: { children: <BlockIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'is_active:false'] }))
                }
              }
            ]}
          />
        </div>
      </PageHeader>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <UsersTable userResults={userResults} />
      </div>
    </PageFullWidth>
  );
};

const WrappedUsersPage = () => (
  <SearchParamsProvider params={USERS_PARAMS}>
    <UsersSearch />
  </SearchParamsProvider>
);

export const Users = React.memo(WrappedUsersPage);
export default Users;
