import { Grid, useTheme } from '@mui/material';
import { PageSection } from 'components/visual/Layouts/PageSection';
import React from 'react';

type DemoSectionProps = {
  id?: string;
  primary: React.ReactNode;
  secondary: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
};

export const DemoSection: React.FC<DemoSectionProps> = React.memo(
  ({ id = null, primary, secondary, left, right }: DemoSectionProps) => {
    const theme = useTheme();

    return (
      <PageSection id={id} primary={primary} secondary={secondary} anchor>
        <Grid container spacing={2}>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2), minHeight: '300px' }}
          >
            {left}
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: 'flex', flexDirection: 'column', rowGap: theme.spacing(2), minHeight: '300px' }}
          >
            {right}
          </Grid>
        </Grid>
      </PageSection>
    );
  }
);
