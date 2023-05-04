import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { IconButton, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import React, { MouseEventHandler, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignal, useStore } from './ContentWithTOC';
import { Node } from './Node';

const useStyles = makeStyles(theme => ({
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    '&>li>a': {
      color: theme.palette.text.secondary,
      textDecoration: 'none',
      padding: '0px 8px 0px 10px',
      margin: '4px 0px 8px',
      borderLeft: `1px solid transparent`,
      '&:hover': {
        color: theme.palette.text.primary,
        borderLeft: `1px solid ${theme.palette.text.primary}`
      },
      '&:active': {
        color: `${theme.palette.primary.main} !important`,
        borderLeft: `1px solid ${theme.palette.primary.main} !important`
      },
      '&:active:hover': {
        color: `${theme.palette.secondary.main} !important`,
        borderLeft: `1px solid ${theme.palette.secondary.main} !important`
      }
    },
    '&>li>a &>li>a.active': {}
  },
  li: {
    display: 'flex',
    padding: 0,
    margin: 0,
    fontWeight: 500,
    fontSize: '0.8125rem',
    '&:hover>.expand': {
      opacity: 1
    }
  },
  link: {
    flex: 1,
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    padding: '0px 8px 0px 10px',
    margin: '4px 0px 8px',
    borderLeft: `1px solid transparent`,
    '&:hover': {
      color: theme.palette.text.primary,
      borderLeft: `1px solid ${theme.palette.text.primary}`
    },
    '&:active': {
      color: `${theme.palette.primary.main} !important`,
      borderLeft: `1px solid ${theme.palette.primary.main} !important`
    },
    '&:active:hover': {
      color: `${theme.palette.secondary.main} !important`,
      borderLeft: `1px solid ${theme.palette.secondary.main} !important`
    }
  },
  active: {
    '&>a': {
      color: `${theme.palette.primary.main} !important`,
      borderLeft: `1px solid ${theme.palette.primary.main} !important`,
      '&:hover': {
        color: `${theme.palette.secondary.main} !important`,
        borderLeft: `1px solid ${theme.palette.secondary.main} !important`
      }
    }
  },
  expandContainer: {
    opacity: 0,
    '&.visible': {
      opacity: 1
    }
  },
  expandIconButton: {
    transform: 'rotate(90deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
  },
  expanded: {
    transform: 'rotate(0deg)'
  },
  title: {
    flex: 1,
    textDecoration: 'none',
    padding: '0px 8px 0px 0px',
    margin: '4px 0px 8px',
    fontSize: '1.25rem',
    marginLeft: '10px'
  }
}));

export const WrappedSection = () => {
  const translation = useSignal(store => store.translation);
  const { t } = useTranslation(translation);
  const classes = useStyles();
  const nodes = useSignal(store => store.nodes);
  const expandAll = useSignal(store => store.expandAll);
  const titleI18nKey = useSignal(store => store.titleI18nKey);
  const setStore = useStore();

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    setStore(store => ({ expandAll: !store.expandAll }));
  }, [setStore]);

  return (
    <>
      <Typography className={clsx(classes.li)} component="div" variant="body1">
        <div className={classes.title}>{t(titleI18nKey)}</div>
        <div className={clsx('expand', classes.expandContainer, expandAll && 'visible')}>
          <IconButton
            className={clsx(classes.expandIconButton, expandAll && classes.expanded)}
            size="small"
            onClick={handleClick}
          >
            <ExpandMoreIcon fontSize="inherit" />
          </IconButton>
        </div>
      </Typography>
      <Typography component="ul" className={classes.ul} variant="body1">
        {nodes.map((_, i) => (
          <Node key={`${nodes[i].anchorHash}`} path={[i]} depth={0} />
        ))}
      </Typography>
    </>
  );
};

export const Section = React.memo(WrappedSection);
export default Section;
