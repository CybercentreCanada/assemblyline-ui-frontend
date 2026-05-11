export type ParsedErrorKey = {
  hash: string;
  service: string;
  version: string;
  context: string;
  errorId: string;
  extra?: string;
};

export const ERROR_TYPE_MAP: Record<string, string> = {
  '1': 'exception',
  '10': 'depth',
  '11': 'files',
  '12': 'retry',
  '20': 'busy',
  '21': 'down',
  '30': 'preempted'
};

export function parseErrorKey(key: string): ParsedErrorKey | null {
  const parts = key.split('.');

  if (parts.length < 5) return null;

  const [hash, service, version, context, errorPart, extra] = parts;

  if (!errorPart.startsWith('e')) return null;

  return {
    hash,
    service,
    version,
    context,
    errorId: errorPart.slice(1),
    extra
  };
}

export function getHashFromKey(key: string): string {
  return parseErrorKey(key)?.hash ?? '';
}

export function getServiceFromKey(key: string): string {
  return parseErrorKey(key)?.service ?? '';
}

export function getErrorIDFromKey(key: string): string {
  return parseErrorKey(key)?.errorId ?? '';
}

export function getErrorTypeFromKey(key: string): string {
  const errorId = parseErrorKey(key)?.errorId;
  return errorId ? (ERROR_TYPE_MAP[errorId] ?? 'unknown') : 'unknown';
}
