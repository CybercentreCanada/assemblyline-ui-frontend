import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import useAppUser from 'commons/components/app/hooks/useAppUser';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import PageHeader from 'commons/components/pages/PageHeader';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import useMyAPI from 'components/hooks/useMyAPI';
import type { CustomUser } from 'components/hooks/useMyUser';
import ForbiddenPage from 'components/routes/403';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import type { SearchParams } from 'components/visual/SearchBar/SearchParams';
import { createSearchParams } from 'components/visual/SearchBar/SearchParams';
import { SearchParamsProvider, useSearchParams } from 'components/visual/SearchBar/SearchParamsContext';
import type { SearchResult } from 'components/visual/SearchBar/SearchParser';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import SafelistTable from 'components/visual/SearchResult/safelist';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import SafelistNew from './safelist_add';
import type { Safelist } from './safelist_detail';
import SafelistDetail from './safelist_detail';

type SearchResults = {
  items: Safelist[];
  offset: number;
  rows: number;
  total: number;
};

const SAFELIST_PARAMS = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).hidden().ignored(),
  rows: p.number(25).enforced().hidden().ignored(),
  sort: p.string('added desc').ignored(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ignored(),
  refresh: p.boolean(false).hidden().ignored()
}));

type SafelistParams = SearchParams<typeof SAFELIST_PARAMS>;

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

  const [safelistResults, setSafelistResults] = useState<SearchResults>(null);
  const [searching, setSearching] = useState<boolean>(false);

  const suggestions = useMemo<string[]>(
    () =>
      indexes.safelist
        ? [...Object.keys(indexes.safelist).filter(name => indexes.safelist[name].indexed), ...DEFAULT_SUGGESTION]
        : [...DEFAULT_SUGGESTION],
    [indexes.safelist]
  );

  const handleReload = useCallback(
    (body: SearchResult<SafelistParams>) => {
      if (!currentUser.roles.includes('safelist_view')) return;

      apiCall({
        url: '/api/v4/search/safelist/',
        method: 'POST',
        body: body
          .set(o => ({ ...o, query: o.query || '*' }))
          .omit(['refresh'])
          .toObject(),
        onSuccess: ({ api_response }) => setSafelistResults(api_response as SearchResults),
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
  }, [handleReload, search]);

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
      <div style={{ paddingBottom: theme.spacing(2) }}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">{t('title')}</Typography>
          </Grid>
          {currentUser.roles.includes('safelist_manage') && (
            <Grid item xs style={{ textAlign: 'right', flexGrow: 0 }}>
              <Tooltip title={t('add_safelist')}>
                <IconButton
                  style={{
                    color: theme.palette.mode === 'dark' ? theme.palette.success.light : theme.palette.success.dark
                  }}
                  onClick={() => navigate(`${location.pathname}${location.search || ''}#new`)}
                  size="large"
                >
                  <AddCircleOutlineOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
        </Grid>
      </div>

      <PageHeader isSticky>
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
                tooltip: { title: t('user') },
                icon: { children: <PersonOutlineOutlinedIcon /> },
                button: {
                  onClick: () =>
                    setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'sources.type:user'] }))
                }
              },
              {
                tooltip: { title: t('tag') },
                icon: { children: <LabelOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'type:tag'] }))
                }
              },
              {
                tooltip: { title: t('disabled') },
                icon: { children: <BlockOutlinedIcon /> },
                button: {
                  onClick: () => setSearchObject(o => ({ ...o, offset: 0, filters: [...o.filters, 'enabled:false'] }))
                }
              }
            ]}
          />
        </div>
      </PageHeader>

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
