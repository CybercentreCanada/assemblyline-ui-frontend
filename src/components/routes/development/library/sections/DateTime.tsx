import { Grid, Typography, useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { useForm } from 'components/routes/development/library/contexts/form';
import { DateTimeField } from 'components/visual/DateTime/DateTimeField';
import { DateTimeRangePicker } from 'components/visual/DateTime/DateTimeRangePicker';
import { PageSection } from 'components/visual/Layouts/PageSection';
import React from 'react';

export type DateTimeLibraryState = {
  datetime: {
    name: string;
    values: {
      sectionOpen: boolean;
      datetime: { start: string; end: string; gap?: string };
    };
  };
};

export const DATETIME_LIBRARY_STATE: DateTimeLibraryState = {
  datetime: {
    name: 'DateTime',
    values: {
      sectionOpen: true,
      datetime: { start: 'now-4d', end: 'now', gap: '4h' }
    }
  }
} as const;

export const DateTimeSection = React.memo(() => {
  const theme = useTheme();

  const form = useForm();

  return (
    <DemoContainer>
      <PageSection primary="Date Time Field" anchor>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography color="textSecondary" variant="body1">
              Absolute Date
            </Typography>

            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: theme.spacing(1) }}>
              <Typography variant="body2">2020-01-01T12:30:00.000Z</Typography>
              <DateTimeField absolute="ISO">2020-01-01T12:30:00.000Z</DateTimeField>

              <Typography variant="body2">2020-01-02</Typography>
              <DateTimeField absolute="ISO">{new Date(2020, 0, 1)}</DateTimeField>

              <Typography variant="body2">Date.now()</Typography>
              <DateTimeField absolute="ISO">{Date.now()}</DateTimeField>

              <Typography variant="body2">2020-01-01T12:30:00.000Z</Typography>
              <DateTimeField absolute="date">2020-01-01T12:30:00.000Z</DateTimeField>

              <Typography variant="body2">2020-01-02</Typography>
              <DateTimeField absolute="date">{new Date(2020, 0, 1)}</DateTimeField>

              <Typography variant="body2">Date.now()</Typography>
              <DateTimeField absolute="date">{Date.now()}</DateTimeField>

              <Typography variant="body2">2020-01-01T12:30:00.000Z</Typography>
              <DateTimeField absolute="datetime">2020-01-01T12:30:00.000Z</DateTimeField>

              <Typography variant="body2">2020-01-02</Typography>
              <DateTimeField absolute="datetime">{new Date(2020, 0, 1)}</DateTimeField>

              <Typography variant="body2">Date.now()</Typography>
              <DateTimeField absolute="datetime">{Date.now()}</DateTimeField>
            </div>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography>Relative Date</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography>Lucene Absolute Date</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography>Lucene Relative Date</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            {/* <Moment variant="toNow">2026 01 01</Moment>
            <Moment variant="fromNow">2026 01 01</Moment> */}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}></Grid>
        </Grid>
      </PageSection>

      <PageSection primary="Date Time Picker" anchor>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <form.Subscribe
              selector={state => state.values.components.datetime.values.datetime}
              children={value => (
                <DateTimeRangePicker
                  value={value}
                  onChange={(event, next) => form.setFieldValue('components.datetime.values.datetime', next)}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} alignItems="flex-end" paddingBottom={2} paddingLeft={2}>
            <form.Subscribe
              selector={state => state.values.components.datetime.values.datetime}
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
    </DemoContainer>
  );
});
