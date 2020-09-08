import { Box, Collapse, makeStyles, Typography, useMediaQuery, useTheme } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Skeleton from '@material-ui/lab/Skeleton';
import clsx from 'clsx';
import useMyAPI from 'components/hooks/useMyAPI';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const apiHeight = '48px';
const useStyles = makeStyles(theme => ({
  blueprint: {
    minHeight: apiHeight,
    alignItems: 'center',
    borderColor: theme.palette.action.disabledBackground,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  },
  blueprintSkel: {
    minHeight: apiHeight,
    alignItems: 'center',
    borderColor: theme.palette.action.disabledBackground
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: theme.spacing(2),
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: 'rotate(180deg)'
  }
}));

export default function ApiDoc() {
  const apiCall = useMyAPI();
  const [apiList, setApiList] = useState(null);
  const [apiSelected, setApiSelected] = useState(null);
  const [apiDefinition, setApiDefinition] = useState(null);
  const classes = useStyles();
  const [expandMap, setExpandMap] = useState({});
  const theme = useTheme();
  const { t } = useTranslation();

  const downSM = useMediaQuery(theme.breakpoints.down('sm'));
  const darkBCRed = '#543838';
  const isDark = theme.palette.type === 'dark';

  function toggleBlueprintExpand(bp) {
    const newValue = {};
    newValue[bp] = !expandMap[bp];
    setExpandMap({ ...expandMap, ...newValue });
  }

  useEffect(() => {
    if (apiList) {
      apiCall({
        url: `/api/${apiSelected}/`,
        onSuccess: api_data => {
          setApiDefinition(api_data.api_response);
          const newMap = {};
          Object.keys(api_data.api_response.blueprints).forEach(key => {
            newMap[key] = false;
          });
          setExpandMap(newMap);
        }
      });
    } else {
      apiCall({
        url: '/api/',
        onSuccess: api_data => {
          setApiList(api_data.api_response);
          setApiSelected(api_data.api_response[0]);
        }
      });
    }
    // eslint-disable-next-line
  }, [apiSelected]);

  return apiDefinition ? (
    <Box display="flex" flexDirection="column">
      {Object.keys(apiDefinition.blueprints).map((bp, i) => {
        return (
          <Box>
            <Box
              display="flex"
              flexDirection="row"
              flexWrap="wrap"
              className={classes.blueprint}
              borderBottom={1}
              px={1}
              onClick={() => toggleBlueprintExpand(bp)}
            >
              <Typography variant="body2" color="textSecondary" style={{ fontWeight: 800 }}>
                {`/api/${apiSelected}/`}&nbsp;
              </Typography>
              <Box flexGrow={1}>
                <Typography variant="h6" style={{ fontWeight: 800 }} color="secondary">
                  {bp}
                </Typography>
              </Box>
              <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
                <Typography variant="body2" color="textSecondary">
                  {apiDefinition.blueprints[bp]}
                </Typography>
                <ExpandMoreIcon
                  className={clsx(classes.expand, {
                    [classes.expandOpen]: expandMap[bp]
                  })}
                />
              </Box>
            </Box>
            <Collapse in={expandMap[bp]} timeout="auto" unmountOnExit>
              <Box py={2}>{bp}</Box>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  ) : (
    <Box display="flex" flexDirection="column">
      {[...Array(21)].map((_, i) => {
        return (
          <Box
            display="flex"
            flexDirection="row"
            flexWrap="wrap"
            className={classes.blueprintSkel}
            borderBottom={1}
            px={1}
          >
            <Typography variant="body2" style={{ paddingRight: '8px' }}>
              <Skeleton width="2rem" />
            </Typography>
            <Box flexGrow={1}>
              <Typography variant="h6">
                <Skeleton width="12rem" />
              </Typography>
            </Box>
            <Box display="inline-flex" width={downSM ? '100%' : null} justifyContent="flex-end">
              <Typography variant="body2" style={{ paddingRight: '16px' }}>
                <Skeleton width="14rem" />
              </Typography>
              <Skeleton width="1rem" />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
