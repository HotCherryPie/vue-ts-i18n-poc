import type { InjectionKey, Ref } from 'vue';
import { defineComponent, inject, provide, toRef } from 'vue';

export type I18nContextValue = {
  locale: Readonly<Ref<Intl.Locale>>;
  override: Readonly<Ref<string | undefined>>;
};

export const I18nContextKey: InjectionKey<I18nContextValue> = Symbol();

export const injectI18nContext = () => {
  return inject(I18nContextKey);
};

type ProviderProps = {
  locale: Intl.Locale;
  override?: string | undefined;
};

export const I18nContext = defineComponent<ProviderProps>({
  // `as unknown as never` used to force tooling to look at generic type `ProviderProps`
  props: ['locale', 'override'] as unknown as never,

  setup(props, { slots }) {
    const parent = inject(I18nContextKey);

    provide(I18nContextKey, {
      locale: toRef(() => props.locale),
      override: toRef(() => props.override ?? parent?.override.value),
    });

    return () => slots['default']?.();
  },
});
