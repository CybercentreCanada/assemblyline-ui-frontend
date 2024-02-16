import { ErrorType } from '../base/error';
import { StatResult } from './search';

/** Get statistics for a service */
export type ServiceStats2 = {
  error: {
    EXCEPTION: 4;
    'MAX DEPTH REACHED': 0;
    'MAX FILES REACHED': 0;
    'MAX RETRY REACHED': 0;
    'SERVICE BUSY': 0;
    'SERVICE DOWN': 0;
    'TASK PRE-EMPTED': 0;
    UNKNOWN: 0;
  };
  file: {
    extracted: { avg: 1.064516129032258; max: 3.0; min: 0.0 };
    supplementary: { avg: 5.967741935483871; max: 15.0; min: 1.0 };
  };
  heuristic: {
    'RESULTSAMPLE.1': 15;
    'RESULTSAMPLE.2': 14;
    'RESULTSAMPLE.3': 14;
    'RESULTSAMPLE.4': 16;
    'RESULTSAMPLE.5': 11;
    'RESULTSAMPLE.6': 3;
  };
  result: {
    count: 31;
    score: {
      avg: 692.9032258064516;
      distribution: { 0: 17; 500: 0; 1000: 3; 1500: 11; 2000: 0 };
      max: 1910.0;
      min: 0.0;
    };
  };
  service: { name: 'ResultSample'; version: '4.2.0.dev0' };
};

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
