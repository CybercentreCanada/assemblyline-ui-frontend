import type { ErrorType } from 'components/models/base/error';
import type { StatResult } from 'components/models/ui/search';

/** Get statistics for a service */
export type ServiceStats = {
  error: Record<ErrorType, number>;
  file: {
    extracted: Partial<StatResult>;
    supplementary: Partial<StatResult>;
  };
  heuristic: Record<string, number>;
  result: {
    count: number;
    score: {
      avg: number;
      distribution: Record<number, number>;
      max: number;
      min: number;
    };
  };
  service: {
    name: string;
    version: string;
  };
};
