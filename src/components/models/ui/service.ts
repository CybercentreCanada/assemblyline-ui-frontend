import { ErrorType } from '../base/error';
import { StatResult } from './search';

/** Get statistics for a service */
export type ServiceStats = {
  error: Record<ErrorType, number>;
  file: {
    extracted: Partial<StatResult>;
    supplementary: Partial<StatResult>;
  };
  heuristic: { [heuristicID: string]: number };
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
