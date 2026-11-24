import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import useALContext from 'core/config/useALContext';
import { AppNavigate, createAppRoute, useAppNavigate, useAppSearchSnapshot } from 'core/router';
import { TableOfContentLayout, useTableOfContent } from 'features/table-of-content/table-of-content.providers';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import type { LibraryFormStore } from 'routes/development-library/contexts/form';
import { FormProvider, useForm } from 'routes/development-library/contexts/form';
import { DateTimeSection } from 'routes/development-library/sections/DateTime';
import { HashParamsSection } from 'routes/development-library/sections/HashParams';
import { InputsSection } from 'routes/development-library/sections/Inputs';
import { LayoutSection } from 'routes/development-library/sections/Layout';
import { ListSection } from 'routes/development-library/sections/List';
import { ListInputsSection } from 'routes/development-library/sections/ListInputs';
import { PathParamsSection } from 'routes/development-library/sections/PathParams';
import { SearchParamsSection } from 'routes/development-library/sections/search-params/SearchParams';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageLayout } from 'ui/layouts/PageLayout';
import type { PageNavigationItemProp } from 'ui/layouts/PageNavigation';
import { PageNavigation } from 'ui/layouts/PageNavigation';

type LibraryTab = LibraryFormStore['state']['tab'];
type ComponentsState = LibraryFormStore['components'];

type LibraryPageContentInnerProps = {
  tab: LibraryTab;
  components: ComponentsState;
};

const LibraryPageContentInner = memo(({ tab, components }: LibraryPageContentInnerProps) => {
  const navigate = useAppNavigate<'/development/library'>();
  const { rootRef, headerRef, Anchors, ActiveAnchor, scrollTo } = useTableOfContent();

  const selectedName = components?.[tab]?.name ?? '';

  const componentEntries = useMemo(() => Object.entries(components ?? {}), [components]);

  const SectionComponent = useMemo<React.ReactNode>(() => {
    return (
      {
        datetime: <DateTimeSection />,
        hash_params: <HashParamsSection />,
        inputs: <InputsSection />,
        layout: <LayoutSection />,
        list_inputs: <ListInputsSection />,
        list: <ListSection />,
        path_params: <PathParamsSection />,
        search_params: <SearchParamsSection />
      }[tab] ?? null
    );
  }, [tab]);

  const handleLeftNavClick = useCallback<PageNavigationItemProp['onPageNavigation']>(
    (event, props) => {
      rootRef.current?.scrollTo({ top: 0, behavior: 'instant' });
      navigate.here().update(s => ({ ...s, search: { ...s.search, tab: props.id as LibraryTab } }));
    },
    [rootRef, navigate]
  );

  return (
    <PageLayout
      rootRef={rootRef}
      headerRef={headerRef}
      header={<PageHeader primary="Library" secondary={selectedName} />}
      leftNav={
        <PageNavigation
          subheader="Components"
          variant="left"
          options={componentEntries.map(([key, v]) => ({ id: key, primary: v.name }))}
          renderItem={(item, _i, NavItem) => (
            <NavItem
              key={String(item.id)}
              id={item.id}
              primary={item.primary}
              active={item.id === tab}
              primaryProps={{ textTransform: 'capitalize' }}
              onPageNavigation={handleLeftNavClick}
            />
          )}
        />
      }
      rightNav={
        <Anchors>
          {sections => (
            <PageNavigation
              subheader="CONTENT"
              variant="right"
              options={sections.map(s => ({ id: s.id, primary: s.label, subheader: s.subheader }))}
              renderItem={(item, _i, NavItem) => (
                <ActiveAnchor key={String(item.id)} activeID={item.id}>
                  {isActive => (
                    <NavItem
                      primary={item.primary}
                      active={isActive}
                      onPageNavigation={e => scrollTo(e, item.id)}
                      {...item}
                    />
                  )}
                </ActiveAnchor>
              )}
            />
          )}
        </Anchors>
      }
    >
      {SectionComponent}
    </PageLayout>
  );
});

export const DevelopmentLibraryContent = memo(() => {
  const form = useForm();
  const search = useAppSearchSnapshot<'/development/library'>();
  const { user: currentUser, configuration } = useALContext();

  useEffect(() => {
    form.setFieldValue('state.tab', search.get('tab') as LibraryFormStore['state']['tab']);
  }, [form, search?.toString()]);

  if (!currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type)) {
    return <AppNavigate nav={nav => nav.here<'/forbidden'>({ replace: true }).update({ route: '/forbidden' })} />;
  }

  return (
    <form.Subscribe
      selector={s => ({
        tab: s.values.state.tab,
        components: s.values.components
      })}
    >
      {props => <LibraryPageContentInner {...props} />}
    </form.Subscribe>
  );
});

export const DevelopmentLibraryPage = memo(() => (
  <TableOfContentLayout>
    <FormProvider>
      <DevelopmentLibraryContent />
    </FormProvider>
  </TableOfContentLayout>
));

export const DevelopmentLibraryRoute = createAppRoute({
  component: DevelopmentLibraryPage,

  path: '/development/library',
  search: s => ({
    tab: s.enum(null, [
      'datetime',
      'hash_params',
      'inputs',
      'layout',
      'list',
      'list_inputs',
      'path_params',
      'search_params'
    ])
  }),
  hash: s => s.string(null),

  ancestor: '/development',
  shortname: () => ['app_route.development_library.shortname', { ns: 'developmentAPI' }],
  fullname: () => ['app_route.development_library.fullname', { ns: 'developmentAPI' }],
  shorticon: () => <LibraryBooksIcon />,
  fullicon: () => <LibraryBooksIcon />,

  disabled: () => false,
  forbidden: (_location, config) =>
    !config.user.is_admin || !['development', 'staging'].includes(config.configuration.system.type)
});
