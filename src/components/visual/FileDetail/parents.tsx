import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { AlertTitle, Collapse, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import 'moment/locale/fr';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import InformativeAlert from '../InformativeAlert';

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  }
}));

type ParentSectionProps = {
  parents: any;
  title?: string;
  show?: boolean;
};

const WrappedParentSection: React.FC<ParentSectionProps> = ({ parents, title = null, show = false }) => {
  const { t } = useTranslation(['fileDetail', 'archive']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return show || (parents && parents.length !== 0) ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        <span>{title ?? t('parents')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {parents && parents.length !== 0 ? (
            parents?.map((resultKey, i) => {
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
            })
          ) : (
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_parents_title', { ns: 'archive' })}</AlertTitle>
                {t('no_parents_desc', { ns: 'archive' })}
              </InformativeAlert>
            </div>
          )}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ParentSection = React.memo(WrappedParentSection);
export default ParentSection;
