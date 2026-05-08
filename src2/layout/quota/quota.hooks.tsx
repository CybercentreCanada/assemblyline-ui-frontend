import { useAppInterfaceStore, useAppSetInterfaceStore } from 'core/interface';
import { useCallback } from 'react';

/** Manages API and submission quota state from the interface store. */
export type UseAppQuota = {
  /** Remaining API call quota. */
  apiQuotaRemaining: number;
  /** Remaining submission quota. */
  submissionQuotaRemaining: number;
  /** Callback to update remaining API quota. */
  setApiQuotaRemaining: (quota: number) => void;
  /** Callback to update remaining submission quota. */
  setSubmissionQuotaRemaining: (quota: number) => void;
};

/**
 * @name useAppQuota
 * @description Manages API and submission quota counters persisted in the interface store.
 * @returns Object containing quota values and setters
 */
export const useAppQuota = (): UseAppQuota => {
  const setAppInterface = useAppSetInterfaceStore();

  const apiQuotaRemaining = useAppInterfaceStore(s => s.quota.api);
  const submissionQuotaRemaining = useAppInterfaceStore(s => s.quota.submission);

  const setApiQuotaRemaining = useCallback(
    (quota: number) => {
      setAppInterface(s => {
        s.quota.api = quota;
        return s;
      });
    },
    [setAppInterface]
  );

  const setSubmissionQuotaRemaining = useCallback(
    (quota: number) => {
      setAppInterface(s => {
        s.quota.submission = quota;
        return s;
      });
    },
    [setAppInterface]
  );

  return {
    apiQuotaRemaining,
    submissionQuotaRemaining,
    setApiQuotaRemaining,
    setSubmissionQuotaRemaining
  };
};
