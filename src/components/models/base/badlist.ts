export const BADHASH_TYPES = ['file', 'tag', 'signature'] as const;
export const SOURCE_TYPES = ['user', 'external'] as const;

export type BadHashType = (typeof BADHASH_TYPES)[number];
export type SourceType = (typeof SOURCE_TYPES)[number];

/** Attribution Tag Model */
export type Attribution = {
  /** Attribution Actor */
  actor?: string[];

  /** Attribution Campaign */
  campaign?: string[];

  /** Attribution Category */
  category?: string[];

  /** Attribution Exploit */
  exploit?: string[];

  /** Attribution Family */
  family?: string[];

  /** Attribution Implant */
  implant?: string[];

  /** Attribution Network */
  network?: string[];
};

/** Signature of a badlisted file */
export type Signature = {
  /** name of the signature */
  name: string;
};

/** Hashes of a badlisted file */
export type Hashes = {
  /** MD5 */
  md5?: string;

  /** SHA1 */
  sha1?: string;

  /** SHA256 */
  sha256?: string;

  /** SSDEEP */
  ssdeep?: string;

  /** TLSH */
  tlsh?: string;
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

/** Badlist source */
export type Source = {
  /** Classification of the source */
  classification: string;

  /** Name of the source */
  name: string;

  /** Reason for why file was badlisted */
  reason: string[];

  /** Type of badlisting source */
  type: SourceType;
};

/** Tag associated to file */
export type Tag = {
  /** Tag type */
  type: string;

  /** Tag value */
  value: string;
};

/** Badlist Model */
export type Badlist = {
  /** Date when the badlisted hash was added */
  added: string & Date;

  /** Attribution related to the bad hash */
  attribution?: Attribution;

  /** Computed max classification for the bad hash */
  classification: string;

  /** Is bad hash enabled or not? */
  enabled: boolean;

  /** When does this item expire from the list? */
  expiry_ts?: string & Date;

  /** Information about the file */
  file?: File;

  /** List of hashes related to the bad hash */
  hashes: Hashes;

  /** ID of the Badlist */
  id: string;

  /** Signature related to the bad hash */
  signature: Signature;

  /** List of reasons why hash is badlisted */
  sources: Source[];

  /** Information about the tag */
  tag?: Tag;

  /** Type of bad hash */
  type: BadHashType;

  /** Last date when sources were added to the bad hash */
  updated: string & Date;
};
