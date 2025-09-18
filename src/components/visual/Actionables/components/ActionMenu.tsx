import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import LandscapeOutlinedIcon from '@mui/icons-material/LandscapeOutlined';
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SelectAllOutlinedIcon from '@mui/icons-material/SelectAllOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Divider, ListSubheader, Link as MaterialLink, Menu, MenuItem, Tooltip } from '@mui/material';
import useClipboard from 'commons/components/utils/hooks/useClipboard';
import { useAPIMutation } from 'components/core/Query/API/useAPIMutation';
import { useAPIQuery } from 'components/core/Query/API/useAPIQuery';
import useALContext from 'components/hooks/useALContext';
import useExternalLookup from 'components/hooks/useExternalLookup';
import useHighlighter from 'components/hooks/useHighlighter';
import useMySnackbar from 'components/hooks/useMySnackbar';
import type { Badlist } from 'components/models/base/badlist';
import type { ExternalLink, ExternalLinkType } from 'components/models/base/config';
import type { Safelist } from 'components/models/base/safelist';
import type { ExternalEnrichmentResults } from 'components/providers/ExternalLookupProvider';
import SafeBadItem from 'components/visual/Actionables/components/SafeBadItem';
import {
  useGetSubmitType,
  useHasBadlistItem,
  useHasBorealis,
  useHasExternalLinks,
  useHasExternalQuery,
  useHasGoToSignature,
  useHasGoToSubmission,
  useHasHighlight,
  useHasSafelistItem,
  useHasSubmitType
} from 'components/visual/Actionables/lib/actionable.hooks';
import type { ActionableProps } from 'components/visual/Actionables/lib/actionable.models';
import { usePropStore } from 'components/visual/Actionables/lib/actionable.provider';
import Classification from 'components/visual/Classification';
import ClassificationMismatchDialog from 'components/visual/ClassificationMismatchDialog';
import InputDialog from 'components/visual/InputDialog';
import { isAccessible } from 'helpers/classificationParser';
import { getSHA256, safeFieldValueURI, toTitleCase } from 'helpers/utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { Link } from 'react-router-dom';

/**
 * Borealis Menu Item
 */
export const BorealisMenuItem = React.memo(() => {
  const { t } = useTranslation();

  const [get, setStore] = usePropStore();

  const setBorealisDetails = get('setBorealisDetails');

  return (
    <MenuItem
      id="borealisID"
      dense
      onClick={() => {
        setBorealisDetails(true);
        setStore({ mouseX: null, mouseY: null });
      }}
    >
      <LandscapeOutlinedIcon style={{ marginRight: '16px' }} />
      {t('borealis')}
    </MenuItem>
  );
});

/**
 * Go To Signature Menu Item
 */
export const GoToSignatureMenuItem = React.memo(() => {
  const { t } = useTranslation();

  const [get] = usePropStore();

  const type = get('type');
  const value = get('value');

  const to = useMemo<string>(
    () =>
      `/manage/signature/${type.substring(10)}/${value.substring(0, value.indexOf('.'))}/${value.substring(
        value.indexOf('.') + 1
      )}`,
    [type, value]
  );

  return (
    <MenuItem id="sigID" dense component={Link} to={to}>
      <FingerprintOutlinedIcon style={{ marginRight: '16px' }} />
      {t('goto_signature')}
    </MenuItem>
  );
});

/**
 * Copy Menu Item
 */
export const CopyMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { copy } = useClipboard();

  const [get, setStore] = usePropStore();

  const value = get('value');

  return (
    <MenuItem
      id="clipID"
      dense
      onClick={() => {
        void copy(value);
        setStore({ mouseX: null, mouseY: null });
      }}
    >
      <AssignmentOutlinedIcon style={{ marginRight: '16px' }} />
      {t('clipboard')}
    </MenuItem>
  );
});

/**
 * Go To Submission Menu Item
 */

const CATEGORY_PREFIX: Record<ActionableProps['category'], string> = {
  hash: '',
  heuristic: 'result.sections.heuristic.name',
  metadata: 'metadata.',
  signature: 'result.sections.heuristic.signature.name',
  tag: 'result.sections.tags.'
};

const CATEGORY_INDEX: Record<ActionableProps['category'], string> = {
  hash: '',
  heuristic: '/result',
  metadata: '',
  signature: '/result',
  tag: '/result'
};

export const GoToSubmissionMenuItem = React.memo(() => {
  const { t } = useTranslation();

  const [get, setStore] = usePropStore();

  const category = get('category');
  const index = get('index');
  const type = get('type');
  const value = get('value');

  const to = useMemo<string>(
    () =>
      index
        ? `/search${index}?query=${type}:${safeFieldValueURI(value)}`
        : `/search${CATEGORY_INDEX[category]}?query=${CATEGORY_PREFIX[category]}${type}:${safeFieldValueURI(value)}`,
    [category, index, type, value]
  );

  return (
    <MenuItem dense component={Link} to={to} onClick={() => setStore({ mouseX: null, mouseY: null })}>
      <SearchOutlinedIcon style={{ marginRight: '16px' }} />
      {t('related')}
    </MenuItem>
  );
});

/**
 * Highlight Menu Item
 */
export const HighlightMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { triggerHighlight } = useHighlighter();

  const [get, setStore] = usePropStore();

  const highlightKey = get('highlightKey');

  return (
    <MenuItem
      dense
      onClick={() => {
        triggerHighlight(highlightKey);
        setStore({ mouseX: null, mouseY: null });
      }}
    >
      <SelectAllOutlinedIcon style={{ marginRight: '16px' }} />
      {t('highlight')}
    </MenuItem>
  );
});

/**
 * Badlist Menu Item
 */
export const BadlistMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [get, setStore] = usePropStore();

  const badlistDialog = get('badlistDialog');
  const badlistReason = get('badlistReason');
  const classification = get('classification');
  const type = get('type');
  const value = get('value');

  const { data: badlist } = useAPIQuery<Badlist>({
    url: `/api/v4/badlist/${type}/${encodeURIComponent(encodeURIComponent(value))}/`,
    method: 'GET',
    enabled: !!type && !!value,
    onFailure: () => null
  });

  const handleAddBadlist = useAPIMutation(() => ({
    url: `/api/v4/badlist/`,
    method: 'PUT',
    body: {
      tag: { type, value },
      sources: [{ classification: classification, name: currentUser.username, reason: [badlistReason], type: 'user' }],
      type: 'tag'
    },
    onSuccess: () => {
      setStore({ badlistDialog: false });
      showSuccessMessage(t('badlist.success'));
    }
  }));

  return (
    <>
      <Tooltip title={badlist ? <SafeBadItem item={badlist} /> : ''} placement="right" arrow>
        <div>
          <MenuItem
            dense
            onClick={() => setStore({ mouseX: null, mouseY: null, badlistDialog: true })}
            disabled={badlist !== null}
          >
            <BugReportOutlinedIcon style={{ marginRight: '16px' }} />
            {t(`${badlist !== null ? 'already_' : ''}badlist`)}
          </MenuItem>
        </div>
      </Tooltip>

      <InputDialog
        acceptText={t('badlist.acceptText')}
        cancelText={t('badlist.cancelText')}
        extra={<Classification size="tiny" type="outlined" c12n={classification ? classification : null} />}
        inputLabel={t('badlist.input')}
        inputValue={badlistReason}
        open={badlistDialog}
        text={t('badlist.text')}
        title={t('badlist.title')}
        waiting={handleAddBadlist.isPending}
        handleAccept={() => handleAddBadlist.mutate()}
        handleClose={() => setStore({ badlistDialog: false })}
        handleInputChange={event => setStore({ badlistReason: event.target.value })}
      />
    </>
  );
});

/**
 * Safelist Menu Item
 */
export const SafelistMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { user: currentUser } = useALContext();
  const { showSuccessMessage } = useMySnackbar();

  const [get, setStore] = usePropStore();

  const category = get('category');
  const classification = get('classification');
  const safelistDialog = get('safelistDialog');
  const safelistReason = get('safelistReason');
  const type = get('type');
  const value = get('value');

  const qhash = useMemo<string>(
    () => (category === 'signature' ? 'signature' : category === 'tag' ? type : null),
    [category, type]
  );

  const { data: safelisted } = useAPIQuery<Safelist>({
    url: `/api/v4/safelist/${qhash}/${encodeURIComponent(encodeURIComponent(value))}/`,
    method: 'GET',
    enabled: !!qhash && !!value,
    onFailure: () => null
  });

  const handleAddSafelist = useAPIMutation(() => ({
    url: `/api/v4/safelist/`,
    method: 'PUT',
    body:
      category === 'signature'
        ? {
            signature: { name: value },
            sources: [{ name: currentUser.username, reason: [safelistReason], type: 'user' }],
            type: 'signature'
          }
        : {
            tag: { type, value },
            sources: [
              { classification: classification, name: currentUser.username, reason: [safelistReason], type: 'user' }
            ],
            type: 'tag'
          },
    onSuccess: () => {
      setStore({ safelistDialog: false });
      showSuccessMessage(t('safelist.success'));
    }
  }));

  return (
    <>
      <Tooltip title={safelisted ? <SafeBadItem item={safelisted} /> : ''} placement="right" arrow>
        <div>
          <MenuItem
            dense
            onClick={() => setStore({ mouseX: null, mouseY: null, safelistDialog: true })}
            disabled={safelisted !== null}
          >
            <VerifiedUserOutlinedIcon style={{ marginRight: '16px' }} />
            {t(`${safelisted !== null ? 'already_' : ''}safelist`)}
          </MenuItem>
        </div>
      </Tooltip>

      <InputDialog
        acceptText={t('safelist.acceptText')}
        cancelText={t('safelist.cancelText')}
        extra={<Classification size="tiny" type="outlined" c12n={classification ? classification : null} />}
        inputLabel={t('safelist.input')}
        inputValue={safelistReason}
        open={safelistDialog}
        text={t('safelist.text')}
        title={t('safelist.title')}
        waiting={handleAddSafelist.isPending}
        handleAccept={() => handleAddSafelist.mutate()}
        handleClose={() => setStore({ safelistDialog: false })}
        handleInputChange={event => setStore({ safelistReason: event.target.value })}
      />
    </>
  );
});

/**
 * Submit Menu Item
 */
export const SubmitMenuItem = React.memo(() => {
  const { t } = useTranslation();

  const [get] = usePropStore();

  const classification = get('classification');
  const value = get('value');

  const submitType = useGetSubmitType();

  return (
    <MenuItem dense component={Link} to={`/submit`} state={{ hash: value, c12n: classification }}>
      <PublishOutlinedIcon style={{ marginRight: '16px' }} />
      {t('submit') + ` ${submitType.toUpperCase()}`}
    </MenuItem>
  );
});

/**
 * External Query Menu Item
 */
export const ExternalQueryMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { configuration } = useALContext();
  const { enrichTagExternal, enrichmentState, getKey } = useExternalLookup();

  const [get, setStore] = usePropStore();

  const classification = get('classification');
  const type = get('type');
  const value = get('value');

  const [allInProgress, setAllInProgress] = useState<boolean>(false);

  const externalLookupResults = useMemo<ExternalEnrichmentResults>(
    () => enrichmentState[getKey(type, value)],
    [enrichmentState, getKey, type, value]
  );

  const handleMenuExternalSearch = useCallback(
    (source: string) => {
      enrichTagExternal(source, type, value, classification);
      setStore({ mouseX: null, mouseY: null });
    },
    [enrichTagExternal, type, value, classification, setStore]
  );

  useEffect(() => {
    if (!!externalLookupResults) {
      let inProgress = true;
      Object.values(externalLookupResults).forEach(results => {
        if (!results.inProgress) {
          inProgress = false;
        }
      });
      setAllInProgress(inProgress);
    }
  }, [externalLookupResults]);

  return (
    <div>
      <Divider />
      <ListSubheader disableSticky sx={{ lineHeight: '32px' }}>
        {t('related_external')}
      </ListSubheader>

      <MenuItem dense onClick={() => handleMenuExternalSearch(null)} disabled={allInProgress}>
        <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />
        {t('related_external.all')}
      </MenuItem>

      {configuration.ui.external_source_tags?.[type]?.sort().map((source, i) => (
        <MenuItem
          dense
          key={`source_${i}`}
          onClick={() => handleMenuExternalSearch(source)}
          disabled={!!externalLookupResults?.[source]?.inProgress}
        >
          <TravelExploreOutlinedIcon style={{ marginRight: '16px' }} />
          {toTitleCase(source)}
        </MenuItem>
      ))}
    </div>
  );
});

/**
 * External Links Menu Item
 */
export const ExternalLinksMenuItem = React.memo(() => {
  const { t } = useTranslation();
  const { configuration, c12nDef } = useALContext();

  const [get, setStore] = usePropStore();

  const externalLinks = get('externalLinks');
  const category = get('category');
  const type = get('type');
  const value = get('value');
  const classification = get('classification');

  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<React.MouseEvent<HTMLAnchorElement, MouseEvent>>(null);
  const [currentAllowBypass, setCurrentAllowBypass] = useState<boolean>(false);
  const [currentLinkClassification, setCurrentLinkClassification] = useState<string>('');

  const proceedExternalLink = useCallback(() => {
    const target = currentEvent.target as HTMLElement;
    target.click();
    setConfirmationDialog(false);
  }, [currentEvent]);

  const checkClassification = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, link_classification: string, allow_bypass: boolean) => {
      if (!isAccessible(link_classification, classification, c12nDef, c12nDef.enforce)) {
        event.preventDefault();
        setCurrentEvent(event);
        setCurrentAllowBypass(allow_bypass);
        setCurrentLinkClassification(link_classification);
        setConfirmationDialog(true);
      }
      setStore({ mouseX: null, mouseY: null });
    },
    [c12nDef, classification, setStore]
  );

  useEffect(() => {
    const externalLinks = configuration?.ui?.external_links?.[category as ExternalLinkType]?.[type];
    if (externalLinks) {
      void Promise.all(
        externalLinks.map(
          link =>
            new Promise<ExternalLink>(async (resolve, reject) => {
              try {
                const targetValue = encodeURIComponent(
                  link.double_encode
                    ? link.encoding === 'url'
                      ? encodeURIComponent(value)
                      : link.encoding === 'sha256'
                        ? await getSHA256(value)
                        : value
                    : value
                );

                resolve({ ...link, url: link.url.replace(link.replace_pattern, targetValue) });
              } catch (err) {
                reject(link);
              }
            })
        )
      ).then(externalLinks => setStore({ externalLinks }));
    }
  }, [category, configuration?.ui?.external_links, setStore, type, value]);

  return (
    <div>
      <Divider />
      <ListSubheader disableSticky sx={{ lineHeight: '32px' }}>
        {t('external_link')}
      </ListSubheader>

      <ClassificationMismatchDialog
        open={confirmationDialog}
        handleClose={() => setConfirmationDialog(false)}
        handleAccept={currentAllowBypass ? proceedExternalLink : null}
        dataClassification={classification}
        targetClassification={currentLinkClassification}
      />

      {externalLinks.map((link, i) => (
        <MenuItem
          dense
          component={MaterialLink}
          key={`source_${i}`}
          rel="noopener noreferrer"
          target="_blank"
          href={link.url}
          onClick={event => checkClassification(event, link.max_classification, link.allow_bypass)}
        >
          <HiOutlineExternalLink style={{ marginRight: '16px', fontSize: '22px' }} />
          {link.name}
        </MenuItem>
      ))}
    </div>
  );
});

export const ActionableMenu = React.memo(() => {
  const [get, setStore] = usePropStore();

  const mouseY = get('mouseY');
  const mouseX = get('mouseX');

  const hasBadlistItem = useHasBadlistItem();
  const hasBorealis = useHasBorealis();
  const hasExternalLinks = useHasExternalLinks();
  const hasExternalQuery = useHasExternalQuery();
  const hasGoToSignature = useHasGoToSignature();
  const hasGoToSubmission = useHasGoToSubmission();
  const hasHighlight = useHasHighlight();
  const hasSafelistItem = useHasSafelistItem();
  const hasSubmitType = useHasSubmitType();

  return (
    <Menu
      open={mouseY !== null}
      onClose={() => setStore({ mouseX: null, mouseY: null })}
      anchorReference="anchorPosition"
      anchorPosition={mouseY === null && mouseX === null ? null : { top: mouseY, left: mouseX }}
    >
      {hasBorealis && <BorealisMenuItem />}
      {hasGoToSignature && <GoToSignatureMenuItem />}
      <CopyMenuItem />
      {hasGoToSubmission && <GoToSubmissionMenuItem />}
      {hasHighlight && <HighlightMenuItem />}
      {hasBadlistItem && <BadlistMenuItem />}
      {hasSafelistItem && <SafelistMenuItem />}
      {hasSubmitType && <SubmitMenuItem />}
      {hasExternalQuery && <ExternalQueryMenuItem />}
      {hasExternalLinks && <ExternalLinksMenuItem />}
    </Menu>
  );
});
