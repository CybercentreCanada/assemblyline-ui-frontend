import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { Divider, Link as MaterialLink, ListSubheader, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import useALContext from 'components/hooks/useALContext';
import { safeFieldValueURI } from 'helpers/utils';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useSearchTagExternal } from './ExternalLookup/useExternalLookup';

const SEARCH_ICON = <SearchOutlinedIcon style={{ marginRight: '16px' }} />;
const CLIPBOARD_ICON = <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />;
const TRAVEL_EXPLORE_ICON = <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />;
const EXTERNAL_ICON = <HiOutlineExternalLink style={{ marginRight: '16px', fontSize: '22px' }} />;
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

type Coordinates = {
  mouseX: number | null;
  mouseY: number | null;
};

type TagProps = {
  category: 'hash' | 'metadata' | 'tag';
  type: string;
  value: string;
  classification?: string | null;
  state: Coordinates;
  setState: (Coordinates) => void;
  searchTagExternal: (source: any, type: any, value: any, classification: any) => void;
};

const categoryPrefix = {
  metadata: 'metadata.',
  tag: 'result.sections.tags.',
  hash: ''
};

const categoryIndex = {
  metadata: '',
  tag: '/result',
  hash: ''
};

const WrappedActionMenu: React.FC<TagProps> = ({
  category,
  type,
  value,
  classification,
  state,
  setState,
  searchTagExternal
}) => {
  const { t } = useTranslation();
  const { user: currentUser, configuration: currentUserConfig } = useALContext();
  const { copy } = useClipboard();
  const classes = useStyles();

  const { toTitleCase } = useSearchTagExternal({
    [type]: {
      results: {},
      errors: {},
      success: null
    }
  });

  const handleClose = useCallback(() => {
    setState(initialMenuState);
  }, [setState]);

  const handleMenuCopy = useCallback(() => {
    copy(value, 'clipID');
    handleClose();
  }, [copy, handleClose, value]);

  const handleMenuExternalSearch = useCallback(
    source => {
      searchTagExternal(source, type, value, classification);
      handleClose();
    },
    [searchTagExternal, handleClose, type, value, classification]
  );

  const hasExternalQuery =
    !!currentUser.roles.includes('external_query') &&
    !!currentUserConfig.ui.external_sources?.length &&
    !!currentUserConfig.ui.external_source_tags?.hasOwnProperty(type);

  const hasExternalLinks =
    !!currentUserConfig.ui.external_links?.hasOwnProperty(category) &&
    !!currentUserConfig.ui.external_links[category].hasOwnProperty(type);

  return hasExternalLinks || hasExternalQuery || category === 'tag' ? (
    <Menu
      open={state.mouseY !== null}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        state.mouseY !== null && state.mouseX !== null ? { top: state.mouseY, left: state.mouseX } : undefined
      }
    >
      <MenuItem id="clipID" dense onClick={handleMenuCopy}>
        {CLIPBOARD_ICON}
        {t('clipboard')}
      </MenuItem>
      {currentUser.roles.includes('submission_view') && (
        <MenuItem
          dense
          component={Link}
          to={`/search${categoryIndex[category]}?query=${categoryPrefix[category]}${type}:${safeFieldValueURI(value)}`}
        >
          {SEARCH_ICON}
          {t('related')}
        </MenuItem>
      )}
      {hasExternalQuery && (
        <div>
          <Divider />
          <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
            {t('related_external')}
          </ListSubheader>

          <MenuItem dense onClick={() => handleMenuExternalSearch(null)}>
            {TRAVEL_EXPLORE_ICON} {t('related_external.all')}
          </MenuItem>

          {currentUserConfig.ui.external_source_tags?.[type]?.sort().map((source, i) => (
            <MenuItem dense key={`source_${i}`} onClick={() => handleMenuExternalSearch(source)}>
              {TRAVEL_EXPLORE_ICON} {toTitleCase(source)}
            </MenuItem>
          ))}
        </div>
      )}
      {hasExternalLinks && (
        <div>
          <Divider />
          <ListSubheader disableSticky classes={{ root: classes.listSubHeaderRoot }}>
            {t('external_link')}
          </ListSubheader>

          {currentUserConfig.ui.external_links[category][type].map((link, i) => (
            <MenuItem
              dense
              component={MaterialLink}
              key={`source_${i}`}
              rel="noopener noreferrer"
              target="_blank"
              href={link.url.replace(
                link.replace_pattern,
                encodeURIComponent(link.double_encode ? encodeURIComponent(value) : value)
              )}
              onClick={handleClose}
            >
              {EXTERNAL_ICON} {link.name}
            </MenuItem>
          ))}
        </div>
      )}
    </Menu>
  ) : null;
};

const ActionMenu = React.memo(WrappedActionMenu);
export default ActionMenu;
