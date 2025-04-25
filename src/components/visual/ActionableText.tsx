import { Link as MaterialLink, Skeleton, useTheme } from '@mui/material';
import useExternalLookup from 'components/hooks/useExternalLookup';
import ActionMenu from 'components/visual/ActionMenu';
import ExternalLinks from 'components/visual/ExternalSearch';
import React, { useCallback } from 'react';

const initialMenuState = {
  mouseX: null,
  mouseY: null
};

type TagProps = {
  category: 'metadata' | 'hash';
  type: string;
  value: string;
  classification?: string | null;
};

const WrappedActionableText: React.FC<TagProps> = ({ category, type, value, classification }) => {
  const theme = useTheme();

  const [state, setState] = React.useState(initialMenuState);

  const handleMenuClick = useCallback(event => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  }, []);

  const { isActionable } = useExternalLookup();
  const actionable = isActionable(category, type, value);

  return (
    <>
      {value ? (
        actionable ? (
          <>
            {state !== initialMenuState && (
              <ActionMenu
                category={category}
                type={type}
                value={value}
                state={state}
                setState={setState}
                classification={classification}
              />
            )}
            <MaterialLink
              onClick={handleMenuClick}
              onContextMenu={handleMenuClick}
              sx={{
                marginLeft: theme.spacing(-0.5),
                paddingLeft: theme.spacing(0.5),
                borderRadius: theme.spacing(0.5),
                textDecoration: 'none',
                minHeight: '22px',
                color: 'inherit',
                alignItems: 'center',
                display: 'flex',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <div style={{ marginTop: '2px' }}>{value}</div>
              <ExternalLinks category={category} type={type} value={value} />
            </MaterialLink>
          </>
        ) : (
          value
        )
      ) : (
        <Skeleton />
      )}
    </>
  );
};

const ActionableText = React.memo(WrappedActionableText);
export default ActionableText;
