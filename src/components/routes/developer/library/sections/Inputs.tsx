import { Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import { DemoContainer } from 'components/routes/developer/library/components/DemoContainer';
import { DemoSection } from 'components/routes/developer/library/components/DemoSection';
import { useForm } from 'components/routes/developer/library/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import React from 'react';

export const useStyles = makeStyles(theme => ({
  main: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(8)
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: theme.spacing(3)
  }
}));

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
    };
    values: {
      text: string;
      number: number;
      date: string;
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
      readOnly: false
    },
    values: {
      text: '',
      number: 0,
      date: '',
      select: '',
      checkbox: false,
      switch: false,
      slider: 0
    }
  }
} as const;

export const InputsSection = React.memo(() => {
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();

  return (
    <DemoContainer>
      <DemoSection
        primary={'Basic Example'}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Number Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Date Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Slider Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Checkbox Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Switch Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
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

  <NumberInput
  label="Number Input"
  value={value}
  onChange={(event, next) => {}}
  />

  <SelectInput
  label="Select Input"
  value={value}
  options={[
    { label: 'Options 1', value: 'option 1' },
    { label: 'Options 2', value: 'option 2' },
    { label: 'Options 3', value: 'option 3' }
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

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Controlled'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'Input components are controlled by default. '}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Controlled Text Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.text = '';
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Controlled Number Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.number = 0;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.select}
              children={value => (
                <SelectInput
                  label="Controlled Select Input"
                  value={value}
                  reset
                  options={[
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.select = '';
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Controlled Date Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.date = null;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Controlled Slider Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = 0;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.checkbox}
              children={value => (
                <CheckboxInput
                  label="Controlled Checkbox Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = false;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.switch}
              children={value => (
                <SwitchInput
                  label="Controlled Switch Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = false;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
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
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Disabled'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'The disabled prop stops the user from making changes. '}</span>
            <span>{'Note: the label should also be the disabled color.'}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Disabled Text Input"
                  value={value}
                  disabled
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
            <MonacoEditor
              language="javascript"
              value={`<>
  <TextInput
    label="Disabled Text Input"
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Loading'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>
              {'All inputs have a loading state that can be set using the loading prop and prevents value change. '}
            </span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Loading Text Input"
                  value={value}
                  loading
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
            <MonacoEditor
              language="javascript"
              value={`<>
  <TextInput
    label="Loading Text Input"
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Reset'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'All inputs implements a reset button which the button can be made visible '}</span>
            <span>{'via the reset prop. Handle the reset change can be made using the onReset event handle.'}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Reset Text Input"
                  value={value}
                  reset
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.text = '';
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.number = 0;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.select = 'option 1';
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.date = null;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = 0;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = false;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                  onReset={() => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = false;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Tooltip'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'Hovering the label should open a tooltip.'}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Tooltip Text Input"
                  tooltip="Tooltip Text Input"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
            <MonacoEditor
              language="javascript"
              value={`<>
  <TextInput
    label="Tooltip Text Input"
    tooltip="Tooltip Text Input"
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Error'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>
              {'Error prop takes a function that evaluates the value. If that function returns an error message, '}
            </span>
            <span>{"it will trigger the input' error state and show that message in the helper text. "}</span>
            <span>{"There's also the onError event handler that triggers when an error is detected."}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Error Text Input"
                  value={value}
                  error={v => (v !== '' ? null : 'Input field cannot be empty')}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Error Number Input"
                  value={value}
                  error={v => (v !== 0 ? null : 'Input field cannot be 0')}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Read Only'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>
              {
                'The readOnly prop prevents the user from making changes, but still shows the input in its default state. '
              }
            </span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="ReadOnly Text Input"
                  value={value}
                  readOnly
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
            <MonacoEditor
              language="javascript"
              value={`<>
  <TextInput
    label="ReadOnly Text Input"
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Interactions'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'Use this to test the different interaction with the different props. '}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => [
                state.values.components.inputs.state.disabled,
                state.values.components.inputs.state.loading,
                state.values.components.inputs.state.reset,
                state.values.components.inputs.state.tooltip,
                state.values.components.inputs.state.error,
                state.values.components.inputs.state.readOnly
              ]}
              children={([disabled, loading, reset, tooltip, error, readOnly]) => (
                <>
                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.text}
                    children={value => (
                      <TextInput
                        label="Interaction Text Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.text = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.text = '';
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.number}
                    children={value => (
                      <NumberInput
                        label="Interaction Number Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.number = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.number = 0;
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
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
                          { label: 'Options 1', value: 'option 1' },
                          { label: 'Options 2', value: 'option 2' },
                          { label: 'Options 3', value: 'option 3' }
                        ]}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.select = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.select = '';
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.date}
                    children={value => (
                      <DateInput
                        label="Interaction Date Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.date = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.date = null;
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== null ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.slider}
                    children={value => (
                      <SliderInput
                        label="Interaction Slider Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.slider = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.slider = 0;
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.checkbox}
                    children={value => (
                      <CheckboxInput
                        label="Interaction Checkbox Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.checkbox = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.checkbox = false;
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.inputs.values.switch}
                    children={value => (
                      <SwitchInput
                        label="Interaction Switch Input"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.inputs.values.switch = next;
                            return s;
                          });
                        }}
                        {...(disabled && { disabled })}
                        {...(loading && { loading })}
                        {...(readOnly && { readOnly })}
                        {...(reset && {
                          reset,
                          onReset: () => {
                            form.setStore(s => {
                              s.components.inputs.values.switch = false;
                              return s;
                            });
                          }
                        })}
                        {...(tooltip && { tooltip: 'This is an example of a tooltip' })}
                        {...(error && { error: v => (v !== false ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />
                </>
              )}
            />
          </Grid>

          <Grid md={6} xs={12}>
            <div style={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(1) }}>
              <form.Subscribe
                selector={state => state.values.components.inputs.state.disabled}
                children={value => (
                  <CheckboxInput
                    label="Disabled"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.disabled = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.inputs.state.loading}
                children={value => (
                  <CheckboxInput
                    label="Loading"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.loading = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.inputs.state.reset}
                children={value => (
                  <CheckboxInput
                    label="Reset"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.reset = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.inputs.state.tooltip}
                children={value => (
                  <CheckboxInput
                    label="Tooltip"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.tooltip = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.inputs.state.error}
                children={value => (
                  <CheckboxInput
                    label="Error"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.error = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.components.inputs.state.readOnly}
                children={value => (
                  <CheckboxInput
                    label="ReadOnly"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.inputs.state.readOnly = next;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </div>
          </Grid>
        </Grid>
      </div>

      <div className={classes.container}>
        <div>
          <Typography variant="h6">{'Edge Case: Long label names'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{"The labels should handle the case where there's a really long label name "}</span>
            <span>{"or there isn't enough space for the full title."}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
            <form.Subscribe
              selector={state => state.values.components.inputs.values.text}
              children={value => (
                <TextInput
                  label="Text Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.text = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.number}
              children={value => (
                <NumberInput
                  label="Number Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.number = next;
                      return s;
                    });
                  }}
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
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.select = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.date}
              children={value => (
                <DateInput
                  label="Date Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.date = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.inputs.values.slider}
              children={value => (
                <SliderInput
                  label="Slider Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.slider = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.checkbox = next;
                      return s;
                    });
                  }}
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
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.inputs.values.switch = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>
          <Grid md={6} xs={12} sx={{ display: 'flex', minHeight: '500px' }}>
            <MonacoEditor
              language="javascript"
              value={`<>
  <TextInput
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
      { label: 'Options 1', value: 'option 1' },
      { label: 'Options 2', value: 'option 2' },
      { label: 'Options 3', value: 'option 3' }
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
          </Grid>
        </Grid>
      </div>
    </DemoContainer>
  );
});
