import { fade, InputBase, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

const useStyles = (layout, open, breadcrumbsEnabled) => {
  return makeStyles(theme => ({
    search: {
      flexGrow: 1,
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.text.primary, 0.04),
      '&:hover': {
        backgroundColor: fade(theme.palette.text.primary, 0.06)
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: layout === 'side' ? theme.spacing(7) : theme.spacing(3),
        width: 'auto'
      },
      [theme.breakpoints.up('md')]: {
        // marginLeft: layout === "side" ? open ? theme.spacing(7) + 240 - 56 : theme.spacing(7) : theme.spacing(3),
        maxWidth: breadcrumbsEnabled ? 300 : 'inherit',
        marginLeft:
          layout === 'side'
            ? open
              ? !breadcrumbsEnabled
                ? theme.spacing(7) + 240 - 56
                : theme.spacing(3)
              : breadcrumbsEnabled
              ? theme.spacing(3)
              : theme.spacing(7)
            : theme.spacing(3)
      }
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit',
      width: '100%'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%'
    }
  }))();
};

const QuickSearch = () => {
  const { t } = useTranslation();
  const { currentLayout, drawerState, layoutProps, breadcrumbsEnabled, breadcrumbsPlacement } = useAppLayout();
  const classes = useStyles(
    currentLayout,
    drawerState,
    layoutProps.allowBreadcrumbs && breadcrumbsEnabled && breadcrumbsPlacement === 'topbar'
  );
  const [value, setValue] = useState('');
  const history = useHistory();

  const uri = layoutProps.topnav.quickSearchURI ? layoutProps.topnav.quickSearchURI : '/search/';
  const param = layoutProps.topnav.quickSearchParam ? layoutProps.topnav.quickSearchParam : 'q';

  const submit = event => {
    event.preventDefault();
    history.push(`${uri}?${param}=${encodeURIComponent(value)}`);
    setValue('');
  };

  return (
    <div className={classes.search}>
      <form autoComplete="off" onSubmit={submit}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          onChange={event => setValue(event.target.value)}
          placeholder={t('quicksearch.placeholder')}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput
          }}
          value={value}
          inputProps={{ 'aria-label': t('quicksearch.aria') }}
        />
      </form>
    </div>
  );
};

export default QuickSearch;
