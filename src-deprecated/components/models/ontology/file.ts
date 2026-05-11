// ---- Common Placeholder Types ----
// Replace with the real definition when available
export type PE = Record<string, unknown>;

/**
 * File Characteristics
 */
export type File = {
  /** MD5 hash of the file */
  md5: string;

  /** SHA1 hash of the file */
  sha1: string;

  /** SHA256 hash of the file */
  sha256: string;

  /** Type of file as identified by Assemblyline */
  type?: string;

  /** Size of the file in bytes */
  size: number;

  /** Known filenames associated with the file */
  names?: string[];

  /** Absolute parent of file relative to submission */
  parent?: string;

  /** Properties related to PE files */
  pe?: PE;

  // The following are intentionally commented out for now:
  // apk?: APK;
  // jar?: JAR;
  // img?: IMG;
  // ole?: OLE;
  // pdf?: PDF;
  // plist?: PList;
  // powershell?: PowerShell;
  // shortcut?: Shortcut;
  // swf?: SWF;
};
