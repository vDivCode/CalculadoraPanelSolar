<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/80 backdrop-blur-sm"
    >
      <!-- Spinner -->
      <div
        class="w-16 h-16 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"
      />

      <div class="text-center">
        <p class="font-display font-bold text-xl text-navy-900 mb-1">
          Calculando tu sistema solar
        </p>
        <p class="text-slate-500 text-sm">Analizando datos y proyecciones...</p>
      </div>

      <!-- Progress dots -->
      <div class="flex gap-2">
        <div
          v-for="i in 4"
          :key="i"
          class="w-2 h-2 rounded-full bg-brand-300 animate-pulse"
          :style="`animation-delay: ${i * 0.15}s`"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
