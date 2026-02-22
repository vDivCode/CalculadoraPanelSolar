// ============================================================
// CALCULADORA SOLAR - Motor de Cálculo
// ============================================================

class CalculadoraSolar {
  /**
   * Calcula todo el sistema solar requerido
   * @param {Object} config - Configuración del usuario
   */
  static calcular(config) {
    const {
      consumo_kwh_mes,
      ciudad,
      tipoPanel,
      tipoBateria,
      horas_sol_extra,
      factor_sombra,
      eficiencia_sistema,
    } = config;

    // --- 1. DATOS BASE ---
    const panel = TIPOS_PANEL.find((p) => p.id === tipoPanel) || TIPOS_PANEL[1];
    const bateria =
      TIPOS_BATERIA.find((b) => b.id === tipoBateria) || TIPOS_BATERIA[0];
    const ciudadData =
      CIUDADES_PERU.find((c) => c.id === ciudad) ||
      CIUDADES_PERU.find((c) => c.id === "trujillo");

    // Horas pico solar (HSP) con ajuste por sombra
    const hsp = ciudadData.hsp * (1 - (factor_sombra || 0) / 100);

    // Consumo diario
    const consumo_kwh_dia = consumo_kwh_mes / 30;

    // Factor de eficiencia del sistema (pérdidas por cables, inversores, temperatura)
    const eff_sistema = (eficiencia_sistema || 85) / 100;

    // --- 2. CÁLCULO DE PANELES ---
    // Energía generada por panel por día = Potencia_panel(kW) × HSP × Eficiencia
    const energia_por_panel_dia = (panel.potencia / 1000) * hsp * eff_sistema;

    // Número de paneles necesarios
    const num_paneles_raw = consumo_kwh_dia / energia_por_panel_dia;
    const num_paneles = Math.ceil(num_paneles_raw);

    // Energía total generada por el sistema
    const energia_generada_dia = num_paneles * energia_por_panel_dia;
    const energia_generada_mes = energia_generada_dia * 30;
    const energia_generada_anio = energia_generada_mes * 12;

    // --- 3. INVERSOR ---
    const potencia_total_kw = (num_paneles * panel.potencia) / 1000;
    const inversor_kw = Math.ceil(potencia_total_kw * 1.1); // 10% de margen

    // --- 4. BATERÍAS (si aplica) ---
    let num_baterias = 0;
    let capacidad_bateria_kwh = 0;
    let costo_baterias_usd = 0;

    if (bateria.tipo !== "on_grid" && bateria.autonomia_horas > 0) {
      // Energía para autonomía en horas
      const potencia_promedio_w = (consumo_kwh_dia * 1000) / 24;
      capacidad_bateria_kwh =
        (potencia_promedio_w * bateria.autonomia_horas) / 1000;
      // Considerar DoD (Depth of Discharge)
      const dod = bateria.tipo === "off_grid" ? 0.5 : 0.8; // Plomo 50%, Litio 80%
      const capacidad_real = capacidad_bateria_kwh / dod;
      costo_baterias_usd = capacidad_real * bateria.precio_kwh_usd;
      num_baterias = Math.ceil(capacidad_real / 5); // Asumiendo módulos de 5 kWh
    }

    // --- 5. COSTOS ---
    const costo_paneles_usd = num_paneles * panel.precio_usd;
    const costo_inversor_usd = inversor_kw * 120; // ~$120/kW para inversores
    const costo_estructura_usd = num_paneles * 25; // ~$25/panel para estructura
    const costo_cables_usd = potencia_total_kw * 40; // ~$40/kW para cables y protecciones
    const costo_mano_obra_usd = potencia_total_kw * 200; // ~$200/kW mano de obra
    const costo_monitoreo_usd = 150; // Módulo de monitoreo
    const costo_subtotal_usd =
      costo_paneles_usd +
      costo_inversor_usd +
      costo_estructura_usd +
      costo_cables_usd +
      costo_mano_obra_usd +
      costo_baterias_usd +
      costo_monitoreo_usd;

    // Contingencia e IGV (18%)
    const contingencia_usd = costo_subtotal_usd * 0.05;
    const subtotal_con_cont = costo_subtotal_usd + contingencia_usd;
    const igv_usd = subtotal_con_cont * 0.18;
    const costo_total_usd = subtotal_con_cont + igv_usd;
    const costo_total_pen = costo_total_usd * TIPO_CAMBIO_USD_PEN;

    // --- 6. AHORRO Y RETORNO ---
    // Usar tarifa según perfil
    const tarifa_kwh =
      config.tarifa_kwh || TARIFAS_ELECTRICAS_PERU.bt2.precio_kwh;
    const ahorro_mes_pen =
      Math.min(consumo_kwh_mes, energia_generada_mes) * tarifa_kwh;
    const ahorro_anio_pen = ahorro_mes_pen * 12;
    const ahorro_anio_usd = ahorro_anio_pen / TIPO_CAMBIO_USD_PEN;

    // Payback en años
    const payback_anios = costo_total_usd / ahorro_anio_usd;

    // Ahorro total en 25 años (considerando inflación eléctrica del 5% anual)
    let ahorro_total_25_anios = 0;
    for (let i = 0; i < VIDA_UTIL_SISTEMA; i++) {
      ahorro_total_25_anios += ahorro_anio_pen * Math.pow(1.05, i);
    }
    // Restar costo de mantenimiento (1% del costo total por año)
    const mant_total = costo_total_pen * 0.01 * VIDA_UTIL_SISTEMA;
    const ganancia_neta_25_anios =
      ahorro_total_25_anios - costo_total_pen - mant_total;

    // ROI
    const roi_25_anios = (ganancia_neta_25_anios / costo_total_pen) * 100;

    // --- 7. MEDIOAMBIENTE ---
    const co2_evitado_mes_kg = consumo_kwh_mes * FACTOR_CO2_PERU;
    const co2_evitado_anio_kg = co2_evitado_mes_kg * 12;
    const co2_evitado_25_anios_toneladas = (co2_evitado_anio_kg * 25) / 1000;
    // Arboles equivalentes (un árbol absorbe ~22 kg CO2/año)
    const arboles_equivalentes = Math.round(
      (co2_evitado_25_anios_toneladas * 1000) / 22,
    );

    // --- 8. ÁREA REQUERIDA ---
    const area_panel_m2 =
      parseFloat(panel.dimensiones.split("m")[0]) *
      parseFloat(panel.dimensiones.split("×")[1].trim().split("m")[0]);
    const area_total_m2 = num_paneles * area_panel_m2 * 1.3; // 30% espacio entre paneles

    // --- 9. PRODUCCIÓN POR MES (estimación estacional) ---
    const produccion_mensual = this._calcularProduccionMensual(
      ciudadData,
      num_paneles,
      panel,
      eff_sistema,
    );

    return {
      // Inputs
      ciudad: ciudadData,
      panel,
      bateria,
      hsp,
      consumo_kwh_mes,
      consumo_kwh_dia,

      // Sistema
      num_paneles,
      num_paneles_raw: parseFloat(num_paneles_raw.toFixed(2)),
      potencia_total_kw: parseFloat(potencia_total_kw.toFixed(2)),
      inversor_kw,
      num_baterias,
      capacidad_bateria_kwh: parseFloat(capacidad_bateria_kwh.toFixed(2)),
      area_total_m2: parseFloat(area_total_m2.toFixed(1)),
      energia_generada_mes: parseFloat(energia_generada_mes.toFixed(1)),
      energia_generada_anio: parseFloat(energia_generada_anio.toFixed(1)),

      // Costos
      costo_paneles_usd: Math.round(costo_paneles_usd),
      costo_inversor_usd: Math.round(costo_inversor_usd),
      costo_estructura_usd: Math.round(costo_estructura_usd),
      costo_cables_usd: Math.round(costo_cables_usd),
      costo_mano_obra_usd: Math.round(costo_mano_obra_usd),
      costo_baterias_usd: Math.round(costo_baterias_usd),
      costo_monitoreo_usd: Math.round(costo_monitoreo_usd),
      igv_usd: Math.round(igv_usd),
      costo_total_usd: Math.round(costo_total_usd),
      costo_total_pen: Math.round(costo_total_pen),

      // Retorno
      ahorro_mes_pen: parseFloat(ahorro_mes_pen.toFixed(2)),
      ahorro_anio_pen: parseFloat(ahorro_anio_pen.toFixed(2)),
      ahorro_anio_usd: parseFloat(ahorro_anio_usd.toFixed(2)),
      payback_anios: parseFloat(payback_anios.toFixed(1)),
      ahorro_total_25_anios: Math.round(ahorro_total_25_anios),
      ganancia_neta_25_anios: Math.round(ganancia_neta_25_anios),
      roi_25_anios: parseFloat(roi_25_anios.toFixed(1)),

      // Medioambiente
      co2_evitado_mes_kg: parseFloat(co2_evitado_mes_kg.toFixed(1)),
      co2_evitado_anio_kg: parseFloat(co2_evitado_anio_kg.toFixed(1)),
      co2_evitado_25_anios_toneladas: parseFloat(
        co2_evitado_25_anios_toneladas.toFixed(2),
      ),
      arboles_equivalentes,

      // Gráficos
      produccion_mensual,

      // Contexto
      modo_sistema:
        bateria.tipo === "on_grid"
          ? "Conectado a Red (On-Grid)"
          : bateria.tipo === "hibrido"
            ? "Sistema Híbrido"
            : "Autónomo (Off-Grid)",
    };
  }

  /**
   * Calcula la producción estimada por mes del año
   */
  static _calcularProduccionMensual(ciudad, num_paneles, panel, eff) {
    // Factores estacionales para Perú (relativo a HSP promedio)
    // Varía según hemisferio sur - verano = dic-mar, invierno = jun-ago
    const factores_estacionales = {
      costa_norte: [
        1.08, 1.06, 1.04, 0.98, 0.94, 0.9, 0.92, 0.95, 1.0, 1.03, 1.05, 1.07,
      ],
      sierra: [
        0.9, 0.88, 0.92, 1.0, 1.05, 1.1, 1.12, 1.1, 1.05, 1.02, 0.95, 0.92,
      ],
      selva: [
        0.92, 0.9, 0.94, 0.96, 0.98, 1.0, 1.02, 1.05, 1.02, 0.98, 0.95, 0.93,
      ],
      lima: [
        1.05, 1.02, 0.98, 0.9, 0.82, 0.75, 0.75, 0.8, 0.88, 0.95, 1.02, 1.05,
      ],
    };

    let factores;
    if (ciudad.id === "lima") factores = factores_estacionales.lima;
    else if (ciudad.altitud > 2000) factores = factores_estacionales.sierra;
    else if (
      ciudad.region.includes("oriente") ||
      ciudad.id === "tarapoto" ||
      ciudad.id === "iquitos"
    )
      factores = factores_estacionales.selva;
    else factores = factores_estacionales.costa_norte;

    const meses = [
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

    return meses.map((mes, i) => {
      const produccion =
        num_paneles *
        (panel.potencia / 1000) *
        ciudad.hsp *
        factores[i] *
        eff *
        30;
      return { mes, produccion: parseFloat(produccion.toFixed(1)) };
    });
  }

  /**
   * Calcula consumo total desde lista de equipos
   */
  static calcularConsumoDesdeEquipos(equipos) {
    let consumo_total_kwh_mes = 0;
    equipos.forEach((equipo) => {
      const consumo_kwh_dia =
        (equipo.potencia * equipo.cantidad * equipo.horas_dia) / 1000;
      const consumo_kwh_mes = consumo_kwh_dia * (equipo.dias_mes || 30);
      consumo_total_kwh_mes += consumo_kwh_mes;
    });
    return parseFloat(consumo_total_kwh_mes.toFixed(2));
  }

  /**
   * Formatea número como moneda Soles
   */
  static formatPEN(valor) {
    return `S/ ${valor.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Formatea número como moneda USD
   */
  static formatUSD(valor) {
    return `$ ${valor.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
