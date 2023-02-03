import { Collapse, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
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

type ChildrenSectionProps = {
  childrens: any;
};

const WrappedChildrenSection: React.FC<ChildrenSectionProps> = ({ childrens }) => {
  const { t } = useTranslation(['fileDetail']);
  const [open, setOpen] = React.useState(true);
  const theme = useTheme();
  const classes = useStyles();
  const sp2 = theme.spacing(2);

  return childrens && childrens.length !== 0 ? (
    <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
      <Typography
        variant="h6"
        onClick={() => {
          setOpen(!open);
        }}
        className={classes.title}
      >
        {t('childrens')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
          {childrens.map((fileItem, i) => (
            <Link
              key={i}
              className={classes.clickable}
              to={`/file/detail/${fileItem.sha256}?name=${encodeURI(fileItem.name)}`}
              style={{ wordBreak: 'break-word' }}
            >
              <span>{fileItem.name}</span>
              <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${fileItem.sha256}`}</span>
            </Link>
          ))}
        </div>
      </Collapse>
    </div>
  ) : null;
};

const ChildrenSection = React.memo(WrappedChildrenSection);
export default ChildrenSection;
