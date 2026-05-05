import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, styled, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { memo, useState } from 'react';

//*****************************************************************************************
// SectionContainer
//*****************************************************************************************

const Container = styled('div', {
  shouldForwardProp: prop => prop !== 'clickable'
})<{ clickable?: boolean }>(({ theme, clickable }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: 'inherit',
  gap: theme.spacing(1),
  ...(clickable && {
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover>span, &:focus>span': {
      color: theme.palette.text.secondary
    }
  })
}));

Container.displayName = 'Container';

const Spacer = styled('div', {
  shouldForwardProp: prop => prop !== 'variant'
})<{ variant?: 'default' | 'flex' }>(({ theme, variant }) => ({
  paddingBottom: theme.spacing(2),
  paddingTop: theme.spacing(2),
  ...(variant === 'flex' && {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  })
}));

Spacer.displayName = 'Spacer';

/** Props for SectionContainer. */
export type SectionContainerProps = {
  /** Section content. */
  children?: ReactNode;
  /** Whether the section starts collapsed. */
  closed?: boolean;
  /** Whether collapsing is disabled. */
  nocollapse?: boolean;
  /** Slot props for inner elements. */
  slotProps?: {
    wrapper?: React.HTMLProps<HTMLDivElement>;
  };
  /** Named slots for additional content. */
  slots?: {
    end?: ReactNode;
  };
  /** Section title. */
  title?: string;
  /** Layout variant. */
  variant?: 'default' | 'flex';
};

export const SectionContainer = memo(
  ({
    children = null,
    closed = false,
    nocollapse = false,
    slotProps = { wrapper: null },
    slots = { end: null },
    title = null,
    variant = 'default'
  }: SectionContainerProps) => {
    const [open, setOpen] = useState<boolean>(!closed);
    const [render, setRender] = useState<boolean>(!closed);

    return (
      <Spacer variant={variant}>
        <Container clickable={!nocollapse} onClick={() => (!nocollapse ? setOpen(o => !o) : null)}>
          <Typography variant="h6">{title}</Typography>
          <div style={{ flex: 1 }} />
          {slots?.end}
          <div style={{ display: 'grid', placeItems: 'center' }}>
            {nocollapse ? null : open ? <ExpandLess /> : <ExpandMore />}
          </div>
        </Container>
        <Divider />
        <Collapse
          in={open}
          timeout="auto"
          onEnter={() => setRender(true)}
          sx={{
            ...(variant === 'flex' && {
              '&.MuiCollapse-root': { display: 'flex', flexDirection: 'column', flex: 1 },
              '& .MuiCollapse-wrapper': { display: 'flex', flexDirection: 'column', flex: 1 },
              '& .MuiCollapse-wrapperInner': { display: 'flex', flexDirection: 'column', flex: 1 }
            })
          }}
        >
          <Spacer variant={variant} {...(slotProps?.wrapper as Record<string, unknown>)}>
            {render && children}
          </Spacer>
        </Collapse>
      </Spacer>
    );
  }
);

SectionContainer.displayName = 'SectionContainer';
