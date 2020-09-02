import { Box, IconButton, makeStyles, TextField } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FilterListIcon from '@material-ui/icons/FilterList';
import React from 'react';

const useStyles = makeStyles(theme => ({
  header: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
    '& button': {
      marginRight: theme.spacing(1)
    }
  }
}));

type AlertsHeaderProps = {
  onFilterBtnClick: () => void;
  onExpandBtnClick: () => void;
};

//
const AlertsHeader: React.FC<AlertsHeaderProps> = ({ onFilterBtnClick, onExpandBtnClick }) => {
  const classes = useStyles();
  return (
    <Box display="flex" flexDirection="row" className={classes.header} alignItems="center">
      <Box flex={1}>
        <TextField placeholder="Filter..." fullWidth color="secondary" InputProps={{ disableUnderline: true }} />
      </Box>
      <IconButton onClick={onFilterBtnClick} edge="end" color="primary">
        <FilterListIcon />
      </IconButton>
      <IconButton onClick={onExpandBtnClick} edge="end" color="primary">
        <ExpandMoreIcon />
      </IconButton>
    </Box>
  );
};
export default AlertsHeader;
