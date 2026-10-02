export const MSG_TYPES = ['ElasticHeartbeat'] as const;
export const LOADER_CLASS = 'assemblyline.odm.messages.elastic_heartbeat.ElasticMessage';

export type MsgType = (typeof MSG_TYPES)[number];

/**
 * Information about an Elasticsearch shard
 */
export type IndexData = {
  /** Index name */
  name: string;

  /** Shard size */
  shard_size: number;
};

/**
 * Heartbeat Model for Elasticsearch
 */
export type Heartbeat = {
  /** Number of Elasticsearch instances with assigned shards */
  instances: number;

  /** Number of unassigned shards in the cluster */
  unassigned_shards: number;

  /** Time to load shard metrics */
  request_time: number;

  /** Information about each index */
  shard_sizes: IndexData[];

  /** Is this component initialized */
  initialized: boolean;

  /** Error message*/
  error: string;
};

/**
 * Model of Elasticsearch Heartbeat Message
 */
export type ElasticMessage = {
  /** Heartbeat message for Elasticsearch */
  msg: Heartbeat;

  /** Loader class for the message */
  msg_loader: typeof LOADER_CLASS;

  /** Type of the message */
  msg_type: MsgType;

  /** Sender of the message */
  sender: string;
};
