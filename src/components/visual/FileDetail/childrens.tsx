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

type ChildrenSectionProps = {
  childrens: any;
};

const WrappedChildrenSection: React.FC<ChildrenSectionProps> = ({ childrens }) => {
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
        {t('childrens')}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        {useMemo(
          () => (
            <div style={{ paddingBottom: sp2, paddingTop: sp2 }}>
              {childrens.map((fileItem, i) => (
                <Box
                  key={i}
                  className={classes.clickable}
                  onClick={() => {
                    history.push(`/file/detail/${fileItem.sha256}?name=${encodeURI(fileItem.name)}`);
                  }}
                  style={{ wordBreak: 'break-word' }}
                >
                  <span>{fileItem.name}</span>
                  <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>
                    {` :: ${fileItem.sha256}`}
                  </span>
                </Box>
              ))}
            </div>
          ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [childrens]
        )}
      </Collapse>
    </div>
  );
};

const ChildrenSection = React.memo(WrappedChildrenSection);
export default ChildrenSection;
