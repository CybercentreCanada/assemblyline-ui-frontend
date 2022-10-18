import { Collapse, Divider, makeStyles, Typography, useTheme } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  clickable: {
    color: 'inherit',
    display: 'block',
    textDecoration: 'none',
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

  return parents && parents.length !== 0 ? (
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
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {parents.map((resultKey, i) => {
            const [parentSHA256, service] = resultKey.split('.', 2);
            return (
              <Link
                key={i}
                className={classes.clickable}
                to={`/file/detail/${parentSHA256}`}
                style={{ wordBreak: 'break-word' }}
              >
                <span>{parentSHA256}</span>
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${service}`}</span>
              </Link>
            );
          })}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ParentSection = React.memo(WrappedParentSection);
export default ParentSection;
