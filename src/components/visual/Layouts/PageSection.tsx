import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { SvgIconProps, TypographyProps } from '@mui/material';
import { Button, Collapse, Divider, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { AnchorProps } from 'components/core/TableOfContent/Anchor';
import { Anchor } from 'components/core/TableOfContent/Anchor';
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

const Root = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1
}));

const Container = styled('div')(() => ({
  position: 'relative',
  width: '100%',
  minHeight: 'auto'
}));

const Titles = styled('div')(() => ({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column'
}));

const EndAdornment = styled('div')(() => ({
  position: 'absolute',
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center'
}));

type SpacerProps = {
  flex?: boolean;
};

const Spacer = styled('div', {
  shouldForwardProp: prop => prop !== 'flex'
})<SpacerProps>(({ theme, flex }) => ({
  paddingBottom: theme.spacing(2),
  paddingTop: theme.spacing(2),

  ...(flex && {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  })
}));

export type PageSectionProps = {
  anchor?: boolean;
  anchorProps?: AnchorProps;
  children?: React.ReactNode;
  closedInitially?: boolean;
  collapsible?: boolean;
  divider?: boolean;
  endAdornment?: React.ReactNode;
  flex?: boolean;
  id?: string;
  open?: boolean;
  primary: React.ReactNode;
  primaryProps?: TypographyProps;
  secondary?: React.ReactNode;
  secondaryProps?: TypographyProps;
  subheader?: boolean;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
  onChange?: (value: boolean) => void;
};

export const PageSection: React.FC<PageSectionProps> = React.memo(
  ({
    anchor = false,
    anchorProps = null,
    children = null,
    closedInitially = false,
    collapsible = false,
    divider = false,
    endAdornment = null,
    flex = false,
    id = null,
    open: openProp = null,
    primary = null,
    primaryProps = null,
    secondary = null,
    secondaryProps = null,
    subheader = false,
    wrapperProps = null,
    onChange = () => null
  }: PageSectionProps) => {
    const theme = useTheme();

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
      <Anchor anchor={id} label={primary} subheader={subheader} disabled={!anchor} {...anchorProps}>
        <Root>
          <Container>
            <Button
              color="inherit"
              fullWidth
              disabled={!collapsible}
              onClick={() => (openProp !== null ? onChange(!openProp) : setOpen(o => !o))}
              sx={{
                borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0 0`,
                justifyContent: 'flex-start',
                paddingBottom: 0,
                paddingLeft: 0,
                paddingTop: 0
              }}
            >
              <Titles>
                <Typography
                  color="textPrimary"
                  overflow="hidden"
                  textAlign="start"
                  textOverflow="ellipsis"
                  textTransform="initial"
                  variant="h6"
                  whiteSpace="nowrap"
                  width="100%"
                  {...(subheader && { variant: 'h5' })}
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
                  variant="body2"
                  whiteSpace="nowrap"
                  width="100%"
                  sx={{ ...(!collapsible && { cursor: 'text', userSelect: 'initial' }), ...secondaryProps?.sx }}
                  {...secondaryProps}
                >
                  {secondary}
                </Typography>
              </Titles>

              {!collapsible ? null : <ExpandMore expand={openProp !== null ? openProp : open} />}
              {!endAdornment ? null : <div style={{ width: width }} />}
            </Button>
            {!endAdornment ? null : <EndAdornment ref={endRef}>{endAdornment}</EndAdornment>}
          </Container>

          {!divider ? null : <Divider />}

          {!children ? null : collapsible ? (
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
              <Spacer flex={flex} {...(wrapperProps as any)}>
                {render && children}
              </Spacer>
            </Collapse>
          ) : (
            <Spacer flex={flex} {...(wrapperProps as any)}>
              {render && children}
            </Spacer>
          )}
        </Root>
      </Anchor>
    );
  }
);
