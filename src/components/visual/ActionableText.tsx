import { Link as MaterialLink, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { useCallback } from 'react';
import ActionMenu from './ActionMenu';
import ExternalLinks from './ExternalLookup/ExternalLinks';
import { useSearchTagExternal } from './ExternalLookup/useExternalLookup';

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
    color: 'inherit',
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

  const { lookupState, isActionable, searchTagExternal } = useSearchTagExternal({
    [type]: {
      results: {},
      errors: {},
      success: null
    }
  });

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
              searchTagExternal={searchTagExternal}
            />
            <MaterialLink className={classes.link} onClick={handleMenuClick} onContextMenu={handleMenuClick}>
              {value}
              {lookupState && lookupState[type] ? (
                <ExternalLinks
                  success={lookupState[type].success}
                  results={lookupState[type].results}
                  errors={lookupState[type].errors}
                  iconStyle={{ marginRight: '-3px', marginLeft: '3px', height: '20px', verticalAlign: 'text-bottom' }}
                />
              ) : null}
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
