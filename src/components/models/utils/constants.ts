export const MD5_REGEX = /^[a-f0-9]{32}$/i;
export const SHA1_REGEX = /^[a-f0-9]{40}$/i;
export const SHA256_REGEX = /^[a-f0-9]{64}$/i;
export const SSDEEP_REGEX = /^[0-9]{1,18}:[a-zA-Z0-9/+]{0,64}:[a-zA-Z0-9/+]{0,64}$/;
export const TLSH_REGEX = /^((?:T1)?[0-9a-fA-F]{70})$/;
export const HASH_MAP = {
  md5: MD5_REGEX,
  sha1: SHA1_REGEX,
  sha256: SHA256_REGEX,
  ssdeep: SSDEEP_REGEX,
  tlsh: TLSH_REGEX
};
