import type { DataType as Common } from './en-001/common';

export type Index = {
  common: Common;
};

export const files = import.meta.glob('./*/*.ts');

export const dictionaries = [
  ...new Set(Object.keys(files).map((it) => it.split('/').at(-2))).values(),
] as string[];

export const referenceDictionary = 'en-001';
