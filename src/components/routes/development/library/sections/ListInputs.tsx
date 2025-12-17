import { Grid, Typography, useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { SELECT_OPTIONS, TEXTFIELD_OPTIONS } from 'components/routes/development/library/sections/Inputs';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { List } from 'components/visual/List/List';
import { ListHeader } from 'components/visual/List/ListHeader';
import { BooleanListInput } from 'components/visual/ListInputs/BooleanListInput';
import { ClassificationListInput } from 'components/visual/ListInputs/ClassificationListInput';
import { NumberListInput } from 'components/visual/ListInputs/NumberListInput';
import { SelectListInput } from 'components/visual/ListInputs/SelectListInput';
import { TextListInput } from 'components/visual/ListInputs/TextListInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export type ListInputsLibraryState = {
  list_inputs: {
    name: string;
    state: {
      badge: boolean;
      capitalize: boolean;
      disabled: boolean;
      endAdornment: boolean;
      error: boolean;
      helperText: boolean;
      inset: boolean;
      loading: boolean;
      longNames: boolean;
      monospace: boolean;
      noSecondary: boolean;
      overflowHidden: boolean;
      password: boolean;
      placeholder: boolean;
      preventRender: boolean;
      readOnly: boolean;
      required: boolean;
      reset: boolean;
      startAdornment: boolean;
      tiny: boolean;
      tooltip: boolean;
    };
    values: {
      boolean: boolean;
      checkbox: boolean;
      classification: string;
      date: string;
      number: number;
      select: (typeof SELECT_OPTIONS)[number]['value'];
      slider: number;
      switch: boolean;
      text: string;
    };
  };
};
export const LIST_INPUTS_LIBRARY_STATE: ListInputsLibraryState = {
  list_inputs: {
    name: 'List Inputs',
    state: {
      badge: false,
      capitalize: false,
      disabled: false,
      endAdornment: false,
      error: false,
      helperText: false,
      inset: false,
      loading: false,
      longNames: false,
      monospace: false,
      noSecondary: false,
      overflowHidden: false,
      password: false,
      placeholder: false,
      preventRender: false,
      readOnly: false,
      required: false,
      reset: false,
      startAdornment: false,
      tiny: false,
      tooltip: false
    },
    values: {
      boolean: false,
      checkbox: false,
      classification: 'TLP:C',
      date: '',
      number: 0,
      select: 'option 1',
      slider: 0,
      switch: false,
      text: ''
    }
  }
} as const;

export const ListInputsSection = React.memo(() => {
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
                state.values.components.list_inputs.state.error,
                state.values.components.list_inputs.state.helperText,
                state.values.components.list_inputs.state.inset,
                state.values.components.list_inputs.state.loading,
                state.values.components.list_inputs.state.longNames,
                state.values.components.list_inputs.state.monospace,
                state.values.components.list_inputs.state.noSecondary,
                state.values.components.list_inputs.state.overflowHidden,
                state.values.components.list_inputs.state.password,
                state.values.components.list_inputs.state.placeholder,
                state.values.components.list_inputs.state.preventRender,
                state.values.components.list_inputs.state.readOnly,
                state.values.components.list_inputs.state.required,
                state.values.components.list_inputs.state.reset,
                state.values.components.list_inputs.state.startAdornment,
                state.values.components.list_inputs.state.tiny,
                state.values.components.list_inputs.state.tooltip
              ] as const
            }
            children={([
              badge,
              capitalize,
              disabled,
              endAdornment,
              error,
              helperText,
              inset,
              loading,
              longNames,
              monospace,
              noSecondary,
              overflowHidden,
              password,
              placeholder,
              preventRender,
              readOnly,
              required,
              reset,
              startAdornment,
              tiny,
              tooltip
            ]) => (
              <div>
                <ListHeader
                  primary="Interactions List Inputs"
                  secondary="Description of the interactions list inputs"
                />
                <List>
                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.text}
                    children={value => (
                      <TextListInput
                        primary="interactions Text List Input"
                        secondary="interactions Text List Input Description"
                        value={value}
                        options={TEXTFIELD_OPTIONS}
                        onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                        {...(badge && { badge })}
                        {...(capitalize && { capitalize })}
                        {...(disabled && { disabled })}
                        {...(endAdornment && { endAdornment: 'end' })}
                        {...(error && { error: v => (v !== '' ? null : 'Input field cannot be empty') })}
                        {...(helperText && { helperText: 'Helper Text' })}
                        {...(inset && { inset })}
                        {...(loading && { loading })}
                        {...(monospace && { monospace })}
                        {...(overflowHidden && { overflowHidden })}
                        {...(password && { password })}
                        {...(placeholder && { placeholder: 'Placeholder' })}
                        {...(preventRender && { preventRender })}
                        {...(readOnly && { readOnly })}
                        {...(required && { required })}
                        {...(startAdornment && { startAdornment: 'start' })}
                        {...(tiny && { tiny })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(longNames && {
                          primary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.',
                          secondary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                        })}
                        {...(noSecondary && { secondary: null })}
                        {...(reset && {
                          reset,
                          defaultValue: '',
                          onReset: () => form.setFieldValue('components.list_inputs.values.text', '')
                        })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.number}
                    children={value => (
                      <NumberListInput
                        primary="interactions Number List Input"
                        secondary="interactions Number List Input Description"
                        value={value}
                        onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                        {...(badge && { badge })}
                        {...(capitalize && { capitalize })}
                        {...(disabled && { disabled })}
                        {...(endAdornment && { endAdornment: 'end' })}
                        {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                        {...(helperText && { helperText: 'Helper Text' })}
                        {...(inset && { inset })}
                        {...(loading && { loading })}
                        {...(monospace && { monospace })}
                        {...(overflowHidden && { overflowHidden })}
                        {...(password && { password })}
                        {...(placeholder && { placeholder: 'Placeholder' })}
                        {...(preventRender && { preventRender })}
                        {...(readOnly && { readOnly })}
                        {...(required && { required })}
                        {...(startAdornment && { startAdornment: 'start' })}
                        {...(tiny && { tiny })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(longNames && {
                          primary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.',
                          secondary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                        })}
                        {...(noSecondary && { secondary: null })}
                        {...(reset && {
                          reset,
                          defaultValue: 0,
                          onReset: () => form.setFieldValue('components.list_inputs.values.number', 0)
                        })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.select}
                    children={value => (
                      <SelectListInput
                        primary="interactions Select List Input"
                        secondary="interactions Select List Input Description"
                        value={value}
                        options={SELECT_OPTIONS}
                        onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                          form.setFieldValue('components.list_inputs.values.select', next)
                        }
                        {...(badge && { badge })}
                        {...(capitalize && { capitalize })}
                        {...(disabled && { disabled })}
                        {...(endAdornment && { endAdornment: 'end' })}
                        {...(error && { error: v => (v !== 'option 1' ? null : 'Input field cannot be option 1') })}
                        {...(helperText && { helperText: 'Helper Text' })}
                        {...(inset && { inset })}
                        {...(loading && { loading })}
                        {...(monospace && { monospace })}
                        {...(overflowHidden && { overflowHidden })}
                        {...(password && { password })}
                        {...(placeholder && { placeholder: 'Placeholder' })}
                        {...(preventRender && { preventRender })}
                        {...(readOnly && { readOnly })}
                        {...(required && { required })}
                        {...(startAdornment && { startAdornment: 'start' })}
                        {...(tiny && { tiny })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(longNames && {
                          primary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.',
                          secondary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                        })}
                        {...(noSecondary && { secondary: null })}
                        {...(reset && {
                          reset,
                          defaultValue: null,
                          onReset: () => form.setFieldValue('components.list_inputs.values.select', null)
                        })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.classification}
                    children={value => (
                      <ClassificationListInput
                        primary="interactions Classification List Input"
                        secondary="interactions Classification List Input Description"
                        value={value}
                        onChange={(event, next) =>
                          form.setFieldValue('components.list_inputs.values.classification', next)
                        }
                        {...(badge && { badge })}
                        {...(capitalize && { capitalize })}
                        {...(disabled && { disabled })}
                        {...(endAdornment && { endAdornment: 'end' })}
                        {...(error && { error: v => (v !== 'TLP:C' ? null : 'Input field cannot be TLP:C') })}
                        {...(helperText && { helperText: 'Helper Text' })}
                        {...(inset && { inset })}
                        {...(loading && { loading })}
                        {...(monospace && { monospace })}
                        {...(overflowHidden && { overflowHidden })}
                        {...(password && { password })}
                        {...(placeholder && { placeholder: 'Placeholder' })}
                        {...(preventRender && { preventRender })}
                        {...(readOnly && { readOnly })}
                        {...(required && { required })}
                        {...(startAdornment && { startAdornment: 'start' })}
                        {...(tiny && { tiny })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(longNames && {
                          primary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.',
                          secondary:
                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                        })}
                        {...(noSecondary && { secondary: null })}
                        {...(reset && {
                          reset,
                          defaultValue: null,
                          onReset: () => form.setFieldValue('components.list_inputs.values.classification', 'TLP:C')
                        })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.boolean}
                    children={value => (
                      <BooleanListInput
                        primary="interactions Boolean List Input"
                        secondary="interactions Boolean List Input Description"
                        value={value}
                        onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                        {...(badge && { badge })}
                        {...(capitalize && { capitalize })}
                        {...(disabled && { disabled })}
                        {...(endAdornment && { endAdornment: 'end' })}
                        {...(error && { error: v => (v !== false ? null : 'Input field cannot be false') })}
                        {...(helperText && { helperText: 'Helper Text' })}
                        {...(inset && { inset })}
                        {...(loading && { loading })}
                        {...(monospace && { monospace })}
                        {...(overflowHidden && { overflowHidden })}
                        {...(password && { password })}
                        {...(placeholder && { placeholder: 'Placeholder' })}
                        {...(preventRender && { preventRender })}
                        {...(readOnly && { readOnly })}
                        {...(required && { required })}
                        {...(startAdornment && { startAdornment: 'start' })}
                        {...(tiny && { tiny })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(longNames && {
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
                    )}
                  />
                </List>
              </div>
            )}
          />
        }
        right={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.capitalize}
              children={value => (
                <CheckboxInput
                  label="Capitalize"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.capitalize', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.disabled}
              children={value => (
                <CheckboxInput
                  label="Disabled"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.disabled', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.endAdornment}
              children={value => (
                <CheckboxInput
                  label="End Adornment"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.endAdornment', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.error}
              children={value => (
                <CheckboxInput
                  label="Error"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.error', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.helperText}
              children={value => (
                <CheckboxInput
                  label="Helper Text"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.helperText', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.inset}
              children={value => (
                <CheckboxInput
                  label="Inset"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.inset', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.loading}
              children={value => (
                <CheckboxInput
                  label="Loading"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.loading', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.longNames}
              children={value => (
                <CheckboxInput
                  label="Long Names"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.longNames', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.monospace}
              children={value => (
                <CheckboxInput
                  label="Monospace"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.monospace', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.noSecondary}
              children={value => (
                <CheckboxInput
                  label="No Secondary"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.noSecondary', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.overflowHidden}
              children={value => (
                <CheckboxInput
                  label="Overflow Hidden"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.overflowHidden', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.password}
              children={value => (
                <CheckboxInput
                  label="Password"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.password', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.placeholder}
              children={value => (
                <CheckboxInput
                  label="Placeholder"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.placeholder', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.preventRender}
              children={value => (
                <CheckboxInput
                  label="Prevent Render"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.preventRender', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.readOnly}
              children={value => (
                <CheckboxInput
                  label="ReadOnly"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.readOnly', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.reset}
              children={value => (
                <CheckboxInput
                  label="Reset"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.reset', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.required}
              children={value => (
                <CheckboxInput
                  label="Required"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.required', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.startAdornment}
              children={value => (
                <CheckboxInput
                  label="Start Adornment"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.startAdornment', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.tiny}
              children={value => (
                <CheckboxInput
                  label="Tiny"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.tiny', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.tooltip}
              children={value => (
                <CheckboxInput
                  label="Tooltip"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.state.tooltip', next)}
                />
              )}
            />
          </div>
        }
      />

      <DemoSection
        primary="Basic List Inputs"
        secondary={
          <>
            <span>{'The following components are all of the inputs used in Assemblyline. '}</span>
            <span>{"Compared to their MUI counterpart, their label doesn't fold into the input."}</span>
          </>
        }
        left={
          <div>
            <ListHeader primary="List Inputs" secondary="Description of the list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Text List Input"
                    secondary="Text List Input Description"
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Number List Input"
                    secondary="Number List Input Description"
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Select List Input"
                    secondary="Select List Input Description"
                    value={value}
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Classification List Input"
                    secondary="Classification List Input Description"
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Boolean List Input"
                    secondary="Boolean List Input Description"
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="List Inputs"
    secondary="Description of the list inputs"
  />
  <List>
    <TextListInput
      primary="Text List Input"
      secondary="Text List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />

    <NumberListInput
      primary="Number List Input"
      secondary="Number List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />

    <SelectListInput
      primary="Select List Input"
      secondary="Select List Input Description"
      value={value}
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
    />

    <ClassificationListInput
      primary="Classification List Input"
      secondary="Classification List Input Description"
      value={value}
      onChange={next => {}}
    />

    <BooleanListInput
      primary="Boolean List Input"
      secondary="Boolean List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />
  </List>
</>`}
          />
        }
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: theme.spacing(3)
        }}
      >
        <div>
          <Typography variant="h6">Controlled</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'List Input components are controlled by default. '}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.text}
              children={value => (
                <TextListInput
                  primary="Controlled Text List Input"
                  secondary="Controlled Text List Input Description"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="center">
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.text}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.number}
              children={value => (
                <NumberListInput
                  primary="Controlled Number List Input"
                  secondary="Controlled Number List Input Description"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="center">
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.number}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.select}
              children={value => (
                <SelectListInput
                  primary="Controlled Select List Input"
                  secondary="Controlled Select List Input Description"
                  value={value}
                  options={SELECT_OPTIONS}
                  onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                    form.setFieldValue('components.list_inputs.values.select', next)
                  }
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="center">
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.select}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.classification}
              children={value => (
                <ClassificationListInput
                  primary="Controlled Classification List Input"
                  secondary="Controlled Classification List Input Description"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="center">
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.classification}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.boolean}
              children={value => (
                <BooleanListInput
                  primary="Controlled Boolean List Input"
                  secondary="Controlled Boolean List Input Description"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="center">
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.boolean}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>
        </Grid>
      </div>

      <DemoSection
        primary="Disabled"
        secondary={
          <>
            <span>{'The disabled prop stops the user from making changes. '}</span>
            <span>Note: the label should also be the disabled color.</span>
          </>
        }
        left={
          <div>
            <ListHeader primary="Disabled List Inputs" secondary="Description of the disabled list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Disabled Text List Input"
                    secondary="Disabled Text List Input Description"
                    value={value}
                    disabled
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Disabled Number List Input"
                    secondary="Disabled Number List Input Description"
                    value={value}
                    disabled
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Disabled Select List Input"
                    secondary="Disabled Select List Input Description"
                    value={value}
                    disabled
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Disabled Classification List Input"
                    secondary="Disabled Classification List Input Description"
                    value={value}
                    disabled
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Disabled Boolean List Input"
                    secondary="Disabled Boolean List Input Description"
                    value={value}
                    disabled
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="Disabled List Inputs"
    secondary="Description of the disabled list inputs"
  />
  <List>
    <TextListInput
      primary="Disabled Text List Input"
      secondary="Disabled Text List Input Description"
      value={value}
      disabled
      onChange={(event, next) => {}}
    />

    <NumberListInput
      primary="Disabled Number List Input"
      secondary="Disabled Number List Input Description"
      value={value}
      disabled
      onChange={(event, next) => {}}
    />

    <SelectListInput
      primary="Disabled Select List Input"
      secondary="Disabled Select List Input Description"
      value={value}
      disabled
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
    />

    <ClassificationListInput
      primary="Disabled Classification List Input"
      secondary="Disabled Classification List Input Description"
      value={value}
      disabled
      onChange={next => {}}
    />

    <BooleanListInput
      primary="Disabled Boolean List Input"
      secondary="Disabled Boolean List Input Description"
      value={value}
      disabled
      onChange={(event, next) => {}}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Loading"
        secondary={
          <>
            <span>
              {'All inputs have a loading state that can be set using the loading prop and prevents value change. '}
            </span>
          </>
        }
        left={
          <div>
            <ListHeader primary="Loading List Inputs" secondary="Description of the loading list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Loading Text List Input"
                    secondary="Loading Text List Input Description"
                    value={value}
                    loading
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Loading Number List Input"
                    secondary="Loading Number List Input Description"
                    value={value}
                    loading
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Loading Select List Input"
                    secondary="Loading Select List Input Description"
                    value={value}
                    loading
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Loading Classification List Input"
                    secondary="Loading Classification List Input Description"
                    value={value}
                    loading
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Loading Boolean List Input"
                    secondary="Loading Boolean List Input Description"
                    value={value}
                    loading
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="Loading List Inputs"
    secondary="Description of the loading list inputs"
  />
  <List>
    <TextListInput
      primary="Loading Text List Input"
      secondary="Loading Text List Input Description"
      value={value}
      loading
      onChange={(event, next) => {}}
    />

    <NumberListInput
      primary="Loading Number List Input"
      secondary="Loading Number List Input Description"
      value={value}
      loading
      onChange={(event, next) => {}}
    />

    <SelectListInput
      primary="Loading Select List Input"
      secondary="Loading Select List Input Description"
      value={value}
      loading
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
    />

    <ClassificationListInput
      primary="Loading Classification List Input"
      secondary="Loading Classification List Input Description"
      value={value}
      loading
      onChange={next => {}}
    />

    <BooleanListInput
      primary="Loading Boolean List Input"
      secondary="Loading Boolean List Input Description"
      value={value}
      loading
      onChange={(event, next) => {}}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Reset"
        secondary={
          <>
            <span>
              {'All inputs implements a reset button which the button can be made visible via the reset prop. '}
            </span>
            <span>Handle the reset change can be made using the onReset event handle.</span>
          </>
        }
        left={
          <div>
            <ListHeader primary="Reset List Inputs" secondary="Description of the reset list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Reset Text List Input"
                    secondary="Reset Text List Input Description"
                    value={value}
                    reset
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                    onReset={() => form.setFieldValue('components.list_inputs.values.text', '')}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Reset Number List Input"
                    secondary="Reset Number List Input Description"
                    value={value}
                    reset
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                    onReset={() => form.setFieldValue('components.list_inputs.values.number', 0)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Reset Select List Input"
                    secondary="Reset Select List Input Description"
                    value={value}
                    reset
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                    onReset={() => form.setFieldValue('components.list_inputs.values.select', 'option 1')}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Reset Classification List Input"
                    secondary="Reset Classification List Input Description"
                    value={value}
                    reset
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                    onReset={() => form.setFieldValue('components.list_inputs.values.classification', 'TLP:C')}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Reset Boolean List Input"
                    secondary="Reset Boolean List Input Description"
                    value={value}
                    reset
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                    onReset={() => form.setFieldValue('components.list_inputs.values.boolean', false)}
                  />
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
    primary="Reset List Inputs"
    secondary="Description of the reset list inputs"
  />
  <List>
    <TextListInput
      primary="Reset Text List Input"
      secondary="Reset Text List Input Description"
      value={value}
      reset
      onChange={(event, next) => {}}
      onReset={() => {}}
    />

    <NumberListInput
      primary="Reset Number List Input"
      secondary="Reset Number List Input Description"
      value={value}
      reset
      onChange={(event, next) => {}}
      onReset={() => {}}
    />

    <SelectListInput
      primary="Reset Select List Input"
      secondary="Reset Select List Input Description"
      value={value}
      reset
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
      onReset={() => {}}
    />

    <ClassificationListInput
      primary="Reset Classification List Input"
      secondary="Reset Classification List Input Description"
      value={value}
      reset
      onChange={next => {}}
      onReset={() => {}}
    />

    <BooleanListInput
      primary="Reset Boolean List Input"
      secondary="Reset Boolean List Input Description"
      value={value}
      reset
      onChange={(event, next) => {}}
      onReset={() => {}}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Error"
        secondary={
          <>
            <span>
              {'Error prop takes a function that evaluates the value. If that function returns an error message, '}
            </span>
            <span>{"it will trigger the input' error state and show that message in the helper text. "}</span>
            <span>{"There's also the onError event handler that triggers when an error is detected."}</span>
          </>
        }
        left={
          <div>
            <ListHeader primary="Error List Inputs" secondary="Description of the error list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Error Text List Input"
                    secondary="Error Text List Input Description"
                    value={value}
                    error={v => (v !== '' ? null : 'Input field cannot be empty')}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Error Number List Input"
                    secondary="Error Number List Input Description"
                    value={value}
                    error={v => (v !== 0 ? null : 'Input field cannot be 0')}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Error Select List Input"
                    secondary="Error Select List Input Description"
                    value={value}
                    error={v => (v !== 'option 1' ? null : 'Input field cannot be null')}
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Error Classification List Input"
                    secondary="Error Classification List Input Description"
                    value={value}
                    error={v => (v !== 'TLP:C' ? null : 'Input field cannot be TLP:C')}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Error Boolean List Input"
                    secondary="Error Boolean List Input Description"
                    value={value}
                    error={v => (v !== false ? null : 'Input field cannot be false')}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="Error List Inputs"
    secondary="Description of the error list inputs"
  />
  <List>
    <TextListInput
      primary="Error Text List Input"
      secondary="Error Text List Input Description"
      value={value}
      error={v => (v !== '' ? null : 'Input field cannot be empty')}
      onChange={(event, next) => {}}
      onError={() => {}}
    />

    <NumberListInput
      primary="Error Number List Input"
      secondary="Error Number List Input Description"
      value={value}
      error={v => (v !== 0 ? null : 'Input field cannot be 0')}
      onChange={(event, next) => {}}
      onError={() => {}}
    />

    <SelectListInput
      primary="Error Select List Input"
      secondary="Error Select List Input Description"
      value={value}
      error={v => (v !== '' ? null : 'Input field cannot be null')}
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
      onError={() => {}}
    />

    <ClassificationListInput
      primary="Error Classification List Input"
      secondary="Error Classification List Input Description"
      value={value}
      error={v => (v !== 'TLP:C' ? null : 'Input field cannot be TLP:C')}
      onChange={next => {}}
      onError={() => {}}
    />

    <BooleanListInput
      primary="Error Boolean List Input"
      secondary="Error Boolean List Input Description"
      value={value}
      error={v => (v !== false ? null : 'Input field cannot be false')}
      onChange={(event, next) => {}}
      onError={() => {}}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Read Only"
        secondary={
          <>
            <span>
              {'All inputs have a loading state that can be set using the loading prop and prevents value change. '}
            </span>
          </>
        }
        left={
          <div>
            <ListHeader primary="Read Only List Inputs" secondary="Description of the loading list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Read Only Text List Input"
                    secondary="Read Only Text List Input Description"
                    value={value}
                    readOnly
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Read Only Number List Input"
                    secondary="Read Only Number List Input Description"
                    value={value}
                    readOnly
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Read Only Select List Input"
                    secondary="Read Only Select List Input Description"
                    value={value}
                    readOnly
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Read Only Classification List Input"
                    secondary="Read Only Classification List Input Description"
                    value={value}
                    readOnly
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Read Only Boolean List Input"
                    secondary="Read Only Boolean List Input Description"
                    value={value}
                    readOnly
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="Read Only List Inputs"
    secondary="Description of the read only list inputs"
  />
  <List>
    <TextListInput
      primary="Read Only Text List Input"
      secondary="Read Only Text List Input Description"
      value={value}
      readOnly
      onChange={(event, next) => {}}
    />

    <NumberListInput
      primary="Read Only Number List Input"
      secondary="Read Only Number List Input Description"
      value={value}
      readOnly
      onChange={(event, next) => {}}
    />

    <SelectListInput
      primary="Read Only Select List Input"
      secondary="Read Only Select List Input Description"
      value={value}
      readOnly
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
    />

    <ClassificationListInput
      primary="Read Only Classification List Input"
      secondary="Read Only Classification List Input Description"
      value={value}
      readOnly
      onChange={next => {}}
    />

    <BooleanListInput
      primary="Read Only Boolean List Input"
      secondary="Read Only Boolean List Input Description"
      value={value}
      readOnly
      onChange={(event, next) => {}}
    />
  </List>
</>`}
          />
        }
      />

      <DemoSection
        primary="Edge Case: Long label names"
        secondary={
          <>
            <span>{"The labels should handle the case where there's a really long label name "}</span>
            <span>{"or there isn't enough space for the full title."}</span>
          </>
        }
        left={
          <div>
            <ListHeader primary="List Inputs" secondary="Description of the list inputs" />
            <List>
              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.text}
                children={value => (
                  <TextListInput
                    primary="Text List Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    secondary="Text List Input Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.text', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.number}
                children={value => (
                  <NumberListInput
                    primary="Number List Inpu: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.t"
                    secondary="Number List Input Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.number', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.select}
                children={value => (
                  <SelectListInput
                    primary="Select List Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    secondary="Select List Input Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    options={SELECT_OPTIONS}
                    onChange={(event, next: (typeof SELECT_OPTIONS)[number]['value']) =>
                      form.setFieldValue('components.list_inputs.values.select', next)
                    }
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.classification}
                children={value => (
                  <ClassificationListInput
                    primary="Classification List Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    secondary="Classification List Input Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.classification', next)}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.list_inputs.values.boolean}
                children={value => (
                  <BooleanListInput
                    primary="Boolean List Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    secondary="Boolean List Input Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => form.setFieldValue('components.list_inputs.values.boolean', next)}
                  />
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
    primary="List Inputs"
    secondary="Description of the list inputs"
  />
  <List>
    <TextListInput
      primary="Text List Input"
      secondary="Text List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />

    <NumberListInput
      primary="Number List Input"
      secondary="Number List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />

    <SelectListInput
      primary="Select List Input"
      secondary="Select List Input Description"
      value={value}
      options={[
        { primary: 'Options 1', value: 'option 1' },
        { primary: 'Options 2', value: 'option 2' },
        { primary: 'Options 3', value: 'option 3' }
      ]}
      onChange={(event, next) => {}}
    />

    <ClassificationListInput
      primary="Classification List Input"
      secondary="Classification List Input Description"
      value={value}
      onChange={next => {}}
    />

    <BooleanListInput
      primary="Boolean List Input"
      secondary="Boolean List Input Description"
      value={value}
      onChange={(event, next) => {}}
    />
  </List>
</>`}
          />
        }
      />
    </DemoContainer>
  );
});
