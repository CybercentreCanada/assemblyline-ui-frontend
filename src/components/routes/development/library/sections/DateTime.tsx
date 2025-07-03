import { Grid, Typography, useTheme } from '@mui/material';
import { DemoContainer } from 'components/routes/development/library/components/DemoContainer';
import { useForm } from 'components/routes/development/library/contexts/form';
import { DateTimeField } from 'components/visual/DateTime/DateTimeField';
import { DateTimeRangePicker } from 'components/visual/DateTime/DateTimeRangePicker';
import { PageSection } from 'components/visual/Layouts/PageSection';
import { add, formatDistanceToNow, sub } from 'date-fns';
import { enCA, frCA } from 'date-fns/locale';
import React from 'react';

export type DateTimeLibraryState = {
  datetime: {
    name: string;
    values: {
      sectionOpen: boolean;
      datetime: string;
    };
  };
};
export const DATETIME_LIBRARY_STATE: DateTimeLibraryState = {
  datetime: {
    name: 'DateTime',
    values: {
      sectionOpen: true,
      datetime: null
    }
  }
} as const;

export const DateTimeSection = React.memo(() => {
  const theme = useTheme();

  const form = useForm();

  const pastDate = new Date(2025, 5, 20); // Example date: Sep 25, 2023
  const futureDate = new Date(2025, 5, 19); // Example date: Dec 25, 2023

  const pastRelative = formatDistanceToNow(pastDate, { addSuffix: true, locale: enCA }); // "5 days ago"
  const futureRelative = formatDistanceToNow(futureDate, { addSuffix: true, locale: frCA }); // "in 3 months"

  console.log(pastRelative, futureRelative);

  function luceneToDate(luceneDate) {
    const now = new Date();

    // Regex to parse Lucene-style datetime
    const match = /now([+-])(\d+)([smhd])/i.exec(luceneDate);

    if (!match) {
      throw new Error('Invalid Lucene date format');
    }

    const operator = match[1]; // "+" or "-"
    const value = parseInt(match[2], 10); // Numeric value
    const unit = match[3].toLowerCase(); // Unit of time (s, m, h, d)

    // `date-fns` requires the time unit as a key in an object
    const timeUnitMap = {
      s: 'seconds',
      m: 'minutes',
      h: 'hours',
      d: 'days',
      w: 'weeks',
      M: 'months',
      y: 'years'
    };

    const adjustment = { [timeUnitMap[unit]]: value };

    // Use `add` or `sub` based on the operator
    return operator === '+' ? add(now, adjustment) : sub(now, adjustment);
  }

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
