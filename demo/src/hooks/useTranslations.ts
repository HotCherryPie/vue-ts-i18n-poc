import { createI18nStorage, createUseTranslations } from '@org/i18n';

import type { Index } from '../translations';
import { files } from '../translations';

const storage = createI18nStorage<Index>(files);

export const useTranslations = createUseTranslations(storage);
