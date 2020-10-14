export function bytesToSize(bytes: number | null) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0 || bytes === null) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
}

export function scoreToVerdict(score: number | null) {
  // More then 2000 => Malicious
  if (score >= 2000) {
    return 'malicious';
  }

  // Between 1000 - 1999 => highly suspicious
  if (score >= 1000) {
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
  return 'unknown';
}
