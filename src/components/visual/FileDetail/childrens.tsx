import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { AlertTitle, IconButton, Skeleton, Tooltip, Typography, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import InformativeAlert from 'components/visual/InformativeAlert';
import SectionContainer from 'components/visual/SectionContainer';
import 'moment/locale/fr';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  clickable: {
    color: 'inherit',
    display: 'block',
    textDecoration: 'none',
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.action.hover
    }
  }
}));

type ChildrenSectionProps = {
  childrens: any;
  show?: boolean;
  title?: string;
  nocollapse?: boolean;
};

const WrappedChildrenSection: React.FC<ChildrenSectionProps> = ({
  childrens,
  show = false,
  title = null,
  nocollapse = false
}) => {
  const { t: tDefault } = useTranslation();
  const { t } = useTranslation(['fileDetail', 'archive']);
  const theme = useTheme();
  const classes = useStyles();

  const [showExtra, setShowExtra] = useState<boolean>(false);

  const filteredChildren = useMemo(
    () => (!childrens || childrens.length === 0 || showExtra ? childrens : childrens.filter((fileItem, i) => i < 10)),
    [childrens, showExtra]
  );

  return show || (childrens && childrens.length !== 0) ? (
    <SectionContainer
      title={title ?? t('childrens')}
      nocollapse={nocollapse}
      slots={{
        end: childrens && childrens?.length > 0 && (
          <Typography
            color="secondary"
            variant="subtitle1"
            children={`${childrens?.length} ${t(childrens?.length === 1 ? 'file' : 'files', { ns: 'fileDetail' })}`}
            sx={{ fontStyle: 'italic' }}
          />
        )
      }}
    >
      {!childrens ? (
        <Skeleton variant="rectangular" style={{ height: '6rem', borderRadius: '4px' }} />
      ) : childrens.length === 0 ? (
        <div style={{ width: '100%' }}>
          <InformativeAlert>
            <AlertTitle>{t('no_children_title', { ns: 'archive' })}</AlertTitle>
            {t('no_children_desc', { ns: 'archive' })}
          </InformativeAlert>
        </div>
      ) : (
        <>
          {filteredChildren?.map((fileItem, i) => (
            <Link
              key={i}
              className={classes.clickable}
              to={`/file/detail/${fileItem.sha256}?name=${encodeURI(fileItem.name)}`}
              style={{ wordBreak: 'break-word' }}
            >
              <span>{fileItem.name}</span>
              <span style={{ fontSize: '80%', color: theme.palette.text.secondary }}>{` :: ${fileItem.sha256}`}</span>
            </Link>
          ))}
          {!showExtra && childrens.length > 10 && (
            <Tooltip title={tDefault('more')}>
              <IconButton size="small" onClick={() => setShowExtra(true)} style={{ padding: 0 }}>
                <MoreHorizOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </SectionContainer>
  ) : null;
};

const ChildrenSection = React.memo(WrappedChildrenSection);
export default ChildrenSection;
