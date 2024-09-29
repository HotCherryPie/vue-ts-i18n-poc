<script setup lang="ts">
type Props = {
  locales: Intl.UnicodeBCP47LocaleIdentifier[];
};

defineProps<Props>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <div :class="$style.root">
    <button
      v-for="it of locales"
      :key="it"
      :class="[$style.item, it === model && $style.active]"
      type="button"
      @click="model = it"
    >
      {{ it }}
    </button>
  </div>
</template>

<style lang="css" module>
.root {
  display: flex;
}

.item {
  all: unset;
  flex: 0 0 auto;
  background-color: #eee;
  padding: 0.25em 1em;

  &:first-child {
    border-radius: 0.25em 0 0 0.25em;
  }

  &:last-child {
    border-radius: 0 0.25em 0.25em 0;
  }

  &.active {
    background-color: #ddd;
  }
}
</style>
