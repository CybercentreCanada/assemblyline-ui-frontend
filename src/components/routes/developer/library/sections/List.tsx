import CancelIcon from '@mui/icons-material/Cancel';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Button, IconButton, Tooltip } from '@mui/material';
import { DemoContainer } from 'components/routes/developer/library/components/DemoContainer';
import { DemoSection } from 'components/routes/developer/library/components/DemoSection';
import { useForm } from 'components/routes/developer/library/contexts/form';
import CustomChip from 'components/visual/CustomChip';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageSection } from 'components/visual/Layouts/PageSection';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export type ListLibraryState = {
  list: {
    name: string;
    sections: string[];
    values: {
      classification: string;
      sectionOpen: boolean;
    };
  };
};
export const LIST_LIBRARY_STATE: ListLibraryState = {
  list: {
    name: 'List',
    sections: ['basic', 'controlled', 'disabled'],
    values: {
      classification: 'TLP:C',
      sectionOpen: true
    }
  }
} as const;

export const ListSection = React.memo(() => {
  const form = useForm();

  return (
    <DemoContainer>
      <DemoSection
        primary={'Page Header: Basic Example'}
        secondary={
          <>
            <span>{'This Header is the component used on top of every page. '}</span>
            <span>{'It implements all the features that are present on most pages.'}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => state.values.components.list.values.classification}
            children={value => (
              <PageHeader
                primary="Page Header"
                secondary="Description of the Page Header"
                classification={value}
                actions={[
                  { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
                  { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
                  <Tooltip key={3} title="Cancel">
                    <div>
                      <IconButton size="large">
                        <CancelIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ]}
                endAdornment={<CustomChip label="End Adornment" />}
              />
            )}
          />
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
<PageHeader
  primary="Page Header"
  secondary="Description of the Page Header"
  classification={value}
  actions={[
    { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
    { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
    <Tooltip key={3} title="Cancel">
      <div>
        <IconButton size="large">
          <CancelIcon />
        </IconButton>
      </div>
    </Tooltip>
  ]}
  endAdornment={<CustomChip label="End Adornment" />}
/>`}
          />
        }
      />

      <DemoSection
        primary={'Page Header: Classification'}
        secondary={
          <>
            <span>{'Use the onClassificationChange to change to classifiation component into a picker. '}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => state.values.components.list.values.classification}
            children={value => (
              <PageHeader
                primary="Page Header"
                secondary="Description of the Page Header"
                classification={value}
                onClassificationChange={next => {
                  form.setStore(s => {
                    s.components.list.values.classification = next;
                    return s;
                  });
                }}
              />
            )}
          />
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
<PageHeader
  primary="Page Header"
  secondary="Description of the Page Header"
  classification={value}
  onClassificationChange={next => {}}
/>`}
          />
        }
      />

      <DemoSection
        primary={'Page Header: Loading'}
        secondary={
          <>
            <span>{'Use the loading prop to enter the loading state. '}</span>
            <span>{'None of the secondary, actions and end adorment will be rendered '}</span>
            <span>{'to avoid crashing by a value not existing yet.'}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => state.values.components.list.values.classification}
            children={value => (
              <PageHeader
                primary="Page Header"
                secondary="Description of the Page Header"
                classification={value}
                loading
                actions={[
                  { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
                  { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
                  <Tooltip key={3} title="Cancel">
                    <div>
                      <IconButton size="large">
                        <CancelIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ]}
                endAdornment={<CustomChip label="End Adornment" />}
              />
            )}
          />
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
<PageHeader
  primary="Page Header"
  secondary="Description of the Page Header"
  classification={value}
  loading
  actions={[
    { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
    { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
    <Tooltip key={3} title="Cancel">
      <div>
        <IconButton size="large">
          <CancelIcon />
        </IconButton>
      </div>
    </Tooltip>
  ]}
  endAdornment={<CustomChip label="End Adornment" />}
/>`}
          />
        }
      />

      <DemoSection
        primary={'Page Header: Long names'}
        secondary={'The Header component should handle long names'}
        left={
          <form.Subscribe
            selector={state => state.values.components.list.values.classification}
            children={value => (
              <PageHeader
                primary="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque, fringilla consequat diam suscipit. Donec sed arcu blandit, luctus lorem quis, sodales elit. Phasellus blandit posuere sapien, ut pharetra ipsum efficitur at. Sed vel nulla risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce efficitur nunc at urna imperdiet mattis. Sed condimentum vel ex et semper."
                secondary="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque, fringilla consequat diam suscipit. Donec sed arcu blandit, luctus lorem quis, sodales elit. Phasellus blandit posuere sapien, ut pharetra ipsum efficitur at. Sed vel nulla risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce efficitur nunc at urna imperdiet mattis. Sed condimentum vel ex et semper."
                classification={value}
                actions={[
                  { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
                  { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
                  <Tooltip key={3} title="Cancel">
                    <div>
                      <IconButton size="large">
                        <CancelIcon />
                      </IconButton>
                    </div>
                  </Tooltip>
                ]}
                endAdornment={<CustomChip label="End Adornment" />}
              />
            )}
          />
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
<PageHeader
  primary="Page Header"
  secondary="Description of the Page Header"
  classification={value}
  loading
  actions={[
    { icon: <InfoOutlinedIcon />, tooltip: 'Information' },
    { icon: <CloseOutlinedIcon />, tooltip: 'Closed', tooltipProps: { placement: 'top' } },
    <Tooltip key={3} title="Cancel">
      <div>
        <IconButton size="large">
          <CancelIcon />
        </IconButton>
      </div>
    </Tooltip>
  ]}
  endAdornment={<CustomChip label="End Adornment" />}
/>`}
          />
        }
      />

      <DemoSection
        primary={'Page Section: Basic Example'}
        secondary={
          <>
            <span>{'This section component. Use the Use the loading prop to enter the loading state. '}</span>
            <span>{'None of the secondary, actions and end adorment will be rendered '}</span>
            <span>{'to avoid crashing by a value not existing yet.'}</span>
          </>
        }
        left={
          <PageSection
            primary="Page Section: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque"
            secondary="Description of the Page Section: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque"
            collapsible
            divider
            endAdornment={<Button variant="outlined">{'End Adornement'}</Button>}
          >
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque, fringilla consequat diam suscipit. Donec sed arcu blandit, luctus lorem quis, sodales elit. Phasellus blandit posuere sapien, ut pharetra ipsum efficitur at. Sed vel nulla risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce efficitur nunc at urna imperdiet mattis. Sed condimentum vel ex et semper.'
            }
          </PageSection>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
 <PageSection
  primary="Page Section"
  secondary="Description of the Page Section"
  collapsible
  divider
  endAdornment={<Button variant="outlined">{'End Adornement'}</Button>}
>
  {children}
</PageSection>`}
          />
        }
      />

      <DemoSection
        primary={'Page Section: Not collapsible and no divider'}
        secondary={
          <>
            <span>{'If the collapsible prop is not provided, the button functionality will not be present. '}</span>
            <span>{'If the divider prop is not provided, the underline will not be present. '}</span>
          </>
        }
        left={
          <PageSection primary="Page Section" secondary="Description of the Page Section">
            {
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque, fringilla consequat diam suscipit. Donec sed arcu blandit, luctus lorem quis, sodales elit. Phasellus blandit posuere sapien, ut pharetra ipsum efficitur at. Sed vel nulla risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce efficitur nunc at urna imperdiet mattis. Sed condimentum vel ex et semper.'
            }
          </PageSection>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
 <PageSection
  primary="Page Section"
  secondary="Description of the Page Section"
>
  {children}
</PageSection>`}
          />
        }
      />

      <DemoSection
        primary={'Page Section: Controlled'}
        secondary={
          <>
            <span>{'By default, the component manages its own collapsible state. '}</span>
            <span>{'If you wish to manage the open state, provide a boolean value. '}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => state.values.components.list.values.sectionOpen}
            children={value => (
              <PageSection
                primary="Page Section"
                secondary="Description of the Page Section"
                collapsible
                open={value}
                onChange={next => {
                  form.setStore(s => {
                    s.components.list.values.sectionOpen = next;
                    return s;
                  });
                }}
              >
                {
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam enim malesuada sapien pellentesque, fringilla consequat diam suscipit. Donec sed arcu blandit, luctus lorem quis, sodales elit. Phasellus blandit posuere sapien, ut pharetra ipsum efficitur at. Sed vel nulla risus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce efficitur nunc at urna imperdiet mattis. Sed condimentum vel ex et semper.'
                }
              </PageSection>
            )}
          />
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`
 <PageSection
  primary="Page Section"
  secondary="Description of the Page Section"
  open={open}
  onChange={next => {}}
>
  {children}
</PageSection>`}
          />
        }
      />
    </DemoContainer>
  );
});
