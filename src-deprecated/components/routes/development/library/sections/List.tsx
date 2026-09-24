import { useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export type ListLibraryState = {
  list: {
    name: string;
    state: {
      button: boolean;
    };
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
    state: {
      button: false
    },
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
  const theme = useTheme();
  const form = useForm();

  return (
    <DemoContainer>
      <DemoSection
        primary="Interactions"
        secondary={
          <>
            <span>{'Use this to test the different interaction with the different props. '}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state =>
              [
                state.values.components.list_inputs.state.badge,
                state.values.components.list_inputs.state.capitalize,
                state.values.components.list_inputs.state.disabled,
                state.values.components.list_inputs.state.endAdornment,
                state.values.components.list_inputs.state.helperText,
                state.values.components.list_inputs.state.inset,
                state.values.components.list_inputs.state.loading,
                state.values.components.list_inputs.state.longname,
                state.values.components.list_inputs.state.monospace,
                state.values.components.list_inputs.state.noSecondary,
                state.values.components.list_inputs.state.overflowHidden,
                state.values.components.list_inputs.state.password,
                state.values.components.list_inputs.state.placeholder,
                state.values.components.list_inputs.state.preventRender,
                state.values.components.list_inputs.state.readOnly,
                state.values.components.list_inputs.state.reset,
                state.values.components.list_inputs.state.startAdornment,
                state.values.components.list_inputs.state.tiny,
                state.values.components.list_inputs.state.tooltip,
                state.values.components.list.state.button,
                state.values.components.list.values.checked1
              ] as const
            }
            children={([
              badge,
              capitalize,
              disabled,
              endAdornment,
              helperText,
              inset,
              loading,
              longname,
              monospace,
              noSecondary,
              overflowHidden,
              password,
              placeholder,
              preventRender,
              readOnly,
              reset,
              startAdornment,
              tiny,
              tooltip,
              button,
              checked1
            ]) => (
              <div>
                <ListHeader
                  primary="Interactions List Inputs"
                  secondary="Description of the interactions list inputs"
                  {...(button && {
                    checked: checked1,
                    onChange: (event, next: boolean) => form.setFieldValue('components.list.values.checked1', !next)
                  })}
                  {...(badge && { badge })}
                  {...(capitalize && { capitalize })}
                  {...(disabled && { disabled })}
                  {...(endAdornment && { endAdornment: 'end' })}
                  {...(helperText && { helperText: 'Helper Text' })}
                  {...(inset && { inset })}
                  {...(loading && { loading })}
                  {...(monospace && { monospace })}
                  {...(overflowHidden && { overflowHidden })}
                  {...(password && { password })}
                  {...(placeholder && { placeholder: 'Placeholder' })}
                  {...(preventRender && { preventRender })}
                  {...(readOnly && { readOnly })}
                  {...(startAdornment && { startAdornment: 'start' })}
                  {...(tiny && { tiny })}
                  {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                  {...(longname && {
                    primary:
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.',
                    secondary:
                      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                  })}
                  {...(noSecondary && { secondary: null })}
                  {...(reset && {
                    reset,
                    defaultValue: null,
                    onReset: () => form.setFieldValue('components.list_inputs.values.boolean', false)
                  })}
                />
              </div>
            )}
          />
        }
        right={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <form.Subscribe
              selector={state => state.values.components.list.state.button}
              children={value => (
                <CheckboxInput
                  label="Button"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list.state.button', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.capitalize}
              children={value => (
                <CheckboxInput
                  label="Capitalize"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.capitalize', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.disabled}
              children={value => (
                <CheckboxInput
                  label="Disabled"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.disabled', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.endAdornment}
              children={value => (
                <CheckboxInput
                  label="End Adornment"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.endAdornment', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.helperText}
              children={value => (
                <CheckboxInput
                  label="Helper Text"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.helperText', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.inset}
              children={value => (
                <CheckboxInput
                  label="Inset"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.inset', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.loading}
              children={value => (
                <CheckboxInput
                  label="Loading"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.loading', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.longname}
              children={value => (
                <CheckboxInput
                  label="Long Names"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.longname', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.monospace}
              children={value => (
                <CheckboxInput
                  label="Monospace"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.monospace', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.noSecondary}
              children={value => (
                <CheckboxInput
                  label="No Secondary"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.noSecondary', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.overflowHidden}
              children={value => (
                <CheckboxInput
                  label="Overflow Hidden"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.overflowHidden', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.password}
              children={value => (
                <CheckboxInput
                  label="Password"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.password', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.placeholder}
              children={value => (
                <CheckboxInput
                  label="Placeholder"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.placeholder', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.preventRender}
              children={value => (
                <CheckboxInput
                  label="Prevent Render"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.preventRender', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.readOnly}
              children={value => (
                <CheckboxInput
                  label="ReadOnly"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.readOnly', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.reset}
              children={value => (
                <CheckboxInput
                  label="Reset"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.reset', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.startAdornment}
              children={value => (
                <CheckboxInput
                  label="Start Adornment"
                  value={value}
                  onChange={(event, next: boolean) =>
                    form.setFieldValue('components.list_inputs.state.startAdornment', next)
                  }
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.tiny}
              children={value => (
                <CheckboxInput
                  label="Tiny"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.tiny', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.tooltip}
              children={value => (
                <CheckboxInput
                  label="Tooltip"
                  value={value}
                  onChange={(event, next: boolean) => form.setFieldValue('components.list_inputs.state.tooltip', next)}
                />
              )}
            />
          </div>
        }
      />
      <DemoSection
        primary="Basics"
        secondary={null}
        left={
          <div>
            <ListHeader
              primary="Subheader List"
              secondary="Subheader List description"
              divider
              slotProps={{ primary: { color: 'primary' } }}
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
                  divider
                  checked={checked}
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked1', !c)}
                  slotProps={{ primary: { color: 'primary' } }}
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
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked2', !c)}
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
                  divider
                  checked={checked}
                  slotProps={{ primary: { color: 'primary' } }}
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
                  divider
                  disabled
                  checked={checked}
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked1', !c)}
                  slotProps={{ primary: { color: 'primary' } }}
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
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked2', !c)}
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
                  divider
                  checked={checked}
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked1', !c)}
                  slotProps={{ primary: { color: 'primary' } }}
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
                  onChange={(event, c) => form.setFieldValue('components.list.values.checked2', !c)}
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
