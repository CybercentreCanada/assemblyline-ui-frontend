import { File as FileInfo, FileIndexed } from 'components/models/base/file';
import { Verdict } from '../base/alert';
import { Error } from '../base/error';
import { AlternateResult, FileResult, ResultIndexed } from '../base/result';
import { Attack, Signature, Tag } from '../base/tagging';

export const SIMILAR_TYPES = ['tlsh', 'ssdeep', 'vector'] as const;

export type SimilarType = (typeof SIMILAR_TYPES)[number];

export type Alternates = { [serviceName: string]: AlternateResult[] };
export type AttackMatrix = { [attack: string]: Attack[] };
export type Childrens = { name: string; sha256: string }[];
export type Heuristics = Record<Verdict, [string, string]>;
export type Metadata = { [level: string]: { [key: string]: any } };
export type Tags = { [tag_name: string]: Tag[] };

export type File = {
  alternates: Alternates;
  attack_matrix: AttackMatrix;
  childrens: Childrens;
  classification: string;
  emptys: FileResult[];
  errors: Error[];
  file_info: FileInfo;
  heuristics: Heuristics;
  metadata: Metadata;
  parents: string[];
  results: FileResult[];
  signatures: Signature[];
  tags: Tags;
};

/** A single result item of the similar search */
export type SimilarResult = {
  /** Type of relationship used to finds thoses files */
  type: string;

  /** Value used to do the relation */
  value: string;

  /** Total files through this relation type */
  total: number;

  /** List of files hash */
  items: FileIndexed[] | ResultIndexed[];
};

/** Find files related to the current files via TLSH, SSDEEP or Vectors */
export type SimilarResults = SimilarResult[];
