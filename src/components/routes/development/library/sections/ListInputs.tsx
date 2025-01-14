import { Typography, useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { DemoSection } from 'components/routes/development/library/components/DemoSection';
import { useForm } from 'components/routes/development/library/contexts/form';
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
      disabled: boolean;
      loading: boolean;
      reset: boolean;
      tooltip: boolean;
      error: boolean;
      readOnly: boolean;
    };
    values: {
      boolean: boolean;
      checkbox: boolean;
      classification: string;
      date: string;
      number: number;
      select: string;
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
      disabled: false,
      loading: false,
      reset: false,
      tooltip: false,
      error: false,
      readOnly: false
    },
    values: {
      boolean: false,
      checkbox: false,
      classification: 'TLP:C',
      date: '',
      number: 0,
      select: '',
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
        primary={'Basic List Inputs'}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
          <Typography variant="h6">{'Controlled'}</Typography>
          <Typography color="textSecondary" variant="body2">
            <span>{'List Input components are controlled by default. '}</span>
          </Typography>
        </div>

        <Grid container spacing={2}>
          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.text}
              children={value => (
                <TextListInput
                  primary="Controlled Text List Input"
                  secondary="Controlled Text List Input Description"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.values.text = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="center">
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.number}
              children={value => (
                <NumberListInput
                  primary="Controlled Number List Input"
                  secondary="Controlled Number List Input Description"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.values.number = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="center">
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.select}
              children={value => (
                <SelectListInput
                  primary="Controlled Select List Input"
                  secondary="Controlled Select List Input Description"
                  value={value}
                  options={[
                    { label: 'Options 1', value: 'option 1' },
                    { label: 'Options 2', value: 'option 2' },
                    { label: 'Options 3', value: 'option 3' }
                  ]}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.values.select = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="center">
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.classification}
              children={value => (
                <ClassificationListInput
                  primary="Controlled Classification List Input"
                  secondary="Controlled Classification List Input Description"
                  value={value}
                  onChange={next => {
                    form.setStore(s => {
                      s.components.list_inputs.values.classification = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="center">
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

          <Grid md={6} xs={12}>
            <form.Subscribe
              selector={state => state.values.components.list_inputs.values.boolean}
              children={value => (
                <BooleanListInput
                  primary="Controlled Boolean List Input"
                  secondary="Controlled Boolean List Input Description"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.values.boolean = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </Grid>

          <Grid md={6} xs={12} container alignItems="center">
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
        primary={'Disabled'}
        secondary={
          <>
            <span>{'The disabled prop stops the user from making changes. '}</span>
            <span>{'Note: the label should also be the disabled color.'}</span>
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
        primary={'Loading'}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
        primary={'Reset'}
        secondary={
          <>
            <span>
              {'All inputs implements a reset button which the button can be made visible via the reset prop. '}
            </span>
            <span>{'Handle the reset change can be made using the onReset event handle.'}</span>
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = '';
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = 0;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = '';
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = 'TLP:C';
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
                    onReset={() => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = false;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
        primary={'Error'}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    error={v => (v !== '' ? null : 'Input field cannot be null')}
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
        primary={'Read Only'}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
        primary={'Interactions'}
        secondary={
          <>
            <span>{'Use this to test the different interaction with the different props. '}</span>
          </>
        }
        left={
          <form.Subscribe
            selector={state => [
              state.values.components.list_inputs.state.disabled,
              state.values.components.list_inputs.state.loading,
              state.values.components.list_inputs.state.reset,
              state.values.components.list_inputs.state.error,
              state.values.components.list_inputs.state.readOnly
            ]}
            children={([disabled, loading, reset, error, readOnly]) => (
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
                        primary="Interactions Text List Input"
                        secondary="Interactions Text List Input Description"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.list_inputs.values.text = next;
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
                              s.components.list_inputs.values.text = '';
                              return s;
                            });
                          }
                        })}
                        {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.number}
                    children={value => (
                      <NumberListInput
                        primary="Interactions Number List Input"
                        secondary="Interactions Number List Input Description"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.list_inputs.values.number = next;
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
                              s.components.list_inputs.values.number = 0;
                              return s;
                            });
                          }
                        })}
                        {...(error && { error: v => (v !== 0 ? null : 'Input field cannot be 0') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.select}
                    children={value => (
                      <SelectListInput
                        primary="Interactions Select List Input"
                        secondary="Interactions Select List Input Description"
                        value={value}
                        options={[
                          { label: 'Options 1', value: 'option 1' },
                          { label: 'Options 2', value: 'option 2' },
                          { label: 'Options 3', value: 'option 3' }
                        ]}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.list_inputs.values.select = next;
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
                              s.components.list_inputs.values.select = '';
                              return s;
                            });
                          }
                        })}
                        {...(error && { error: v => (v !== '' ? null : 'Input field cannot be null') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.classification}
                    children={value => (
                      <ClassificationListInput
                        primary="Interactions Classification List Input"
                        secondary="Interactions Classification List Input Description"
                        value={value}
                        onChange={next => {
                          form.setStore(s => {
                            s.components.list_inputs.values.classification = next;
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
                              s.components.list_inputs.values.classification = 'TLP:C';
                              return s;
                            });
                          }
                        })}
                        {...(error && { error: v => (v !== 'TLP:C' ? null : 'Input field cannot be TLP:C') })}
                      />
                    )}
                  />

                  <form.Subscribe
                    selector={state => state.values.components.list_inputs.values.boolean}
                    children={value => (
                      <BooleanListInput
                        primary="Interactions Boolean List Input"
                        secondary="Interactions Boolean List Input Description"
                        value={value}
                        onChange={(event, next) => {
                          form.setStore(s => {
                            s.components.list_inputs.values.boolean = next;
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
                              s.components.list_inputs.values.boolean = false;
                              return s;
                            });
                          }
                        })}
                        {...(error && { error: v => (v !== false ? null : 'Input field cannot be TLP:C') })}
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
              selector={state => state.values.components.list_inputs.state.disabled}
              children={value => (
                <CheckboxInput
                  label="Disabled"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.state.disabled = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.loading}
              children={value => (
                <CheckboxInput
                  label="Loading"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.state.loading = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.reset}
              children={value => (
                <CheckboxInput
                  label="Reset"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.state.reset = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.error}
              children={value => (
                <CheckboxInput
                  label="Error"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.state.error = next;
                      return s;
                    });
                  }}
                />
              )}
            />

            <form.Subscribe
              selector={state => state.values.components.list_inputs.state.readOnly}
              children={value => (
                <CheckboxInput
                  label="ReadOnly"
                  value={value}
                  onChange={(event, next) => {
                    form.setStore(s => {
                      s.components.list_inputs.state.readOnly = next;
                      return s;
                    });
                  }}
                />
              )}
            />
          </div>
        }
      />

      <DemoSection
        primary={'Edge Case: Long label names'}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.text = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.number = next;
                        return s;
                      });
                    }}
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
                    options={[
                      { label: 'Options 1', value: 'option 1' },
                      { label: 'Options 2', value: 'option 2' },
                      { label: 'Options 3', value: 'option 3' }
                    ]}
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.select = next;
                        return s;
                      });
                    }}
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
                    onChange={next => {
                      form.setStore(s => {
                        s.components.list_inputs.values.classification = next;
                        return s;
                      });
                    }}
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
                    onChange={(event, next) => {
                      form.setStore(s => {
                        s.components.list_inputs.values.boolean = next;
                        return s;
                      });
                    }}
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
        { label: 'Options 1', value: 'option 1' },
        { label: 'Options 2', value: 'option 2' },
        { label: 'Options 3', value: 'option 3' }
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
