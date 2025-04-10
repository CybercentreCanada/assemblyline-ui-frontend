import { TableOfContentProvider, useTableOfContent } from 'components/core/TableOfContent/TableOfContent';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import SimpleSearchQuery from 'components/visual/SearchBar/simple-search-query';
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { LibraryFormStore } from './contexts/form';
import { FormProvider, useForm } from './contexts/form';
import { InputsSection } from './sections/Inputs';
import { LayoutSection } from './sections/Layout';
import { ListSection } from './sections/List';
import { ListInputsSection } from './sections/ListInputs';

const LibraryContent = () => {
  const { rootRef, headerRef, Anchors, ActiveAnchor, scrollTo } = useTableOfContent();
  const form = useForm();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new SimpleSearchQuery(location.search);
    form.setFieldValue('state.tab', url.get('tab') as LibraryFormStore['state']['tab']);
  }, [form, location.search]);

  return (
    <form.Subscribe
      selector={state => [state.values.state.tab, state.values.components?.[state.values.state.tab]?.name]}
      children={([tab, name]) => (
        <PageLayout
          rootRef={rootRef}
          headerRef={headerRef}
          header={<PageHeader primary="Library" secondary={name} />}
          leftNav={
            <form.Subscribe
              selector={state => Object.entries(state.values.components)}
              children={entries => (
                <PageNavigation
                  subheader="Components"
                  variant="left"
                  options={entries.map(([key, values]) => ({ id: key, primary: values.name }))}
                  renderItem={({ id, primary, ...params }, i, NavItem) => (
                    <form.Subscribe
                      key={`${primary.toString()}-${i}`}
                      selector={state => state}
                      children={() => (
                        <NavItem
                          id={id}
                          primary={primary}
                          active={id === tab}
                          primaryProps={{ textTransform: 'capitalize' }}
                          {...params}
                        />
                      )}
                    />
                  )}
                  onPageNavigation={(event, { id }) => {
                    rootRef.current.scrollTo({ top: 0, behavior: 'instant' });
                    navigate(`${location.pathname}?tab=${id}`);
                  }}
                />
              )}
            />
          }
          rightNav={
            <Anchors
              children={sections => (
                <PageNavigation
                  subheader="CONTENT"
                  variant="right"
                  options={sections.map(({ id, label, subheader }) => ({ id, primary: label, subheader }))}
                  renderItem={({ id, primary, ...params }, i, NavItem) => (
                    <ActiveAnchor
                      key={`${primary.toString()}-${i}`}
                      activeID={id}
                      children={isActive => (
                        <form.Subscribe
                          key={`${primary.toString()}-${i}`}
                          selector={state => state}
                          children={() => (
                            <NavItem
                              primary={primary}
                              active={isActive}
                              onPageNavigation={event => scrollTo(event, id)}
                              {...params}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          }
        >
          {(() => {
            switch (tab) {
              case 'inputs':
                return <InputsSection />;
              case 'layout':
                return <LayoutSection />;
              case 'list':
                return <ListSection />;
              case 'list_inputs':
                return <ListInputsSection />;
            }
          })()}
        </PageLayout>
      )}
    />
  );
};

const WrappedLibraryPage = () => (
  <TableOfContentProvider>
    <FormProvider>
      <LibraryContent />
    </FormProvider>
  </TableOfContentProvider>
);

export const LibraryPage = React.memo(WrappedLibraryPage);
export default LibraryPage;
