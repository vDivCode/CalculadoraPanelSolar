<script setup lang="ts">
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const emit = defineEmits<{ recalcular: [] }>();
const calc = useCalculadora();
const r = computed(() => calc.resultado.value);

// ── Chart producción mensual ──
const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const montarChart = () => {
  if (!chartRef.value || !r.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartRef.value, {
    type: "bar",
    data: {
      labels: r.value.produccion_mensual.map((m) => m.mes),
      datasets: [
        {
          label: "Producción (kWh)",
          data: r.value.produccion_mensual.map((m) => m.produccion),
          backgroundColor: r.value.produccion_mensual.map((m, i) =>
            i ===
            r.value!.produccion_mensual.reduce(
              (mx, v, idx, arr) =>
                v.produccion > arr[mx].produccion ? idx : mx,
              0,
            )
              ? "rgba(37, 99, 235, 0.90)"
              : "rgba(59, 130, 246, 0.35)",
          ),
          borderColor: "rgba(37, 99, 235, 0.6)",
          borderWidth: 1.5,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#ffffff",
          borderColor: "#e2e8f0",
          borderWidth: 1,
          titleColor: "#1e3a8a",
          bodyColor: "#64748b",
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y.toLocaleString("es-PE")} kWh`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: { color: "#94a3b8", font: { size: 11, weight: "bold" } },
        },
        y: {
          grid: { color: "rgba(0,0,0,0.04)" },
          ticks: {
            color: "#94a3b8",
            font: { size: 11 },
            callback: (v) => `${Number(v).toLocaleString()} kWh`,
          },
        },
      },
    },
  });
};

watch(r, () => nextTick(montarChart));
onMounted(() => nextTick(montarChart));
onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>

<template>
  <div class="animate-slide-up">
    <!-- Loading -->
    <div v-if="calc.calculando.value" class="text-center py-20">
      <div class="inline-flex flex-col items-center gap-4">
        <div
          class="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"
        />
        <p class="text-brand-700 font-semibold">
          Calculando tu sistema solar...
        </p>
        <p class="text-slate-400 text-sm">
          Analizando datos de {{ calc.ciudadActual.value?.nombre }}
        </p>
      </div>
    </div>

    <!-- Sin resultado -->
    <div v-else-if="!r" class="text-center py-20 text-slate-400">
      No hay resultados aún.
    </div>

    <!-- ── RESULTADOS ── -->
    <template v-else>
      <div class="mb-7">
        <p
          class="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-1"
        >
          Paso 4 de 4 · Resultados
        </p>
        <h2
          class="font-display font-bold text-2xl md:text-3xl text-navy-900 mb-1"
        >
          Tu sistema solar en {{ r.ciudad.nombre }}
        </h2>
        <p class="text-slate-500 text-sm">
          {{ r.modo_sistema }} · {{ r.panel.nombre }} ·
          {{ calc.fmt.kwh(r.consumo_kwh_mes) }}/mes
        </p>
      </div>

      <!-- ── KPIs PRINCIPALES ── -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-7">
        <div class="kpi-blue col-span-2 md:col-span-1">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            Paneles
          </div>
          <div class="font-display font-bold text-4xl text-navy-900">
            {{ r.num_paneles }}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ r.potencia_total_kw }} kWp total
          </div>
        </div>

        <div class="kpi-blue">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            Inversor
          </div>
          <div class="font-display font-bold text-2xl text-navy-900">
            {{ r.inversor_kw
            }}<span class="text-sm text-slate-400 ml-1">kW</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">Potencia instalada</div>
        </div>

        <div class="kpi-green">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            Ahorro/mes
          </div>
          <div class="font-display font-bold text-xl text-navy-900">
            {{ calc.fmt.pen(r.ahorro_mes_pen) }}
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ calc.fmt.usd(r.ahorro_anio_usd / 12) }} USD/mes
          </div>
        </div>

        <div class="kpi-violet">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            Retorno
          </div>
          <div class="font-display font-bold text-2xl text-navy-900">
            {{ r.payback_anios
            }}<span class="text-sm text-slate-400 ml-1">años</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">Recupero de inversión</div>
        </div>

        <div class="kpi-green">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            CO₂ evitado
          </div>
          <div class="font-display font-bold text-xl text-navy-900">
            {{ r.co2_evitado_anio_kg
            }}<span class="text-sm text-slate-400 ml-1">kg/año</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">
            {{ r.arboles_equivalentes }} árboles
          </div>
        </div>

        <div class="kpi-amber">
          <div
            class="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1.5"
          >
            Área
          </div>
          <div class="font-display font-bold text-2xl text-navy-900">
            {{ r.area_total_m2
            }}<span class="text-sm text-slate-400 ml-1">m²</span>
          </div>
          <div class="text-xs text-slate-400 mt-1">Techo requerido</div>
        </div>
      </div>

      <!-- ── GRÁFICO ── -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-display font-semibold text-base text-navy-900">
              Producción mensual estimada
            </h3>
            <p class="text-xs text-slate-400">
              Variación estacional para {{ r.ciudad.nombre }}
            </p>
          </div>
          <div class="text-right">
            <div class="text-xs text-slate-400">Anual</div>
            <div class="font-semibold text-brand-600 text-sm">
              {{ calc.fmt.kwh(r.energia_generada_anio) }}
            </div>
          </div>
        </div>
        <div class="h-52">
          <canvas ref="chartRef" />
        </div>
      </div>

      <!-- ── COSTOS + RETORNO ── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <!-- Desglose de costos -->
        <div class="card">
          <h3 class="font-display font-semibold text-base text-navy-900 mb-4">
            💰 Inversión detallada
          </h3>
          <div class="space-y-2">
            <div
              v-for="item in [
                {
                  label: `Paneles solares (${r.num_paneles} × ${r.panel.nombre})`,
                  valor: r.costo_paneles_usd,
                },
                {
                  label: `Inversor ${r.inversor_kw} kW`,
                  valor: r.costo_inversor_usd,
                },
                {
                  label: 'Estructura de montaje',
                  valor: r.costo_estructura_usd,
                },
                { label: 'Cableado y protecciones', valor: r.costo_cables_usd },
                {
                  label: 'Mano de obra e instalación',
                  valor: r.costo_mano_obra_usd,
                },
                {
                  label: 'Baterías',
                  valor: r.costo_baterias_usd,
                  hide: r.costo_baterias_usd === 0,
                },
                { label: 'Sistema de monitoreo', valor: r.costo_monitoreo_usd },
                { label: 'IGV (18%)', valor: r.igv_usd },
              ].filter((i) => !i.hide)"
              :key="item.label"
              class="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
            >
              <span class="text-sm text-slate-600">{{ item.label }}</span>
              <div class="text-right">
                <div class="text-sm font-semibold text-navy-900">
                  {{ calc.fmt.usd(item.valor) }}
                </div>
                <div class="text-[11px] text-slate-400">
                  {{ calc.fmt.pen(item.valor * 3.75) }}
                </div>
              </div>
            </div>
          </div>
          <div
            class="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-200 flex justify-between items-center"
          >
            <span class="font-semibold text-sm text-brand-700">TOTAL</span>
            <div class="text-right">
              <div class="font-display font-bold text-xl text-navy-900">
                {{ calc.fmt.usd(r.costo_total_usd) }}
              </div>
              <div class="text-sm text-brand-600">
                {{ calc.fmt.pen(r.costo_total_pen) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Retorno e impacto -->
        <div class="space-y-4">
          <!-- Retorno 25 años -->
          <div class="card">
            <h3 class="font-display font-semibold text-base text-navy-900 mb-4">
              📈 Retorno en 25 años
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="kpi in [
                  {
                    label: 'Payback',
                    val: `${r.payback_anios} años`,
                    sub: 'Recuperación de inversión',
                  },
                  {
                    label: 'ROI',
                    val: `${r.roi_25_anios}%`,
                    sub: 'Retorno sobre inversión',
                  },
                  {
                    label: 'Ahorro total',
                    val: calc.fmt.pen(r.ahorro_total_25_anios),
                    sub: '25 años acumulados',
                  },
                  {
                    label: 'Ganancia',
                    val: calc.fmt.pen(r.ganancia_neta_25_anios),
                    sub: 'Neta descontando costos',
                  },
                ]"
                :key="kpi.label"
              >
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div
                    class="text-[10px] text-slate-400 uppercase tracking-widest mb-1"
                  >
                    {{ kpi.label }}
                  </div>
                  <div class="font-semibold text-sm text-brand-700">
                    {{ kpi.val }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    {{ kpi.sub }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Impacto ambiental -->
          <div class="card">
            <h3 class="font-display font-semibold text-sm text-navy-900 mb-4">
              🌿 Impacto ambiental
            </h3>
            <div class="grid grid-cols-3 gap-2.5">
              <div class="eco-card">
                <div class="text-xl mb-1">🌍</div>
                <div class="font-bold text-lg text-emerald-600">
                  {{ r.co2_evitado_25_anios_toneladas }}
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  toneladas CO₂<br />en 25 años
                </div>
              </div>
              <div class="eco-card">
                <div class="text-xl mb-1">🌳</div>
                <div class="font-bold text-lg text-emerald-600">
                  {{ r.arboles_equivalentes.toLocaleString() }}
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  árboles<br />equivalentes
                </div>
              </div>
              <div class="eco-card">
                <div class="text-xl mb-1">⚡</div>
                <div class="font-bold text-base text-emerald-600">
                  {{ calc.fmt.kwh(r.energia_generada_anio) }}
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  energía limpia<br />por año
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FICHA TÉCNICA ── -->
      <div class="card mb-8">
        <h3 class="font-display font-semibold text-base text-navy-900 mb-4">
          🔧 Especificaciones técnicas
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <div
            v-for="spec in [
              { label: 'Ciudad', val: r.ciudad.nombre },
              { label: 'HSP efectiva', val: `${r.hsp} h/día` },
              {
                label: 'Consumo mensual',
                val: calc.fmt.kwh(r.consumo_kwh_mes),
              },
              {
                label: 'Producción mensual',
                val: calc.fmt.kwh(r.energia_generada_mes),
              },
              { label: 'Panel seleccionado', val: r.panel.nombre },
              { label: 'Modo del sistema', val: r.modo_sistema },
              {
                label: 'Eficiencia configurada',
                val: `${calc.eficiencia.value}%`,
              },
              { label: 'Factor CO₂ Perú', val: '0.5568 kg/kWh' },
            ]"
            :key="spec.label"
            class="p-3 rounded-xl bg-slate-50 border border-slate-200"
          >
            <div
              class="text-[10px] text-slate-400 uppercase tracking-widest mb-1"
            >
              {{ spec.label }}
            </div>
            <div class="text-sm font-semibold text-navy-900">
              {{ spec.val }}
            </div>
          </div>
        </div>
      </div>

      <!-- Recalcular -->
      <div class="text-center">
        <button class="btn-outline" @click="emit('recalcular')">
          🔄 Recalcular con otros datos
        </button>
      </div>
    </template>
  </div>
</template>
