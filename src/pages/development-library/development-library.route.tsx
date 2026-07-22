import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchParams } from 'core/routes';
import { TableOfContentProvider, useTableOfContent } from 'features/table-of-content/TableOfContent';
import { FormProvider, useForm, type LibraryFormStore } from 'pages/development-library/contexts/form';
import { DateTimeSection } from 'pages/development-library/sections/DateTime';
import { InputsSection } from 'pages/development-library/sections/Inputs';
import { LayoutSection } from 'pages/development-library/sections/Layout';
import { ListSection } from 'pages/development-library/sections/List';
import { ListInputsSection } from 'pages/development-library/sections/ListInputs';
import type { ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';
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

export const DevelopmentLibraryContent = memo(({ tab, components }: LibraryPageContentInnerProps) => {
  const navigate = useAppNavigate();
  const { rootRef, headerRef, Anchors, ActiveAnchor, scrollTo } = useTableOfContent();

  const selectedName = components?.[tab]?.name ?? '';

  const componentEntries = useMemo(() => Object.entries(components ?? {}), [components]);

  const SectionComponent = useMemo<ReactNode>(() => {
    return (
      {
        datetime: <DateTimeSection />,
        inputs: <InputsSection />,
        layout: <LayoutSection />,
        list: <ListSection />,
        list_inputs: <ListInputsSection />
      }[tab] ?? null
    );
  }, [tab]);

  const handleLeftNavClick = useCallback<PageNavigationItemProp['onPageNavigation']>(
    (event, props) => {
      rootRef.current?.scrollTo({ top: 0, behavior: 'instant' });
      navigate.here().update({ route: '/development/library', search: { tab: props.id } });
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

export const DevelopmentLibraryPage = memo(() => {
  const form = useForm();
  const search = useAppSearchParams<'/development/library'>();

  useEffect(() => {
    form.setFieldValue('state.tab', search.tab);
  }, [form, search]);

  return (
    <form.Subscribe
      selector={s => ({
        tab: s.values.state.tab,
        components: s.values.components
      })}
    >
      {props => <DevelopmentLibraryContent {...props} />}
    </form.Subscribe>
  );
});

export const WrappedDevelopmentLibraryPage = memo(() => (
  <TableOfContentProvider>
    <FormProvider>
      <DevelopmentLibraryPage />
    </FormProvider>
  </TableOfContentProvider>
));

export const DevelopmentLibraryRoute = createAppRoute({
  component: WrappedDevelopmentLibraryPage,
  path: '/development/library',
  search: s => ({
    tab: s.enum(['datetime', 'inputs', 'layout', 'list', 'list_inputs'] as LibraryFormStore['state']['tab'][], null)
  }),

  forbidden: s => !s.user.is_admin || !['development', 'staging'].includes(s.configuration.system.type)
});
