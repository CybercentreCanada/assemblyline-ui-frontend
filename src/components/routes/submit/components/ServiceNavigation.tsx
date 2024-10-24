import { Grid, Typography, useTheme } from '@mui/material';
import type { UserSettings } from 'components/models/base/user_settings';
import { DEFAULT_SETTINGS } from 'components/routes/submit/settings';
import React from 'react';

type ServiceAccordionProps = {
  settings?: UserSettings;
};

const WrappedServiceNavigation = ({ settings = DEFAULT_SETTINGS }: ServiceAccordionProps) => {
  const theme = useTheme();

  console.log(settings);

  return (
    <Grid container textAlign="left" spacing={1}>
      <Grid item xs={12} md={5}>
        {settings.services
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((category, cat_id) => (
            <div key={cat_id}>
              <Typography color="primary" variant="body1">
                {category.name}
              </Typography>
              <div>
                {category.services
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((service, svr_id) => (
                    <div key={svr_id}>
                      <Typography color="textPrimary" variant="body2">
                        {service.name}
                      </Typography>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </Grid>
      <Grid item xs={12} md={7}>
        asd
      </Grid>
    </Grid>
  );
};

export const ServiceNavigation = React.memo(WrappedServiceNavigation);
