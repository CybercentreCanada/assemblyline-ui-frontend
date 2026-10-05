import useALContext from 'components/hooks/useALContext';
import type { HashPatternMap } from 'components/models/base/config';
import { usePropStore } from 'components/visual/Actionables/lib/actionable.provider';
import { BOREALIS_TYPE_MAP } from 'components/visual/EnrichmentCustomChip';
import { getSubmitType } from 'helpers/utils';
import { useMemo } from 'react';

export const useHasBorealis = (): boolean => {
  const { configuration } = useALContext();
  const [get] = usePropStore();
  const type = get('type');
  const value = get('value');
  const setBorealisDetails = get('setBorealisDetails');

  return useMemo(
    () =>
      Boolean(
        configuration.ui.api_proxies?.borealis && type in BOREALIS_TYPE_MAP && value !== null && setBorealisDetails
      ),
    [configuration.ui.api_proxies, setBorealisDetails, type, value]
  );
};

export const useHasGoToSignature = (): boolean => {
  const { user: currentUser } = useALContext();
  const [get] = usePropStore();
  const category = get('category');
  const type = get('type');

  return useMemo(
    () => category === 'tag' && type.startsWith('file.rule.') && currentUser.roles.includes('signature_view'),
    [category, currentUser.roles, type]
  );
};

export const useHasGoToSubmission = (): boolean => {
  const { user: currentUser } = useALContext();
  return useMemo(() => currentUser.roles.includes('submission_view'), [currentUser.roles]);
};

export const useHasHighlight = (): boolean => {
  const [get] = usePropStore();
  const highlightKey = get('highlightKey');
  return useMemo(() => Boolean(highlightKey), [highlightKey]);
};

export const useHasBadlistItem = (): boolean => {
  const { user: currentUser } = useALContext();
  const [get] = usePropStore();
  const category = get('category');

  return useMemo(
    () => category === 'tag' && currentUser.roles.includes('badlist_manage'),
    [category, currentUser.roles]
  );
};

export const useHasSafelistItem = (): boolean => {
  const { user: currentUser } = useALContext();
  const [get] = usePropStore();
  const category = get('category');

  return useMemo(
    () => (category === 'tag' || category === 'signature') && currentUser.roles.includes('safelist_manage'),
    [category, currentUser.roles]
  );
};

export const useGetSubmitType = (): HashPatternMap => {
  const { configuration } = useALContext();
  const [get] = usePropStore();
  const category = get('category');
  const type = get('type');
  const value = get('value');

  return useMemo(
    () => (category === 'tag' && type.endsWith('.uri') ? 'url' : getSubmitType(value, configuration)[0]),
    [category, configuration, type, value]
  );
};

export const useHasSubmitType = (): boolean => {
  const { configuration } = useALContext();
  const submitType = useGetSubmitType();

  return useMemo(
    () => Boolean(submitType && (submitType !== 'url' || configuration.ui?.allow_url_submissions)),
    [configuration.ui?.allow_url_submissions, submitType]
  );
};

export const useHasExternalQuery = (): boolean => {
  const { user: currentUser, configuration } = useALContext();
  const [get] = usePropStore();
  const type = get('type');

  return useMemo(
    () =>
      currentUser.roles.includes('external_query') &&
      configuration.ui.external_sources?.length > 0 &&
      type in configuration.ui.external_source_tags,
    [configuration.ui.external_source_tags, configuration.ui.external_sources?.length, currentUser.roles, type]
  );
};

export const useHasExternalLinks = (): boolean => {
  const { configuration } = useALContext();
  const [get] = usePropStore();
  const category = get('category');
  const type = get('type');

  return useMemo(
    () => category in configuration.ui.external_links && type in configuration.ui.external_links[category],
    [category, configuration.ui.external_links, type]
  );
};

export const useIsActionable = (): boolean => {
  const checks: boolean[] = [
    useHasBadlistItem(),
    useHasBorealis(),
    useHasExternalLinks(),
    useHasExternalQuery(),
    useHasGoToSignature(),
    useHasGoToSubmission(),
    useHasHighlight(),
    useHasSafelistItem(),
    useHasSubmitType()
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => checks.some(Boolean), checks);
};
