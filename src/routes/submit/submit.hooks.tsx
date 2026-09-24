import { useAppConfigStore } from 'core/config';
import { useCallback, useRef } from 'react';
import type { AutoURLServiceIndices, SubmitStore } from 'routes/submit/submit.form';
import { FLOW, useForm } from 'routes/submit/submit.form';
import { generateSubmitUUID } from 'routes/submit/submit.utils';

//*****************************************************************************************
// Auto URL Services Selection
//*****************************************************************************************

/**
 * @name useAutoURLServicesSelection
 * @description Selects or deselects the configured "auto URL services" whenever the active tab is `hash`, the hash
 * type is `url`, and the selected profile changes. Tracks what it auto-selected so it can revert those selections
 * once the conditions stop matching.
 * @returns Callback that reconciles the auto URL service selection against the current form state
 */
export const useAutoURLServicesSelection = (): (() => void) => {
  const configuration = useAppConfigStore(s => s.configuration);
  const form = useForm();

  const autoNames = configuration.ui.url_submission_auto_service_selection;

  const prevTuple = useRef<readonly [string | null, boolean]>([null, false]);

  const computeHasURLservices = useCallback(
    (state: SubmitStore) => {
      if (state.state.tab !== 'hash') return false;
      if (state.hash.type !== 'url') return false;

      return state.settings.services.some(cat => {
        if (!state.state.customize && cat.restricted) return false;

        return cat.services.some(svc => {
          if (!state.state.customize && svc.restricted) return false;
          return autoNames.includes(svc.name);
        });
      });
    },
    [autoNames]
  );

  const buildTuple = useCallback(
    (state: SubmitStore) => [state.state.profile, computeHasURLservices(state)] as const,
    [computeHasURLservices]
  );

  const addSelection = useCallback(() => {
    const added: AutoURLServiceIndices = [];

    const profile = form.getFieldValue('state.profile');

    form.setFieldValue('settings.services', categories =>
      categories.map((cat, ci) => {
        const services = cat.services.map((svc, si) => {
          if (autoNames.includes(svc.name)) {
            added.push([ci, si]);
            return { ...svc, selected: profile === 'default' ? true : svc.selected };
          }
          return svc;
        });

        return {
          ...cat,
          services,
          selected: services.every(s => s.selected)
        };
      })
    );

    form.setFieldValue('autoURLServiceSelection.prev', prev => {
      const next = prev ? [...prev] : [];
      for (const a of added) {
        if (!next.some(([ci, si]) => ci === a[0] && si === a[1])) {
          next.push(a);
        }
      }
      return next;
    });
  }, [form, autoNames]);

  const removeSelection = useCallback(() => {
    const urlServices = form.getFieldValue('autoURLServiceSelection.prev') ?? [];
    if (!urlServices.length) return;

    form.setFieldValue('settings.services', categories =>
      categories.map((cat, ci) => {
        const services = cat.services.map((svc, si) => {
          const matched = urlServices.some(([x, y]) => x === ci && y === si);
          return matched ? { ...svc, selected: svc.default } : svc;
        });

        return {
          ...cat,
          services,
          selected: services.every(s => s.selected)
        };
      })
    );

    form.setFieldValue('autoURLServiceSelection.prev', []);
  }, [form]);

  return useCallback(() => {
    const state = form.store.state.values;
    const currTuple = buildTuple(state);

    const prev = prevTuple.current;
    const prevHasURL = prev[1];
    const currHasURL = currTuple[1];

    if (prev[0] === currTuple[0] && prevHasURL === currHasURL) {
      return;
    }

    if (currHasURL) {
      addSelection();
    } else if (prevHasURL && !currHasURL) {
      removeSelection();
    }

    prevTuple.current = currTuple;
  }, [form.store.state.values, buildTuple, addSelection, removeSelection]);
};

/**
 * @name useSubmitCancel
 * @description Returns a callback that resets the submit form and cancels active submission flow listeners.
 * @returns Callback that cancels the current submission
 */
export const useSubmitCancel = (): (() => void) => {
  const form = useForm();

  return useCallback(() => {
    form.setFieldValue('file', null);
    form.setFieldValue('hash.type', null);
    form.setFieldValue('hash.value', '');
    form.setFieldValue('raw.hash', null);
    form.setFieldValue('raw.value', null);
    form.setFieldValue('state.phase', 'editing');
    form.setFieldValue('state.progress', null);
    form.setFieldValue('state.uuid', generateSubmitUUID());
    FLOW.cancel();
    FLOW.off('complete');
    FLOW.off('fileError');
    FLOW.off('progress');
  }, [form]);
};
