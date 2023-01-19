import SearchIcon from '@mui/icons-material/Search';
import { alpha, InputBase } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const useStyles = breadcrumbsEnabled =>
  makeStyles(theme => ({
    search: {
      flexGrow: 1,
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.text.primary, 0.04),
      '&:hover': {
        backgroundColor: alpha(theme.palette.text.primary, 0.06)
      },
      marginRight: theme.spacing(2),
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: 'auto'
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: breadcrumbsEnabled ? 300 : 'inherit'
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
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '100%'
    }
  }))();

const QuickSearch = () => {
  const { t } = useTranslation();
  const { layoutProps, breadcrumbsEnabled } = useAppLayout();
  const classes = useStyles(layoutProps.allowBreadcrumbs && breadcrumbsEnabled);
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const uri = layoutProps.topnav.quickSearchURI ? layoutProps.topnav.quickSearchURI : '/search/';
  const param = layoutProps.topnav.quickSearchParam ? layoutProps.topnav.quickSearchParam : 'q';

  const submit = event => {
    event.preventDefault();
    navigate(`${uri}?${param}=${encodeURIComponent(value)}`);
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
