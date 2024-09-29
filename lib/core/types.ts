// MARK: Common

export type DictionaryId = Intl.UnicodeBCP47LocaleIdentifier;

export type MessageKey = string;

export type MessageTemplate = string;

export type VolumeName = string;

export type VolumeOverride = `[${string}]`;

// Return value wrapped in this weird template string to force tooling
//  to use real string value and not just type reference.
export type MessageBuilder<T extends MessageTemplate = MessageTemplate> = (
  variables?: Record<string, string | number>,
) => `${''}${T}`;

export type VolumeIndex = Record<MessageKey, MessageTemplate>;

export type VolumeData = Record<MessageKey, MessageBuilder>;

export type CommonVolumeResourceId<T extends VolumeName> = T;

export type OverriddenVolumeResourceId<T extends VolumeName> = `${T}.${VolumeOverride}`;

export type VolumeResourceId<T extends VolumeName = VolumeName> =
  | CommonVolumeResourceId<T>
  | OverriddenVolumeResourceId<T>;

// MARK: I18nStorage

export type I18nStorageIndex = Record<VolumeName, VolumeIndex>;

export type I18nStorageVolumeRuntime<T extends VolumeIndex> = {
  readonly [K in keyof T]: MessageBuilder<T[K]>;
};

export type I18nStorageVolume<T extends VolumeData = VolumeData> = T | Promise<T>;

export type I18nStorageVolumeGetter<T extends VolumeData> = () => I18nStorageVolume<T>;

export type I18nStorage<T extends I18nStorageIndex = I18nStorageIndex> = Record<
  DictionaryId,
  {
    [K in keyof T & string as CommonVolumeResourceId<K>]: I18nStorageVolumeGetter<I18nStorageVolumeRuntime<T[K]>>;
  } & {
    [K in keyof T & string as OverriddenVolumeResourceId<K>]?: I18nStorageVolumeGetter<I18nStorageVolumeRuntime<T[K]>>;
  }
>;

export type GetI18nStorageVolumeNames<T extends I18nStorage> = keyof (T extends I18nStorage<infer I> ? I : never) &
  string;

export type GetI18nStorageVolumeData<S extends I18nStorage, V extends GetI18nStorageVolumeNames<S>> =
  S[DictionaryId][V] extends I18nStorageVolumeGetter<infer T> ? T : never;
