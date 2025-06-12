import { Button, Grid, Typography, useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
import { ClassificationInput } from 'components/visual/Inputs/ClassificationInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { PageSection } from 'components/visual/Layouts/PageSection';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export type InputsLibraryState = {
  inputs: {
    name: string;
    state: {
      disabled: boolean;
      loading: boolean;
      reset: boolean;
      tooltip: boolean;
      error: boolean;
      readOnly: boolean;
      helperText: boolean;
      placeholder: boolean;
      endAdornment: boolean;
      tiny: boolean;
    };
    values: {
      text: string;
      chips: string[];
      number: number;
      date: string;
      classification: string;
      select: string;
      checkbox: boolean;
      switch: boolean;
      slider: number;
    };
  };
};

export const INPUTS_LIBRARY_STATE: InputsLibraryState = {
  inputs: {
    name: 'Inputs',
    state: {
      disabled: false,
      loading: false,
      reset: false,
      tooltip: false,
      error: false,
      readOnly: false,
      helperText: false,
      placeholder: false,
      endAdornment: false,
      tiny: false
    },
    values: {
      text: '',
      chips: [],
      number: null,
      date: '',
      select: '',
      classification: 'TLP:CLEAR',
      checkbox: false,
      switch: false,
      slider: 0
    }
  }
} as const;

export const InputsSection = React.memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <DemoContainer>
      <DemoSection
        id="Basic Example"
        primary="Basic Example"
        secondary={
          <>
            <span>{'The following components are all of the inputs used in Assemblyline. '}</span>
            <span>{"Compared to their MUI counterpart, their label doesn't fold into the input."}</span>
          </>
        }
        left={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Text Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Chips Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Number Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Select Input"
                  value={value}
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Date Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Classification Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Slider Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Checkbox Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Switch Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </div>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Text Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Text Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Number Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Date Input"
  value={value}
  onChange={next => {}}
  />

  <SliderInput
  label="Slider Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Checkbox Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Switch Input"
  value={value}
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <PageSection
        primary="Controlled"
        secondary={<span>{'Input components are controlled by default. '}</span>}
        anchor
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Controlled Text Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.text', '')}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
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
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Controlled Chips Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.chips', [])}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
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
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Controlled Number Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.number', 0)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
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
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Controlled Select Input"
                  value={value}
                  reset
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.select', '')}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
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
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Controlled Date Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.date', null)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
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
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Controlled Classification Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.classification', null)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
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
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Controlled Slider Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.slider', 0)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
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
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Controlled Checkbox Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.checkbox', false)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
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
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Controlled Switch Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.switch', false)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${value}`}</Typography>
                </div>
              )}
            />
          </Grid>
        </Grid>
      </PageSection>

      <DemoSection
        primary="Disabled"
        secondary={
          <>
            <span>{'The disabled prop stops the user from making changes. '}</span>
            <span>Note: the label should also be the disabled color.</span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Disabled Text Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Disabled Chips Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Disabled Number Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Disabled Select Input"
                  value={value}
                  disabled
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Disabled Date Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Disabled Classification Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Disabled Slider Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Disabled Checkbox Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Disabled Switch Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Disabled Text Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Disabled Chips Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Disabled Number Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Disabled Select Input"
  value={value}
  disabled
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Disabled Date Input"
  value={value}
  disabled
  onChange={next => {}}
  />

  <SliderInput
  label="Disabled Slider Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Disabled Checkbox Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Disabled Switch Input"
  value={value}
  disabled
  onChange={(event, next) => {}}
  />
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
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Loading Text Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Loading Chips Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Loading Number Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Loading Select Input"
                  value={value}
                  loading
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Loading Date Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Loading Classification Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Loading Slider Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Loading Checkbox Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Loading Switch Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Loading Text Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Loading Chips Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Loading Number Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Loading Select Input"
  value={value}
  loading
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Loading Date Input"
  value={value}
  loading
  onChange={next => {}}
  />

  <SliderInput
  label="Loading Slider Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Loading Checkbox Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Loading Switch Input"
  value={value}
  loading
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Reset"
        secondary={
          <>
            <span>{'All inputs implements a reset button which the button can be made visible '}</span>
            <span>via the reset prop. Handle the reset change can be made using the onReset event handle.</span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Reset Text Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.text', '')}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Reset Chips Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.chips', [])}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Reset Number Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.number', 0)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Reset Select Input"
                  value={value}
                  reset
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.select', 'option 1')}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Reset Date Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.date', null)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Reset Classification Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.classification', 'TLP:CLEAR')}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Reset Slider Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.slider', 0)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Reset Checkbox Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.checkbox', false)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Reset Switch Input"
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.switch', false)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
    label="Reset Text Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />

  <ChipsInput
    label="Reset Chips Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />

  <NumberInput
    label="Reset Number Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />

  <SelectInput
    label="Reset Select Input"
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

  <DateInput
    label="Reset Date Input"
    value={value}
    reset
    onChange={next => {}}
    onReset={() => {}}
  />

  <SliderInput
    label="Reset Slider Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />

  <CheckboxInput
    label="Reset Checkbox Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />

  <SwitchInput
    label="Reset Switch Input"
    value={value}
    reset
    onChange={(event, next) => {}}
    onReset={() => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Tooltip"
        secondary={
          <>
            <span>Hovering the label should open a tooltip.</span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Tooltip Text Input"
                  tooltip="Tooltip Text Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Tooltip Chips Input"
                  tooltip="Tooltip Chips Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Tooltip Number Input"
                  tooltip="Tooltip Number Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Tooltip Select Input"
                  tooltip="Tooltip Select Input"
                  value={value}
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Tooltip Date Input"
                  tooltip="Tooltip Date Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Tooltip Classification Input"
                  tooltip="Tooltip Classification Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Tooltip Slider Input"
                  tooltip="Tooltip Slider Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Tooltip Checkbox Input"
                  tooltip="Tooltip Checkbox Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Tooltip Switch Input"
                  tooltip="Tooltip Switch Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Tooltip Text Input"
  tooltip="Tooltip Text Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <TextInput
  label="Tooltip Chips Input"
  tooltip="Tooltip Chips Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Tooltip Number Input"
  tooltip="Tooltip Number Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Tooltip Select Input"
  tooltip="Tooltip Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Tooltip Date Input"
  tooltip="Tooltip Date Input"
  value={value}
  onChange={next => {}}
  />

  <SliderInput
  label="Tooltip Slider Input"
  tooltip="Tooltip Slider Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Tooltip Checkbox Input"
  tooltip="Tooltip Checkbox Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Tooltip Switch Input"
  tooltip="Tooltip Switch Input"
  value={value}
  onChange={(event, next) => {}}
  />
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
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Error Text Input"
                  value={value}
                  error={v => (v !== '' ? null : 'Input field cannot be empty')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Error Chips Input"
                  value={value}
                  error={v => (v.length !== 0 ? null : 'Input field cannot be empty')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Error Number Input"
                  value={value}
                  error={v => (v !== null ? null : 'Input field cannot be null')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Error Select Input"
                  value={value}
                  error={v => (v !== '' ? null : 'Input field cannot be null')}
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Error Date Input"
                  value={value}
                  error={v => (v !== null ? null : 'Input field cannot be null')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Error Classification Input"
                  value={value}
                  error={v => (v !== 'TLP:CLEAR' ? null : 'Input field cannot be TLP:CLEAR')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Error Slider Input"
                  value={value}
                  error={v => (v !== 0 ? null : 'Input field cannot be 0')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Error Checkbox Input"
                  value={value}
                  error={v => (v !== false ? null : 'Input field cannot be false')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Error Switch Input"
                  value={value}
                  error={v => (v !== false ? null : 'Input field cannot be false')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Error Text Input"
  value={value}
  error={v => (v !== '' ? null : 'Input field cannot be empty')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <ChipsInput
  label="Error Chips Input"
  value={value}
  error={v => (v !== '' ? null : 'Input field cannot be empty')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <NumberInput
  label="Error Number Input"
  value={value}
  error={v => (v !== 0 ? null : 'Input field cannot be 0')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <SelectInput
  label="Error Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  error={v => (v !== '' ? null : 'Input field cannot be null')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <DateInput
  label="Error Date Input"
  value={value}
  error={v => (v !== null ? null : 'Input field cannot be null')}
  onChange={next => {}}
  onError={error => {}}
  />

  <SliderInput
  label="Error Slider Input"
  value={value}
  error={v => (v !== 0 ? null : 'Input field cannot be 0')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <CheckboxInput
  label="Error Checkbox Input"
  value={value}
  error={v => (v !== false ? null : 'Input field cannot be false')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />

  <SwitchInput
  label="Error Switch Input"
  value={value}
  error={v => (v !== false ? null : 'Input field cannot be false')}
  onChange={(event, next) => {}}
  onError={error => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Helper Text"
        secondary={
          <>
            <span>
              {"A Helper Text is visible below the inputs only if it is not disabled or doesn't have an error. "}
            </span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Helper Text Text Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Helper Text Chips Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Helper Text Number Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Helper Text Select Input"
                  value={value}
                  helperText="Helper Text"
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Helper Text Date Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Helper Text Classification Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Helper Text Slider Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Helper Text Checkbox Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Helper Text Switch Input"
                  value={value}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Helper Text Text Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Helper Text Chips Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Helper Text Number Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Helper Text Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Helper Text Date Input"
  value={value}
  helperText='Helper Text'
  onChange={next => {}}
  />

  <SliderInput
  label="Helper Text Slider Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Helper Text Checkbox Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Helper Text Switch Input"
  value={value}
  helperText='Helper Text'
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Placeholder"
        secondary={
          <>
            <span></span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Placeholder Text Input"
                  value={value}
                  placeholder="Placeholder"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Placeholder Chips Input"
                  value={value}
                  placeholder="Placeholder"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Placeholder Number Input"
                  value={value}
                  placeholder="Placeholder"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Placeholder Select Input"
                  value={value}
                  placeholder="Placeholder"
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Placeholder Date Input"
                  value={value}
                  placeholder="Placeholder"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Placeholder Text Input"
  value={value}
  placeholder="Placeholder"
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Placeholder Chips Input"
  value={value}
  placeholder="Placeholder"
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Placeholder Number Input"
  value={value}
  placeholder="Placeholder"
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Placeholder Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  placeholder="Placeholder"
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Placeholder Date Input"
  value={value}
  placeholder="Placeholder"
  onChange={next => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Read Only"
        secondary={
          <>
            <span>
              {
                'The readOnly prop prevents the user from making changes, but still shows the input in its default state. '
              }
            </span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="ReadOnly Text Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="ReadOnly Chips Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="ReadOnly Number Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="ReadOnly Select Input"
                  value={value}
                  readOnly
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="ReadOnly Date Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="ReadOnly Classification Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="ReadOnly Slider Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="ReadOnly Checkbox Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="ReadOnly Switch Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="ReadOnly Text Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="ReadOnly Chips Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="ReadOnly Number Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="ReadOnly Select Input"
  value={value}
  readOnly
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="ReadOnly Date Input"
  value={value}
  readOnly
  onChange={next => {}}
  />

  <SliderInput
  label="ReadOnly Slider Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="ReadOnly Checkbox Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="ReadOnly Switch Input"
  value={value}
  readOnly
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="End Adornment"
        secondary={
          <>
            <span></span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="End Adornment Text Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="End Adornment Chips Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="End Adornment Number Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="End Adornment Select Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="End Adornment Date Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="End Adornment Classification Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="End Adornment Slider Input"
                  value={value}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="End Adornment Checkbox Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="End Adornment Switch Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="End Adornment Text Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="End Adornment Chips Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="End Adornment Number Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="End Adornment Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="End Adornment Date Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={next => {}}
  />

  <SliderInput
  label="End Adornment Slider Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="End Adornment Checkbox Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="End Adornment Switch Input"
  value={value}
  endAdornment={<Button variant="contained">{'Submit'}</Button>}
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Tiny Size"
        secondary={
          <>
            <span></span>
          </>
        }
        left={
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Tiny Text Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Tiny Chips Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Tiny Number Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Tiny Select Input"
                  value={value}
                  tiny
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Tiny Date Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Tiny Classification Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Tiny Slider Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Tiny Checkbox Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Tiny Switch Input"
                  value={value}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="End Adornment Text Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="End Adornment Chips Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="End Adornment Number Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="End Adornment Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="End Adornment Date Input"
  value={value}
  onChange={next => {}}
  />

  <SliderInput
  label="End Adornment Slider Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="End Adornment Checkbox Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="End Adornment Switch Input"
  value={value}
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Interactions"
        secondary={
          <>
            <span>{'Use this to test the different interaction with the different props. '}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => [
              state.values.components.inputs.state.disabled,
              state.values.components.inputs.state.loading,
              state.values.components.inputs.state.reset,
              state.values.components.inputs.state.tooltip,
              state.values.components.inputs.state.error,
              state.values.components.inputs.state.readOnly,
              state.values.components.inputs.state.helperText,
              state.values.components.inputs.state.placeholder,
              state.values.components.inputs.state.endAdornment,
              state.values.components.inputs.state.tiny
            ]}
            children={([
              disabled,
              loading,
              reset,
              tooltip,
              error,
              readOnly,
              helperText,
              placeholder,
              endAdornment,
              tiny
            ]) => (
              <>
                <form.Subscribe
                  selector={state => state.values.components.inputs.values.text}
                  children={value => (
                    <TextInput
                      label="Interaction Text Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.text', '')
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.chips}
                  children={value => (
                    <ChipsInput
                      label="Interaction Chips Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.chips', [])
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v.length !== 0 ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.number}
                  children={value => (
                    <NumberInput
                      label="Interaction Number Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.number', 0)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.select}
                  children={value => (
                    <SelectInput
                      label="Interaction Select Input"
                      value={value}
                      options={[
                        { primary: 'Options 1', value: 'option 1' },
                        { primary: 'Options 2', value: 'option 2' },
                        { primary: 'Options 3', value: 'option 3' }
                      ]}
                      onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.select', '')
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.date}
                  children={value => (
                    <DateInput
                      label="Interaction Date Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.date', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== null ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.classification}
                  children={value => (
                    <ClassificationInput
                      label="Interaction Classification Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.date', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== null ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.slider}
                  children={value => (
                    <SliderInput
                      label="Interaction Slider Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.slider', 0)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.checkbox}
                  children={value => (
                    <CheckboxInput
                      label="Interaction Checkbox Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.checkbox', false)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.switch}
                  children={value => (
                    <SwitchInput
                      label="Interaction Switch Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        onReset: () => form.setFieldValue('components.inputs.values.switch', false)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                    />
                  )}
                />
              </>
            )}
          />
        }
        right={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.state.disabled}
              children={value => (
                <CheckboxInput
                  label="Disabled"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.disabled', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.loading}
              children={value => (
                <CheckboxInput
                  label="Loading"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.loading', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.reset}
              children={value => (
                <CheckboxInput
                  label="Reset"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.reset', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.tooltip}
              children={value => (
                <CheckboxInput
                  label="Tooltip"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.tooltip', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.error}
              children={value => (
                <CheckboxInput
                  label="Error"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.error', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.readOnly}
              children={value => (
                <CheckboxInput
                  label="ReadOnly"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.readOnly', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.helperText}
              children={value => (
                <CheckboxInput
                  label="Helper Text"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.helperText', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.placeholder}
              children={value => (
                <CheckboxInput
                  label="Placeholder"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.placeholder', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.endAdornment}
              children={value => (
                <CheckboxInput
                  label="End Adornment"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.endAdornment', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.tiny}
              children={value => (
                <CheckboxInput
                  label="Tiny"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.tiny', next)}
                />
              )}
            />
          </div>
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
          <>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Text Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Chips Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Number Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Select Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  options={[
                    { primary: 'Options 1', value: 'option 1' },
                    { primary: 'Options 2', value: 'option 2' },
                    { primary: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next: string) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Date Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Date Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Slider Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Checkbox Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Slider Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
          </>
        }
        right={
          <MonacoEditor
            language="javascript"
            value={`<>
  <TextInput
  label="Text Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Chips Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Number Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Select Input"
  value={value}
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Date Input"
  value={value}
  onChange={next => {}}
  />

  <SliderInput
  label="Slider Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Checkbox Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Switch Input"
  value={value}
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />
    </DemoContainer>
  );
});
