import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import 'moment/locale/fr';
import React, { useState } from 'react';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'inherit',
    gap: theme.spacing(1)
  },
  clickable: {
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover>span, &:focus>span': {
      color: theme.palette.text.secondary
    }
  },
  spacer: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  center: {
    display: 'grid',
    placeItems: 'center'
  }
}));

type SectionContainerProps = {
  children?: React.ReactNode;
  title?: string;
  nocollapse?: boolean;
  closed?: boolean;
  slots?: {
    end?: React.ReactNode;
  };
  slotProps?: {
    wrapper?: React.HTMLProps<HTMLDivElement>;
  };
};

const WrappedSectionContainer: React.FC<SectionContainerProps> = ({
  children = null,
  nocollapse = false,
  closed = false,
  title = null,
  slots = { end: null },
  slotProps = { wrapper: null }
}) => {
  const classes = useStyles();

  const [open, setOpen] = useState<boolean>(!closed);
  const [render, setRender] = useState<boolean>(!closed);

  return (
    <div className={classes.spacer}>
      <div className={clsx(classes.container, !nocollapse && classes.clickable)}>
        <Typography variant="h6" children={title} onClick={() => (nocollapse ? null : setOpen(o => !o))} />
        <div style={{ flex: 1 }} />
        {slots?.end}
        <div className={classes.center}>{nocollapse ? null : open ? <ExpandLess /> : <ExpandMore />}</div>
      </div>
      <Divider />
      <Collapse in={open} timeout="auto" onEnter={() => setRender(true)}>
        <div className={classes.spacer} {...slotProps?.wrapper}>
          {render && children}
        </div>
      </Collapse>
    </div>
  );
};

const SectionContainer = React.memo(WrappedSectionContainer);
export default SectionContainer;
