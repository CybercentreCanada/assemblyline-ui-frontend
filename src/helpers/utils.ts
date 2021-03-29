export function bytesToSize(bytes: number | null) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0 || bytes === null) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export function scoreToVerdict(score: number | null) {
  // More then 1000 => Malicious
  if (score >= 1000) {
    return 'malicious';
  }

  // Between 500 - 999 => highly suspicious
  if (score >= 500) {
    return 'highly_suspicious';
  }

  // Between 100 - 999 => suspicious
  if (score >= 100) {
    return 'suspicious';
  }

  // Smaller then 0 => Safe
  if (score < 0) {
    return 'safe';
  }

  // Between 0 and 99 => Unknown
  return 'info';
}

export function getValueFromPath(obj: object, path: string) {
  const paths = path.split('.');
  let current = obj;
  let i;

  for (i = 0; i < paths.length; ++i) {
    if (current[paths[i]] === undefined) {
      return undefined;
    }
    current = current[paths[i]];
  }
  return current;
}

export function getProvider() {
  if (window.location.pathname.indexOf(`${process.env.PUBLIC_URL}/oauth/`) !== -1) {
    return window.location.pathname.split(`${process.env.PUBLIC_URL}/oauth/`).pop().slice(0, -1);
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('provider');
}

export function searchResultsDisplay(count, max = 10000) {
  if (count >= max) {
    return `${count}+`;
  }

  return `${count}`;
}
