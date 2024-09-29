import type { Promisable } from 'type-fest';
import { shallowRef, watch } from 'vue';

import { useI18n } from '../hooks';

import type {
  I18nStorage,
  GetI18nStorageVolumeData,
  GetI18nStorageVolumeNames,
  VolumeOverride,
  I18nStorageIndex,
  MessageBuilder,
  VolumeData,
} from './types';

const stubMessage = (() => '') satisfies MessageBuilder;
const stubMessages = new Proxy(
  {},
  { get: () => stubMessage, set: () => false },
);

type UseTranslationsOptions = {
  /**
   * @param e error
   * @returns boolean that indicates whether it is required to attempt to load again
   */
  onVolumeLoadFail?(e: { error: unknown }): Promisable<boolean | undefined>;
};

export const createUseTranslations = <
  const I extends I18nStorageIndex,
  const S extends I18nStorage<I>,
>(
  storage: S,
  options: UseTranslationsOptions = {},
) => {
  return <V extends GetI18nStorageVolumeNames<S>>(volume: V) => {
    const { locale, override } = useI18n();

    type Messages = GetI18nStorageVolumeData<S, V>;

    const strings = shallowRef<Messages>(stubMessages as Messages);
    const internalLoadPromise = shallowRef<Promise<Messages>>();
    const publicLoadPromise = shallowRef<Promise<void>>();

    watch(
      [() => locale.value.toString(), () => override.value] as const,
      async ([locale_, override_]) => {
        const dictionary = storage[locale_];

        if (dictionary === undefined) {
          throw new Error(`Data for language "${locale_}" is missing`);
        }

        const overrideSpecifier =
          override_ === undefined
            ? undefined
            : (`[${override_}]` as const satisfies VolumeOverride);

        const fetcher =
          overrideSpecifier === undefined
            ? dictionary[volume]
            : dictionary[`${volume}.${overrideSpecifier}`] ??
              dictionary[volume];

        // @ts-expect-error fuck template string type inference
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let data = fetcher();

        if (!(data instanceof Promise)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          strings.value = data;
          return;
        }

        // Case when loading for desired locale is already pending.
        //  May happen when override changes, but it is missing for given volume,
        //  so resolved value will be same promise.
        if (internalLoadPromise.value === data) return;

        const load = Promise.withResolvers<undefined>();

        internalLoadPromise.value = data;
        publicLoadPromise.value = load.promise;

        let isLoadFinished = false;
        while (!isLoadFinished) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
          isLoadFinished = await data
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .then((it: VolumeData) => {
              if (internalLoadPromise.value !== data) return true;

              strings.value = it;
              load.resolve(undefined);
              internalLoadPromise.value = undefined;
              publicLoadPromise.value = undefined;

              return true;
            })
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            .catch(async (err: unknown) => {
              if (internalLoadPromise.value !== data) return true;

              const needToRetry =
                (await options.onVolumeLoadFail?.({ error: err })) ?? false;

              if (needToRetry) return false;

              load.reject();
              internalLoadPromise.value = undefined;
              publicLoadPromise.value = undefined;

              return true;
            });

          if (!isLoadFinished) {
            // @ts-expect-error fuck template string type inference
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data = fetcher();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            internalLoadPromise.value = data;
          }
        }
      },
      { immediate: true },
    );

    return [strings, { suspense: () => internalLoadPromise.value }] as const;
  };
};
