// ============================================================
// CALCULADORA SOLAR PERÚ - App Principal
// ============================================================

// --- Estado global ---
const state = {
  currentStep: 1,
  perfil: null, // 'hogar' | 'empresa_pequena' | 'empresa_grande' | 'industrial' | 'campo'
  ciudad: "trujillo",
  consumoMode: "recibo", // 'recibo' | 'equipos' | 'ia'
  consumo_kwh_mes: 0,
  equiposSeleccionados: [], // [{id, cantidad, horas_dia, dias_mes}]
  tipoPanel: "panel_450w",
  tipoBateria: "sin_bateria",
  factor_sombra: 10,
  eficiencia_sistema: 85,
  tarifa_kwh: 0.62,
  resultado: null,
};

// --- Inicialización ---
document.addEventListener("DOMContentLoaded", () => {
  initPerfiles();
  initCiudades("Norte");
  initConsumoTabs();
  initEquiposList("Hogar");
  initPaneles();
  initBaterias();
  initAdvancedConfig();
  initRangeSliders();
  initNavButtons();
  setHSPInfo("trujillo");
  updateBtnGroup();
});

// ============================================================
// PASO 1: PERFILES Y CIUDAD
// ============================================================
const PERFILES_CONFIG = [
  {
    id: "hogar",
    nombre: "Hogar",
    icono: "🏠",
    desc: "Casa o departamento familiar",
    equiposSet: "Hogar",
    tarifa: 0.62,
  },
  {
    id: "empresa_pequena",
    nombre: "Empresa Pequeña",
    icono: "🏪",
    desc: "Oficina, tienda o negocio",
    equiposSet: "Empresa",
    tarifa: 0.68,
  },
  {
    id: "empresa_grande",
    nombre: "Empresa Grande",
    icono: "🏢",
    desc: "Empresa mediana o gran empresa",
    equiposSet: "Empresa",
    tarifa: 0.55,
  },
  {
    id: "industrial",
    nombre: "Industrial",
    icono: "🏭",
    desc: "Fábrica, planta o industria",
    equiposSet: "Industria",
    tarifa: 0.48,
  },
  {
    id: "campo",
    nombre: "Campo / Agrícola",
    icono: "🌿",
    desc: "Fundo, rancho o zona rural",
    equiposSet: "Industria",
    tarifa: 0.62,
  },
];

function initPerfiles() {
  const grid = document.getElementById("perfilesGrid");
  grid.innerHTML = "";
  PERFILES_CONFIG.forEach((p) => {
    const el = document.createElement("div");
    el.className = "profile-card";
    el.dataset.id = p.id;
    el.innerHTML = `
      <span class="profile-icon">${p.icono}</span>
      <div class="profile-name">${p.nombre}</div>
      <div class="profile-desc">${p.desc}</div>
    `;
    el.addEventListener("click", () => selectPerfil(p));
    grid.appendChild(el);
  });
}

function selectPerfil(p) {
  document
    .querySelectorAll(".profile-card")
    .forEach((c) => c.classList.remove("selected"));
  document
    .querySelector(`.profile-card[data-id="${p.id}"]`)
    .classList.add("selected");
  state.perfil = p.id;
  state.tarifa_kwh = p.tarifa;
  // Cambiar set de equipos según perfil
  const setNombre = p.equiposSet;
  initEquiposList(setNombre);
  const currentCat = getEquiposCategorias(setNombre)[0];
  renderEquiposCats(setNombre, currentCat);
  renderEquiposList(setNombre, currentCat);
}

// --- CIUDADES ---
const REGIONES = [
  "Norte",
  "Sierra Norte",
  "Nor-oriente",
  "Sierra Centro",
  "Costa Centro",
  "Sierra Sur-centro",
  "Sierra Sur",
  "Sur",
  "Sur-oriente",
  "San Martín",
];
const MEGA_REGIONS = ["Norte", "Centro", "Sur", "Selva"];

function getMegaRegion(region) {
  if (["Norte", "Sierra Norte", "Nor-oriente", "San Martín"].includes(region))
    return "Norte";
  if (["Sierra Centro", "Costa Centro", "Sierra Sur-centro"].includes(region))
    return "Centro";
  if (["Sierra Sur", "Sur", "Sur-oriente"].includes(region)) return "Sur";
  return "Selva";
}

function initCiudades(filterRegion) {
  const tabs = document.getElementById("regionTabs");
  tabs.innerHTML = "";
  MEGA_REGIONS.forEach((r) => {
    const btn = document.createElement("button");
    btn.className = "region-tab" + (r === filterRegion ? " active" : "");
    btn.textContent = r;
    btn.dataset.region = r;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".region-tab")
        .forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");
      renderCiudades(r);
    });
    tabs.appendChild(btn);
  });
  renderCiudades(filterRegion);

  // Default Trujillo
  state.ciudad = "trujillo";
}

function renderCiudades(megaRegion) {
  const grid = document.getElementById("ciudadesGrid");
  const ciudadesFiltradas = CIUDADES_PERU.filter(
    (c) => getMegaRegion(c.region) === megaRegion,
  );
  grid.innerHTML = "";
  ciudadesFiltradas.forEach((c) => {
    const el = document.createElement("div");
    el.className = "ciudad-card" + (c.id === state.ciudad ? " selected" : "");
    el.dataset.id = c.id;
    el.innerHTML = `
      <div>
        <div class="ciudad-nombre">${c.nombre}</div>
        <div style="font-size:10px;color:var(--text-muted)">${c.region}</div>
      </div>
      <span class="ciudad-hsp">${c.hsp} HSP</span>
    `;
    el.addEventListener("click", () => selectCiudad(c.id));
    grid.appendChild(el);
  });
}

function selectCiudad(id) {
  state.ciudad = id;
  document
    .querySelectorAll(".ciudad-card")
    .forEach((c) => c.classList.remove("selected"));
  const selected = document.querySelector(`.ciudad-card[data-id="${id}"]`);
  if (selected) selected.classList.add("selected");
  setHSPInfo(id);
}

function setHSPInfo(ciudadId) {
  const c =
    CIUDADES_PERU.find((x) => x.id === ciudadId) ||
    CIUDADES_PERU.find((x) => x.id === "trujillo");
  const levels = [
    {
      min: 0,
      max: 4.5,
      label: "😶 Radiación baja",
      desc: "Zona con nubosidad frecuente. Se necesitarán más paneles.",
    },
    {
      min: 4.5,
      max: 5.0,
      label: "🙁 Radiación moderada",
      desc: "Incluye Lima costera. Sistema viable con buena planificación.",
    },
    {
      min: 5.0,
      max: 5.5,
      label: "😊 Buena radiación",
      desc: "Radiación excelente. El sistema solar es muy rentable aquí.",
    },
    {
      min: 5.5,
      max: 6.0,
      label: "😎 Muy buena radiación",
      desc: "Zona con alta insolación. Excelente retorno de inversión.",
    },
    {
      min: 6.0,
      max: 10,
      label: "🔥 Radiación excepcional",
      desc: "Zona premium para solar. ¡El mejor ROI de toda Sudamérica!",
    },
  ];
  const level =
    levels.find((l) => c.hsp >= l.min && c.hsp < l.max) ||
    levels[levels.length - 1];
  document.getElementById("hspCiudad").textContent = c.nombre;
  document.getElementById("hspValor").textContent = `${c.hsp} HSP`;
  document.getElementById("hspNivel").textContent = level.label;
  document.getElementById("hspDesc").textContent = level.desc;
  document.getElementById("hspAltitud").textContent =
    `Altitud: ${c.altitud} msnm | Región: ${c.region}`;
}

// ============================================================
// PASO 2: MODO CONSUMO
// ============================================================
function initConsumoTabs() {
  document.querySelectorAll(".consumo-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".consumo-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".consumo-panel")
        .forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      state.consumoMode = btn.dataset.mode;
      document
        .getElementById(`panel_${btn.dataset.mode}`)
        .classList.add("active");
    });
  });
}

// ============================================================
// EQUIPOS - Inventario dinámico
// ============================================================
function getEquipoDB(set) {
  if (set === "Empresa") return EQUIPOS_EMPRESA;
  if (set === "Industria") return EQUIPOS_INDUSTRIA;
  return ELECTRODOMESTICOS_HOGAR;
}

function getEquiposCategorias(set) {
  const db = getEquipoDB(set);
  return [...new Set(db.map((e) => e.categoria))];
}

let currentEquiposSet = "Hogar";

function initEquiposList(set) {
  currentEquiposSet = set;
  const cats = getEquiposCategorias(set);
  renderEquiposCats(set, cats[0]);
  renderEquiposList(set, cats[0]);
}

function renderEquiposCats(set, activecat) {
  const container = document.getElementById("equipoCats");
  const cats = getEquiposCategorias(set);
  container.innerHTML = "";
  cats.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat === activecat ? " active" : "");
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".cat-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderEquiposList(set, cat);
    });
    container.appendChild(btn);
  });
}

function renderEquiposList(set, categoria) {
  const db = getEquipoDB(set);
  const lista = document.getElementById("equiposLista");
  const items = db.filter((e) => e.categoria === categoria);
  lista.innerHTML = "";
  items.forEach((e) => {
    const sel = state.equiposSeleccionados.find((x) => x.id === e.id);
    const cantidad = sel ? sel.cantidad : 0;
    const horas = sel ? sel.horas_dia : 8;
    const el = document.createElement("div");
    el.className = "equipo-item" + (cantidad > 0 ? " selected" : "");
    el.id = `equipo_${e.id}`;
    el.innerHTML = `
      <div class="equipo-info">
        <span class="equipo-icon">${e.icono}</span>
        <div>
          <div class="equipo-nombre">${e.nombre}</div>
          <div class="equipo-potencia">${e.potencia.toLocaleString()} W</div>
        </div>
      </div>
      <div class="equipo-control">
        <label>Horas/día</label>
        <input class="horas-input" type="number" min="0.5" max="24" step="0.5"
          value="${horas}" data-id="${e.id}" onchange="updateHoras('${e.id}', this.value, '${set}')">
      </div>
      <div class="equipo-control">
        <label>Cantidad</label>
        <div class="qty-control">
          <button class="qty-btn" onclick="cambiarQty('${e.id}', -1, '${set}')">−</button>
          <span class="qty-value" id="qty_${e.id}">${cantidad}</span>
          <button class="qty-btn" onclick="cambiarQty('${e.id}', 1, '${set}')">+</button>
        </div>
      </div>
    `;
    lista.appendChild(el);
  });
}

function cambiarQty(id, delta, set) {
  const idx = state.equiposSeleccionados.findIndex((x) => x.id === id);
  const db = getEquipoDB(set);
  const equipoData = db.find((e) => e.id === id);
  if (!equipoData) return;

  if (idx === -1 && delta > 0) {
    state.equiposSeleccionados.push({
      id,
      cantidad: 1,
      horas_dia: 8,
      dias_mes: 30,
      potencia: equipoData.potencia,
    });
  } else if (idx !== -1) {
    state.equiposSeleccionados[idx].cantidad = Math.max(
      0,
      state.equiposSeleccionados[idx].cantidad + delta,
    );
    if (state.equiposSeleccionados[idx].cantidad === 0) {
      state.equiposSeleccionados.splice(idx, 1);
    }
  }

  const qtyEl = document.getElementById(`qty_${id}`);
  const itemEl = document.getElementById(`equipo_${id}`);
  const sel = state.equiposSeleccionados.find((x) => x.id === id);
  if (qtyEl) qtyEl.textContent = sel ? sel.cantidad : 0;
  if (itemEl) {
    if (sel && sel.cantidad > 0) itemEl.classList.add("selected");
    else itemEl.classList.remove("selected");
  }

  actualizarResumenEquipos();
}

function updateHoras(id, value, set) {
  const idx = state.equiposSeleccionados.findIndex((x) => x.id === id);
  if (idx !== -1) {
    state.equiposSeleccionados[idx].horas_dia = parseFloat(value) || 8;
    actualizarResumenEquipos();
  }
}

function actualizarResumenEquipos() {
  const total = CalculadoraSolar.calcularConsumoDesdeEquipos(
    state.equiposSeleccionados,
  );
  state.consumo_kwh_mes = total;

  document.getElementById("equiposTotalKwh").textContent =
    `${total.toFixed(0)} kWh/mes`;

  const lista = document.getElementById("equiposSelLista");
  if (state.equiposSeleccionados.length === 0) {
    lista.innerHTML =
      '<div style="color:var(--text-muted);font-size:13px">Sin equipos seleccionados aún</div>';
  } else {
    const todosEquipos = [
      ...ELECTRODOMESTICOS_HOGAR,
      ...EQUIPOS_EMPRESA,
      ...EQUIPOS_INDUSTRIA,
    ];
    lista.innerHTML = state.equiposSeleccionados
      .map((sel) => {
        const eq = todosEquipos.find((e) => e.id === sel.id);
        if (!eq) return "";
        const consumo = (
          ((eq.potencia * sel.cantidad * sel.horas_dia) / 1000) *
          30
        ).toFixed(1);
        return `<div class="eq-sel-item">
        <span class="eq-sel-nombre">${eq.icono} ${eq.nombre} ×${sel.cantidad}</span>
        <span class="eq-sel-consumo">${consumo} kWh/mes</span>
      </div>`;
      })
      .join("");
  }
}

// ============================================================
// ASISTENTE IA (reglas heurísticas)
// ============================================================
function analizarTextoIA() {
  const texto = document.getElementById("iaTexto").value.toLowerCase();
  if (!texto.trim()) {
    showNotif("✍️ Escribe una descripción de tu negocio o hogar", "error");
    return;
  }

  let consumo = 200;
  let desc = "";

  // Detección heurística
  if (
    texto.includes("minería") ||
    texto.includes("mineria") ||
    texto.includes("mina")
  ) {
    consumo = 25000;
    desc = "Operación minera detectada — alta demanda energética";
  } else if (
    texto.includes("data center") ||
    texto.includes("datacenter") ||
    texto.includes("servidor")
  ) {
    consumo = 8000;
    desc = "Data center / servidores — consumo muy alto y constante";
  } else if (
    texto.includes("hotel") &&
    (texto.includes("grande") || texto.includes("100") || texto.includes("200"))
  ) {
    consumo = 8000;
    desc = "Hotel grande — habitaciones, A/C, restaurante y lavandería";
  } else if (texto.includes("hotel")) {
    consumo = 3000;
    desc = "Hotel pequeño-mediano — habitaciones, A/C y servicios";
  } else if (
    texto.includes("fábrica") ||
    texto.includes("fabrica") ||
    texto.includes("planta industrial")
  ) {
    consumo = 12000;
    desc = "Planta industrial — maquinaria pesada y producción continua";
  } else if (texto.includes("taller")) {
    consumo = 3000;
    desc = "Taller industrial — motores, compresores y maquinaria";
  } else if (
    texto.includes("restaurante") ||
    texto.includes("cevichería") ||
    texto.includes("cocina")
  ) {
    consumo = 800;
    desc = "Restaurante — cocina industrial, refrigeración e iluminación";
  } else if (
    texto.includes("hospital") ||
    texto.includes("clínica") ||
    texto.includes("clinica")
  ) {
    consumo = 5000;
    desc = "Centro de salud — equipos médicos, A/C y operación 24/7";
  } else if (
    texto.includes("colegio") ||
    texto.includes("escuela") ||
    texto.includes("universidad")
  ) {
    consumo = 2500;
    desc = "Institución educativa — aulas, laboratorios y administración";
  } else if (
    texto.includes("supermercado") ||
    texto.includes("mercado") ||
    texto.includes("tienda grande")
  ) {
    consumo = 4000;
    desc = "Supermercado — refrigeración, iluminación y A/C";
  } else if (
    texto.includes("oficina") ||
    texto.includes("empresa") ||
    texto.includes("corporativo")
  ) {
    // Detectar número de personas
    const match = texto.match(
      /(\d+)\s*(personas?|trabajadores?|empleados?|personas)/,
    );
    const personas = match ? parseInt(match[1]) : 10;
    consumo =
      personas * 80 +
      (texto.includes("servidor") ? 2000 : 0) +
      (texto.includes("aire") ? personas * 100 : 0);
    desc = `Oficina con ~${personas} personas — PCs, iluminación y climatización`;
  } else if (
    texto.includes("casa") ||
    texto.includes("hogar") ||
    texto.includes("familia")
  ) {
    const match = texto.match(/(\d+)\s*(personas?|miembros)/);
    const personas = match ? parseInt(match[1]) : 4;
    consumo =
      personas * 60 +
      (texto.includes("aire") || texto.includes("a/c") ? 200 : 0) +
      (texto.includes("piscina") ? 300 : 0);
    desc = `Hogar con ~${personas} personas`;
  } else if (
    texto.includes("farm") ||
    texto.includes("invernadero") ||
    texto.includes("invernadero")
  ) {
    consumo = 2000;
    desc = "Agricultura / invernadero — bombas, iluminación y climatización";
  } else if (
    texto.includes("tienda") ||
    texto.includes("bodega") ||
    texto.includes("minimarket")
  ) {
    consumo = 400;
    desc = "Tienda o minimarket — iluminación, refrigeración y POS";
  } else {
    // Estimación por palabras clave de equipos
    let est = 150;
    if (texto.includes("aire acondicionado") || texto.includes("a/c"))
      est += 300;
    if (
      texto.includes("láser") ||
      texto.includes("laser") ||
      texto.includes("maquinaria")
    )
      est += 500;
    if (texto.includes("refrigerador") || texto.includes("cámara fría"))
      est += 200;
    if (
      texto.includes("computadora") ||
      texto.includes("pc") ||
      texto.includes("laptop")
    )
      est += 100;
    consumo = est;
    desc = "Estimación basada en equipos mencionados";
  }

  // Mostrar resultado
  document.getElementById("iaResultConsumo").textContent =
    `${consumo.toLocaleString()} kWh/mes`;
  document.getElementById("iaResultDesc").textContent = desc;
  document.getElementById("iaResult").classList.add("show");
  state.consumo_kwh_mes = consumo;
  showNotif("✅ Consumo estimado con éxito", "success");
}

// ============================================================
// PASO 3: PANELES Y BATERIAS
// ============================================================
function initPaneles() {
  const grid = document.getElementById("panelesGrid");
  grid.innerHTML = "";
  TIPOS_PANEL.forEach((p) => {
    const el = document.createElement("div");
    el.className =
      "panel-option-card" + (p.id === state.tipoPanel ? " selected" : "");
    el.dataset.id = p.id;
    el.innerHTML = `
      ${p.popularidad ? `<span class="panel-badge">${p.popularidad}</span>` : ""}
      <div>
        <span class="panel-potencia">${p.potencia}<span class="panel-unit">W</span></span>
      </div>
      <div class="panel-nombre">${p.nombre}</div>
      <div class="panel-dim">📐 ${p.dimensiones} | Efic. ${(p.eficiencia * 100).toFixed(1)}%</div>
      <div class="panel-precio-ref">Ref. ~$${p.precio_usd} USD/panel</div>
    `;
    el.addEventListener("click", () => {
      document
        .querySelectorAll(".panel-option-card")
        .forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
      state.tipoPanel = p.id;
    });
    grid.appendChild(el);
  });
}

function initBaterias() {
  const container = document.getElementById("bateriasContainer");
  container.innerHTML = "";
  TIPOS_BATERIA.forEach((b) => {
    const el = document.createElement("div");
    el.className =
      "bateria-card" + (b.id === state.tipoBateria ? " selected" : "");
    el.dataset.id = b.id;
    el.innerHTML = `
      <div class="bateria-icon">${b.icono}</div>
      <div>
        <div class="bateria-nombre">${b.nombre}</div>
        <div class="bateria-desc">${b.descripcion}</div>
      </div>
    `;
    el.addEventListener("click", () => {
      document
        .querySelectorAll(".bateria-card")
        .forEach((c) => c.classList.remove("selected"));
      el.classList.add("selected");
      state.tipoBateria = b.id;
    });
    container.appendChild(el);
  });
}

function initAdvancedConfig() {
  const toggle = document.getElementById("advancedToggle");
  const panel = document.getElementById("advancedPanel");
  toggle.addEventListener("click", () => {
    toggle.classList.toggle("open");
    panel.classList.toggle("show");
  });
}

function initRangeSliders() {
  // Sombra
  const sombra = document.getElementById("sombraRange");
  const sombraVal = document.getElementById("sombraVal");
  sombra.addEventListener("input", () => {
    state.factor_sombra = parseInt(sombra.value);
    sombraVal.textContent = sombra.value + "%";
    updateRangeSlider(sombra);
  });
  updateRangeSlider(sombra);

  // Eficiencia
  const efic = document.getElementById("eficRange");
  const eficVal = document.getElementById("eficVal");
  efic.addEventListener("input", () => {
    state.eficiencia_sistema = parseInt(efic.value);
    eficVal.textContent = efic.value + "%";
    updateRangeSlider(efic);
  });
  updateRangeSlider(efic);
}

function updateRangeSlider(input) {
  const min = input.min || 0;
  const max = input.max || 100;
  const val = ((input.value - min) / (max - min)) * 100;
  input.style.setProperty("--val", val + "%");
}

// ============================================================
// NAVEGACIÓN ENTRE PASOS
// ============================================================
function initNavButtons() {
  document.querySelectorAll(".btn-next").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(state.currentStep + 1));
  });
  document.querySelectorAll(".btn-prev").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(state.currentStep - 1));
  });
  document.getElementById("recalcularBtn")?.addEventListener("click", () => {
    state.resultado = null;
    document.getElementById("resultsContainer").classList.remove("show");
    document.getElementById("step4Placeholder").style.display = "";
    goToStep(1);
  });
}

function goToStep(step) {
  // Validación antes de avanzar
  if (step > state.currentStep) {
    if (!validarPaso(state.currentStep)) return;
  }

  state.currentStep = Math.max(1, Math.min(4, step));
  updateStepperUI();

  document
    .querySelectorAll(".step-panel")
    .forEach((p) => p.classList.remove("active"));
  const panel = document.getElementById(`step_${state.currentStep}`);
  if (panel) {
    panel.classList.add("active");
    window.scrollTo({
      top: panel.getBoundingClientRect().top + window.scrollY - 80,
      behavior: "smooth",
    });
  }

  if (state.currentStep === 4) {
    calcular();
  }
}

function updateStepperUI() {
  document.querySelectorAll(".stepper-item").forEach((item, i) => {
    const stepN = i + 1;
    item.classList.remove("active", "completed");
    if (stepN === state.currentStep) item.classList.add("active");
    else if (stepN < state.currentStep) item.classList.add("completed");
  });

  document.querySelectorAll(".stepper-nav-spacer").forEach((sp, i) => {
    sp.classList.remove("completed");
    if (i + 1 < state.currentStep) sp.classList.add("completed");
  });

  updateBtnGroup();
}

function updateBtnGroup() {
  // step 4 tiene solo recalcular
}

function validarPaso(step) {
  if (step === 1) {
    if (!state.perfil) {
      showNotif("⚠️ Por favor selecciona tu perfil", "error");
      return false;
    }
    return true;
  }
  if (step === 2) {
    const consumo = getConsumoActual();
    if (!consumo || consumo <= 0) {
      showNotif("⚠️ Ingresa tu consumo o selecciona equipos", "error");
      return false;
    }
    state.consumo_kwh_mes = consumo;
    return true;
  }
  return true;
}

function getConsumoActual() {
  if (state.consumoMode === "recibo") {
    return parseFloat(document.getElementById("recibokwh").value) || 0;
  }
  if (state.consumoMode === "equipos") {
    return CalculadoraSolar.calcularConsumoDesdeEquipos(
      state.equiposSeleccionados,
    );
  }
  if (state.consumoMode === "ia") {
    return state.consumo_kwh_mes;
  }
  return 0;
}

// ============================================================
// CALCULAR Y MOSTRAR RESULTADOS
// ============================================================
function calcular() {
  state.consumo_kwh_mes = getConsumoActual();
  if (!state.consumo_kwh_mes || state.consumo_kwh_mes <= 0) {
    showNotif("⚠️ Ingresa tu consumo o selecciona equipos", "error");
    // Navegar directamente sin llamar goToStep para evitar loop
    state.currentStep = 2;
    updateStepperUI();
    document
      .querySelectorAll(".step-panel")
      .forEach((p) => p.classList.remove("active"));
    document.getElementById("step_2").classList.add("active");
    return;
  }

  // Mostrar loading
  document.getElementById("loaderOverlay").classList.add("show");

  setTimeout(() => {
    const resultado = CalculadoraSolar.calcular({
      consumo_kwh_mes: state.consumo_kwh_mes,
      ciudad: state.ciudad,
      tipoPanel: state.tipoPanel,
      tipoBateria: state.tipoBateria,
      factor_sombra: state.factor_sombra,
      eficiencia_sistema: state.eficiencia_sistema,
      tarifa_kwh: state.tarifa_kwh,
    });
    state.resultado = resultado;
    document.getElementById("loaderOverlay").classList.remove("show");
    renderResultados(resultado);
  }, 1800);
}

// ============================================================
// RENDER DE RESULTADOS
// ============================================================
function renderResultados(r) {
  document.getElementById("resultsContainer").classList.add("show");

  // --- KPIs ---
  animCount("kpiPaneles", 0, r.num_paneles, 1200, "");
  animCount("kpiPotencia", 0, r.potencia_total_kw, 1200, " kW");
  animCount("kpiAhorroMes", 0, Math.round(r.ahorro_mes_pen), 1200, "");
  animCount("kpiCO2", 0, r.co2_evitado_anio_kg, 1200, "");
  document.getElementById("kpiAhorroMesPre").textContent = "S/ ";
  document.getElementById("kpiCO2Post").textContent = " kg/año";
  document.getElementById("kpiPayback").textContent =
    r.payback_anios.toFixed(1) + " años";
  document.getElementById("kpiArea").textContent = r.area_total_m2 + " m²";

  // --- DONUT: Consumo vs Generación ---
  renderDonut(r);

  // --- BARRAS: Producción mensual ---
  renderBarChart(r.produccion_mensual, r.consumo_kwh_mes);

  // --- COSTOS ---
  renderCostos(r);

  // --- RETORNO ---
  renderRetorno(r);

  // --- ECO ---
  document.getElementById("ecoCO2Mes").textContent =
    `${r.co2_evitado_mes_kg} kg`;
  document.getElementById("ecoCO2Anio").textContent =
    `${r.co2_evitado_anio_kg.toFixed(0)} kg`;
  document.getElementById("ecoCO225").textContent =
    `${r.co2_evitado_25_anios_toneladas} ton`;
  document.getElementById("ecoArboles").textContent =
    r.arboles_equivalentes.toLocaleString();

  // --- SPECS ---
  renderSpecs(r);

  // --- Scroll ---
  setTimeout(() => {
    document
      .getElementById("resultsContainer")
      .scrollIntoView({ behavior: "smooth", block: "start" });
  }, 200);
}

function animCount(id, from, to, duration, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = from + (to - from) * ease;
    el.textContent = Math.round(current).toLocaleString("es-PE") + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function renderDonut(r) {
  const pct = Math.min(
    100,
    Math.round((r.energia_generada_mes / r.consumo_kwh_mes) * 100),
  );
  const radius = 72;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  document
    .getElementById("donutCircleGenera")
    .setAttribute("stroke-dasharray", `${dash} ${circ}`);
  document.getElementById("donutPct").textContent = pct + "%";

  const excedente = Math.max(0, r.energia_generada_mes - r.consumo_kwh_mes);
  document.getElementById("legendConsumo").textContent =
    `${r.consumo_kwh_mes.toFixed(0)} kWh/mes consumo`;
  document.getElementById("legendGenera").textContent =
    `${r.energia_generada_mes.toFixed(0)} kWh/mes generado`;
  document.getElementById("legendExcedente").textContent =
    excedente > 0
      ? `${excedente.toFixed(0)} kWh/mes excedente (se vende a la red)`
      : "Sistema ajustado a tu consumo";
}

function renderBarChart(produccion, consumo_mes) {
  const container = document.getElementById("barChart");
  const max =
    Math.max(...produccion.map((m) => m.produccion), consumo_mes) * 1.1;
  container.innerHTML = "";

  produccion.forEach((m) => {
    const pct = (m.produccion / max) * 100;
    const consPct = (consumo_mes / max) * 100;
    const color = m.produccion >= consumo_mes ? "#10b981" : "#f59e0b";

    const col = document.createElement("div");
    col.className = "bar-col";
    col.style.cssText = "position:relative;";
    col.innerHTML = `
      <div class="bar" style="height:${pct}%;background:${color};opacity:0.85;"
           data-value="${m.produccion.toFixed(0)} kWh" title="${m.mes}: ${m.produccion} kWh">
      </div>
      <span style="font-size:9px;color:var(--text-muted);position:absolute;bottom:-20px;left:50%;transform:translateX(-50%)">${m.mes}</span>
    `;
    container.appendChild(col);
  });

  // Línea de consumo (visual indicator via color coding done above)
  const lineInfo = document.getElementById("barConsLineInfo");
  if (lineInfo)
    lineInfo.textContent = `Línea referencial de consumo: ${consumo_mes.toFixed(0)} kWh/mes`;
}

function renderCostos(r) {
  const desglose = [
    { item: "Paneles solares", usd: r.costo_paneles_usd },
    { item: "Inversor", usd: r.costo_inversor_usd },
    { item: `Baterías (${r.bateria.nombre})`, usd: r.costo_baterias_usd },
    { item: "Estructura metálica", usd: r.costo_estructura_usd },
    { item: "Cableado y protecciones", usd: r.costo_cables_usd },
    { item: "Mano de obra e instalación", usd: r.costo_mano_obra_usd },
    { item: "Sistema de monitoreo", usd: r.costo_monitoreo_usd },
    { item: "IGV (18%)", usd: r.igv_usd },
  ];

  const tbody = document.getElementById("costosTbody");
  tbody.innerHTML = desglose
    .filter((d) => d.usd > 0)
    .map(
      (d) => `
      <tr>
        <td>${d.item}</td>
        <td>$${d.usd.toLocaleString("en-US")}</td>
        <td>S/ ${(d.usd * TIPO_CAMBIO_USD_PEN).toLocaleString("es-PE")}</td>
      </tr>
    `,
    )
    .join("");
  tbody.innerHTML += `
    <tr>
      <td>Total del sistema</td>
      <td>$${r.costo_total_usd.toLocaleString("en-US")}</td>
      <td>S/ ${r.costo_total_pen.toLocaleString("es-PE")}</td>
    </tr>
  `;
}

function renderRetorno(r) {
  const pct = Math.min(100, Math.round((r.payback_anios / 25) * 100));
  document.getElementById("paybackYears").textContent =
    `${r.payback_anios} años`;
  document.getElementById("ahorroAnio").textContent =
    CalculadoraSolar.formatPEN(r.ahorro_anio_pen);
  document.getElementById("ahorroTotal25").textContent =
    CalculadoraSolar.formatPEN(r.ahorro_total_25_anios);
  document.getElementById("gananciaNeta25").textContent =
    CalculadoraSolar.formatPEN(r.ganancia_neta_25_anios);
  document.getElementById("roi25").textContent = `${r.roi_25_anios}%`;

  setTimeout(() => {
    const fill = document.getElementById("timelineFill");
    if (fill) fill.style.width = pct + "%";
  }, 400);
}

function renderSpecs(r) {
  document.getElementById("specPanel").textContent = r.panel.nombre;
  document.getElementById("specInversor").textContent = `${r.inversor_kw} kW`;
  document.getElementById("specHSP").textContent =
    `${r.hsp.toFixed(1)} horas pico`;
  document.getElementById("specArea").textContent =
    `${r.area_total_m2} m² aprox.`;
  document.getElementById("specBateria").textContent =
    r.num_baterias > 0
      ? `${r.num_baterias} módulos (${r.capacidad_bateria_kwh} kWh)`
      : "No incluido (On-Grid)";
  document.getElementById("specModo").textContent = r.modo_sistema;
  document.getElementById("specEfic").textContent =
    `${state.eficiencia_sistema}% sistema`;
  document.getElementById("specVida").textContent =
    "25 años garantía producción";
}

// ============================================================
// ACCIONES
// ============================================================
function imprimirResultados() {
  window.print();
}

function copiarResumen() {
  if (!state.resultado) return;
  const r = state.resultado;
  const texto = `
🌞 RESULTADO CALCULADORA SOLAR PERÚ
Ciudad: ${r.ciudad.nombre} (${r.hsp} HSP)
Consumo: ${r.consumo_kwh_mes} kWh/mes
Paneles: ${r.num_paneles} × ${r.panel.potencia}W = ${r.potencia_total_kw} kW
Inversión: $${r.costo_total_usd.toLocaleString()} USD (S/ ${r.costo_total_pen.toLocaleString()})
Ahorro mensual: S/ ${r.ahorro_mes_pen.toFixed(2)}
Retorno: ${r.payback_anios} años
CO₂ evitado: ${r.co2_evitado_anio_kg} kg/año
`.trim();

  navigator.clipboard.writeText(texto).then(() => {
    showNotif("📋 ¡Resumen copiado al portapapeles!", "success");
  });
}

// ============================================================
// UTILS
// ============================================================
function showNotif(msg, type = "") {
  const el = document.getElementById("notif");
  el.textContent = msg;
  el.className = `notif ${type} show`;
  setTimeout(() => el.classList.remove("show"), 3500);
}

// Click fuera de modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document.getElementById("loaderOverlay").classList.remove("show");
});
