import type { MaybeRefOrGetter, Plugin } from 'vue';
import { toRef, toValue } from 'vue';
import { I18nContextKey } from './i18n-context';

type PluginOptions = {
  locale: MaybeRefOrGetter<Intl.Locale>;
  override?: MaybeRefOrGetter<string> | undefined;
};

export const I18nPlugin: Plugin<PluginOptions> = {
  install: (app, options) => {
    app.provide(I18nContextKey, {
      locale: toRef(() => toValue(options.locale)),
      override: toRef(() => toValue(options.override)),
    });
  },
};
