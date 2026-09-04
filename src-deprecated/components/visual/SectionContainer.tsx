import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Collapse, Divider, styled, Typography } from '@mui/material';
import React, { useState } from 'react';

/**
 * TODO: change to PageSection
 */

type ContainerProps = {
  clickable?: boolean;
};

const Container = styled('div', {
  shouldForwardProp: prop => prop !== 'clickable'
})<ContainerProps>(({ theme, clickable }) => ({
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

type SpacerProps = {
  variant?: 'default' | 'flex';
};

const Spacer = styled('div', {
  shouldForwardProp: prop => prop !== 'variant'
})<SpacerProps>(({ theme, variant }) => ({
  paddingBottom: theme.spacing(2),
  paddingTop: theme.spacing(2),

  ...(variant === 'flex' && {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  })
}));

type SectionContainerProps = {
  children?: React.ReactNode;
  title?: string;
  nocollapse?: boolean;
  closed?: boolean;
  variant?: 'default' | 'flex';
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
  variant = 'default',
  slots = { end: null },
  slotProps = { wrapper: null }
}) => {
  const [open, setOpen] = useState<boolean>(!closed);
  const [render, setRender] = useState<boolean>(!closed);

  return (
    <Spacer variant={variant}>
      <Container clickable={!nocollapse} onClick={() => (nocollapse ? null : setOpen(o => !o))}>
        <Typography variant="h6" children={title} />
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
        <Spacer variant={variant} {...(slotProps?.wrapper as any)}>
          {render && children}
        </Spacer>
      </Collapse>
    </Spacer>
  );
};

const SectionContainer = React.memo(WrappedSectionContainer);
export default SectionContainer;
