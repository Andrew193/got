import { HeroesNamesCodes } from '../units-related/unit.model';

export enum BlockType {
  paragraph = 'paragraph',
  hero = 'hero',
  table = 'table',
}

export type WatchtowerTableColumn = {
  alias: string;
  label: string;
};

export type ParagraphBlock = {
  type: BlockType.paragraph;
  text: string;
};

export type TableBlock = {
  type: BlockType.table;
  columns: WatchtowerTableColumn[];
  rows: Record<string, unknown>[];
};

export type HeroBlock = {
  type: BlockType.hero;
  heroName: HeroesNamesCodes;
};

export type ContentBlock = ParagraphBlock | TableBlock | HeroBlock;

export type HeaderSection = {
  title: string;
  backgroundSrc: string;
};

export type NewsConfig = {
  id: string;
  headers: HeaderSection[];
  blocks: ContentBlock[];
};
