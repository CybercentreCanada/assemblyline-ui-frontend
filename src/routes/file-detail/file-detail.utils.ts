import type { File } from 'models/api/file';
import type { Error } from 'models/base/error';
import { emptyResult } from 'ui/ResultCard';

//*****************************************************************************************
// File Details
//*****************************************************************************************

/**
 * @name patchFileDetails
 * @description Merges file details and live errors, keeping the latest entry for each service.
 * @param prev - Previously loaded file details
 * @param data - Newly loaded file details
 * @param liveErrors - Errors received from the live submission stream
 * @returns Merged file details with successful results prioritized over errors and empty results
 */
export const patchFileDetails = (prev: File | null, data: File, liveErrors: Error[] | null = null): File => {
  const newData = { ...(prev ?? {}), ...data } as File;
  const resultByService = new Map(
    [...(prev?.results ?? []), ...(data.results ?? [])].map(result => [result.response.service_name, result])
  );
  const errorByService = new Map(
    [...(prev?.errors ?? []), ...(data.errors ?? []), ...(liveErrors ?? [])].map(error => [
      error.response.service_name,
      error
    ])
  );
  const successfulResults = [...resultByService.values()].filter(result => !emptyResult(result));
  const emptyResults = [...resultByService.values()].filter(result => emptyResult(result));
  const successfulServices = new Set(successfulResults.map(result => result.response.service_name));
  const errorServices = new Set([...errorByService.keys()].filter(serviceName => !successfulServices.has(serviceName)));

  newData.results = successfulResults.sort((a, b) => (a.response.service_name > b.response.service_name ? 1 : -1));
  newData.emptys = emptyResults
    .filter(result => {
      const serviceName = result.response.service_name;
      return !successfulServices.has(serviceName) && !errorServices.has(serviceName);
    })
    .sort((a, b) => (a.response.service_name > b.response.service_name ? 1 : -1));
  newData.errors = [...errorByService.values()].filter(error => !successfulServices.has(error.response.service_name));
  return newData;
};
