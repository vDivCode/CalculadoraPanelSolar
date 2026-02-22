<script setup lang="ts">
const emit = defineEmits<{ prev: []; next: [] }>();
const calc = useCalculadora();

const avanzado = ref(false);
</script>

<template>
  <div class="animate-slide-up">
    <div class="mb-7">
      <p
        class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1"
      >
        Paso 3 de 4
      </p>
      <h2
        class="font-display font-bold text-2xl md:text-3xl text-navy-900 mb-1"
      >
        Configura tu sistema solar
      </h2>
      <p class="text-slate-500 text-sm">
        Elige el panel y el tipo de almacenamiento que mejor se adapta a tus
        necesidades.
      </p>
    </div>

    <!-- ── PANELES ── -->
    <div class="mb-8">
      <p class="input-label mb-3">Tipo de panel solar</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          v-for="panel in calc.paneles.value"
          :key="panel.id"
          class="card-selectable text-left relative"
          :class="calc.panelId.value === panel.id ? 'selected' : ''"
          @click="calc.panelId.value = panel.id"
        >
          <!-- Badge -->
          <span v-if="panel.badge" class="badge-amber mb-3 block w-fit">{{
            panel.badge
          }}</span>

          <!-- Potencia -->
          <div class="font-display font-bold text-3xl text-navy-900 mb-1">
            {{ panel.potencia
            }}<span class="text-base text-slate-400 ml-1">W</span>
          </div>

          <div class="font-semibold text-sm text-navy-800 mb-3">
            {{ panel.nombre }}
          </div>

          <div class="space-y-1 text-xs text-slate-500">
            <div class="flex justify-between">
              <span>Eficiencia</span>
              <span class="text-brand-600 font-semibold"
                >{{ (panel.eficiencia * 100).toFixed(1) }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span>Dimensiones</span>
              <span class="text-slate-600">{{ panel.dimensiones }}</span>
            </div>
            <div class="flex justify-between">
              <span>Precio ref.</span>
              <span class="text-slate-600">~${{ panel.precio_usd }} USD</span>
            </div>
          </div>

          <!-- Check -->
          <div
            v-if="calc.panelId.value === panel.id"
            class="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs"
          >
            ✓
          </div>
        </button>
      </div>
    </div>

    <hr class="section-divider" />

    <!-- ── BATERÍAS ── -->
    <div class="mb-8">
      <p class="input-label mb-3">Tipo de almacenamiento</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          v-for="bat in calc.baterias.value"
          :key="bat.id"
          class="card-selectable text-left relative flex gap-3 items-start"
          :class="calc.bateriaId.value === bat.id ? 'selected' : ''"
          @click="calc.bateriaId.value = bat.id"
        >
          <span class="text-2xl mt-0.5 flex-shrink-0">{{ bat.icono }}</span>
          <div>
            <div class="font-semibold text-navy-900 text-sm mb-1">
              {{ bat.nombre }}
            </div>
            <div class="text-xs text-slate-500 leading-relaxed">
              {{ bat.descripcion }}
            </div>
            <div class="mt-2.5 space-y-1 text-xs">
              <div v-if="bat.autonomia_horas > 0" class="text-slate-600">
                🔋 Autonomía:
                <strong class="text-brand-600"
                  >{{ bat.autonomia_horas }} h</strong
                >
              </div>
              <div v-if="bat.ciclos_vida > 0" class="text-slate-600">
                ♻️ Ciclos:
                <strong class="text-brand-600">{{
                  bat.ciclos_vida.toLocaleString()
                }}</strong>
              </div>
              <div
                v-if="bat.tipo === 'on_grid'"
                class="text-emerald-600 font-medium"
              >
                ⚡ Venta de excedentes a la red
              </div>
            </div>
          </div>

          <!-- Check -->
          <div
            v-if="calc.bateriaId.value === bat.id"
            class="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs"
          >
            ✓
          </div>
        </button>
      </div>
    </div>

    <!-- ── OPCIONES AVANZADAS ── -->
    <div>
      <button
        class="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors mb-4"
        @click="avanzado = !avanzado"
      >
        <span
          class="inline-block transition-transform duration-200"
          :class="avanzado ? 'rotate-90' : 'rotate-0'"
          >▶</span
        >
        Opciones avanzadas (sombra y eficiencia)
      </button>

      <Transition name="fade">
        <div
          v-if="avanzado"
          class="p-5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <!-- Factor sombra -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="input-label">Factor de sombra</label>
              <span class="text-brand-600 font-bold text-sm"
                >{{ calc.factorSombra.value }}%</span
              >
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              v-model.number="calc.factorSombra.value"
              class="w-full accent-brand-600 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0% (Sin sombra)</span><span>40% (Mucha sombra)</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Reducción por árboles, edificios o chimeneas.
            </p>
          </div>

          <!-- Eficiencia -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="input-label">Eficiencia del sistema</label>
              <span class="text-brand-600 font-bold text-sm"
                >{{ calc.eficiencia.value }}%</span
              >
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="5"
              v-model.number="calc.eficiencia.value"
              class="w-full accent-brand-600 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>70% (Sistema viejo)</span><span>95% (Sistema nuevo)</span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Incluye pérdidas por temperatura, cables e inversor.
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Botones -->
    <div class="flex justify-between items-center mt-10 gap-3">
      <button class="btn-secondary" @click="emit('prev')">← Anterior</button>
      <button class="btn-primary px-8 py-3" @click="emit('next')">
        ☀️ Calcular mi sistema solar →
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
