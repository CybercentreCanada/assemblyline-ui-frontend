import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, useTheme } from '@mui/material';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import { memo, Profiler } from 'react';
import { CUSTOMIZE_METHODS, CustomizeMethod, useForm } from './customize.form';

const StyledDiv = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        color: theme.palette.text.secondary,
        border: `1px solid ${theme.palette.text.secondary}`,
        borderRadius: theme.spacing(0.5),
        margin: theme.spacing(0.5),
        padding: theme.spacing(0.5)
      }}
    >
      {children}
    </div>
  );
};

export const CustomizeRoute = memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <PageLayout
      header={
        <PageHeader
          primary="Customize"
          secondary={'This page is used to test the performance of different styling methods.'}
        />
      }
      leftNav={null}
      rightNav={null}
    >
      <form.Subscribe
        selector={state => [state.values.method, state.values.times] as const}
        children={([method, times]) => (
          <FormControl>
            <FormLabel>Method</FormLabel>
            <RadioGroup
              defaultValue={null}
              value={method}
              onChange={(e, v: CustomizeMethod) => form.setFieldValue('method', v)}
            >
              <FormControlLabel value={null} control={<Radio />} label="None" />
              {CUSTOMIZE_METHODS.map(label => (
                <FormControlLabel
                  key={label}
                  value={label}
                  control={<Radio />}
                  label={
                    <>
                      <span>{label}</span>
                      {!times?.[label] ? null : (
                        <span
                          style={{ color: theme.palette.text.secondary }}
                        >{` (${times?.[label]?.toFixed(2)} ms)`}</span>
                      )}
                    </>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        )}
      />

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        <form.Subscribe
          selector={state => [state.values.method, state.values.count] as const}
          children={([method, count]) => (
            <Profiler
              id={'test'}
              onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) =>
                form.setFieldValue('times', times => ({ ...times, [method]: actualDuration }))
              }
            >
              {method &&
                Array.from({ length: count }, (_, i) => {
                  switch (method) {
                    case 'Pure <div /> using style':
                      return (
                        <div
                          key={i}
                          style={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.text.secondary}`,
                            borderRadius: theme.spacing(0.5),
                            margin: theme.spacing(0.5),
                            padding: theme.spacing(0.5)
                          }}
                        >{`Div ${i}`}</div>
                      );

                    case 'Pure <div /> using className':
                      return <div key={i} className="development-customize-div-class">{`Div ${i}`}</div>;

                    case '<div /> component with style':
                      return <StyledDiv key={i}>{`Div ${i}`}</StyledDiv>;

                    case 'Box component with style':
                      return (
                        <Box
                          key={i}
                          style={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.text.secondary}`,
                            borderRadius: theme.spacing(0.5),
                            margin: theme.spacing(0.5),
                            padding: theme.spacing(0.5)
                          }}
                        >{`Box ${i}`}</Box>
                      );
                    case 'Box component with sx':
                      return (
                        <Box
                          key={i}
                          sx={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.text.secondary}`,
                            borderRadius: theme.spacing(0.5),
                            margin: theme.spacing(0.5),
                            padding: theme.spacing(0.5)
                          }}
                        >{`SX Box ${i}`}</Box>
                      );
                    default:
                      return null;
                  }
                })}
            </Profiler>
          )}
        />
      </div>
    </PageLayout>
  );
});
