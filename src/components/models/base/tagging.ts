import { Verdict } from './alert';

/**
 * Attack Matrix Model
 * @param attack_id
 * @param category
 * @param Verdict
 */
export type Attack = [string, string, Verdict];

/**
 * Signature Model
 * @param name signature name
 * @param h_type verdict
 * @param safelisted is the signature safelisted
 */
export type Signature = [string, Verdict, boolean];

/**
 * Tag Model
 * @param name tag value
 * @param h_type verdict
 * @param safelisted is the tag safelisted
 * @param classification tag classification
 */
export type Tag = [string, Verdict, boolean, string];

/** Tagging Model */
export type Tagging = {};
