export type TranslationsReference<T> = {
  [K in keyof T]: string;
};
