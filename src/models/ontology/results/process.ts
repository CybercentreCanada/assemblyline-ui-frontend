/** Details about the characteristics used to identify an object. */
export type ObjectID = {
  /** The normalized tag of the object. */
  tag: string;

  /**
   * Deterministic identifier of ontology.
   * This value should be replicable between services that have access to similar object details,
   * such that it can be used for relating objects in post-processing.
   */
  ontology_id: string;

  /** Component that generated this section. Default: value of `AL_SERVICE_NAME` or "unknown". */
  service_name: string;

  /** The GUID associated with the object. */
  guid?: string;

  /** The hash of the tree ID. */
  treeid?: string;

  /** Human-readable tree ID (concatenation of tags). */
  processtree?: string;

  /** The time at which the object was observed. */
  time_observed?: string; // ISO date format

  /** Unifying session name/ID. */
  session?: string;
};

/** Details about a process. */
export type Process = {
  /** The object ID of the process object. */
  objectid: ObjectID;

  /** The image of the process. Default: "<unknown_image>". */
  image: string;

  /** The time of creation for the process. */
  start_time: string; // ISO date format

  /** The object ID of the parent process object. */
  pobjectid?: ObjectID;

  /** The image of the parent process that spawned this process. */
  pimage?: string;

  /** The command line that the parent process ran. */
  pcommand_line?: string;

  /** The process ID of the parent process. */
  ppid?: number;

  /** The process ID. */
  pid?: number;

  /** The command line that the process ran. */
  command_line?: string;

  /** The time of termination for the process. */
  end_time?: string; // ISO date format

  /** The integrity level of the process. */
  integrity_level?: string;

  /** The hash of the file run. */
  image_hash?: string;

  /** The original name of the file. */
  original_file_name?: string;
};
