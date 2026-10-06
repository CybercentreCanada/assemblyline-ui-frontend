import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme } from '@mui/material';
import useALContext from 'core/config/useALContext';
import PageContainer from 'core/template/branding/AppPageContainer';
import { useAppUser } from 'core/template/components/app/hooks';
import PageFullWidth from 'core/template/components/pages/PageFullWidth';
import useMyAPI from 'deprecated/hooks/useMyAPI';
import { createSearchParams, SearchParamsProvider, useSearchParams } from 'features/SearchParams/createSearchParams';
import useDrawer from 'layout/drawer/useDrawer';
import type { SearchResult } from 'models/api/search';
import type { CustomUser, IndexDefinition } from 'models/api/user';
import type { Safelist } from 'models/base/safelist';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import ForbiddenPage from 'routes/forbidden/forbidden';
import SafelistNew from 'routes/manage-safelist-add/manage-safelist-add.route';
import SafelistDetail from 'routes/manage-safelist-detail/manage-safelist-detail.route';
import SafelistTable from 'routes/search/components/safelist';
import { IconButton } from 'ui/buttons/IconButton';
import { PageHeader } from 'ui/layouts/PageHeader';
import { DEFAULT_SUGGESTION } from 'ui/SearchBar/search-textfield';
import SearchHeader from 'ui/SearchBar/SearchHeader';

const SAFELIST_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('snapshot').ephemeral(),
  rows: p.number(25).locked().origin('snapshot').ephemeral(),
  sort: p.string('added desc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('snapshot').ephemeral()
}));

type SafelistParams = typeof SAFELIST_PARAMS;

const SafelistSearch = () => {
  const { t } = useTranslation(['manageSafelist']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useMyAPI();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams<SafelistParams>();

  const [safelistResults, setSafelistResults] = useState<SearchResult<Safelist>>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.safelist, ...DEFAULT_SUGGESTION }),
    [indexes.safelist]
  );

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
      if (!currentUser.roles.includes('safelist_view')) return;

      apiCall<SearchResult<Safelist>>({
        url: '/api/v4/search/safelist/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setSafelistResults(api_response),
        onEnter: () => setSearching(true),
        onExit: () => setSearching(false)
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser.roles]
  );

  const setSafelistID = useCallback(
    (wf_id: string) => {
      navigate(`${location.pathname}${location.search || ''}#${wf_id}`);
    },
    [location.pathname, location.search, navigate]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !safelistResults) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (!location.hash) closeGlobalDrawer();
    else if (location.hash === '#new') setGlobalDrawer(<SafelistNew close={closeGlobalDrawer} />);
    else setGlobalDrawer(<SafelistDetail safelist_id={location.hash.slice(1)} close={closeGlobalDrawer} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    handleReload(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleReload, search.toString()]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadSafelist', reload);
    return () => {
      window.removeEventListener('reloadSafelist', reload);
    };
  }, [setSearchObject]);

  return currentUser.roles.includes('safelist_view') ? (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(2) } }
        }}
        actions={
          <IconButton
            tooltip={t('add_safelist')}
            preventRender={!currentUser.roles.includes('safelist_manage')}
            size="large"
            sx={{ color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark }}
            onClick={() => navigate(`${location.pathname}${location.search || ''}#new`)}
          >
            <AddCircleOutlineOutlinedIcon />
          </IconButton>
        }
      />

      <PageContainer isSticky>
        <div style={{ paddingTop: theme.spacing(1) }}>
          <SearchHeader
            params={search.toParams()}
            loading={searching}
            results={safelistResults}
            resultLabel={
              search.get('query')
                ? t(`filtered${safelistResults?.total === 1 ? '' : 's'}`)
                : t(`total${safelistResults?.total === 1 ? '' : 's'}`)
            }
            onChange={v => setSearchParams(v)}
            paramDefaults={search.defaults().toObject()}
            searchInputProps={{ placeholder: t('filter'), options: suggestions }}
            actionProps={[
              {
                tooltip: {
                  title: search.has('filters', 'sources.type:user') ? t('filter.user.remove') : t('filter.user.add')
                },
                icon: { children: <PersonOutlineOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'sources.type:user') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('sources.type:user')
                }
              },
              {
                tooltip: { title: search.has('filters', 'type:tag') ? t('filter.tag.remove') : t('filter.tag.add') },
                icon: { children: <LabelOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'type:tag') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('type:tag')
                }
              },
              {
                tooltip: {
                  title: search.has('filters', 'enabled:false') ? t('filter.disabled.remove') : t('filter.disabled.add')
                },
                icon: { children: <BlockOutlinedIcon /> },
                button: {
                  color: search.has('filters', 'enabled:false') ? 'primary' : 'default',
                  onClick: () => handleToggleFilter('enabled:false')
                }
              }
            ]}
          />
        </div>
      </PageContainer>

      <div style={{ paddingTop: theme.spacing(2), paddingLeft: theme.spacing(0.5), paddingRight: theme.spacing(0.5) }}>
        <SafelistTable safelistResults={safelistResults} setSafelistID={setSafelistID} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedSafelistPage = () => (
  <SearchParamsProvider params={SAFELIST_PARAMS}>
    <SafelistSearch />
  </SearchParamsProvider>
);

export const SafelistPage = React.memo(WrappedSafelistPage);
export default SafelistPage;
