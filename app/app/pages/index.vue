<script setup lang="ts">
const calc = useCalculadora();

onMounted(() => {
  calc.cargarDatos();
});

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
  <div class="min-h-screen bg-slate-50">
    <!-- ── HEADER ── -->
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between"
      >
        <div class="flex items-center gap-2.5">
          <span class="text-2xl">☀️</span>
          <span class="font-display font-bold text-navy-900 text-lg"
            >SolarCalc <span class="text-brand-600">Perú</span></span
          >
        </div>
        <span class="badge-blue">Herramienta gratuita</span>
      </div>
    </header>

    <!-- ── HERO ── -->
    <section class="bg-white border-b border-slate-100 py-14 text-center px-5">
      <div class="max-w-3xl mx-auto">
        <span class="badge-blue mb-5 inline-flex"
          >☀️ Calculadora Solar Profesional · Perú 2025</span
        >

        <h1
          class="font-display font-bold text-4xl md:text-5xl text-navy-900 leading-tight mb-4"
        >
          ¿Cuántos paneles solares<br />
          <span class="text-brand-600">necesitas en Perú?</span>
        </h1>

        <p
          class="text-slate-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          La calculadora más completa del país. Para hogares, empresas e
          industrias. Con
          <strong class="text-navy-900 font-semibold"
            >datos reales de 24 ciudades peruanas</strong
          >.
        </p>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-8">
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
              class="block font-display font-bold text-3xl text-brand-600"
              >{{ stat.value }}</span
            >
            <span
              class="text-xs text-slate-500 mt-1 block uppercase tracking-wide"
              >{{ stat.label }}</span
            >
          </div>
        </div>
      </div>
    </section>

    <!-- ── MAIN CONTENT ── -->
    <main class="max-w-5xl mx-auto px-5 py-10">
      <!-- Stepper nav -->
      <nav
        class="flex items-center justify-center mb-10 gap-0"
        aria-label="Pasos del cálculo"
      >
        <template v-for="(p, i) in pasosTitulos" :key="p.num">
          <button
            class="flex flex-col items-center gap-1.5 z-10 cursor-pointer group"
            :aria-current="calc.paso.value === p.num ? 'step' : undefined"
            @click="calc.paso.value > p.num ? irPaso(p.num) : undefined"
          >
            <!-- Circle -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-200"
              :class="{
                'border-brand-600 bg-brand-600 text-white':
                  calc.paso.value === p.num,
                'border-brand-600 bg-brand-100 text-brand-700':
                  calc.paso.value > p.num,
                'border-slate-300 bg-white text-slate-400':
                  calc.paso.value < p.num,
              }"
            >
              <span v-if="calc.paso.value > p.num">✓</span>
              <span v-else>{{ p.num }}</span>
            </div>
            <!-- Label -->
            <span
              class="text-[10px] uppercase tracking-widest font-semibold hidden sm:block"
              :class="{
                'text-brand-600': calc.paso.value === p.num,
                'text-brand-500': calc.paso.value > p.num,
                'text-slate-400': calc.paso.value < p.num,
              }"
              >{{ p.label }}</span
            >
          </button>

          <!-- Connector -->
          <div
            v-if="i < pasosTitulos.length - 1"
            class="flex-1 max-w-20 h-0.5 mb-5 transition-all duration-300"
            :class="calc.paso.value > p.num ? 'bg-brand-500' : 'bg-slate-200'"
          />
        </template>
      </nav>

      <!-- Step panels -->
      <div
        class="bg-white rounded-2xl border border-slate-200 shadow-card p-7 md:p-9"
      >
        <Transition name="step" mode="out-in">
          <CalculatorStepPerfil
            v-if="calc.paso.value === 1"
            @next="irPaso(2)"
          />
          <CalculatorStepConsumo
            v-else-if="calc.paso.value === 2"
            @prev="irPaso(1)"
            @next="irPaso(3)"
          />
          <CalculatorStepSistema
            v-else-if="calc.paso.value === 3"
            @prev="irPaso(2)"
            @next="irPaso(4)"
          />
          <CalculatorStepResultados
            v-else-if="calc.paso.value === 4"
            @recalcular="irPaso(1)"
          />
        </Transition>
      </div>
    </main>

    <!-- ── FOOTER ── -->
    <footer
      class="border-t border-slate-200 bg-white mt-6 py-8 px-5 text-center"
    >
      <p class="text-sm text-slate-400">
        ☀️ <strong class="text-slate-600">Calculadora Solar Perú</strong> —
        Herramienta educativa gratuita.<br />
        Datos HSP:
        <a
          href="https://globalsolaratlas.info"
          target="_blank"
          class="text-brand-500 hover:underline"
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
.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.step-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
