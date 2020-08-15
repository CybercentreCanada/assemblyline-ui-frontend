import { Box, Card, makeStyles, Typography } from '@material-ui/core';
import PageFullscreen from 'commons/components/layout/pages/PageFullScreen';
import React from 'react';
import { useTranslation } from 'react-i18next';

function createData(id) {
  return { id };
}

const useStyles = makeStyles(theme => ({
  card: {
    flexGrow: 1,
    minHeight: '175px',
    minWidth: '320px',
    padding: theme.spacing(2),
    margin: theme.spacing(1)
  },
  watermark: {
    color: theme.palette.action.disabledBackground,
    margin: 'auto',
    width: '275px',
    lineHeight: '155px',
    textAlign: 'center'
  }
}));

function Dashboard() {
  const { t } = useTranslation();
  const classes = useStyles();

  const cards = [];
  for (let x = 0; x < 12; x++) {
    cards.push(createData(x + 1));
  }

  return (
    <>
      <PageFullscreen>
        <Typography gutterBottom color="primary" variant="h2" align="center">
          {t('page.dashboard.title')}
        </Typography>
        <Box display="flex" flexDirection="row" flexWrap="wrap" width="100%">
          {cards.map((a, i) => (
            <Card key={i} className={classes.card}>
              <Typography variant="h4" className={classes.watermark}>
                # {a.id}
              </Typography>
            </Card>
          ))}
        </Box>
      </PageFullscreen>
    </>
  );
}

export default Dashboard;
