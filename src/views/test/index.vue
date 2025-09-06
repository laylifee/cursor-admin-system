<template>
  <div>{{ route?.meta?.title }}</div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const msg = ref('hello world')
const router = useRouter()
const route = useRoute()
</script>
