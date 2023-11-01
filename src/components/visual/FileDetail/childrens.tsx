import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { AlertTitle, Collapse, Divider, Skeleton, Typography, useTheme } from '@mui/material';
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

type ChildrenSectionProps = {
  childrens: any;
  show?: boolean;
  title?: string;
};

const WrappedChildrenSection: React.FC<ChildrenSectionProps> = ({ childrens, show = false, title = null }) => {
  const { t } = useTranslation(['fileDetail', 'archive']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return show || (childrens && childrens.length !== 0) ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography variant="h6" onClick={() => setOpen(!open)} className={classes.title}>
        <span>{title ?? t('childrens')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {!childrens ? (
            <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
          ) : childrens.length === 0 ? (
            <div style={{ width: '100%' }}>
              <InformativeAlert>
                <AlertTitle>{t('no_children_title', { ns: 'archive' })}</AlertTitle>
                {t('no_children_desc', { ns: 'archive' })}
              </InformativeAlert>
            </div>
          ) : (
            childrens?.map((fileItem, i) => (
              <Link
                key={i}
                className={classes.clickable}
                to={`/file/detail/${fileItem.sha256}?name=${encodeURI(fileItem.name)}`}
                style={{ wordBreak: 'break-word' }}
              >
                <span>{fileItem.name}</span>
                <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${fileItem.sha256}`}</span>
              </Link>
            ))
          )}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ChildrenSection = React.memo(WrappedChildrenSection);
export default ChildrenSection;
