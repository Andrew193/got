import { HeroesNamesCodes } from '../units-related/unit.model';

export type WatchtowerTableColumn = {
  alias: string;
  label: string;
};

export type ParagraphBlock = {
  type: 'paragraph';
  text: string;
};

export type TableBlock = {
  type: 'table';
  columns: WatchtowerTableColumn[];
  rows: Record<string, unknown>[];
};

export type HeroBlock = {
  type: 'hero';
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
