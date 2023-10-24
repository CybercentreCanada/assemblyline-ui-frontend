import { Link as MaterialLink, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useExternalLookup from 'components/hooks/useExternalLookup';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';
import ExternalLinks from './ExternalSearch';

const initialMenuState = {
  mouseX: null,
  mouseY: null
};

const useStyles = makeStyles(theme => ({
  listSubHeaderRoot: {
    lineHeight: '32px'
  },
  link: {
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
  }
}));

type TagProps = {
  category: 'metadata' | 'hash';
  type: string;
  value: string;
  classification?: string | null;
};

const WrappedActionableText: React.FC<TagProps> = ({ category, type, value, classification }) => {
  const [state, setState] = React.useState(initialMenuState);
  const classes = useStyles();

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
            <ActionMenu
              category={category}
              type={type}
              value={value}
              state={state}
              setState={setState}
              classification={classification}
            />
            <MaterialLink className={classes.link} onClick={handleMenuClick} onContextMenu={handleMenuClick}>
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
