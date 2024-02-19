export const SAFEHASH_TYPES = ['file', 'tag', 'signature'] as const;
export const SOURCE_TYPES = ['user', 'external'] as const;

export type SafeHashType = (typeof SAFEHASH_TYPES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Hashes of a safelisted file */
export type Hashes = {
  /** MD5 */
  md5?: string;

  /** SHA1 */
  sha1?: string;

  /** SHA256 */
  sha256?: string;
};

/** File Details */
export type File = {
  /** List of names seen for that file */
  name: string[];

  /** Size of the file in bytes */
  size?: number;

  /** Type of file as identified by Assemblyline */
  type?: string;
};

/** Safelist source */
export type Source = {
  /** Classification of the source */
  classification: string;

  /** Name of the source */
  name: string;

  /** Reason for why file was safelisted */
  reason: string[];

  /** Type of safelisting source */
  type: SourceType;
};

/** Tag associated to file */
export type Tag = {
  /** Tag type */
  type: string;

  /** Tag value */
  value: string;
};

/** Signature of a safelisted file */
export type Signature = {
  /** name of the signature */
  name: string;
};

/** Safelist Model */
export type Safelist = {
  /** Date when the safelisted hash was added */
  added: string & Date;

  /** Computed max classification for the safe hash */
  classification: string;

  /** Is safe hash enabled or not? */
  enabled: boolean;

  /** When does this item expire from the list? */
  expiry_ts?: string & Date;

  /** Information about the file */
  file?: File;

  /** List of hashes related to the safe hash */
  hashes: Hashes;

  /** ID of the Safelist */
  id: string;

  /** Signature related to the safe hash */
  signature: Signature;

  /** List of reasons why hash is safelisted */
  sources: Source[];

  /** Information about the tag */
  tag?: Tag;

  /** Type of safe hash */
  type: SafeHashType;

  /** Last date when sources were added to the safe hash */
  updated: string & Date;
};
