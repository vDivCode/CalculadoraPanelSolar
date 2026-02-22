<script setup lang="ts">
const emit = defineEmits<{ prev: []; next: [] }>();
const calc = useCalculadora();

const tabActiva = ref<"recibo" | "equipos" | "ia">("recibo");
watch(tabActiva, (v) => {
  calc.consumoMode.value = v;
});

// ── Equipos: categoria activa ──
const categorias = computed(() => [
  ...new Set(calc.equiposActivos.value.map((e) => e.categoria)),
]);
const catActiva = ref("");
watch(
  categorias,
  (cats) => {
    if (cats.length) catActiva.value = cats[0];
  },
  { immediate: true },
);

const equiposFiltrados = computed(() =>
  calc.equiposActivos.value.filter((e) => e.categoria === catActiva.value),
);

const resumenEquipos = computed(() =>
  calc.equiposSelec.value.map((sel) => {
    const consumo = (
      ((sel.potencia * sel.cantidad * sel.horas_dia) / 1000) *
      30
    ).toFixed(1);
    return { ...sel, consumo_kwh_mes: consumo };
  }),
);

// ── IA heurística ──
const iaTexto = ref("");
const iaResultado = ref<{ consumo: number; desc: string } | null>(null);

const analizarIA = () => {
  const t = iaTexto.value.toLowerCase();
  if (!t.trim()) return;

  let consumo = 200,
    desc = "Estimación basada en palabras clave";

  if (t.match(/min[eí]r[ía]|mina/)) {
    consumo = 25000;
    desc = "Operación minera — demanda muy alta";
  } else if (t.match(/data.?center|servidor/)) {
    consumo = 8000;
    desc = "Data center / servidores";
  } else if (t.match(/hotel/) && t.match(/grand|100|200/)) {
    consumo = 8000;
    desc = "Hotel grande — habitaciones, A/C y restaurante";
  } else if (t.match(/hotel/)) {
    consumo = 3000;
    desc = "Hotel mediano — habitaciones y servicios";
  } else if (t.match(/f[aá]brica|planta.?industrial/)) {
    consumo = 12000;
    desc = "Planta industrial — maquinaria y producción continua";
  } else if (t.match(/taller/)) {
    consumo = 3000;
    desc = "Taller mecánico / industrial";
  } else if (t.match(/restaurante|cevicher[ií]a|cocina/)) {
    consumo = 800;
    desc = "Restaurante — cocina industrial y refrigeración";
  } else if (t.match(/hospital|cl[ií]nica/)) {
    consumo = 5000;
    desc = "Clínica / hospital — equipos médicos 24/7";
  } else if (t.match(/colegio|escuela|universidad/)) {
    consumo = 2500;
    desc = "Institución educativa — aulas y laboratorios";
  } else if (t.match(/supermercado|mercado/)) {
    consumo = 4000;
    desc = "Supermercado — refrigeración e iluminación";
  } else if (t.match(/oficina|empresa|corporativo/)) {
    const m = t.match(/(\d+)\s*(personas?|trabajadores?|empleados?)/);
    const n = m ? +m[1] : 10;
    consumo =
      n * 80 +
      (t.includes("servidor") ? 2000 : 0) +
      (t.match(/aire|a\/c/) ? n * 100 : 0);
    desc = `Oficina con ~${n} personas`;
  } else if (t.match(/casa|hogar|familia/)) {
    const m = t.match(/(\d+)\s*(personas?|miembros?)/);
    const n = m ? +m[1] : 4;
    consumo =
      n * 60 +
      (t.match(/aire|a\/c/) ? 200 : 0) +
      (t.includes("piscina") ? 300 : 0);
    desc = `Hogar con ~${n} personas`;
  } else {
    let e = 150;
    if (t.match(/aire.?acondicionado|a\/c/)) e += 300;
    if (t.match(/maquinaria|l[aá]ser/)) e += 500;
    if (t.match(/refriger/)) e += 200;
    if (t.match(/computadora|laptop|pc/)) e += 100;
    consumo = e;
  }

  iaResultado.value = { consumo, desc };
  calc.consumoKwh.value = consumo;
};

const chips = [
  "Oficina de 10 personas con A/C",
  "Casa familiar de 4 personas",
  "Restaurante con cocina industrial",
  "Hotel pequeño de 20 habitaciones",
  "Taller mecánico con motores",
  "Clínica mediana 24 horas",
  "Supermercado con refrigeración",
  "Fábrica con motores industriales",
];
</script>

<template>
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <p
        class="text-xs uppercase tracking-widest font-bold text-solar-500 mb-2"
      >
        Paso 2 de 4
      </p>
      <h2 class="font-display font-bold text-3xl md:text-4xl text-white mb-2">
        ¿Cuánta energía consumes?
      </h2>
      <p class="text-slate-400">Elige el método que mejor se adapte a ti.</p>
    </div>

    <!-- Tabs -->
    <div
      class="flex gap-1 p-1.5 bg-dark-700 rounded-xl border border-white/[0.06] mb-7"
    >
      <button
        v-for="tab in [
          { id: 'recibo', label: '🧾 Tengo mi recibo' },
          { id: 'equipos', label: '📋 Lista de equipos' },
          { id: 'ia', label: '🤖 Asistente IA' },
        ]"
        :key="tab.id"
        class="flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all duration-200"
        :class="
          tabActiva === tab.id
            ? 'bg-solar-500 text-black shadow-solar-btn'
            : 'text-slate-400 hover:text-slate-200 hover:bg-dark-600'
        "
        @click="tabActiva = tab.id as any"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- ── RECIBO ── -->
    <div v-show="tabActiva === 'recibo'" class="max-w-lg">
      <div class="mb-5">
        <label class="input-label">Consumo mensual de tu recibo</label>
        <div class="relative">
          <input
            v-model.number="calc.consumoKwh.value"
            type="number"
            min="10"
            max="500000"
            step="10"
            placeholder="Ej: 280"
            class="input-field pr-20"
          />
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-solar-500"
            >kWh/mes</span
          >
        </div>
        <p class="text-xs text-slate-600 mt-2">
          📄 Lo encuentras en tu recibo de Hidrandina, Edelnor, LuzdelSur u otra
          distribuidora.
        </p>
      </div>

      <!-- Referencia rápida -->
      <div class="p-4 rounded-xl bg-dark-600 border border-white/[0.06]">
        <p
          class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3"
        >
          📊 Referencias típicas en Perú
        </p>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="ref in [
              { label: '🏠 Casa pequeña', valor: '80–150 kWh' },
              { label: '🏠 Casa mediana', valor: '200–350 kWh' },
              { label: '🏪 Tienda', valor: '300–600 kWh' },
              { label: '🏢 Oficina', valor: '500–1,500 kWh' },
              { label: '🏭 Industria', valor: '3,000–50,000 kWh' },
              { label: '🏨 Hotel med.', valor: '3,000–8,000 kWh' },
            ]"
            :key="ref.label"
            class="text-xs text-slate-500"
          >
            {{ ref.label }}:
            <strong class="text-solar-400">{{ ref.valor }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- ── EQUIPOS ── -->
    <div
      v-show="tabActiva === 'equipos'"
      class="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5"
    >
      <!-- Lista -->
      <div>
        <!-- Categorías -->
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            v-for="cat in categorias"
            :key="cat"
            class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200"
            :class="
              catActiva === cat
                ? 'bg-solar-500/15 border-solar-500/50 text-solar-300'
                : 'border-white/[0.07] text-slate-500 hover:border-solar-500/30 hover:text-slate-300'
            "
            @click="catActiva = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Equipos -->
        <div class="space-y-2 max-h-80 overflow-y-auto pr-1">
          <div
            v-for="eq in equiposFiltrados"
            :key="eq.id"
            class="flex items-center gap-3 p-3 rounded-xl border transition-all duration-200"
            :class="
              calc.cantidadEquipo(eq.id) > 0
                ? 'border-solar-500/50 bg-solar-500/5'
                : 'border-white/[0.06] bg-dark-600 hover:border-solar-500/20'
            "
          >
            <!-- Info -->
            <span class="text-2xl flex-shrink-0">{{ eq.icono }}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-slate-200 truncate">
                {{ eq.nombre }}
              </div>
              <div class="text-xs text-slate-500">
                {{ eq.potencia.toLocaleString() }} W
              </div>
            </div>

            <!-- Horas -->
            <div class="text-center flex-shrink-0">
              <div
                class="text-[9px] text-slate-600 uppercase tracking-wide mb-0.5"
              >
                Horas/día
              </div>
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                :value="
                  calc.equiposSelec.value.find((e) => e.id === eq.id)
                    ?.horas_dia ?? 8
                "
                class="w-14 text-center bg-dark-700 border border-white/[0.07] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-solar-500"
                @change="
                  calc.actualizarHoras(
                    eq.id,
                    +($event.target as HTMLInputElement).value,
                  )
                "
              />
            </div>

            <!-- Cantidad -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                class="w-7 h-7 rounded-full border border-white/10 bg-dark-700 flex items-center justify-center text-slate-400 text-base font-bold hover:border-solar-500 hover:text-solar-500 transition-colors"
                @click="calc.cambiarCantidad(eq, -1)"
              >
                −
              </button>
              <span class="w-6 text-center font-bold text-sm text-white">
                {{ calc.cantidadEquipo(eq.id) }}
              </span>
              <button
                class="w-7 h-7 rounded-full border border-white/10 bg-dark-700 flex items-center justify-center text-slate-400 text-base font-bold hover:border-solar-500 hover:text-solar-500 transition-colors"
                @click="calc.cambiarCantidad(eq, 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen lateral -->
      <div class="p-5 rounded-2xl border border-solar-500/20 bg-solar-500/5">
        <p
          class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4"
        >
          ⚡ Resumen de consumo
        </p>
        <div class="space-y-2 max-h-48 overflow-y-auto mb-4">
          <div
            v-if="resumenEquipos.length === 0"
            class="text-xs text-slate-600"
          >
            Sin equipos seleccionados
          </div>
          <div
            v-for="eq in resumenEquipos"
            :key="eq.id"
            class="flex justify-between text-xs"
          >
            <span class="text-slate-400 truncate mr-2"
              >{{ eq.icono }} {{ eq.nombre }} ×{{ eq.cantidad }}</span
            >
            <span class="text-solar-400 font-bold flex-shrink-0"
              >{{ eq.consumo_kwh_mes }} kWh</span
            >
          </div>
        </div>
        <div
          class="border-t border-white/[0.07] pt-3 flex justify-between items-center"
        >
          <span class="text-sm font-bold text-white">Total</span>
          <span class="font-display font-extrabold text-2xl text-solar-500">
            {{ calc.consumoTotal.value.toFixed(0) }}
            <span class="text-base">kWh/mes</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ── IA ── -->
    <div v-show="tabActiva === 'ia'" class="max-w-xl">
      <label class="input-label">Describe tu negocio o instalación</label>
      <textarea
        v-model="iaTexto"
        rows="4"
        placeholder="Ej: 'Somos una oficina de 15 personas con 12 computadoras, 2 aires acondicionados y cocina...' o 'Casa de 4 personas con lavadora, refrigeradora grande y ducha eléctrica...'"
        class="input-field resize-none mb-3"
      />

      <!-- Chips de sugerencias -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="chip in chips"
          :key="chip"
          class="px-3 py-1.5 rounded-full border border-white/[0.07] bg-dark-600 text-xs text-slate-400 hover:border-solar-500/40 hover:text-solar-300 hover:bg-solar-500/5 transition-all duration-200"
          @click="iaTexto = chip"
        >
          {{ chip }}
        </button>
      </div>

      <button class="btn-primary" @click="analizarIA">
        🤖 Estimar consumo
      </button>

      <!-- Resultado IA -->
      <Transition name="fade-up">
        <div
          v-if="iaResultado"
          class="mt-5 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5"
        >
          <p
            class="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2"
          >
            ✅ Consumo estimado
          </p>
          <p class="font-display font-extrabold text-3xl text-white">
            {{ iaResultado.consumo.toLocaleString() }}
            <span class="text-lg text-slate-400">kWh/mes</span>
          </p>
          <p class="text-sm text-slate-400 mt-1">{{ iaResultado.desc }}</p>
          <p class="text-[11px] text-slate-600 mt-2">
            * Para mayor precisión usa "Lista de equipos".
          </p>
        </div>
      </Transition>
    </div>

    <!-- Botones navegación -->
    <div class="flex justify-between items-center mt-10 gap-3">
      <button class="btn-secondary" @click="emit('prev')">← Anterior</button>
      <button class="btn-primary text-base px-8 py-4" @click="emit('next')">
        Siguiente: Tipo de sistema →
      </button>
    </div>
  </div>
</template>
