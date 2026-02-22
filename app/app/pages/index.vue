<script setup lang="ts">
const calc = useCalculadora();

onMounted(() => {
  calc.cargarDatos();
});

// SEO
useSeoMeta({
  title: "Calculadora Solar Perú — ¿Cuántos paneles necesitas?",
  description:
    "Calcula cuántos paneles solares necesitas para tu hogar, empresa o industria en Perú. 24 ciudades, inventario de equipos y retorno de inversión.",
});

const pasosTitulos = [
  { num: 1, label: "Perfil" },
  { num: 2, label: "Consumo" },
  { num: 3, label: "Sistema" },
  { num: 4, label: "Resultados" },
];

const irPaso = (n: number) => {
  if (n > calc.paso.value) {
    // validar antes de avanzar
    if (calc.paso.value === 1 && !calc.perfilId.value) {
      alert("Selecciona tu perfil primero");
      return;
    }
    if (calc.paso.value === 2 && calc.consumoTotal.value <= 0) {
      alert("Ingresa tu consumo o selecciona equipos");
      return;
    }
  }
  calc.paso.value = Math.min(4, Math.max(1, n));
  if (calc.paso.value === 4) calc.calcular();
};
</script>

<template>
  <div>
    <!-- ════════════════════════════════════════
         HERO HEADER
         ════════════════════════════════════════ -->
    <header class="relative overflow-hidden pt-20 pb-16 text-center px-5">
      <!-- Glow fondo -->
      <div
        class="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 bg-gradient-to-b from-solar-500 to-transparent blur-3xl"
      />
      <!-- Línea inferior -->
      <div
        class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-solar-500/40 to-transparent"
      />

      <div class="badge-solar mx-auto mb-6">
        ☀️ Calculadora Solar Profesional · Perú 2025
      </div>

      <h1
        class="font-display font-extrabold text-4xl md:text-6xl leading-tight mb-5 bg-gradient-to-br from-white via-solar-200 to-solar-500 bg-clip-text text-transparent"
      >
        ¿Cuántos paneles solares<br />necesitas en Perú?
      </h1>

      <p
        class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        La calculadora más completa del país. Para hogares, empresas e
        industrias. Con
        <strong class="text-solar-400"
          >datos reales de 24 ciudades peruanas</strong
        >.
      </p>

      <!-- Stats -->
      <div class="flex flex-wrap justify-center gap-10">
        <div
          v-for="stat in [
            { value: '24', label: 'Ciudades con datos HSP' },
            { value: '60+', label: 'Tipos de equipos' },
            { value: '5', label: 'Perfiles de usuario' },
            { value: '25', label: 'Años de proyección' },
          ]"
          :key="stat.label"
          class="text-center"
        >
          <span
            class="block font-display font-extrabold text-4xl text-solar-500"
            >{{ stat.value }}</span
          >
          <span
            class="text-xs uppercase tracking-widest text-slate-500 mt-1 block"
            >{{ stat.label }}</span
          >
        </div>
      </div>
    </header>

    <!-- ════════════════════════════════════════
         STEPPER
         ════════════════════════════════════════ -->
    <div class="max-w-5xl mx-auto px-5 pb-20">
      <!-- Nav de pasos -->
      <nav
        class="flex items-center justify-center mb-12 gap-0"
        aria-label="Pasos del cálculo"
      >
        <template v-for="(p, i) in pasosTitulos" :key="p.num">
          <button
            class="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
            :aria-current="calc.paso.value === p.num ? 'step' : undefined"
            @click="calc.paso.value > p.num ? irPaso(p.num) : undefined"
          >
            <!-- Círculo -->
            <div
              class="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2 transition-all duration-300"
              :class="{
                'border-solar-500 bg-solar-500/15 text-solar-300 shadow-solar':
                  calc.paso.value === p.num,
                'border-solar-500 bg-solar-500 text-black':
                  calc.paso.value > p.num,
                'border-white/10 bg-dark-700 text-slate-600':
                  calc.paso.value < p.num,
              }"
            >
              <span v-if="calc.paso.value > p.num">✓</span>
              <span v-else>{{ p.num }}</span>
            </div>
            <!-- Label -->
            <span
              class="text-[10px] uppercase tracking-widest font-bold hidden sm:block"
              :class="{
                'text-solar-400': calc.paso.value === p.num,
                'text-solar-600': calc.paso.value > p.num,
                'text-slate-600': calc.paso.value < p.num,
              }"
              >{{ p.label }}</span
            >
          </button>

          <!-- Conector -->
          <div
            v-if="i < pasosTitulos.length - 1"
            class="flex-1 max-w-24 h-0.5 mb-6 transition-all duration-500"
            :class="
              calc.paso.value > p.num ? 'bg-solar-500' : 'bg-white/[0.07]'
            "
          />
        </template>
      </nav>

      <!-- Paneles por paso -->
      <Transition name="fade-up" mode="out-in">
        <!-- PASO 1 -->
        <CalculatorStepPerfil v-if="calc.paso.value === 1" @next="irPaso(2)" />

        <!-- PASO 2 -->
        <CalculatorStepConsumo
          v-else-if="calc.paso.value === 2"
          @prev="irPaso(1)"
          @next="irPaso(3)"
        />

        <!-- PASO 3 -->
        <CalculatorStepSistema
          v-else-if="calc.paso.value === 3"
          @prev="irPaso(2)"
          @next="irPaso(4)"
        />

        <!-- PASO 4 -->
        <CalculatorStepResultados
          v-else-if="calc.paso.value === 4"
          @recalcular="irPaso(1)"
        />
      </Transition>
    </div>

    <!-- Footer -->
    <footer class="text-center py-10 px-5 border-t border-white/[0.06] mt-4">
      <p class="text-sm text-slate-600">
        ☀️ <strong class="text-slate-500">Calculadora Solar Perú</strong> —
        Herramienta educativa gratuita.<br />
        Datos HSP:
        <a
          href="https://globalsolaratlas.info"
          target="_blank"
          class="text-solar-600 hover:text-solar-500"
          >Global Solar Atlas</a
        >
        y SENAMHI. Factor CO₂: MINEM 2023. Tarifas: OSINERGMIN 2025.
      </p>
    </footer>

    <!-- Loader overlay -->
    <CalculatorLoader :visible="calc.calculando.value" />
  </div>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
