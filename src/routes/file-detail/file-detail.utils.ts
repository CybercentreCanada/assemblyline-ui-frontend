import type { File } from 'models/api/file';
import type { Error } from 'models/base/error';
import { emptyResult } from 'ui/ResultCard';

//*****************************************************************************************
// File Details
//*****************************************************************************************

/**
 * @name patchFileDetails
 * @description Merges previous, current, and live file-detail outcomes by service. The latest outcome within each
 * category is retained, and each service is emitted once across all categories using success, error, then empty
 * result priority.
 * @param prev - Previously loaded file details
 * @param data - Newly loaded file details
 * @param liveErrors - Errors received from the live submission stream
 * @returns File details containing one prioritized outcome per service across results, errors, and empty results
 */
export const patchFileDetails = (prev: File | null, data: File, liveErrors: Error[] | null = null): File => {
  const newData = { ...(prev ?? {}), ...data } as File;
  const successfulResultByService = new Map<string, File['results'][number]>();
  const emptyResultByService = new Map<string, File['emptys'][number]>();
  const errorByService = new Map<string, Error>();

  for (const result of prev?.emptys ?? []) emptyResultByService.set(result.response.service_name, result);
  for (const result of prev?.results ?? []) {
    (emptyResult(result) ? emptyResultByService : successfulResultByService).set(result.response.service_name, result);
  }
  for (const result of data.results ?? []) {
    (emptyResult(result) ? emptyResultByService : successfulResultByService).set(result.response.service_name, result);
  }
  for (const result of data.emptys ?? []) emptyResultByService.set(result.response.service_name, result);
  for (const error of prev?.errors ?? []) errorByService.set(error.response.service_name, error);
  for (const error of data.errors ?? []) errorByService.set(error.response.service_name, error);
  for (const error of liveErrors ?? []) errorByService.set(error.response.service_name, error);

  newData.results = [...successfulResultByService.values()].sort((a, b) =>
    a.response.service_name.localeCompare(b.response.service_name)
  );
  newData.errors = [];
  for (const [serviceName, error] of errorByService) {
    if (!successfulResultByService.has(serviceName)) newData.errors.push(error);
  }
  newData.emptys = [];
  for (const [serviceName, result] of emptyResultByService) {
    if (!successfulResultByService.has(serviceName) && !errorByService.has(serviceName)) newData.emptys.push(result);
  }
  newData.emptys.sort((a, b) => a.response.service_name.localeCompare(b.response.service_name));
  return newData;
};
