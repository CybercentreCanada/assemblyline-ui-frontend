import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useAppNavigate } from 'core/router';
import { createAppRoute, useAppSearchSnapshot } from 'core/routes';
import { TableOfContentProvider, useTableOfContent } from 'features/table-of-content/TableOfContent';
import type { ReactNode } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { FormProvider, useForm } from 'routes/development-library/contexts/form';
import { DateTimeSection } from 'routes/development-library/sections/DateTime';
import { InputsSection } from 'routes/development-library/sections/Inputs';
import { LayoutSection } from 'routes/development-library/sections/Layout';
import { ListSection } from 'routes/development-library/sections/List';
import { ListInputsSection } from 'routes/development-library/sections/ListInputs';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageLayout } from 'ui/layouts/PageLayout';
import type { PageNavigationItemProp } from 'ui/layouts/PageNavigation';
import { PageNavigation } from 'ui/layouts/PageNavigation';

// TODO: this whole code should be lazy loaded as it is expensive to be part of the core core.

// Component types only, so switching tabs doesn't build every section's JSX up front.
const LIBRARY_SECTIONS = {
  datetime: DateTimeSection,
  inputs: InputsSection,
  layout: LayoutSection,
  list: ListSection,
  list_inputs: ListInputsSection
} as const;

export const DevelopmentLibraryContent = memo(() => {
  const form = useForm();
  const navigate = useAppNavigate();
  const search = useAppSearchSnapshot<'/development/library'>();

  const { rootRef, headerRef, Anchors, ActiveAnchor, scrollTo } = useTableOfContent();

  const components = useMemo(() => form.getFieldValue('components'), [form]);
  const tab = useMemo(() => search.get('tab'), [search]);
  const selectedName = useMemo<string>(() => components?.[tab]?.name ?? '', [components, tab]);
  const componentEntries = useMemo(() => Object.entries(components ?? {}), [components]);

  const SectionComponent = useMemo<ReactNode>(() => {
    const Section = LIBRARY_SECTIONS[tab as keyof typeof LIBRARY_SECTIONS];
    return Section ? <Section /> : null;
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
                      {...item}
                      primary={item.primary}
                      active={isActive}
                      onPageNavigation={e => scrollTo(e, item.id)}
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

export const DevelopmentLibraryPage = memo(() => (
  <TableOfContentProvider>
    <FormProvider>
      <DevelopmentLibraryContent />
    </FormProvider>
  </TableOfContentProvider>
));

export const DevelopmentLibraryRoute = createAppRoute({
  title: {
    ns: 'app',
    key: 'drawer.development.library'
  },
  icon: {
    primary: <LibraryBooksIcon />
  },
  ancestor: '/development',
  component: DevelopmentLibraryPage,
  path: '/development/library',
  search: s => ({
    tab: s.enum(null, ['datetime', 'inputs', 'layout', 'list', 'list_inputs'])
  }),

  forbidden: s => !s.user.is_admin || !['development', 'staging'].includes(s.configuration.system.type)
});
