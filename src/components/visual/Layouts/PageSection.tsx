import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { SvgIconProps, TypographyProps } from '@mui/material';
import { Button, Collapse, Divider, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import type { CSSProperties } from 'react';
import React, { useEffect, useRef, useState } from 'react';

interface ExpandMoreProps extends SvgIconProps {
  expand: boolean;
}

const ExpandMore = styled(({ expand = false, ...other }: ExpandMoreProps) => {
  return <KeyboardArrowDownIcon {...other} />;
})(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  }),
  variants: [
    { props: ({ expand }) => !expand, style: { transform: 'rotate(0deg)' } },
    { props: ({ expand }) => !!expand, style: { transform: 'rotate(180deg)' } }
  ]
}));

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  container: {
    position: 'relative',
    width: '100%',
    minHeight: 'auto'
  },
  button: {
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0 0`,
    justifyContent: 'flex-start',
    paddingBottom: 0,
    paddingLeft: 0,
    paddingTop: 0
  },
  titles: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  endAdornment: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center'
  },
  spacer: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },

  flex: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  }
}));

export type PageSectionProps = {
  children?: React.ReactNode;
  closedInitially?: boolean;
  collapsible?: boolean;
  divider?: boolean;
  endAdornment?: React.ReactNode;
  flex?: boolean;
  open?: boolean;
  primary: React.ReactNode;
  primaryProps?: TypographyProps;
  secondary?: React.ReactNode;
  secondaryProps?: TypographyProps;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
  onChange?: (value: boolean) => void;
};

export const PageSection: React.FC<PageSectionProps> = React.memo(
  ({
    children = null,
    closedInitially = false,
    collapsible = false,
    divider = false,
    endAdornment = null,
    flex = false,
    open: openProp = null,
    primary = null,
    primaryProps = null,
    secondary = null,
    secondaryProps = null,
    wrapperProps = null,
    onChange = () => null
  }: PageSectionProps) => {
    const theme = useTheme();
    const classes = useStyles();

    const [open, setOpen] = useState<boolean>(!closedInitially);
    const [render, setRender] = useState<boolean>(!closedInitially);
    const [width, setWidth] = useState<CSSProperties['width']>(0);

    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!endAdornment) return;
      const element = endRef.current;

      function handleResize() {
        setWidth(`${element?.getBoundingClientRect()?.width}px`);
      }

      element.addEventListener('resize', handleResize);
      handleResize();
      return () => element.removeEventListener('resize', handleResize);
    }, [endAdornment]);

    return (
      <div className={classes.root}>
        <div className={classes.container}>
          <Button
            className={classes.button}
            color="inherit"
            fullWidth
            disabled={!collapsible}
            onClick={() => (openProp !== null ? onChange(!openProp) : setOpen(o => !o))}
          >
            <div className={classes.titles}>
              <Typography
                color="textPrimary"
                overflow="hidden"
                textAlign="start"
                textOverflow="ellipsis"
                textTransform="initial"
                variant="h6"
                whiteSpace="nowrap"
                width="100%"
                sx={{ ...(!collapsible && { cursor: 'text', userSelect: 'initial' }), ...primaryProps?.sx }}
                {...primaryProps}
              >
                {primary}
              </Typography>

              <Typography
                color="textSecondary"
                component="div"
                overflow="hidden"
                textAlign="start"
                textOverflow="ellipsis"
                textTransform="initial"
                variant="caption"
                whiteSpace="nowrap"
                width="100%"
                sx={{ ...(!collapsible && { cursor: 'text', userSelect: 'initial' }), ...secondaryProps?.sx }}
                {...secondaryProps}
              >
                {secondary}
              </Typography>
            </div>

            {!collapsible ? null : <ExpandMore expand={openProp !== null ? openProp : open} />}
            {!endAdornment ? null : <div style={{ width: width }} />}
          </Button>
          {!endAdornment ? null : (
            <div className={classes.endAdornment} ref={endRef}>
              {endAdornment}
            </div>
          )}
        </div>

        {!divider ? null : <Divider />}

        {collapsible ? (
          <Collapse
            in={openProp !== null ? openProp : open}
            timeout="auto"
            onEnter={() => setRender(true)}
            sx={{
              ...(flex && {
                '&.MuiCollapse-root': { display: 'flex', flexDirection: 'column', flex: 1 },
                '& .MuiCollapse-wrapper': { display: 'flex', flexDirection: 'column', flex: 1 },
                '& .MuiCollapse-wrapperInner': { display: 'flex', flexDirection: 'column', flex: 1 }
              })
            }}
          >
            <div className={clsx(classes.spacer, flex && classes.flex)} {...wrapperProps}>
              {render && children}
            </div>
          </Collapse>
        ) : (
          <div className={clsx(classes.spacer, flex && classes.flex)} {...wrapperProps}>
            {render && children}
          </div>
        )}
      </div>
    );
  }
);
