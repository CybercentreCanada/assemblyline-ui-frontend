import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, useTheme } from '@mui/material';
import { createAppRoute } from 'core/routes';
import { memo, Profiler } from 'react';
import {
  Performance,
  StyledBox2,
  StyledDiv,
  StyledDiv2
} from 'routes/development-customize/development-customize.components';
import type { CustomizeMethod } from 'routes/development-customize/development-customize.form';
import { CUSTOMIZE_METHODS, FormProvider, useForm } from 'routes/development-customize/development-customize.form';
import { PageHeader } from 'ui/layouts/PageHeader';
import { PageLayout } from 'ui/layouts/PageLayout';

export const DevelopmentCustomizePage = memo(() => {
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
                        <span style={{ color: theme.palette.text.secondary }}>{` (${times?.[label]} ms)`}</span>
                      )}
                      {!performances?.[label] ? null : (
                        <span style={{ color: theme.palette.text.secondary }}>{` (${performances?.[label]} ms)`}</span>
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
                              color: theme.palette.text.secondary,
                              border: `1px solid ${theme.palette.text.secondary}`,
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
                              color: theme.palette.text.secondary,
                              border: `1px solid ${theme.palette.text.secondary}`,
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
                              color: theme.palette.text.secondary,
                              border: `1px solid ${theme.palette.text.secondary}`,
                              borderRadius: theme.spacing(0.5),
                              margin: theme.spacing(0.5),
                              padding: theme.spacing(0.5),
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main
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

const WrappedDevelopmentCustomizePage = memo(() => (
  <FormProvider>
    <DevelopmentCustomizePage />
  </FormProvider>
));

export const DevelopmentCustomizeRoute = createAppRoute({
  component: WrappedDevelopmentCustomizePage,

  path: '/development/customize',

  ancestor: '/development',
  shortname: () => ({ i18nKey: 'drawer.development.customize', ns: 'app' }),
  fullname: () => ({ i18nKey: 'drawer.development.customize', ns: 'app' }),
  shorticon: () => <DataObjectOutlinedIcon />,
  fullicon: () => <DataObjectOutlinedIcon />,

  disabled: () => false,
  forbidden: (_location, config) => !config.user.is_admin || !['development', 'staging'].includes(config.configuration.system.type)
});
