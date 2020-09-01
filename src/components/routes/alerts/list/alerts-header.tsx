import { Box, Divider, FormControl, InputLabel, makeStyles, Select, TextField, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginBottom: theme.spacing(2),
    width: '100%'
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  }
}));

const AlertsHeader: React.FC = () => {
  const classes = useStyles();
  return (
    <Box>
      <form noValidate autoComplete="off">
        <Box>
          <FormControl variant="outlined" className={classes.formControl}>
            <TextField id="outlined-basic" label="Filter" variant="outlined" size="small" />
          </FormControl>
        </Box>
        <Box>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="timeconstraits-native-required">Time Constraint</InputLabel>
            <Select
              native
              value={1}
              label="Time Constraint"
              onChange={event => console.log(event.target.value)}
              name="age"
              inputProps={{
                id: 'timeconstraits-native-required'
              }}
            >
              <option value={1}>None (slow)</option>
              <option value={2}>24 4ours</option>
              <option value={3}>4 Days</option>
              <option value={4}>1 Week</option>
            </Select>
          </FormControl>
        </Box>
        <Box>
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel htmlFor="groupby-native-required">Group By</InputLabel>
            <Select
              native
              value={1}
              label="Group By"
              onChange={event => console.log(event.target.value)}
              name="age"
              inputProps={{
                id: 'groupby-native-required'
              }}
            >
              <option value={1}>file.sha256</option>
              <option value={2}>file.md5</option>
              <option value={3}>file.name</option>
              <option value={4}>file.sha1</option>
              <option value={5}>priority</option>
              <option value={6}>status</option>
            </Select>
          </FormControl>
        </Box>
      </form>
      <Box mt={2}>
        <Typography>Status</Typography>
        <Divider />
      </Box>
      <Box mt={2}>
        <Typography>Priority</Typography>
        <Divider />
      </Box>
      <Box mt={2}>
        <Typography>Labels</Typography>
        <Divider />
      </Box>
      <Box mt={2}>
        <Typography>Personal Filters</Typography>
        <Divider />
      </Box>
      <Box mt={2}>
        <Typography>Global Filters</Typography>
        <Divider />
      </Box>
    </Box>
  );
};

export default AlertsHeader;
