import { type Ref } from 'vue';

import { injectI18nContext } from '../core/i18n-context';

interface Value {
  locale: Readonly<Ref<Intl.Locale>>;
  override: Readonly<Ref<string | undefined>>;
}

export const useI18n = (): Value => {
  const context = injectI18nContext();

  if (context === undefined) throw new Error('I18nContext is missing');

  const { locale, override } = context;

  return {
    locale,
    override,
  } as const;
};
