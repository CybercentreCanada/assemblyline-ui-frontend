import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, styled, useTheme } from '@mui/material';
import type { CustomizeMethod } from 'components/routes/development/customize/customize.form';
import { CUSTOMIZE_METHODS, useForm } from 'components/routes/development/customize/customize.form';
import 'components/routes/development/customize/customize.styles.css';
import { PageHeader } from 'components/visual/Layouts/PageHeader';
import { PageLayout } from 'components/visual/Layouts/PageLayout';
import { memo, Profiler, useEffect } from 'react';

const Performance = ({ method, children }) => {
  const form = useForm();

  // Save the start time before the component renders
  const startRenderTime = performance.now();

  useEffect(() => {
    // Measure the end time after the component has mounted
    const endRenderTime = performance.now();
    const timeToRender = endRenderTime - startRenderTime;

    // Update the state with the time to render in milliseconds
    form.setFieldValue('performances', p => ({ ...p, [method]: timeToRender.toFixed(2) }));
  }, [method]); // Empty dependency array ensures this only runs once after mount

  return children;
};

const StyledDiv = ({ children }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        color: theme.vars.palette.text.secondary,
        border: `1px solid ${theme.vars.palette.text.secondary}`,
        borderRadius: theme.spacing(0.5),
        margin: theme.spacing(0.5),
        padding: theme.spacing(0.5)
      }}
    >
      {children}
    </div>
  );
};

const StyledDiv2 = styled('div')(({ theme }) => ({
  color: theme.vars.palette.text.secondary,
  border: `1px solid ${theme.vars.palette.text.secondary}`,
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.vars.palette.primary.main
  }
}));

const StyledBox2 = styled(Box)(({ theme }) => ({
  color: theme.vars.palette.text.secondary,
  border: `1px solid ${theme.vars.palette.text.secondary}`,
  borderRadius: theme.spacing(0.5),
  margin: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.vars.palette.primary.main
  }
}));

export const CustomizeRoute = memo(() => {
  const theme = useTheme();
  const form = useForm();

  return (
    <PageLayout
      header={
        <PageHeader
          primary="Customize"
          secondary="This page is used to test the performance of different styling methods."
        />
      }
      leftNav={null}
      rightNav={null}
    >
      <form.Subscribe
        selector={state => [state.values.method, state.values.times, state.values.performances] as const}
        children={([method, times, performances]) => (
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
                        <span style={{ color: theme.vars.palette.text.secondary }}>{` (${times?.[label]} ms)`}</span>
                      )}
                      {!performances?.[label] ? null : (
                        <span style={{ color: theme.vars.palette.text.secondary }}>
                          {` (${performances?.[label]} ms)`}
                        </span>
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
            <Performance method={method}>
              <Profiler
                id="test"
                onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) =>
                  form.setFieldValue('times', times => ({ ...times, [method]: actualDuration.toFixed(2) }))
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
                              color: theme.vars.palette.text.secondary,
                              border: `1px solid ${theme.vars.palette.text.secondary}`,
                              borderRadius: theme.spacing(0.5),
                              margin: theme.spacing(0.5),
                              padding: theme.spacing(0.5)
                            }}
                          >
                            {`Div ${i}`}
                          </div>
                        );

                      case 'Pure <div /> using className':
                        return (
                          <div key={i} className="development-customize-div-class">
                            {`Div ${i}`}
                          </div>
                        );

                      case '<div /> component with style':
                        return <StyledDiv key={i}>{`Div ${i}`}</StyledDiv>;

                      case "<div /> component with MUI's style":
                        return <StyledDiv2 key={i}>{`Div ${i}`}</StyledDiv2>;

                      case 'Box component using className':
                        return (
                          <Box key={i} className="development-customize-div-class">
                            {`Box ${i}`}
                          </Box>
                        );

                      case 'Box component with style':
                        return (
                          <Box
                            key={i}
                            style={{
                              color: theme.vars.palette.text.secondary,
                              border: `1px solid ${theme.vars.palette.text.secondary}`,
                              borderRadius: theme.spacing(0.5),
                              margin: theme.spacing(0.5),
                              padding: theme.spacing(0.5)
                            }}
                          >
                            {`Box ${i}`}
                          </Box>
                        );

                      case 'Box component with sx':
                        return (
                          <Box
                            key={i}
                            sx={{
                              color: theme.vars.palette.text.secondary,
                              border: `1px solid ${theme.vars.palette.text.secondary}`,
                              borderRadius: theme.spacing(0.5),
                              margin: theme.spacing(0.5),
                              padding: theme.spacing(0.5),
                              '&:hover': {
                                backgroundColor: theme.vars.palette.primary.main
                              }
                            }}
                          >
                            {`SX Box ${i}`}
                          </Box>
                        );

                      case 'Box component with styled':
                        return <StyledBox2 key={i}>{`Div ${i}`}</StyledBox2>;

                      default:
                        return null;
                    }
                  })}
              </Profiler>
            </Performance>
          )}
        />
      </div>
    </PageLayout>
  );
});
