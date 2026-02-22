// composables/useCalculadora.ts
// ─────────────────────────────────────────────
// Central composable: carga JSON, estado y cálculos
import { ref, computed, watch } from "vue";

// ── Constantes físicas/económicas ──
const FACTOR_CO2_PERU = 0.5568; // kg CO₂ / kWh (MINEM 2023)
const TIPO_CAMBIO_USD_PEN = 3.75; // S/ por dólar (referencial)
const VIDA_UTIL_SISTEMA = 25; // años

// ── Factores estacionales por zona ──
const FACTORES_ESTACIONALES: Record<string, number[]> = {
  costa_norte: [
    1.08, 1.06, 1.04, 0.98, 0.94, 0.9, 0.92, 0.95, 1.0, 1.03, 1.05, 1.07,
  ],
  sierra: [0.9, 0.88, 0.92, 1.0, 1.05, 1.1, 1.12, 1.1, 1.05, 1.02, 0.95, 0.92],
  selva: [0.92, 0.9, 0.94, 0.96, 0.98, 1.0, 1.02, 1.05, 1.02, 0.98, 0.95, 0.93],
  lima: [1.05, 1.02, 0.98, 0.9, 0.82, 0.75, 0.75, 0.8, 0.88, 0.95, 1.02, 1.05],
};

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// ── Tipos ──
export interface Ciudad {
  id: string;
  nombre: string;
  region: string;
  hsp: number;
  altitud: number;
}

export interface Equipo {
  id: string;
  nombre: string;
  potencia: number;
  categoria: string;
  icono: string;
}

export interface EquipoSeleccionado extends Equipo {
  cantidad: number;
  horas_dia: number;
  dias_mes: number;
}

export interface Panel {
  id: string;
  nombre: string;
  potencia: number;
  eficiencia: number;
  precio_usd: number;
  dimensiones: string;
  descripcion: string;
  badge: string;
  degradacion_anual: number;
}

export interface Bateria {
  id: string;
  nombre: string;
  tipo: "on_grid" | "off_grid" | "hibrido";
  descripcion: string;
  autonomia_horas: number;
  precio_kwh_usd: number;
  ciclos_vida: number;
  icono: string;
  dod: number;
}

export interface Perfil {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  tarifa: string;
  equiposSet: "hogar" | "empresa" | "industria";
  consumoReferencia: { min: number; max: number; tipico: number };
}

export interface Tarifa {
  id: string;
  nombre: string;
  precio_kwh: number;
  descripcion: string;
}

export interface ResultadoCalculo {
  // Inputs
  ciudad: Ciudad;
  panel: Panel;
  bateria: Bateria;
  hsp: number;
  consumo_kwh_mes: number;
  consumo_kwh_dia: number;
  // Sistema
  num_paneles: number;
  potencia_total_kw: number;
  inversor_kw: number;
  num_baterias: number;
  capacidad_bateria_kwh: number;
  area_total_m2: number;
  energia_generada_mes: number;
  energia_generada_anio: number;
  // Costos (USD)
  costo_paneles_usd: number;
  costo_inversor_usd: number;
  costo_estructura_usd: number;
  costo_cables_usd: number;
  costo_mano_obra_usd: number;
  costo_baterias_usd: number;
  costo_monitoreo_usd: number;
  igv_usd: number;
  costo_total_usd: number;
  costo_total_pen: number;
  // Retorno
  ahorro_mes_pen: number;
  ahorro_anio_pen: number;
  ahorro_anio_usd: number;
  payback_anios: number;
  ahorro_total_25_anios: number;
  ganancia_neta_25_anios: number;
  roi_25_anios: number;
  // Medioambiente
  co2_evitado_mes_kg: number;
  co2_evitado_anio_kg: number;
  co2_evitado_25_anios_toneladas: number;
  arboles_equivalentes: number;
  // Gráficos
  produccion_mensual: { mes: string; produccion: number }[];
  // Meta
  modo_sistema: string;
}

// ── Composable ──
export const useCalculadora = () => {
  // ── Estado del Wizard ──
  const paso = ref(1);
  const perfilId = ref<string | null>(null);
  const ciudadId = ref("trujillo");
  const consumoMode = ref<"recibo" | "equipos" | "ia">("recibo");
  const consumoKwh = ref(0);
  const equiposSelec = ref<EquipoSeleccionado[]>([]);
  const panelId = ref("panel_450w");
  const bateriaId = ref("sin_bateria");
  const factorSombra = ref(10);
  const eficiencia = ref(85);
  const resultado = ref<ResultadoCalculo | null>(null);
  const calculando = ref(false);

  // ── Datos (cargados desde JSON) ──
  const ciudades = ref<Ciudad[]>([]);
  const perfiles = ref<Perfil[]>([]);
  const paneles = ref<Panel[]>([]);
  const baterias = ref<Bateria[]>([]);
  const tarifas = ref<Record<string, Tarifa>>({});
  const equiposHogar = ref<Equipo[]>([]);
  const equiposEmpresa = ref<Equipo[]>([]);
  const equiposIndustria = ref<Equipo[]>([]);

  // ── Cargar todos los JSONs ──
  const cargarDatos = async () => {
    const [c, p, pan, bat, tar, eh, ee, ei] = await Promise.all([
      fetch("/data/ciudades.json").then((r) => r.json()) as Promise<Ciudad[]>,
      fetch("/data/perfiles.json").then((r) => r.json()) as Promise<Perfil[]>,
      fetch("/data/tipos_panel.json").then((r) => r.json()) as Promise<Panel[]>,
      fetch("/data/tipos_bateria.json").then((r) => r.json()) as Promise<
        Bateria[]
      >,
      fetch("/data/tarifas_electricas.json").then((r) => r.json()) as Promise<
        Record<string, Tarifa>
      >,
      fetch("/data/electrodomesticos_hogar.json").then((r) =>
        r.json(),
      ) as Promise<Equipo[]>,
      fetch("/data/equipos_empresa.json").then((r) => r.json()) as Promise<
        Equipo[]
      >,
      fetch("/data/equipos_industria.json").then((r) => r.json()) as Promise<
        Equipo[]
      >,
    ]);
    ciudades.value = c;
    perfiles.value = p;
    paneles.value = pan;
    baterias.value = bat;
    tarifas.value = tar;
    equiposHogar.value = eh;
    equiposEmpresa.value = ee;
    equiposIndustria.value = ei;
  };

  // ── Getters computados ──
  const perfilActual = computed(
    () => perfiles.value.find((p) => p.id === perfilId.value) ?? null,
  );
  const ciudadActual = computed(
    () =>
      ciudades.value.find((c) => c.id === ciudadId.value) ?? ciudades.value[3],
  ); // Trujillo default
  const panelActual = computed(
    () => paneles.value.find((p) => p.id === panelId.value) ?? paneles.value[1],
  );
  const bateriaActual = computed(
    () =>
      baterias.value.find((b) => b.id === bateriaId.value) ?? baterias.value[0],
  );

  const tarifaKwh = computed(() => {
    const key = perfilActual.value?.tarifa ?? "bt2";
    return tarifas.value[key]?.precio_kwh ?? 0.62;
  });

  const equiposActivos = computed<Equipo[]>(() => {
    const set = perfilActual.value?.equiposSet ?? "hogar";
    if (set === "empresa") return equiposEmpresa.value;
    if (set === "industria") return equiposIndustria.value;
    return equiposHogar.value;
  });

  const hspInfo = computed(() => {
    const hsp = ciudadActual.value?.hsp ?? 5.4;
    if (hsp >= 6.0) return { nivel: "🔥 Excepcional", color: "text-rose-400" };
    if (hsp >= 5.5) return { nivel: "😎 Muy buena", color: "text-solar-400" };
    if (hsp >= 5.0) return { nivel: "😊 Buena", color: "text-yellow-400" };
    if (hsp >= 4.5) return { nivel: "🙁 Moderada", color: "text-orange-400" };
    return { nivel: "😶 Baja", color: "text-slate-400" };
  });

  const consumoTotal = computed(() => {
    if (consumoMode.value === "recibo") return consumoKwh.value;

    if (consumoMode.value === "equipos") {
      return equiposSelec.value.reduce((total, eq) => {
        return (
          total +
          ((eq.potencia * eq.cantidad * eq.horas_dia) / 1000) *
            (eq.dias_mes ?? 30)
        );
      }, 0);
    }
    return consumoKwh.value; // IA
  });

  // ── Acciones de equipos ──
  const cambiarCantidad = (equipo: Equipo, delta: number) => {
    const idx = equiposSelec.value.findIndex((e) => e.id === equipo.id);
    if (idx === -1 && delta > 0) {
      equiposSelec.value.push({
        ...equipo,
        cantidad: 1,
        horas_dia: 8,
        dias_mes: 30,
      });
    } else if (idx !== -1) {
      const nueva = equiposSelec.value[idx].cantidad + delta;
      if (nueva <= 0) equiposSelec.value.splice(idx, 1);
      else equiposSelec.value[idx].cantidad = nueva;
    }
  };

  const cantidadEquipo = (id: string) =>
    equiposSelec.value.find((e) => e.id === id)?.cantidad ?? 0;

  const actualizarHoras = (id: string, horas: number) => {
    const eq = equiposSelec.value.find((e) => e.id === id);
    if (eq) eq.horas_dia = horas;
  };

  // ── Cálculo principal ──
  const calcular = async () => {
    const ciudad = ciudadActual.value;
    const panel = panelActual.value;
    const bateria = bateriaActual.value;
    if (!ciudad || !panel || !bateria) return;

    calculando.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1600)); // UX delay

    const consumo_kwh_mes = consumoTotal.value;
    const consumo_kwh_dia = consumo_kwh_mes / 30;
    const hsp = ciudad.hsp * (1 - factorSombra.value / 100);
    const eff = eficiencia.value / 100;

    // ── Paneles ──
    const energia_por_panel_dia = (panel.potencia / 1000) * hsp * eff;
    const num_paneles = Math.ceil(consumo_kwh_dia / energia_por_panel_dia);
    const potencia_total_kw = parseFloat(
      ((num_paneles * panel.potencia) / 1000).toFixed(2),
    );
    const inversor_kw = Math.ceil(potencia_total_kw * 1.1);
    const energia_generada_mes = parseFloat(
      (num_paneles * energia_por_panel_dia * 30).toFixed(1),
    );
    const energia_generada_anio = parseFloat(
      (energia_generada_mes * 12).toFixed(1),
    );

    // ── Baterías ──
    let num_baterias = 0,
      capacidad_bateria_kwh = 0,
      costo_baterias_usd = 0;
    if (bateria.tipo !== "on_grid" && bateria.autonomia_horas > 0) {
      const potencia_promedio_w = (consumo_kwh_dia * 1000) / 24;
      const capBruta = (potencia_promedio_w * bateria.autonomia_horas) / 1000;
      capacidad_bateria_kwh = parseFloat((capBruta / bateria.dod).toFixed(2));
      costo_baterias_usd = Math.round(
        capacidad_bateria_kwh * bateria.precio_kwh_usd,
      );
      num_baterias = Math.ceil(capacidad_bateria_kwh / 5);
    }

    // ── Área ──
    const [w, h] = panel.dimensiones
      .replace("m", "")
      .split("×")
      .map((s) => parseFloat(s.trim()));
    const area_total_m2 = parseFloat((num_paneles * w * h * 1.3).toFixed(1));

    // ── Costos ──
    const costo_paneles_usd = Math.round(num_paneles * panel.precio_usd);
    const costo_inversor_usd = Math.round(inversor_kw * 120);
    const costo_estructura_usd = Math.round(num_paneles * 25);
    const costo_cables_usd = Math.round(potencia_total_kw * 40);
    const costo_mano_obra_usd = Math.round(potencia_total_kw * 200);
    const costo_monitoreo_usd = 150;
    const subtotal =
      costo_paneles_usd +
      costo_inversor_usd +
      costo_estructura_usd +
      costo_cables_usd +
      costo_mano_obra_usd +
      costo_baterias_usd +
      costo_monitoreo_usd;
    const conCont = subtotal * 1.05;
    const igv_usd = Math.round(conCont * 0.18);
    const costo_total_usd = Math.round(conCont + igv_usd);
    const costo_total_pen = Math.round(costo_total_usd * TIPO_CAMBIO_USD_PEN);

    // ── Retorno ──
    const ahorro_mes_pen = parseFloat(
      (
        Math.min(consumo_kwh_mes, energia_generada_mes) * tarifaKwh.value
      ).toFixed(2),
    );
    const ahorro_anio_pen = parseFloat((ahorro_mes_pen * 12).toFixed(2));
    const ahorro_anio_usd = parseFloat(
      (ahorro_anio_pen / TIPO_CAMBIO_USD_PEN).toFixed(2),
    );
    const payback_anios = parseFloat(
      (costo_total_usd / ahorro_anio_usd).toFixed(1),
    );

    let ahorro_total = 0;
    for (let i = 0; i < VIDA_UTIL_SISTEMA; i++)
      ahorro_total += ahorro_anio_pen * Math.pow(1.05, i);
    const mant_total = costo_total_pen * 0.01 * VIDA_UTIL_SISTEMA;
    const ganancia_neta_25_anios = Math.round(
      ahorro_total - costo_total_pen - mant_total,
    );
    const roi_25_anios = parseFloat(
      ((ganancia_neta_25_anios / costo_total_pen) * 100).toFixed(1),
    );

    // ── Medioambiente ──
    const co2_mes = parseFloat((consumo_kwh_mes * FACTOR_CO2_PERU).toFixed(1));
    const co2_anio = parseFloat(
      (consumo_kwh_mes * 12 * FACTOR_CO2_PERU).toFixed(1),
    );
    const co2_25 = parseFloat(((co2_anio * 25) / 1000).toFixed(2));
    const arboles = Math.round((co2_25 * 1000) / 22);

    // ── Producción mensual ──
    const zona =
      ciudad.id === "lima"
        ? "lima"
        : ciudad.altitud > 2000
          ? "sierra"
          : ["iquitos", "tarapoto", "puerto_maldonado"].includes(ciudad.id)
            ? "selva"
            : "costa_norte";

    const produccion_mensual = MESES.map((mes, i) => ({
      mes,
      produccion: parseFloat(
        (
          num_paneles *
          (panel.potencia / 1000) *
          ciudad.hsp *
          FACTORES_ESTACIONALES[zona][i] *
          eff *
          30
        ).toFixed(1),
      ),
    }));

    resultado.value = {
      ciudad,
      panel,
      bateria,
      hsp: parseFloat(hsp.toFixed(2)),
      consumo_kwh_mes,
      consumo_kwh_dia: parseFloat(consumo_kwh_dia.toFixed(2)),
      num_paneles,
      potencia_total_kw,
      inversor_kw,
      num_baterias,
      capacidad_bateria_kwh,
      area_total_m2,
      energia_generada_mes,
      energia_generada_anio,
      costo_paneles_usd,
      costo_inversor_usd,
      costo_estructura_usd,
      costo_cables_usd,
      costo_mano_obra_usd,
      costo_baterias_usd,
      costo_monitoreo_usd,
      igv_usd,
      costo_total_usd,
      costo_total_pen,
      ahorro_mes_pen,
      ahorro_anio_pen,
      ahorro_anio_usd,
      payback_anios,
      ahorro_total_25_anios: Math.round(ahorro_total),
      ganancia_neta_25_anios,
      roi_25_anios,
      co2_evitado_mes_kg: co2_mes,
      co2_evitado_anio_kg: co2_anio,
      co2_evitado_25_anios_toneladas: co2_25,
      arboles_equivalentes: arboles,
      produccion_mensual,
      modo_sistema:
        bateria.tipo === "on_grid"
          ? "Conectado a Red (On-Grid)"
          : bateria.tipo === "hibrido"
            ? "Sistema Híbrido"
            : "Autónomo (Off-Grid)",
    };

    calculando.value = false;
  };

  // ── Formatters ──
  const fmt = {
    pen: (v: number) =>
      `S/ ${v.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    usd: (v: number) =>
      `$ ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    number: (v: number) => v.toLocaleString("es-PE"),
    percent: (v: number) => `${v}%`,
    kwh: (v: number) => `${v.toLocaleString("es-PE")} kWh`,
  };

  return {
    // Estado
    paso,
    perfilId,
    ciudadId,
    consumoMode,
    consumoKwh,
    equiposSelec,
    panelId,
    bateriaId,
    factorSombra,
    eficiencia,
    resultado,
    calculando,
    // Datos
    ciudades,
    perfiles,
    paneles,
    baterias,
    tarifas,
    equiposHogar,
    equiposEmpresa,
    equiposIndustria,
    // Getters
    perfilActual,
    ciudadActual,
    panelActual,
    bateriaActual,
    tarifaKwh,
    equiposActivos,
    hspInfo,
    consumoTotal,
    // Acciones
    cargarDatos,
    calcular,
    cambiarCantidad,
    cantidadEquipo,
    actualizarHoras,
    // Helpers
    fmt,
  };
};
