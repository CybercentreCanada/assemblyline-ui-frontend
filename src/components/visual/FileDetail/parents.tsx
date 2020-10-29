import { Box, Collapse, Divider, makeStyles, Typography, useTheme } from '@material-ui/core';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  clickable: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  },
  title: {
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type ParentSectionProps = {
  parents: any;
};

const WrappedParentSection: React.FC<ParentSectionProps> = ({ parents }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);
  const history = useHistory();

  return (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('parents')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {parents.map((resultKey, i) => {
                const [parentSHA256, service] = resultKey.split('.', 2);
                return (
                  <Box
                    key={i}
                    className={classes.clickable}
                    onClick={() => {
                      history.push(`/file/detail/${parentSHA256}`);
                    }}
                    style={{ wordBreak: 'break-word' }}
                  >
                    <span>{parentSHA256}</span>
                    <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${service}`}</span>
                  </Box>
                );
              })}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [parents]
        )}
      </Collapse>
    </div>
  );
};

const ParentSection = React.memo(WrappedParentSection);
export default ParentSection;
