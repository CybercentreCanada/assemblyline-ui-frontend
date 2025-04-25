import BlockIcon from '@mui/icons-material/Block';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useTheme } from '@mui/material';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import type { SearchParams } from 'components/core/SearchParams/SearchParams';
import { createSearchParams } from 'components/core/SearchParams/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/core/SearchParams/SearchParamsContext';
import type { SearchParamsResult } from 'components/core/SearchParams/SearchParser';
import useALContext from 'components/hooks/useALContext';
import useMyAPI from 'components/hooks/useMyAPI';
import type { UserIndexed } from 'components/models/base/user';
import type { SearchResult } from 'components/models/ui/search';
import { AddUserPage } from 'components/routes/admin/users_add';
import { PageHeader as ALPageHeader } from 'components/visual/Layouts/PageHeader';
import { SearchHeader } from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import UsersTable from 'components/visual/SearchResult/users';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';

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

  const [userResults, setUserResults] = useState<SearchResult<UserIndexed>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTION);

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  const handleReload = useCallback(
    (body: SearchParamsResult<UsersParams>) => {
      if (!currentUser.is_admin) return;

      const param = body
        .set(o => ({ ...o, query: [o.query || '*', ...o.filters].join(' && ') }))
        .omit(['filters', 'refresh'])
        .toString();

      apiCall<SearchResult<UserIndexed>>({
        url: `/api/v4/user/list/?${param}`,
        onSuccess: ({ api_response }) => setUserResults(api_response),
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
      <ALPageHeader
        primary={t('title')}
        style={{ paddingBottom: theme.spacing(2) }}
        actions={[<AddUserPage key="add-user" />]}
      />

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
                tooltip: {
                  title: search.has('filters', 'type:admin') ? t('filter.admins.remove') : t('filter.admins.add')
                },
                icon: { children: <SupervisorAccountIcon /> },
                button: {
                  color: search.has('filters', 'type:admin') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:admin')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'is_active:false')
                    ? t('filter.disabled.remove')
                    : t('filter.disabled.add')
                },
                icon: { children: <BlockIcon /> },
                button: {
                  color: search.has('filters', 'is_active:false') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('is_active:false')
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
