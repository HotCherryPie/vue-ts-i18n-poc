<script setup lang="ts">
import { useTranslations } from '@/hooks';

const [messages] = useTranslations('common');
</script>

<template>
  <div>
    {{ messages.welcome() }}
  </div>
</template>
