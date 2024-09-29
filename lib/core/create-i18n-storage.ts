import { IntlMessageFormat } from 'intl-messageformat';

import type {
  I18nStorage,
  I18nStorageIndex,
  VolumeData,
  DictionaryId,
  VolumeResourceId,
  VolumeIndex,
  I18nStorageVolume,
  MessageKey,
} from './types';

/**
 * Return value of `import.meta.glob`
 */

type VolumeGlobImports = Record<string, () => Promise<unknown>>;

type VolumeGlobImportFn = VolumeGlobImports[string];

type VolumeModule = { default: VolumeIndex };

type VolumeModuleData = VolumeModule['default'];

type CacheKey = `${DictionaryId}/${VolumeResourceId}`;

type CacheValue = I18nStorageVolume;

type Cache = Map<CacheKey, CacheValue>;

const formattersCache = Symbol();

const wrapVolumeWithMessageBuilders = (
  dictionaryId: DictionaryId,
  volumeDataRaw: VolumeModuleData,
): VolumeData => {
  const out = { [formattersCache]: {} } as VolumeData &
    Record<
      typeof formattersCache,
      Record<MessageKey, InstanceType<typeof IntlMessageFormat>>
    >;

  for (const [key, value] of Object.entries(volumeDataRaw)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    out[key] = (args: any) => {
      if (!(key in out[formattersCache]))
        out[formattersCache][key] = new IntlMessageFormat(
          value,
          dictionaryId,
          undefined,
          { ignoreTag: true },
        );

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unsafe-argument
      return out[formattersCache][key]!.format(args) as string;
    };
  }

  return out;
};

const getVolumeGetter =
  (
    dictionaryId: DictionaryId,
    cache: Cache,
    key: CacheKey,
    fetcher: VolumeGlobImportFn,
  ) =>
  () => {
    if (!cache.has(key)) {
      cache.set(
        key,
        fetcher()
          .then((module) => {
            const data = wrapVolumeWithMessageBuilders(
              dictionaryId,
              (module as VolumeModule).default,
            );
            cache.set(key, data);
            return data;
          })
          .catch((err: unknown) => {
            cache.delete(key);
            throw err;
          }),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return cache.get(key)!;
  };

export const createI18nStorage = <I extends I18nStorageIndex>(
  imports: VolumeGlobImports,
) => {
  const cache = new Map<CacheKey, CacheValue>();

  return Object.entries(imports)
    .map(([k, v]) => {
      const [dictionaryId, volumeResourceId] = k
        .slice(0, -3)
        .split('/')
        .slice(-2) as [DictionaryId, VolumeResourceId];

      const cacheKey = `${dictionaryId}/${volumeResourceId}` satisfies CacheKey;

      return [
        dictionaryId,
        volumeResourceId,
        getVolumeGetter(dictionaryId, cache, cacheKey, v),
      ] as const;
    })
    .reduce<Record<DictionaryId, Record<VolumeResourceId, () => CacheValue>>>(
      (out, [dictionaryId, volumeResourceId, volumeGetter]) => {
        out[dictionaryId] = out[dictionaryId] ?? {};

        out[dictionaryId][volumeResourceId] = volumeGetter;
        return out;
      },
      {},
    ) as I18nStorage<I>;
};
