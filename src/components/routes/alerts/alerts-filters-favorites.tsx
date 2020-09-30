import { Box, Button, Divider, TextField, Typography, useTheme } from '@material-ui/core';
import React from 'react';

interface AlertsFiltersFavoritesProps {
  query?: string;
}

const AlertsFiltersFavorites = ({ query }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="h6">Favorites</Typography>
      <Divider />
      <Box mt={theme.spacing(0.4)} p={theme.spacing(0.1)}>
        <Box>
          <TextField label="Query" variant="outlined" defaultValue={query} fullWidth />
        </Box>
        <Box mt={2}>
          <TextField label="Name" variant="outlined" fullWidth />
        </Box>
      </Box>
      <Box mt={1}>
        <Button variant="contained" color="primary">
          Add
        </Button>
        <Box mr={1} display="inline-block" />
        <Button variant="contained">Cancel</Button>
      </Box>
    </Box>
  );
};

export default AlertsFiltersFavorites;
