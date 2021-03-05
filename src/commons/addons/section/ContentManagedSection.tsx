import { makeStyles } from '@material-ui/core';
import React, { ReactNode, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  tocBar: {
    display: 'none',
    paddingLeft: '16px',
    [theme.breakpoints.up('md')]: {
      display: 'block'
    }
  },
  toc: {
    listStyle: 'none',
    paddingInlineStart: 0,
    position: 'sticky',
    top: theme.spacing(10),
    [theme.breakpoints.only('md')]: {
      width: '124px'
    },
    [theme.breakpoints.up('lg')]: {
      width: '164px'
    },
    '& li': {
      color: theme.palette.text.primary,
      marginLeft: theme.spacing(1),
      marginBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1.25),
      paddingRight: theme.spacing(1)
    },
    '& .active': {
      borderLeft: `solid ${theme.palette.primary.main} 2px`,
      paddingLeft: theme.spacing(1),
      color: theme.palette.primary.main
    },
    '& li:hover': {
      borderLeft: `solid ${theme.palette.text.disabled} 1px`,
      paddingLeft: '9px',
      color: theme.palette.text.disabled
    },
    '& li > a': {
      color: 'inherit',
      display: 'block',
      textDecoration: 'none',
      width: '100%'
    }
  },
  top: {
    paddingTop: theme.spacing(2.5),
    marginLeft: theme.spacing(2.25),
    color: theme.palette.text.primary,
    '& a': {
      color: 'inherit',
      display: 'block',
      textDecoration: 'none'
    },
    '& :hover': {
      color: theme.palette.text.disabled
    }
  }
}));

const ContentItem: React.FC<ContentItemProps> = ({ name, id, subItems = [] }) => {
  const classes = useStyles();
  const location = useLocation();
  const currentHash = location.hash && location.hash !== '' ? location.hash.substring(1) : null;
  const active = currentHash && currentHash.startsWith(id) ? 'active' : null;

  return (
    <>
      <li className={active}>
        <Link to={`#${id}`} target="_self">
          {name}
        </Link>
      </li>
      {active && (
        <ul className={classes.toc} style={{ fontSize: 'smaller', paddingInlineStart: '8px' }}>
          {subItems.map(item => {
            return <ContentItem key={item.id} name={item.name} id={item.id} />;
          })}
        </ul>
      )}
    </>
  );
};

type ContentItemProps = {
  name: string;
  id: string;
  subItems?: ContentItemProps[];
};

type ContentManagedSectionProps = {
  children: ReactNode;
  items: ContentItemProps[];
  title?: string;
  top?: ContentItemProps;
};

const WrappedContentManagedSection: React.FC<ContentManagedSectionProps> = ({
  children,
  items,
  title = null,
  top = null
}) => {
  const classes = useStyles();
  const location = useLocation();

  useEffect(() => {
    if (location.hash && location.hash !== '') {
      const scrollElement = document.getElementById(location.hash.substring(1));
      if (scrollElement) {
        // If element exists already, use native scrollIntoView.
        scrollElement.scrollIntoView(true);
      } else {
        // eslint-disable-next-line no-console
        console.log('[WARN] Trying to scroll to unknown ID:', location.hash);
      }
    }
  }, [location.hash]);

  return (
    <div id="top" style={{ display: 'flex' }}>
      <div id="content">{children}</div>
      <div id="toc" className={classes.tocBar}>
        {title && <div style={{ fontSize: '1.25rem', marginLeft: '18px' }}>{title}</div>}
        <ul className={classes.toc}>
          {items.map(item => {
            return <ContentItem key={item.id} name={item.name} id={item.id} subItems={item.subItems} />;
          })}
          {top && (
            <div className={classes.top}>
              <Link to={`#${top.id}`} target="_self">
                {top.name}
              </Link>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

const ContentManagedSection = React.memo(WrappedContentManagedSection);
export default ContentManagedSection;
