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

const hspColor = (hsp: number) => {
  if (hsp >= 6.0) return "bg-rose-100 text-rose-700 border-rose-200";
  if (hsp >= 5.5) return "bg-amber-100 text-amber-700 border-amber-200";
  if (hsp >= 5.0) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (hsp >= 4.5) return "bg-orange-100 text-orange-700 border-orange-200";
  return "bg-slate-100 text-slate-500 border-slate-200";
};

const siguienteHabilitado = computed(() => !!calc.perfilId.value);
</script>

<template>
  <div class="animate-slide-up">
    <!-- Header de paso -->
    <div class="mb-7">
      <p
        class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1"
      >
        Paso 1 de 4
      </p>
      <h2
        class="font-display font-bold text-2xl md:text-3xl text-navy-900 mb-1"
      >
        ¿Quién va a usar el sistema solar?
      </h2>
      <p class="text-slate-500 text-sm">
        Selecciona tu perfil y ciudad para adaptar el cálculo a tu realidad.
      </p>
    </div>

    <!-- Perfiles -->
    <div class="mb-7">
      <p class="input-label">Selecciona tu perfil</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <button
          v-for="perfil in calc.perfiles.value"
          :key="perfil.id"
          class="card-selectable text-center py-5 px-3"
          :class="calc.perfilId.value === perfil.id ? 'selected' : ''"
          @click="calc.perfilId.value = perfil.id"
        >
          <span class="block text-3xl mb-2">{{ perfil.icono }}</span>
          <div class="font-semibold text-sm text-navy-900 mb-0.5">
            {{ perfil.nombre }}
          </div>
          <div class="text-[11px] text-slate-400 leading-tight">
            {{ perfil.descripcion }}
          </div>
        </button>
      </div>
    </div>

    <hr class="section-divider" />

    <!-- Ciudad -->
    <div class="mb-6">
      <p class="input-label mb-2">¿En qué ciudad estás?</p>

      <!-- Tabs de región -->
      <div class="flex gap-2 mb-4">
        <button
          v-for="r in regionesGrupo"
          :key="r.label"
          class="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150"
          :class="
            regionActiva === r.label
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600'
          "
          @click="regionActiva = r.label"
        >
          {{ r.label }}
        </button>
      </div>

      <!-- Grid de ciudades -->
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
      >
        <button
          v-for="ciudad in ciudadesFiltradas"
          :key="ciudad.id"
          class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-left transition-all duration-150"
          :class="
            calc.ciudadId.value === ciudad.id
              ? 'border-brand-500 bg-brand-50 text-brand-800'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50'
          "
          @click="calc.ciudadId.value = ciudad.id"
        >
          <div>
            <div class="text-[13px] font-semibold leading-tight">
              {{ ciudad.nombre }}
            </div>
            <div class="text-[10px] text-slate-400">{{ ciudad.region }}</div>
          </div>
          <span
            class="text-[11px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0"
            :class="hspColor(ciudad.hsp)"
            >{{ ciudad.hsp }}</span
          >
        </button>
      </div>
    </div>

    <!-- Info HSP -->
    <div
      v-if="calc.ciudadActual.value"
      class="flex items-center gap-3 p-4 rounded-xl border border-brand-100 bg-brand-50 mt-4"
    >
      <span class="text-3xl">☀️</span>
      <div>
        <div class="font-semibold text-brand-800 text-sm">
          {{ calc.ciudadActual.value.nombre }} —
          <span class="text-brand-600"
            >{{ calc.ciudadActual.value.hsp }} HSP</span
          >
          <span class="ml-1.5 text-xs text-slate-500">{{
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
        class="btn-primary px-8 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!siguienteHabilitado"
        @click="emit('next')"
      >
        Siguiente: Mi consumo →
      </button>
    </div>
  </div>
</template>
