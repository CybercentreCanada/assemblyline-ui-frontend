import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { useTheme } from '@mui/material';
import { useAppUser } from 'commons/components/app/hooks';
import PageContainer from 'commons/components/pages/PageContainer';
import PageFullWidth from 'commons/components/pages/PageFullWidth';
import { useALQuery } from 'components/core/Query/AL/useALQuery';
import { createSearchParams } from 'components/core/SearchParams/createSearchParams';
import useALContext from 'components/hooks/useALContext';
import useDrawer from 'components/hooks/useDrawer';
import type { CustomUser, IndexDefinition } from 'components/models/ui/user';
import ForbiddenPage from 'components/routes/403';
import BadlistNew from 'components/routes/manage/badlist_add';
import BadlistDetail from 'components/routes/manage/badlist_detail';
import { IconButton } from 'components/visual/Buttons/IconButton';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import SearchHeader from 'components/visual/SearchBar/SearchHeader';
import { DEFAULT_SUGGESTION } from 'components/visual/SearchBar/search-textfield';
import BadlistTable from 'components/visual/SearchResult/badlist';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

export const { SearchParamsProvider, useSearchParams } = createSearchParams(p => ({
  query: p.string(''),
  offset: p.number(0).min(0).origin('state').ephemeral(),
  rows: p.number(25).locked().origin('state').ephemeral(),
  sort: p.string('added desc').ephemeral(),
  filters: p.filters([]),
  track_total_hits: p.number(10000).nullable().ephemeral(),
  refresh: p.boolean(false).origin('state').ephemeral()
}));

const BadlistSearch = () => {
  const { t } = useTranslation(['manageBadlist']);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { indexes } = useALContext();
  const { user: currentUser } = useAppUser<CustomUser>();
  const { globalDrawerOpened, setGlobalDrawer, closeGlobalDrawer } = useDrawer();
  const { search, setSearchParams, setSearchObject } = useSearchParams();

  const suggestions = useMemo<IndexDefinition>(
    () => ({ ...indexes.badlist, ...DEFAULT_SUGGESTION }),
    [indexes.badlist]
  );

  const badlists = useALQuery({
    url: '/api/v4/search/badlist/',
    method: 'POST',
    enabled: currentUser.roles.includes('badlist_view'),
    body: search
      .set(o => ({ ...o, query: o.query || '*' }))
      .omit(['refresh'])
      .toObject()
  });

  const handleToggleFilter = useCallback(
    (filter: string) => {
      setSearchObject(o => {
        const filters = o.filters.includes(filter) ? o.filters.filter(f => f !== filter) : [...o.filters, filter];
        return { ...o, offset: 0, filters };
      });
    },
    [setSearchObject]
  );

  useEffect(() => {
    if (!location.hash || globalDrawerOpened || !badlists.data) return;
    navigate(`${location.pathname}${location.search || ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalDrawerOpened]);

  useEffect(() => {
    if (!location.hash) closeGlobalDrawer();
    else if (location.hash === '#new') setGlobalDrawer(<BadlistNew close={closeGlobalDrawer} />);
    else setGlobalDrawer(<BadlistDetail badlist_id={location.hash.slice(1)} close={closeGlobalDrawer} />);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    function reload() {
      setSearchObject(o => ({ ...o, offset: 0, refresh: !o.refresh }));
    }

    window.addEventListener('reloadBadlist', reload);
    return () => {
      window.removeEventListener('reloadBadlist', reload);
    };
  }, [setSearchObject]);

  return currentUser.roles.includes('badlist_view') ? (
    <PageFullWidth margin={4}>
      <PageHeader
        primary={t('title')}
        slotProps={{
          root: { style: { marginBottom: theme.spacing(4) } }
        }}
        actions={
          <IconButton
            tooltip={t('add_badlist')}
            preventRender={!currentUser.roles.includes('badlist_manage')}
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
            loading={badlists.isFetching}
            results={badlists.data}
            resultLabel={
              search.get('query')
                ? t(`filtered${badlists.data?.total === 1 ? '' : 's'}`)
                : t(`total${badlists.data?.total === 1 ? '' : 's'}`)
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
        <BadlistTable badlistResults={badlists.data} isLoading={badlists.isLoading} />
      </div>
    </PageFullWidth>
  ) : (
    <ForbiddenPage />
  );
};

const WrappedBadlistPage = () => (
  <SearchParamsProvider>
    <BadlistSearch />
  </SearchParamsProvider>
);

export const BadlistPage = React.memo(WrappedBadlistPage);
export default BadlistPage;
