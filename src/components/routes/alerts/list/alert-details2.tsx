import { Box, Chip, Grid, Link, makeStyles, Paper, Typography, useTheme, withStyles } from '@material-ui/core';
import ClipboardIcon from '@material-ui/icons/AssignmentReturned';
import useClipboard from 'components/hooks/useClipboard';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertItem } from '../alerts';


const useStyles = makeStyles(theme => ({
 container: {
   fontSize: 'small'
 }
}));

type AlertDetailsProps = {
  item: AlertItem;
};

const AlertDetails = ({ item }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <Grid container spacing={1} className={classes.container}>

      testing
    </Grid>
  );
};


export default AlertDetails;
