import { styled, useTheme } from '@mui/material';
import { useAppPreferenceStore } from 'core/preference';
import { AppLink } from 'core/router';
import { useAppHashParams } from 'core/routes';
import useALContext from 'deprecated/hooks/useALContext';
import type { ReactNode } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ToCBar = styled('div')(({ theme }) => ({
  display: 'none',
  paddingLeft: '16px',
  [theme.breakpoints.up('md')]: {
    display: 'block'
  }
}));

const ToC = styled('ul')(({ theme }) => ({
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
}));

const Top = styled('div')(({ theme }) => ({
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
}));

export type ContentWithTOCItemDef = {
  id: string;
  subItems?: ContentWithTOCItemDef[];
  is_admin?: boolean;
};

export type ContentWithTOCItemProps = {
  translation: string;
  item: ContentWithTOCItemDef;
};

const ContentWithTOCItem: React.FC<ContentWithTOCItemProps> = ({ translation, item }) => {
  const { t } = useTranslation([translation]);
  const hashFragment = useAppHashParams();
  const { user: currentUser } = useALContext();

  const active = useMemo(
    () => (hashFragment && hashFragment.startsWith(item.id) ? 'active' : null),
    [hashFragment, item.id]
  );

  return (
    (!item.is_admin || (currentUser.is_admin && item.is_admin)) && (
      <>
        <li className={active}>
          <AppLink nav={nav => nav.here().update(s => ({ ...s, hash: item.id }) as never)} target="_self">
            {t(item.id)}
          </AppLink>
        </li>
        {active && item.subItems && (
          <ToC style={{ fontSize: 'smaller', paddingInlineStart: '8px' }}>
            {item.subItems.map(itm => (
              <ContentWithTOCItem key={itm.id} item={itm} translation={translation} />
            ))}
          </ToC>
        )}
      </>
    )
  );
};

type ContentWithTOCProps = {
  children: ReactNode;
  translation: string;
  items: ContentWithTOCItemDef[];
  titleI18nKey?: string;
  topI18nKey?: string;
};

const WrappedContentWithTOC: React.FC<ContentWithTOCProps> = ({
  children,
  translation,
  items,
  titleI18nKey = 'toc',
  topI18nKey = 'top'
}) => {
  const autoHideAppbar = useAppPreferenceStore(s => s?.template?.autoHideAppbar);
  const currentLayout = useAppPreferenceStore(s => s?.template?.layout);
  const theme = useTheme();
  const hash = useAppHashParams();
  const { t } = useTranslation([translation]);

  useEffect(() => {
    if (hash && hash !== '') {
      const scrollElement = document.getElementById(hash);
      if (scrollElement) {
        // If element exists already, use native scrollIntoView.
        scrollElement.scrollIntoView(true);
      } else {
        // eslint-disable-next-line no-console
        console.log('[WARN] Trying to scroll to unknown ID:', hash);
      }
    }
  }, [hash]);

  return (
    <div id="top" style={{ display: 'flex' }}>
      <div id="content">{children}</div>
      <ToCBar id="toc">
        <div
          style={{
            position: 'sticky',
            top: theme.spacing(autoHideAppbar && currentLayout !== 'top' ? 5 : 13)
          }}
        >
          {useMemo(
            () => (
              <>
                {titleI18nKey && <div style={{ fontSize: '1.25rem', marginLeft: '18px' }}>{t(titleI18nKey)}</div>}
                <ToC>
                  {items &&
                    items.map(item => <ContentWithTOCItem key={item.id} item={item} translation={translation} />)}
                  {topI18nKey && (
                    <Top>
                      <AppLink nav={nav => nav.here().update(s => ({ ...s, hash: 'top' }) as never)} target="_self">
                        {t(topI18nKey)}
                      </AppLink>
                    </Top>
                  )}
                </ToC>
              </>
            ),
            [items, t, titleI18nKey, topI18nKey, translation]
          )}
        </div>
      </ToCBar>
    </div>
  );
};

const ContentWithTOC = React.memo(WrappedContentWithTOC);
export default ContentWithTOC;
