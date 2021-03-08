import { makeStyles, useTheme } from '@material-ui/core';
import useAppLayout from 'commons/components/hooks/useAppLayout';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const ContentWithTOCItem: React.FC<ContentWithTOCItemProps> = ({ name, id, subItems = [] }) => {
  const { autoHideAppbar, currentLayout } = useAppLayout();
  const classes = useStyles(autoHideAppbar && currentLayout !== 'top');
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
            return <ContentWithTOCItem key={item.id} name={item.name} id={item.id} />;
          })}
        </ul>
      )}
    </>
  );
};

type ContentWithTOCItemProps = {
  name: string;
  id: string;
  subItems?: ContentWithTOCItemProps[];
};

type ContentWithTOCProps = {
  children: ReactNode;
  title?: string;
  top?: ContentWithTOCItemProps;
};

const WrappedContentWithTOC: React.FC<ContentWithTOCProps> = ({ children }) => {
  const { autoHideAppbar, currentLayout } = useAppLayout();
  const theme = useTheme();
  const classes = useStyles();
  const location = useLocation();
  const { t } = useTranslation(['helpSearch']);
  const [items, setItems] = useState<ContentWithTOCItemProps[]>(null);
  const [top, setTop] = useState<ContentWithTOCItemProps>(null);

  useEffect(() => {
    setItems([
      { name: t('overview'), id: 'overview' },
      { name: t('basic'), id: 'basic' },
      {
        name: t('fields.toc'),
        id: 'fields',
        subItems: [
          { name: t('fields.idx_alert.toc'), id: 'fields.idx_alert' },
          { name: t('fields.idx_file.toc'), id: 'fields.idx_file' },
          { name: t('fields.idx_heuristic.toc'), id: 'fields.idx_heuristic' },
          { name: t('fields.idx_result.toc'), id: 'fields.idx_result' },
          { name: t('fields.idx_signature.toc'), id: 'fields.idx_signature' },
          { name: t('fields.idx_submission.toc'), id: 'fields.idx_submission' },
          { name: t('fields.idx_workflow.toc'), id: 'fields.idx_workflow' }
        ]
      },
      { name: t('wildcard'), id: 'wildcard' },
      {
        name: t('regex'),
        id: 'regex',
        subItems: [
          { name: t('regex.anchoring'), id: 'regex.anchoring' },
          { name: t('regex.chars'), id: 'regex.chars' },
          { name: t('regex.any'), id: 'regex.any' },
          { name: t('regex.oneplus'), id: 'regex.oneplus' },
          { name: t('regex.zeroplus'), id: 'regex.zeroplus' },
          { name: t('regex.zeroone'), id: 'regex.zeroone' },
          { name: t('regex.minmax'), id: 'regex.minmax' },
          { name: t('regex.grouping'), id: 'regex.grouping' },
          { name: t('regex.alternation'), id: 'regex.alternation' },
          { name: t('regex.class'), id: 'regex.class' }
        ]
      },
      { name: t('fuzziness'), id: 'fuzziness' },
      { name: t('proximity'), id: 'proximity' },
      { name: t('ranges'), id: 'ranges', subItems: [{ name: t('ranges.datemath'), id: 'ranges.datemath' }] },
      { name: t('operator'), id: 'operator' },
      { name: t('grouping'), id: 'grouping' },
      { name: t('reserved'), id: 'reserved' }
    ]);
    setTop({ name: t('top'), id: 'title' });
  }, [t]);

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
        <div
          style={{
            position: 'sticky',
            top: theme.spacing(autoHideAppbar && currentLayout !== 'top' ? 4 : 12)
          }}
        >
          {useMemo(() => {
            return (
              <>
                <div style={{ fontSize: '1.25rem', marginLeft: '18px' }}>{t('toc')}</div>
                <ul className={classes.toc}>
                  {items &&
                    items.map(item => {
                      return (
                        <ContentWithTOCItem key={item.id} name={item.name} id={item.id} subItems={item.subItems} />
                      );
                    })}
                  {top && (
                    <div className={classes.top}>
                      <Link to={`#${top.id}`} target="_self">
                        {top.name}
                      </Link>
                    </div>
                  )}
                </ul>
              </>
            );
          }, [classes.toc, classes.top, items, t, top])}
        </div>
      </div>
    </div>
  );
};

const ContentWithTOC = React.memo(WrappedContentWithTOC);
export default ContentWithTOC;
