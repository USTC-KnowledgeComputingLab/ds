---
layout: home
---

<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()

onMounted(() => {
  const userLang = navigator.language || navigator.userLanguage
  if (userLang.startsWith('zh')) {
    router.go(withBase('/zh/'))
  } else {
    router.go(withBase('/en/'))
  }
})
</script>
