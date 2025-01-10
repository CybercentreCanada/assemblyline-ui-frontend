import { TableOfContentProvider, useTableOfContent } from 'components/core/tableofcontent/TableOfContent';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import { PageNavigation } from 'components/visual/Layouts/PageNavigation';
import React from 'react';
import { FormProvider, useForm } from './contexts/form';
import { InputsSection } from './sections/Inputs';
import { LayoutSection } from './sections/Layout';
import { ListSection } from './sections/List';
import { ListInputsSection } from './sections/ListInputs';

const LibraryContent = () => {
  const { rootRef, headerRef, Anchors, scrollTo } = useTableOfContent();
  const form = useForm();

  return (
    <form.Subscribe
      selector={state => [state.values.state.active, state.values.components?.[state.values.state.active]?.name]}
      children={([active, activeName]) => (
        <PageLayout
          rootRef={rootRef}
          headerRef={headerRef}
          header={<PageHeader primary="Library" secondary={activeName} />}
          leftNav={
            <form.Subscribe
              selector={state => Object.entries(state.values.components)}
              children={entries => (
                <PageNavigation
                  subheader="Components"
                  variant="left"
                  options={entries.map(([key, values]) => ({ id: key, primary: values.name }))}
                  render={({ id, primary, ...params }, i, NavItem) => (
                    <form.Subscribe
                      key={`${primary}-${i}`}
                      selector={state => state}
                      children={() => (
                        <NavItem
                          id={id}
                          primary={primary}
                          active={id === active}
                          primaryProps={{ textTransform: 'capitalize' }}
                          {...params}
                        />
                      )}
                    />
                  )}
                  onPageNavigation={(event, { id }) => {
                    form.setStore(s => {
                      s.state.active = id as any;
                      return s;
                    });
                  }}
                />
              )}
            />
          }
          rightNav={
            <Anchors
              children={(sections, activeSection) => (
                <PageNavigation
                  subheader="CONTENT"
                  variant="right"
                  options={sections.map(section => ({ primary: section }))}
                  render={({ primary, ...params }, i, NavItem) => (
                    <form.Subscribe
                      key={`${primary}-${i}`}
                      selector={state => state}
                      children={() => <NavItem primary={primary} active={primary === activeSection} {...params} />}
                    />
                  )}
                  onPageNavigation={(event, { primary }) => scrollTo(event, primary)}
                />
              )}
            />
          }
        >
          {(() => {
            switch (active) {
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
