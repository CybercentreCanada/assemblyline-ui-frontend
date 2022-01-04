import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      paddingTop: theme.spacing(1),
      marginRight: theme.spacing(2)
      // width: '80vw'
    },
    paper: {
      // marginRight: theme.spacing(2)
      // backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 95%)'
    },
    popper: {
      width: '75%',
      maxWidth: '1050px',
      // display: 'inline-block',
      position: 'absolute',
      overflow: 'auto',
      zIndex: 1,
      top: 0,
      left: 0,
      maxHeight: 250,
      // backgroundColor: theme.palette.type === 'dark' ? 'hsl(0, 0%, 10%)' : 'hsl(0, 0%, 95%)',
      boxShadow: theme.shadows[4]
    }
  })
);

export default function MenuListComposition() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const anchorRef = React.useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    // setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div ref={anchorRef} className={classes.root}>
      {/* <Button
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        Toggle Menu Grow
      </Button> */}
      <Popper
        className={classes.popper}
        open={open}
        anchorEl={anchorRef.current}
        placement={'bottom-start'}
        role={undefined}
        transition
        disablePortal
      >
        <Paper className={classes.paper}>
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList className={classes.paper} autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={handleClose}>Logout</MenuItem>
            </MenuList>
          </ClickAwayListener>
        </Paper>

        {/* {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>My account</MenuItem>
                  <MenuItem onClick={handleClose}>Logout</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )} */}
      </Popper>
    </div>
  );
}
