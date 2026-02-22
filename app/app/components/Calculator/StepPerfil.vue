<script setup lang="ts">
const emit = defineEmits<{ next: [] }>();
const calc = useCalculadora();

const regionesGrupo = [
  {
    label: "Norte",
    fn: (r: string) =>
      ["Norte", "Sierra Norte", "Nor-oriente", "San Martín"].includes(r),
  },
  {
    label: "Centro",
    fn: (r: string) =>
      ["Sierra Centro", "Costa Centro", "Sierra Sur-centro", "Centro"].includes(
        r,
      ),
  },
  {
    label: "Sur",
    fn: (r: string) => ["Sierra Sur", "Sur", "Sur-oriente"].includes(r),
  },
];
const regionActiva = ref("Norte");

const ciudadesFiltradas = computed(() =>
  calc.ciudades.value.filter((c) => {
    const grupo = regionesGrupo.find((g) => g.label === regionActiva.value);
    return grupo ? grupo.fn(c.region) : true;
  }),
);

const hspGrado = (hsp: number) => {
  if (hsp >= 6.0) return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  if (hsp >= 5.5) return "bg-solar-500/20 text-solar-300 border-solar-500/40";
  if (hsp >= 5.0)
    return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  if (hsp >= 4.5)
    return "bg-orange-500/20 text-orange-300 border-orange-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
};

const siguienteHabilitado = computed(() => !!calc.perfilId.value);
</script>

<template>
  <div class="animate-fade-in-up">
    <!-- Header del paso -->
    <div class="mb-8">
      <p
        class="text-xs uppercase tracking-widest font-bold text-solar-500 mb-2"
      >
        Paso 1 de 4
      </p>
      <h2 class="font-display font-bold text-3xl md:text-4xl text-white mb-2">
        ¿Quién va a usar el sistema solar?
      </h2>
      <p class="text-slate-400">
        Selecciona tu perfil y ciudad para adaptar el cálculo a tu realidad.
      </p>
    </div>

    <!-- Perfiles -->
    <div class="mb-2">
      <p class="input-label">Selecciona tu perfil</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        <button
          v-for="perfil in calc.perfiles.value"
          :key="perfil.id"
          class="card-selectable text-center py-6 px-4 group"
          :class="calc.perfilId.value === perfil.id ? 'selected' : ''"
          @click="calc.perfilId.value = perfil.id"
        >
          <span
            class="block text-4xl mb-3 transition-transform duration-300 group-hover:scale-110"
          >
            {{ perfil.icono }}
          </span>
          <div class="font-bold text-sm text-white mb-1">
            {{ perfil.nombre }}
          </div>
          <div class="text-[11px] text-slate-500 leading-tight">
            {{ perfil.descripcion }}
          </div>
        </button>
      </div>
    </div>

    <hr class="section-divider" />

    <!-- Ciudad -->
    <div class="mb-6">
      <p class="input-label mb-3">¿En qué ciudad estás?</p>

      <!-- Tabs de región -->
      <div class="flex gap-2 flex-wrap mb-4">
        <button
          v-for="r in regionesGrupo"
          :key="r.label"
          class="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200"
          :class="
            regionActiva === r.label
              ? 'bg-solar-500 border-solar-500 text-black'
              : 'bg-transparent border-white/10 text-slate-400 hover:border-solar-500/40 hover:text-slate-200'
          "
          @click="regionActiva = r.label"
        >
          {{ r.label }}
        </button>
      </div>

      <!-- Grid de ciudades -->
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5"
      >
        <button
          v-for="ciudad in ciudadesFiltradas"
          :key="ciudad.id"
          class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-200"
          :class="
            calc.ciudadId.value === ciudad.id
              ? 'border-solar-500 bg-solar-500/10 text-solar-200'
              : 'border-white/[0.07] bg-dark-600 text-slate-300 hover:border-solar-500/30 hover:bg-dark-500'
          "
          @click="calc.ciudadId.value = ciudad.id"
        >
          <div>
            <div class="text-[13px] font-semibold leading-tight">
              {{ ciudad.nombre }}
            </div>
            <div class="text-[10px] text-slate-500">{{ ciudad.region }}</div>
          </div>
          <span
            class="text-[11px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0"
            :class="hspGrado(ciudad.hsp)"
          >
            {{ ciudad.hsp }}
          </span>
        </button>
      </div>
    </div>

    <!-- Box informativo HSP -->
    <div
      v-if="calc.ciudadActual.value"
      class="flex items-center gap-4 p-4 rounded-xl border border-solar-500/20 bg-solar-500/5 mt-4"
    >
      <span class="text-4xl">☀️</span>
      <div>
        <div class="font-bold text-solar-300 text-base">
          {{ calc.ciudadActual.value.nombre }} —
          <span class="text-solar-500"
            >{{ calc.ciudadActual.value.hsp }} HSP</span
          >
          <span class="ml-2 text-sm" :class="calc.hspInfo.value.color">{{
            calc.hspInfo.value.nivel
          }}</span>
        </div>
        <div class="text-xs text-slate-500">
          Altitud: {{ calc.ciudadActual.value.altitud }} msnm · Región:
          {{ calc.ciudadActual.value.region }}
        </div>
      </div>
    </div>

    <!-- Botón siguiente -->
    <div class="flex justify-end mt-8">
      <button
        class="btn-primary text-base px-8 py-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        :disabled="!siguienteHabilitado"
        @click="emit('next')"
      >
        Siguiente: Mi consumo <span class="text-lg">→</span>
      </button>
    </div>
  </div>
</template>
