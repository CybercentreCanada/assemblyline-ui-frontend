import BlockIcon from '@mui/icons-material/Block';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useTheme } from '@mui/material';
import useMyAPI from 'core/api/hooks/useMyAPI';
import useALContext from 'core/config/useALContext';
import PageContainer from 'core/template/branding/AppPageContainer';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import { createSearchParams, SearchParamsProvider, useSearchParams } from 'features/SearchParams/createSearchParams';
import type { SearchResult } from 'models/api/search';
import type { IndexDefinition } from 'models/api/user';
import type { UserIndexed } from 'models/base/user';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router';
import { AddUserPage } from 'routes/admin-users/components/users_add';
import UsersTable from 'routes/search/components/users';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import { SearchHeader } from 'ui/SearchBar/SearchHeader';

const USERS_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string(null).nullable().ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('snapshot').ephemeral()
}));

type UsersParams = typeof USERS_PARAMS;

const UsersSearch = () => {
  const { t } = useTranslation(['adminUsers']);
  const theme = useTheme();
  const { apiCall } = useMyAPI();
  const { user: currentUser } = useALContext();
  const { search, setSearchParams, setSearchObject } = useSearchParams<UsersParams>();

  const [userResults, setUserResults] = useState<SearchResult<UserIndexed>>(null);
  const [searching, setSearching] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<IndexDefinition>(DEFAULT_SUGGESTION);

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
    (body: typeof search) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    if (!currentUser.is_admin) return;
    apiCall<IndexDefinition>({
      url: '/api/v4/search/fields/user/',
      onSuccess: ({ api_response }) => setSuggestions({ ...api_response, ...DEFAULT_SUGGESTION })
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
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } },
          actions: { spacing: 1 }
        }}
        actions={<AddUserPage />}
      />

      <PageContainer isSticky>
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
      </PageContainer>

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
