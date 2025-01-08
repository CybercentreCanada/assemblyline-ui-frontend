import { Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import makeStyles from '@mui/styles/makeStyles';
import { useForm } from 'components/routes/developer/library/contexts/form';
import { CheckboxInput } from 'components/visual/Inputs/CheckboxInput';
import { DateInput } from 'components/visual/Inputs/DateInput';
import { NumberInput } from 'components/visual/Inputs/NumberInput';
import { SelectInput } from 'components/visual/Inputs/SelectInput';
import { SliderInput } from 'components/visual/Inputs/SliderInput';
import { SwitchInput } from 'components/visual/Inputs/SwitchInput';
import { TextInput } from 'components/visual/Inputs/TextInput';
import MonacoEditor from 'components/visual/MonacoEditor';
import SectionContainer from 'components/visual/SectionContainer';
import React from 'react';

const useStyles = makeStyles(theme => ({
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

export const InputsSection = React.memo(() => {
  const theme = useTheme();
  const classes = useStyles();
  const form = useForm();

  return (
    <SectionContainer title="Inputs">
      <div className={classes.main}>
        <div className={classes.container}>
          <div>
            <Typography variant="h6">{'Basic Inputs'}</Typography>
            <Typography color="textSecondary" variant="body2">
              <span>{'The following components are all of the inputs used in Assemblyline. '}</span>
              <span>{"Compared to their MUI counterpart, their label doesn't fold into the input."}</span>
            </Typography>
          </div>

          <Grid container spacing={2}>
            <Grid md={6} xs={12} sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2) }}>
              <form.Subscribe
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Text Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Number Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Select Input"
                    value={value}
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Date Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Slider Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Checkbox Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Switch Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Controlled Text Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.text = '';
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.text}
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
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Controlled Number Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.number = 0;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.number}
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
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Controlled Select Input"
                    value={value}
                    reset
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.select = '';
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.select}
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
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Controlled Date Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.date = null;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.date}
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
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Controlled Slider Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.slider = 0;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.slider}
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
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Controlled Checkbox Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.checkbox = false;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
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
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Controlled Switch Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.switch = false;
                        return s;
                      });
                    }}
                  />
                )}
              />
            </Grid>

            <Grid md={6} xs={12} container alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
              <form.Subscribe
                selector={state => state.values.inputs.switch}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Disabled Text Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Disabled Number Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Disabled Select Input"
                    value={value}
                    disabled
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Disabled Date Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Disabled Slider Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Disabled Checkbox Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Disabled Switch Input"
                    value={value}
                    disabled
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Loading Text Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Loading Number Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Loading Select Input"
                    value={value}
                    loading
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Loading Date Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Loading Slider Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Loading Checkbox Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Loading Switch Input"
                    value={value}
                    loading
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Reset Text Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.text = '';
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Reset Number Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.number = 0;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Reset Select Input"
                    value={value}
                    reset
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.select = 'option 1';
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Reset Date Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.date = null;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Reset Slider Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.slider = 0;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Reset Checkbox Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.checkbox = false;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Reset Switch Input"
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.inputs.switch = false;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Tooltip Text Input"
                    tooltip="Tooltip Text Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Tooltip Number Input"
                    tooltip="Tooltip Number Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Tooltip Select Input"
                    tooltip="Tooltip Select Input"
                    value={value}
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Tooltip Date Input"
                    tooltip="Tooltip Date Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Tooltip Slider Input"
                    tooltip="Tooltip Slider Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Tooltip Checkbox Input"
                    tooltip="Tooltip Checkbox Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Tooltip Switch Input"
                    tooltip="Tooltip Switch Input"
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Error Text Input"
                    value={value}
                    error={v => (v !== '' ? null : 'Input field cannot be empty')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Error Number Input"
                    value={value}
                    error={v => (v !== 0 ? null : 'Input field cannot be 0')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Error Select Input"
                    value={value}
                    error={v => (v !== '' ? null : 'Input field cannot be null')}
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Error Date Input"
                    value={value}
                    error={v => (v !== null ? null : 'Input field cannot be null')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Error Slider Input"
                    value={value}
                    error={v => (v !== 0 ? null : 'Input field cannot be 0')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Error Checkbox Input"
                    value={value}
                    error={v => (v !== false ? null : 'Input field cannot be false')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Error Switch Input"
                    value={value}
                    error={v => (v !== false ? null : 'Input field cannot be false')}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="ReadOnly Text Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="ReadOnly Number Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="ReadOnly Select Input"
                    value={value}
                    readOnly
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="ReadOnly Date Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="ReadOnly Slider Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="ReadOnly Checkbox Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="ReadOnly Switch Input"
                    value={value}
                    readOnly
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    readonly
    onChange={(event, next) => {}}
  />

  <NumberInput
    label="ReadOnly Number Input"
    value={value}
    readonly
    onChange={(event, next) => {}}
  />

  <SelectInput
    label="ReadOnly Select Input"
    value={value}
    readonly
    items={['option 1', 'option 2', 'option 3']}
    onChange={(event, next) => {}}
  />

  <DateInput
    label="ReadOnly Date Input"
    value={value}
    readonly
    onChange={next => {}}
  />

  <SliderInput
    label="ReadOnly Slider Input"
    value={value}
    readonly
    onChange={(event, next) => {}}
  />

  <CheckboxInput
    label="ReadOnly Checkbox Input"
    value={value}
    readonly
    onChange={(event, next) => {}}
  />

  <SwitchInput
    label="ReadOnly Switch Input"
    value={value}
    readonly
    onChange={(event, next) => {}}
  />
</>`}
              />
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
                selector={state => state.values.inputs.text}
                children={value => (
                  <TextInput
                    label="Text Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.text = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.number}
                children={value => (
                  <NumberInput
                    label="Number Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.number = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.select}
                children={value => (
                  <SelectInput
                    label="Select Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    items={['option 1', 'option 2', 'option 3']}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.select = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.date}
                children={value => (
                  <DateInput
                    label="Date Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.date = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.slider}
                children={value => (
                  <SliderInput
                    label="Slider Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.slider = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.checkbox}
                children={value => (
                  <CheckboxInput
                    label="Checkbox Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.checkbox = next;
                        return s;
                      });
                    }}
                  />
                )}
              />

              <form.Subscribe
                selector={state => state.values.inputs.switch}
                children={value => (
                  <SwitchInput
                    label="Slider Input: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris at pellentesque massa. Vivamus sagittis venenatis auctor. Suspendisse venenatis sollicitudin sollicitudin. Nulla dui nibh, volutpat non ipsum viverra, tristique iaculis diam. Sed efficitur tellus leo. Curabitur ut tincidunt turpis. Phasellus quis urna at turpis pharetra volutpat luctus eu nunc."
                    value={value}
                    reset
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.inputs.switch = next;
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
    items={['option 1', 'option 2', 'option 3']}
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

        <div style={{ height: '200px' }} />
      </div>
    </SectionContainer>
  );
});
