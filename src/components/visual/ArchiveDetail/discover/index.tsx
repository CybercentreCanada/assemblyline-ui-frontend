import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import { File } from 'components/visual/ArchiveDetail';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiscoverFile from './file';

export * from './file';
export * from './item';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  sp2: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover, &:focus': {
      color: theme.palette.text.secondary
    }
  },
  labels: {
    display: 'flex',
    alignItems: 'center'
  }
}));

type SectionProps = {
  file: File;
};

const WrappedDiscoverSection: React.FC<SectionProps> = ({ file }) => {
  const { t } = useTranslation(['fileDetail']);
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(true);

  return file ? (
    <div className={classes.sp2}>
      <Typography className={classes.title} variant="h6" onClick={() => setOpen(!open)}>
        <span>{t('discover')}</span>
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Divider />
      <Collapse in={open} timeout="auto">
        <div className={clsx(classes.sp2, classes.container)}>
          <DiscoverFile sha256={file.file_info.sha256} />
        </div>
      </Collapse>
    </div>
  ) : null;
};

export const DiscoverSection = React.memo(WrappedDiscoverSection);
export default DiscoverSection;
