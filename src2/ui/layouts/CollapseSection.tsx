import { Collapse } from '@mui/material';
import type { Dispatch, HTMLAttributes, ReactNode, SetStateAction } from 'react';
import { memo, useState } from 'react';

export type CollapseSectionProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  closed?: boolean;
  header: (props: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) => ReactNode;
  preventRender?: boolean;
};

export const CollapseSection = memo(
  ({ children = null, closed = false, header = () => null, preventRender = false, ...props }: CollapseSectionProps) => {
    const [open, setOpen] = useState<boolean>(!closed);
    const [render, setRender] = useState<boolean>(!closed);

    return preventRender ? null : (
      <div {...props}>
        {header({ open, setOpen })}
        <Collapse
          in={open}
          timeout="auto"
          onEnter={() => setRender(true)}
          sx={{
            '&.MuiCollapse-root': { display: 'flex', flexDirection: 'column', flex: 1 },
            '& .MuiCollapse-wrapper': { display: 'flex', flexDirection: 'column', flex: 1 },
            '& .MuiCollapse-wrapperInner': { display: 'flex', flexDirection: 'column', flex: 1 }
          }}
        >
          {render && children}
        </Collapse>
      </div>
    );
  }
);

CollapseSection.displayName = 'CollapseSection';
