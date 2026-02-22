<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-dark-900/90 backdrop-blur-sm"
    >
      <!-- Sol animado -->
      <div class="relative w-28 h-28">
        <!-- Rayos -->
        <div
          class="absolute inset-0 rounded-full border-4 border-solar-500/20 border-t-solar-500 animate-spin"
          style="animation-duration: 1.2s"
        />
        <!-- Núcleo -->
        <div
          class="absolute inset-3 rounded-full bg-gradient-to-br from-solar-400 to-solar-600 animate-pulse-slow flex items-center justify-center"
        >
          <span class="text-4xl">☀️</span>
        </div>
      </div>

      <div class="text-center">
        <p class="font-display font-bold text-xl text-white mb-1">
          Calculando tu sistema solar
        </p>
        <p class="text-slate-400 text-sm">Analizando datos y proyecciones...</p>
      </div>

      <!-- Progress dots -->
      <div class="flex gap-2">
        <div
          v-for="i in 4"
          :key="i"
          class="w-2 h-2 rounded-full bg-solar-500/40 animate-pulse"
          :style="`animation-delay: ${i * 0.15}s`"
        />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
