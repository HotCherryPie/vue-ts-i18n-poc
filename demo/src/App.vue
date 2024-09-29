<script setup lang="ts">
import { ref } from 'vue';
import { I18nContext } from '@org/i18n';

import LangSelector from './components/LangSelector.vue';
import TheWelcome from './components/TheWelcome.vue';

const locale = ref('en-001');
</script>

<template>
  <I18nContext :locale="new Intl.Locale(locale)">
    <header>
      <LangSelector v-model="locale" :locales="['en-001', 'ru-RU']" />
    </header>

    <main>
      <TheWelcome />
    </main>
  </I18nContext>
</template>
