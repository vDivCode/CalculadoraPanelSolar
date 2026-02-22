<script setup lang="ts">
const emit = defineEmits<{ prev: []; next: [] }>();
const calc = useCalculadora();

const avanzado = ref(false);
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <p
        class="text-xs uppercase tracking-widest font-bold text-solar-500 mb-2"
      >
        Paso 3 de 4
      </p>
      <h2 class="font-display font-bold text-3xl md:text-4xl text-white mb-2">
        Configura tu sistema solar
      </h2>
      <p class="text-slate-400">
        Elige el panel y el tipo de almacenamiento que mejor se adapta a tus
        necesidades.
      </p>
    </div>

    <!-- ── PANELES ── -->
    <div class="mb-8">
      <p class="input-label mb-4">Tipo de panel solar</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          v-for="panel in calc.paneles.value"
          :key="panel.id"
          class="card-selectable text-left relative"
          :class="calc.panelId.value === panel.id ? 'selected' : ''"
          @click="calc.panelId.value = panel.id"
        >
          <!-- Badge -->
          <span
            v-if="panel.badge"
            class="badge-solar text-[10px] mb-3 block w-fit"
            >{{ panel.badge }}</span
          >

          <!-- Potencia -->
          <div class="font-display font-extrabold text-4xl text-white mb-1">
            {{ panel.potencia
            }}<span class="text-lg text-slate-500 ml-1">W</span>
          </div>

          <div class="font-bold text-sm text-slate-200 mb-3">
            {{ panel.nombre }}
          </div>

          <div class="space-y-1.5 text-xs text-slate-500">
            <div class="flex justify-between">
              <span>Eficiencia</span>
              <span class="text-solar-400 font-bold"
                >{{ (panel.eficiencia * 100).toFixed(1) }}%</span
              >
            </div>
            <div class="flex justify-between">
              <span>Dimensiones</span>
              <span class="text-slate-400">{{ panel.dimensiones }}</span>
            </div>
            <div class="flex justify-between">
              <span>Precio ref.</span>
              <span class="text-slate-400">~${{ panel.precio_usd }} USD</span>
            </div>
          </div>

          <!-- Check -->
          <div
            v-if="calc.panelId.value === panel.id"
            class="absolute top-4 right-4 w-6 h-6 rounded-full bg-solar-500 flex items-center justify-center text-black font-black text-xs"
          >
            ✓
          </div>
        </button>
      </div>
    </div>

    <hr class="section-divider" />

    <!-- ── BATERÍAS ── -->
    <div class="mb-8">
      <p class="input-label mb-4">Tipo de almacenamiento</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          v-for="bat in calc.baterias.value"
          :key="bat.id"
          class="card-selectable text-left relative flex gap-4 items-start"
          :class="calc.bateriaId.value === bat.id ? 'selected' : ''"
          @click="calc.bateriaId.value = bat.id"
        >
          <span class="text-3xl mt-0.5 flex-shrink-0">{{ bat.icono }}</span>
          <div>
            <div class="font-bold text-white mb-1.5 text-sm">
              {{ bat.nombre }}
            </div>
            <div class="text-xs text-slate-500 leading-relaxed">
              {{ bat.descripcion }}
            </div>
            <div class="mt-3 space-y-1 text-xs">
              <div v-if="bat.autonomia_horas > 0">
                🔋 Autonomía:
                <strong class="text-solar-400"
                  >{{ bat.autonomia_horas }} h</strong
                >
              </div>
              <div v-if="bat.ciclos_vida > 0">
                ♻️ Ciclos:
                <strong class="text-solar-400">{{
                  bat.ciclos_vida.toLocaleString()
                }}</strong>
              </div>
              <div v-if="bat.tipo === 'on_grid'" class="text-emerald-400">
                ⚡ Venta de excedentes a la red
              </div>
            </div>
          </div>

          <!-- Check -->
          <div
            v-if="calc.bateriaId.value === bat.id"
            class="absolute top-4 right-4 w-6 h-6 rounded-full bg-solar-500 flex items-center justify-center text-black font-black text-xs"
          >
            ✓
          </div>
        </button>
      </div>
    </div>

    <!-- ── OPCIONES AVANZADAS ── -->
    <div>
      <button
        class="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-solar-400 transition-colors mb-4"
        @click="avanzado = !avanzado"
      >
        <span
          class="transition-transform duration-300"
          :class="avanzado ? 'rotate-90' : 'rotate-0'"
          >›</span
        >
        Opciones avanzadas (sombra y eficiencia)
      </button>

      <Transition name="fade-up">
        <div
          v-if="avanzado"
          class="p-5 rounded-xl border border-white/[0.06] bg-dark-700 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <!-- Factor sombra -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="input-label">Factor de sombra</label>
              <span class="text-solar-400 font-bold text-sm"
                >{{ calc.factorSombra.value }}%</span
              >
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              v-model.number="calc.factorSombra.value"
              class="w-full accent-solar-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>0% (Sin sombra)</span><span>40% (Mucha sombra)</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">
              Reducción por árboles, edificios o chimeneas cercanas.
            </p>
          </div>

          <!-- Eficiencia sistema -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="input-label">Eficiencia del sistema</label>
              <span class="text-solar-400 font-bold text-sm"
                >{{ calc.eficiencia.value }}%</span
              >
            </div>
            <input
              type="range"
              min="70"
              max="95"
              step="5"
              v-model.number="calc.eficiencia.value"
              class="w-full accent-solar-500 cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>70% (Sistema viejo)</span><span>95% (Sistema nuevo)</span>
            </div>
            <p class="text-xs text-slate-600 mt-2">
              Incluye pérdidas por temperatura, cables e inversor.
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Botones -->
    <div class="flex justify-between items-center mt-10 gap-3">
      <button class="btn-secondary" @click="emit('prev')">← Anterior</button>
      <button class="btn-primary text-base px-8 py-4" @click="emit('next')">
        ☀️ Calcular mi sistema solar →
      </button>
    </div>
  </div>
</template>
