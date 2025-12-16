import { Button, Grid, Typography, useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { ChipsInput } from 'components/visual/Inputs/ChipsInput';
import { ClassificationInput } from 'components/visual/Inputs/ClassificationInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import { JSONInput } from 'components/visual/Inputs/JSONInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { RadioInput } from 'components/visual/Inputs/RadioInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextAreaInput } from 'components/visual/Inputs/TextAreaInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import { PageSection } from 'components/visual/Layouts/PageSection';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export const LONG_STRING =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce iaculis consectetur elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean nec ante nec sapien vulputate rhoncus ac quis leo. Aenean erat erat, lacinia nec nulla sit amet, egestas rutrum neque. Quisque et eleifend lorem, id vehicula lectus. Integer rhoncus rutrum ante id tempus. Donec non libero non justo vehicula finibus. Maecenas scelerisque lectus euismod neque aliquam, eget dictum mauris aliquet. Fusce at massa quis felis pulvinar egestas. Donec in libero sed sem scelerisque iaculis. Fusce placerat, eros eu gravida sollicitudin, massa sapien luctus massa, id ullamcorper tellus risus eget lorem. Praesent a nisi massa. Nulla mollis dictum sagittis. Donec vestibulum nulla magna, vitae volutpat dui blandit et.';

export const SELECT_OPTIONS = [
  { primary: 'Options 1', value: 'option 1' },
  { primary: 'Options 2', value: 'option 2' },
  { primary: 'Options 3', value: 'option 3' },
  { primary: LONG_STRING, value: LONG_STRING }
] as const;

export const RADIO_OPTIONS = [
  { value: null as null, label: 'Null' },
  { value: 'first', label: 'First' },
  { value: 'second', label: 'Second' },
  { value: LONG_STRING, label: LONG_STRING }
] as const;

// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
export const TEXTFIELD_OPTIONS = [
  '12 Angry Men',
  '2001: A Space Odyssey',
  '3 Idiots',
  'A Clockwork Orange',
  'Alien',
  'Aliens',
  'Amadeus',
  'Amélie',
  'American Beauty',
  'American History X',
  'Apocalypse Now',
  'Back to the Future',
  'Bicycle Thieves',
  'Braveheart',
  'Casablanca',
  'Cinema Paradiso',
  'Citizen Kane',
  'City Lights',
  'City of God',
  'Dangal',
  'Das Boot',
  'Django Unchained',
  'Double Indemnity',
  'Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb',
  'Eternal Sunshine of the Spotless Mind',
  'Fight Club',
  'Forrest Gump',
  'Full Metal Jacket',
  'Gladiator',
  'Goodfellas',
  'Grave of the Fireflies',
  'Inception',
  'Inglourious Basterds',
  'Interstellar',
  'Lawrence of Arabia',
  'Léon: The Professional',
  'Life Is Beautiful',
  'Like Stars on Earth',
  'Logan',
  'M',
  'Memento',
  'Modern Times',
  'Monty Python and the Holy Grail',
  'North by Northwest',
  'Oldboy',
  'Once Upon a Time in America',
  'Once Upon a Time in the West',
  'Paths of Glory',
  'Princess Mononoke',
  'Psycho',
  'Pulp Fiction',
  'Raiders of the Lost Ark',
  'Rear Window',
  'Requiem for a Dream',
  'Reservoir Dogs',
  'Saving Private Ryan',
  'Se7en',
  'Seven Samurai',
  'Snatch',
  'Spirited Away',
  'Star Wars: Episode IV - A New Hope',
  'Star Wars: Episode V - The Empire Strikes Back',
  'Star Wars: Episode VI - Return of the Jedi',
  'Sunset Boulevard',
  'Taxi Driver',
  'Terminator 2: Judgment Day',
  'The Dark Knight Rises',
  'The Dark Knight',
  'The Departed',
  'The Godfather: Part II',
  'The Godfather',
  'The Good, the Bad and the Ugly',
  'The Great Dictator',
  'The Green Mile',
  'The Intouchables',
  'The Kid',
  'The Lion King',
  'The Lives of Others',
  'The Lord of the Rings: The Fellowship of the Ring',
  'The Lord of the Rings: The Return of the King',
  'The Lord of the Rings: The Two Towers',
  'The Matrix',
  'The Pianist',
  'The Prestige',
  'The Shawshank Redemption',
  'The Shining',
  'The Silence of the Lambs',
  'The Sting',
  'The Usual Suspects',
  'To Kill a Mockingbird',
  'Toy Story 3',
  'Toy Story',
  'Vertigo',
  'WALL·E',
  'Whiplash',
  'Witness for the Prosecution',
  "It's a Wonderful Life",
  "One Flew Over the Cuckoo's Nest",
  "Schindler's List",
  "Singin' in the Rain"
];

export type InputsLibraryState = {
  inputs: {
    name: string;
    state: {
      badge: boolean;
      disabled: boolean;
      endAdornment: boolean;
      error: boolean;
      helperText: boolean;
      loading: boolean;
      longname: boolean;
      monospace: boolean;
      overflowHidden: boolean;
      password: boolean;
      placeholder: boolean;
      readOnly: boolean;
      required: boolean;
      reset: boolean;
      tiny: boolean;
      tooltip: boolean;
    };
    values: {
      checkbox: boolean;
      chips: string[];
      classification: string;
      date: string;
      json: object;
      number: number;
      radio: (typeof RADIO_OPTIONS)[number]['value'];
      select: (typeof SELECT_OPTIONS)[number]['value'];
      slider: number;
      switch: boolean;
      text: string;
      textarea: string;
    };
  };
};

export const INPUTS_LIBRARY_STATE: InputsLibraryState = {
  inputs: {
    name: 'Inputs',
    state: {
      badge: false,
      disabled: false,
      endAdornment: false,
      error: false,
      helperText: false,
      loading: false,
      longname: false,
      monospace: false,
      overflowHidden: false,
      password: false,
      placeholder: false,
      readOnly: false,
      required: false,
      reset: false,
      tiny: false,
      tooltip: false
    },
    values: {
      checkbox: false,
      chips: [LONG_STRING, LONG_STRING],
      classification: 'TLP:CLEAR',
      date: '',
      json: { [LONG_STRING]: LONG_STRING },
      number: 0,
      radio: LONG_STRING,
      select: 'option 1',
      slider: 0,
      switch: false,
      text: LONG_STRING,
      textarea: LONG_STRING
    }
  }
};

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
                  options={TEXTFIELD_OPTIONS}
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
                  min={5}
                  max={1000}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Text Area Input"
                  value={value}
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Radio Input"
                  value={value}
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="JSON Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  defaultValue={''}
                  reset
                  options={TEXTFIELD_OPTIONS}
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
                  defaultValue={[]}
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
                  <Typography variant="body2">{`Value: ${JSON.stringify(value)}`}</Typography>
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
                  defaultValue={0}
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
                  defaultValue={'option 1'}
                  reset
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.select', null)}
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
                  defaultValue={null}
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
                  defaultValue={'TLP:CLEAR'}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Controlled Text Area Input"
                  value={value}
                  defaultValue={''}
                  reset
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.textarea', null)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
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
                  defaultValue={0}
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
                  defaultValue={false}
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
                  defaultValue={false}
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

          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Controlled Radio Input"
                  value={value}
                  defaultValue={null}
                  reset
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.switch', null)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
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
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Controlled JSON Input"
                  value={value}
                  defaultValue={{}}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.json', {})}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <div>
                  <Typography variant="body2">{`Type: ${typeof value}`}</Typography>
                  <Typography variant="body2">{`Value: ${JSON.stringify(value)}`}</Typography>
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
                  options={TEXTFIELD_OPTIONS}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Disabled Text Area Input"
                  value={value}
                  disabled
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Disabled Radio Input"
                  value={value}
                  disabled
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Disabled JSON Input"
                  value={value}
                  disabled
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={TEXTFIELD_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Loading Chips Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Loading Text Area Input"
                  value={value}
                  loading
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Loading Radio Input"
                  value={value}
                  loading
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Loading JSON Input"
                  value={value}
                  loading
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  defaultValue={''}
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
                  defaultValue={[]}
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
                  defaultValue={0}
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
                  defaultValue={'option 1'}
                  reset
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
                  defaultValue={null}
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
                  defaultValue={'TLP:CLEAR'}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.classification', 'TLP:CLEAR')}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Reset Classification Input"
                  value={value}
                  defaultValue={''}
                  reset
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.textarea', '')}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Reset Slider Input"
                  value={value}
                  defaultValue={0}
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
                  defaultValue={false}
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
                  defaultValue={false}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.switch', false)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Reset Radio Input"
                  value={value}
                  defaultValue={null}
                  reset
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.radio', null)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Reset JSON Input"
                  value={value}
                  defaultValue={{}}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
                  onReset={() => form.setFieldValue('components.inputs.values.json', {})}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Tooltip Text Area Input"
                  tooltip="Tooltip Text Area Input"
                  value={value}
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Tooltip Radio Input"
                  tooltip="Tooltip Radio Input"
                  value={value}
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Tooltip JSON Input"
                  tooltip="Tooltip JSON Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  error={v => (v !== 'option 1' ? null : 'Input field cannot be null')}
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Error Text Area Input"
                  value={value}
                  rows={3}
                  error={v => (v !== '' ? null : 'Input field cannot be empty')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Error Radio Input"
                  value={value}
                  error={v => (v !== null ? null : 'Input field cannot be null')}
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Error JSON Input"
                  value={value}
                  error={v => (JSON.stringify(v) !== '{}' ? null : 'Input field cannot be {}')}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Helper Text Text Area Input"
                  value={value}
                  rows={3}
                  helperText="Helper Text"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Helper Text Radio Input"
                  helperText="Helper Text"
                  value={value}
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Helper Text JSON Input"
                  helperText="Helper Text"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Placeholder Text Area Input"
                  value={value}
                  rows={3}
                  placeholder="Placeholder"
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Placeholder Radio Input"
                  value={value}
                  placeholder="Placeholder"
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Placeholder JSON Input"
                  placeholder="Placeholder"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="ReadOnly Text Area Input"
                  value={value}
                  rows={3}
                  readOnly
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="ReadOnly Radio Input"
                  value={value}
                  readOnly
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="ReadOnly JSON Input"
                  readOnly
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="End Adornment Text Area Input"
                  value={value}
                  rows={3}
                  endAdornment={<Button variant="contained">Submit</Button>}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="End Adornment Radio Input"
                  value={value}
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="End Adornment JSON Input"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Tiny Text Area Input"
                  value={value}
                  rows={3}
                  tiny
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Tiny Radio Input"
                  value={value}
                  tiny
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Tiny JSON Input"
                  tiny
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
        primary="Monospace"
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
                  label="Monospace Text Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Monospace Chips Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Monospace Number Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Monospace Select Input"
                  value={value}
                  monospace
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Monospace Date Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Monospace Classification Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Monospace Text Area Input"
                  value={value}
                  rows={3}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Monospace Slider Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Monospace Checkbox Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Monospace Switch Input"
                  value={value}
                  monospace
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Monospace Radio Input"
                  value={value}
                  monospace
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Monospace JSON Input"
                  monospace
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
  label="Monospace Text Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Monospace Chips Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Monospace Number Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Monospace Select Input"
  value={value}
  monospace
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Monospace Date Input"
  value={value}
  monospace
  onChange={next => {}}
  />

  <SliderInput
  label="Monospace Slider Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Monospace Checkbox Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Monospace Switch Input"
  value={value}
  monospace
  onChange={(event, next) => {}}
  />
</>`}
          />
        }
      />

      <DemoSection
        primary="Password"
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
                  label="Password Text Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.chips}
              children={value => (
                <ChipsInput
                  label="Password Chips Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.chips', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Password Number Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.number', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Password Select Input"
                  value={value}
                  password
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Password Date Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.date', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.classification}
              children={value => (
                <ClassificationInput
                  label="Password Classification Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Password Text Area Input"
                  value={value}
                  rows={3}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Password Slider Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.slider', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Password Checkbox Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.checkbox', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Password Switch Input"
                  value={value}
                  password
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.switch', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Password Radio Input"
                  value={value}
                  password
                  options={RADIO_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="Password JSON Input"
                  password
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
  label="Password Text Input"
  value={value}
  password
  onChange={(event, next) => {}}
  />

  <ChipsInput
  label="Password Chips Input"
  value={value}
  password
  onChange={(event, next) => {}}
  />

  <NumberInput
  label="Password Number Input"
  value={value}
  password
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Password Select Input"
  value={value}
  password
  options={[
    { primary: 'Options 1', value: 'option 1' },
    { primary: 'Options 2', value: 'option 2' },
    { primary: 'Options 3', value: 'option 3' }
  ]}
  onChange={(event, next) => {}}
  />

  <DateInput
  label="Password Date Input"
  value={value}
  password
  onChange={next => {}}
  />

  <SliderInput
  label="Password Slider Input"
  value={value}
  password
  onChange={(event, next) => {}}
  />

  <CheckboxInput
  label="Password Checkbox Input"
  value={value}
  password
  onChange={(event, next) => {}}
  />

  <SwitchInput
  label="Password Switch Input"
  value={value}
  password
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
              state.values.components.inputs.state.tiny,
              state.values.components.inputs.state.monospace,
              state.values.components.inputs.state.password,
              state.values.components.inputs.state.longname,
              state.values.components.inputs.state.overflowHidden,
              state.values.components.inputs.state.required,
              state.values.components.inputs.state.badge
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
              tiny,
              monospace,
              password,
              longname,
              overflowHidden,
              required,
              badge
            ]) => (
              <>
                <form.Subscribe
                  selector={state => state.values.components.inputs.values.text}
                  children={value => (
                    <TextInput
                      label="Interaction Text Input"
                      value={value}
                      options={TEXTFIELD_OPTIONS}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.text', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        defaultValue: '',
                        onReset: () => form.setFieldValue('components.inputs.values.text', '')
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: [],
                        onReset: () => form.setFieldValue('components.inputs.values.chips', [])
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v.length !== 0 ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: 0,
                        onReset: () => form.setFieldValue('components.inputs.values.number', 0)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0'), min: 5, max: 10 })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.select}
                  children={value => (
                    <SelectInput
                      label="Interaction Select Input"
                      value={value}
                      options={SELECT_OPTIONS}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        defaultValue: 'option 1',
                        onReset: () => form.setFieldValue('components.inputs.values.select', 'option 1')
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: (v: string) => (v !== '' ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: null,
                        onReset: () => form.setFieldValue('components.inputs.values.date', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== null ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: null,
                        onReset: () => form.setFieldValue('components.inputs.values.classification', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== 'TLP:CLEAR' ? null : 'Input field cannot be TLP:CLEAR') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.textarea}
                  children={value => (
                    <TextAreaInput
                      label="Interaction Text Area Input"
                      value={value}
                      rows={3}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        defaultValue: '',
                        onReset: () => form.setFieldValue('components.inputs.values.textarea', '')
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== '' ? null : "Input field cannot be''") })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: 0,
                        onReset: () => form.setFieldValue('components.inputs.values.slider', 0)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: false,
                        onReset: () => form.setFieldValue('components.inputs.values.checkbox', false)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
                        defaultValue: false,
                        onReset: () => form.setFieldValue('components.inputs.values.switch', false)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.radio}
                  children={value => (
                    <RadioInput
                      label="Interaction Radio Input"
                      value={value}
                      options={RADIO_OPTIONS}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        defaultValue: null,
                        onReset: () => form.setFieldValue('components.inputs.values.radio', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: (v: string) => (v !== null ? null : 'Input field cannot be null') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
                    />
                  )}
                />

                <form.Subscribe
                  selector={state => state.values.components.inputs.values.json}
                  children={value => (
                    <JSONInput
                      label="Interaction JSON Input"
                      value={value}
                      onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
                      {...(disabled && { disabled })}
                      {...(loading && { loading })}
                      {...(readOnly && { readOnly })}
                      {...(tiny && { tiny })}
                      {...(reset && {
                        reset,
                        defaultValue: {},
                        onReset: () => form.setFieldValue('components.inputs.values.radio', null)
                      })}
                      {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                      {...(error && { error: v => (JSON.stringify(v) !== '{}' ? null : 'Input field cannot be {}') })}
                      {...(helperText && { helperText: 'Helper Text' })}
                      {...(placeholder && { placeholder: 'Placeholder' })}
                      {...(endAdornment && { endAdornment: <Button variant="contained">Submit</Button> })}
                      {...(monospace && { monospace: true })}
                      {...(password && { password: true })}
                      {...(overflowHidden && { overflowHidden: true })}
                      {...(required && { required: true })}
                      {...(longname && {
                        label:
                          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      })}
                      {...(badge && { badge: true })}
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
            <form.Subscribe
              selector={state => state.values.components.inputs.state.monospace}
              children={value => (
                <CheckboxInput
                  label="Monospace"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.monospace', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.password}
              children={value => (
                <CheckboxInput
                  label="Password"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.password', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.longname}
              children={value => (
                <CheckboxInput
                  label="Long Name"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.longname', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.overflowHidden}
              children={value => (
                <CheckboxInput
                  label="Overflow Hidden"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.overflowHidden', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.required}
              children={value => (
                <CheckboxInput
                  label="Required"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.required', next)}
                />
              )}
            />
            <form.Subscribe
              selector={state => state.values.components.inputs.state.badge}
              children={value => (
                <CheckboxInput
                  label="Badge"
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.state.badge', next)}
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
                  options={SELECT_OPTIONS}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.select', next)}
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
                  label="Classification Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.classification', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.textarea}
              children={value => (
                <TextAreaInput
                  label="Text Area Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  rows={3}
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.textarea', next)}
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

            <form.Subscribe
              selector={state => state.values.components.inputs.values.radio}
              children={value => (
                <RadioInput
                  label="Radio Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  reset
                  options={
                    [
                      {
                        value: null,
                        label:
                          'Null: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      },
                      {
                        value: 'first',
                        label:
                          'First: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      },
                      {
                        value: 'second',
                        label:
                          'Second: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc.'
                      }
                    ] as const
                  }
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.radio', next)}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.json}
              children={value => (
                <JSONInput
                  label="JSON Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  reset
                  onChange={(event, next) => form.setFieldValue('components.inputs.values.json', next)}
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
