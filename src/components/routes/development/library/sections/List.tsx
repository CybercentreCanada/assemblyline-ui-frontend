import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export type ListLibraryState = {
  list: {
    name: string;
    values: {
      classification: string;
      sectionOpen: boolean;
      text: string;
      checked1: boolean;
      checked2: boolean;
      indeterminate: boolean;
    };
  };
};
export const LIST_LIBRARY_STATE: ListLibraryState = {
  list: {
    name: 'List',
    values: {
      classification: 'TLP:C',
      sectionOpen: true,
      text: '',
      checked1: false,
      checked2: true,
      indeterminate: false
    }
  }
} as const;

export const ListSection = React.memo(() => {
  const form = useForm();

  return (
    <DemoContainer>
      <DemoSection
        primary="Basics"
        secondary={null}
        left={
          <div>
            <ListHeader
              primary="Subheader List"
              secondary="Subheader List description"
              primaryProps={{ color: 'primary' }}
              divider
            />
            <ListHeader primary="List" secondary="List description" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list.values.text}
                children={value => (
                  <>
                    <TextListInput
                      primary="Text List Input 1"
                      secondary="Text List Input Description 1"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Text List Input 2"
                      secondary="Text List Input Description 2"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Text List Input 3"
                      secondary="Text List Input Description 3"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                  </>
                )}
              />
            </List>
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
 <ListHeader
    primary="List"
    secondary="List description"
    primaryProps={{ color: 'primary' }}
    divider
  />
  <ListHeader
    primary="List"
    secondary="List description"
  />
  <List checkbox>
    <TextListInput
      primary="Text List Input"
      secondary="Text List Input Description"
    />
    <TextListInput
      primary="Text List Input"
      secondary="Text List Input Description"
    />
    <TextListInput
      primary="Text List Input"
      secondary="Text List Input Description"
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Checkbox"
        secondary={
          <>
            <span>{'To add a checkbox to the ListHeader, provide a value for the "checked" prop. '}</span>
            <span>{'To reflect the spacing, add the "checkbox" prop to the List component. '}</span>
          </>
        }
        left={
          <div>
            <form.Subscribe
              selector={state => state.values.components.list.values.checked1}
              children={checked => (
                <ListHeader
                  primary="Checkbox Subheader List"
                  secondary="Checkbox Subheader List description"
                  primaryProps={{ color: 'primary' }}
                  divider
                  checked={checked}
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked1', !c)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.list.values.checked2}
              children={value => (
                <ListHeader
                  primary="Checkbox List"
                  secondary="Checkbox List description"
                  checked={value}
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked2', !c)}
                />
              )}
            />
            <List inset>
              <form.Subscribe
                selector={state => state.values.components.list.values.text}
                children={value => (
                  <>
                    <TextListInput
                      primary="Checkbox Text List Input 1"
                      secondary="Checkbox Text List Input Description 1"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Checkbox Text List Input 2"
                      secondary="Checkbox Text List Input Description 2"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Checkbox Text List Input 3"
                      secondary="Checkbox Text List Input Description 3"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                  </>
                )}
              />
            </List>
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
 <ListHeader
    primary="Checkbox Subheader List"
    secondary="Checkbox Subheader List description"
    primaryProps={{ color: 'primary' }}
    divider
    checked={checked}
    indeterminate={indeterminate}
    onChange={(event, checked, indeterminate) => { }}
  />
  <ListHeader
    primary="Checkbox List"
    secondary="Checkbox List description"
    checked={checked}
    indeterminate={indeterminate}
    onChange={(event, checked, indeterminate) => { }}
  />
  <List checkbox>
    <TextListInput
      primary="Checkbox Text List Input 1"
      secondary="Checkbox Text List Input Description 1"
      value={value}
      onChange={(event, next) => { }}
    />
    <TextListInput
      primary="Checkbox Text List Input 2"
      secondary="Checkbox Text List Input Description 2"
      value={value}
      onChange={(event, next) => { }}
    />
    <TextListInput
      primary="Checkbox Text List Input 3"
      secondary="Checkbox Text List Input Description 3"
      value={value}
      onChange={(event, next) => { }}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Uncontrolled"
        secondary={
          'If a value for the "onChange" prop is not provided in the ListHeader component, it will not act as a button. '
        }
        left={
          <div>
            <form.Subscribe
              selector={state => state.values.components.list.values.checked1}
              children={checked => (
                <ListHeader
                  primary="Uncontrolled Subheader List"
                  secondary="Uncontrolled Subheader List description"
                  primaryProps={{ color: 'primary' }}
                  divider
                  checked={checked}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.list.values.checked2}
              children={value => (
                <ListHeader primary="Uncontrolled List" secondary="Uncontrolled List description" checked={value} />
              )}
            />
            <List inset>
              <form.Subscribe
                selector={state => state.values.components.list.values.text}
                children={value => (
                  <>
                    <TextListInput
                      primary="Uncontrolled Text List Input 1"
                      secondary="Uncontrolled Text List Input Description 1"
                      value={value}
                    />
                    <TextListInput
                      primary="Uncontrolled Text List Input 2"
                      secondary="Uncontrolled Text List Input Description 2"
                      value={value}
                    />
                    <TextListInput
                      primary="Uncontrolled Text List Input 3"
                      secondary="Uncontrolled Text List Input Description 3"
                      value={value}
                    />
                  </>
                )}
              />
            </List>
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
 <ListHeader
    primary="Uncontrolled Subheader List"
    secondary="Uncontrolled Subheader List description"
    primaryProps={{ color: 'primary' }}
    divider
    checked={checked}
    indeterminate={indeterminate}
  />
  <ListHeader
    primary="Uncontrolled List"
    secondary="Uncontrolled List description"
    checked={checked}
    indeterminate={indeterminate}
  />
  <List checkbox>
    <TextListInput
      primary="Uncontrolled Text List Input 1"
      secondary="Uncontrolled Text List Input Description 1"
    />
    <TextListInput
      primary="Uncontrolled Text List Input 2"
      secondary="Uncontrolled Text List Input Description 2"
    />
    <TextListInput
      primary="Uncontrolled Text List Input 3"
      secondary="Uncontrolled Text List Input Description 3"
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Disabled"
        secondary={'Add the "disable" prop to disable the component. '}
        left={
          <div>
            <form.Subscribe
              selector={state => state.values.components.list.values.checked1}
              children={checked => (
                <ListHeader
                  primary="Disabled Subheader List"
                  secondary="Disabled Subheader List description"
                  primaryProps={{ color: 'primary' }}
                  divider
                  disabled
                  checked={checked}
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked1', !c)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.list.values.checked2}
              children={value => (
                <ListHeader
                  primary="Disabled List"
                  secondary="Disabled List description"
                  checked={value}
                  disabled
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked2', !c)}
                />
              )}
            />
            <List inset>
              <form.Subscribe
                selector={state => state.values.components.list.values.text}
                children={value => (
                  <>
                    <TextListInput
                      primary="Disabled Text List Input 1"
                      secondary="Disabled Text List Input Description 1"
                      value={value}
                      disabled
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Disabled Text List Input 2"
                      secondary="Disabled Text List Input Description 2"
                      value={value}
                      disabled
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Disabled Text List Input 3"
                      secondary="Disabled Text List Input Description 3"
                      value={value}
                      disabled
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                  </>
                )}
              />
            </List>
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
 <ListHeader
    primary="Disabled Subheader List"
    secondary="Disabled Subheader List description"
    primaryProps={{ color: 'primary' }}
    checked={checked}
    indeterminate={indeterminate}
    divider
    disabled
  />
  <ListHeader
    primary="Disabled List"
    secondary="Disabled List description"
    checked={checked}
    indeterminate={indeterminate}
    disabled
  />
  <List checkbox>
    <TextListInput
      primary="Disabled Text List Input 1"
      secondary="Disabled Text List Input Description 1"
      disabled
    />
    <TextListInput
      primary="Disabled Text List Input 2"
      secondary="Disabled Text List Input Description 2"
      disabled
    />
    <TextListInput
      primary="Disabled Text List Input 3"
      secondary="Disabled Text List Input Description 3"
      disabled
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Long Names"
        secondary=""
        left={
          <div>
            <form.Subscribe
              selector={state => state.values.components.list.values.checked1}
              children={checked => (
                <ListHeader
                  primary="Subheader List: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  secondary="Subheader List description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  primaryProps={{ color: 'primary' }}
                  divider
                  checked={checked}
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked1', !c)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.list.values.checked2}
              children={value => (
                <ListHeader
                  primary="List: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  secondary="List description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  checked={value}
                  onChange={(event, c, i) => form.setFieldValue('components.list.values.checked2', !c)}
                />
              )}
            />
            <List inset>
              <form.Subscribe
                selector={state => state.values.components.list.values.text}
                children={value => (
                  <>
                    <TextListInput
                      primary="Long Names Text List Input 1"
                      secondary="Long Names Text List Input Description 1"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Long Names Text List Input 2"
                      secondary="Long Names Text List Input Description 2"
                      value={value}
                      disabled
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                    <TextListInput
                      primary="Long Names Text List Input 3"
                      secondary="Long Names Text List Input Description 3"
                      value={value}
                      disabled
                      onChange={(event, next) => form.setFieldValue('components.list.values.text', next)}
                    />
                  </>
                )}
              />
            </List>
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
 <ListHeader
    primary="Disabled Subheader List"
    secondary="Disabled Subheader List description"
    primaryProps={{ color: 'primary' }}
    checked={checked}
    indeterminate={indeterminate}
    divider
    disabled
  />
  <ListHeader
    primary="Disabled List"
    secondary="Disabled List description"
    checked={checked}
    indeterminate={indeterminate}
    disabled
  />
  <List checkbox>
    <TextListInput
      primary="Disabled Text List Input 1"
      secondary="Disabled Text List Input Description 1"
      disabled
    />
    <TextListInput
      primary="Disabled Text List Input 2"
      secondary="Disabled Text List Input Description 2"
      disabled
    />
    <TextListInput
      primary="Disabled Text List Input 3"
      secondary="Disabled Text List Input Description 3"
      disabled
    />
  </List>
</>`}
          />
        }
      />
    </DemoContainer>
  );
});
