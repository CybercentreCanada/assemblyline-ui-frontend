import { TableOfContentProvider, useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import useALContext from 'components/hooks/useALContext';
import type { LibraryFormStore } from 'components/routes/development/library/contexts/form';
import { FormProvider, useForm } from 'components/routes/development/library/contexts/form';
import { DateTimeSection } from 'components/routes/development/library/sections/DateTime';
import { InputsSection } from 'components/routes/development/library/sections/Inputs';
import { LayoutSection } from 'components/routes/development/library/sections/Layout';
import { ListSection } from 'components/routes/development/library/sections/List';
import { ListInputsSection } from 'components/routes/development/library/sections/ListInputs';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import type { PageNavigationItemProp } from 'components/visual/Layouts/PageNavigation';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

type LibraryTab = LibraryFormStore['state']['tab'];
type ComponentsState = LibraryFormStore['components'];

type LibraryPageContentInnerProps = {
  tab: LibraryTab;
  components: ComponentsState;
};

const LibraryPageContentInnerComponent: React.FC<LibraryPageContentInnerProps> = ({ tab, components }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rootRef, headerRef, Anchors, ActiveAnchor, scrollTo } = useTableOfContent();

  const selectedName = components?.[tab]?.name ?? '';

  const componentEntries = useMemo(() => Object.entries(components ?? {}), [components]);

  const SectionComponent = useMemo<React.ReactNode>(() => {
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
      navigate(`${location.pathname}?tab=${props.id}`);
    },
    [rootRef, navigate, location.pathname]
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
};

const LibraryPageContentInner = React.memo(LibraryPageContentInnerComponent);

const LibraryContent: React.FC = () => {
  const form = useForm();
  const location = useLocation();
  const { user: currentUser, configuration } = useALContext();

  useEffect(() => {
    const url = new SimpleSearchQuery(location.search);
    form.setFieldValue('state.tab', url.get('tab') as LibraryFormStore['state']['tab']);
  }, [form, location.search]);

  if (!currentUser.is_admin || !['development', 'staging'].includes(configuration.system.type)) {
    return <Navigate to="/forbidden" replace />;
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
};

const WrappedLibraryPage: React.FC = () => (
  <TableOfContentProvider>
    <FormProvider>
      <LibraryContent />
    </FormProvider>
  </TableOfContentProvider>
);

export const LibraryPage = React.memo(WrappedLibraryPage);
export default LibraryPage;
