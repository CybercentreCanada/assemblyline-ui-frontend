import type { AppRouterStore } from 'core/router';

export type AppRouterBlockedReason = 'unsaved_changes' | 'data_loss_on_leave' | 'external_leave_risk' | null;

/** Route blocker registry keyed by route ids. */
export type AppRouterBlockedPages = Record<keyof AppRouterStore['pages'], AppRouterBlockedReason>;
