"use client";

import React, { useState, useEffect } from 'react';
import { Home, Factory, HardHat, Zap, Sun, MapPin, Calculator, Battery, CheckCircle2, Tv, RefreshCcw, Coffee, MonitorSmartphone, Fan, Snowflake } from 'lucide-react';

type PropertyType = 'Hogar' | 'Empresa' | 'Minas';

const propertyOptions: { id: PropertyType; label: string; icon: React.ReactNode; defaultConsumption: number; desc: string }[] = [
  { id: 'Hogar', label: 'Hogar', icon: <Home className="w-8 h-8" />, defaultConsumption: 300, desc: 'Consumo residencial típico' },
  { id: 'Empresa', label: 'Empresa', icon: <Factory className="w-8 h-8" />, defaultConsumption: 2500, desc: 'Negocios y oficinas' },
  { id: 'Minas', label: 'Minería', icon: <HardHat className="w-8 h-8" />, defaultConsumption: 50000, desc: 'Procesos industriales pesados' },
];

type Appliance = {
  id: string;
  name: string;
  icon: React.ReactNode;
  kwhPerMonth: number;
};

const commonAppliances: Appliance[] = [
  { id: 'fridge', name: 'Refrigerador', icon: <Snowflake className="w-5 h-5" />, kwhPerMonth: 50 },
  { id: 'tv', name: 'Televisor', icon: <Tv className="w-5 h-5" />, kwhPerMonth: 15 },
  { id: 'washer', name: 'Lavadora', icon: <RefreshCcw className="w-5 h-5" />, kwhPerMonth: 25 },
  { id: 'coffee', name: 'Cafetera', icon: <Coffee className="w-5 h-5" />, kwhPerMonth: 10 },
  { id: 'pc', name: 'Computadora', icon: <MonitorSmartphone className="w-5 h-5" />, kwhPerMonth: 30 },
  { id: 'ac', name: 'Aire Acondicionado', icon: <Fan className="w-5 h-5" />, kwhPerMonth: 120 },
];

export default function SolarCalculator() {
  const [propertyType, setPropertyType] = useState<PropertyType>('Hogar');
  const [monthlyKwh, setMonthlyKwh] = useState<number>(300);
  const [panelWattage, setPanelWattage] = useState<number>(550);
  const [sunHours, setSunHours] = useState<number>(4.5);
  
  // Appliance tracking
  const [useAppliances, setUseAppliances] = useState(false);
  const [applianceCounts, setApplianceCounts] = useState<Record<string, number>>({});
  
  // Results
  const [panelsNeeded, setPanelsNeeded] = useState<number>(0);
  const [systemSizeKW, setSystemSizeKW] = useState<number>(0);
  const [requiredArea, setRequiredArea] = useState<number>(0);

  // Recalculate consumption based on appliances
  useEffect(() => {
    if (useAppliances) {
      let totalKwh = 0;
      commonAppliances.forEach(app => {
        const count = applianceCounts[app.id] || 0;
        totalKwh += (count * app.kwhPerMonth);
      });
      setMonthlyKwh(totalKwh === 0 ? 50 : totalKwh); // Prevent 0
    }
  }, [applianceCounts, useAppliances]);

  // Adjust Panel Wattage automatically based on total consumption
  useEffect(() => {
    if (monthlyKwh > 10000) {
      setPanelWattage(600); // Industrial panel needed
    } else if (monthlyKwh > 1000) {
      setPanelWattage(550); // Premium panel for Enterprise
    } else {
      // Keep user choice or default to 450W for home
      if (panelWattage > 550) setPanelWattage(450); 
    }
  }, [monthlyKwh]);

  useEffect(() => {
    // Math:
    // Daily consumption (kWh) = Monthly / 30
    const dailyKwh = monthlyKwh / 30;
    
    // Efficiency losses (~20% loss = 80% efficiency)
    const efficiency = 0.8;
    
    // Panel daily production (kWh) = (Panel Wattage * Sun Hours / 1000) * efficiency
    const panelDailyProduction = (panelWattage * sunHours / 1000) * efficiency;
    
    // Calculate panels
    let panels = 0;
    if (panelDailyProduction > 0) {
      panels = Math.ceil(dailyKwh / panelDailyProduction);
    }
    
    setPanelsNeeded(panels);
    setSystemSizeKW(Number((panels * panelWattage / 1000).toFixed(2)));
    setRequiredArea(panels * 2.2); // approx 2.2 m^2 per panel
  }, [monthlyKwh, panelWattage, sunHours]);

  const handlePropertyChange = (ptype: PropertyType, defaultVal: number) => {
    setPropertyType(ptype);
    if (!useAppliances) {
      setMonthlyKwh(defaultVal);
    }
  };

  const incrementAppliance = (id: string) => {
    setApplianceCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrementAppliance = (id: string) => {
    setApplianceCounts(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 relative">
      
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-sm font-medium mb-4">
            <Sun className="w-4 h-4" />
            Empieza a ahorrar hoy con HidroSolar
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
            Calculadora <span className="text-blue-600">Solar</span>
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Descubre exactamente cuántos paneles necesitas para potenciar tu hogar, empresa o mina de manera eficiente y renovable.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Section */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Property Type Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-sm font-bold">1</span>
                Tipo de Propiedad
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {propertyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handlePropertyChange(opt.id, opt.defaultConsumption)}
                    className={`relative p-6 rounded-2xl border text-left transition-all duration-200 group
                      ${propertyType === opt.id 
                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <div className={`${propertyType === opt.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`}>
                      {opt.icon}
                    </div>
                    <h3 className="mt-4 font-semibold text-lg text-slate-900">{opt.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                    
                    {propertyType === opt.id && (
                      <div className="absolute top-4 right-4 text-blue-600">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 border border-slate-300 text-slate-700 text-sm font-bold">2</span>
                  Consumo Mensual Estimado
                </h2>
                
                {propertyType === 'Hogar' && (
                  <button 
                    onClick={() => setUseAppliances(!useAppliances)}
                    className="text-sm px-4 py-2 rounded-lg bg-white border border-slate-300 shadow-sm hover:bg-slate-50 text-blue-600 font-medium transition-colors"
                  >
                    {useAppliances ? 'Ingresar kWh manualmente' : 'No sé mi consumo...'}
                  </button>
                )}
              </div>
              
              <div className="flex justify-end">
                 <span className="text-3xl font-bold text-blue-600">{monthlyKwh.toLocaleString()} <span className="text-lg font-medium text-slate-500">kWh</span></span>
              </div>

              {!useAppliances ? (
                <div className="p-1">
                  <input 
                    type="range" 
                    min={100} 
                    max={propertyType === 'Minas' ? 1000000 : propertyType === 'Empresa' ? 20000 : 2000} 
                    step={propertyType === 'Minas' ? 10000 : 50}
                    value={monthlyKwh} 
                    onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                    <span>Mínimo</span>
                    <span>Máximo</span>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  {commonAppliances.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600 bg-blue-100 p-2 rounded-lg">{app.icon}</div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{app.name}</p>
                          <p className="text-xs text-slate-500">~{app.kwhPerMonth} kWh/mes</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button onClick={() => decrementAppliance(app.id)} className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-100 font-bold text-slate-600 transition-colors">-</button>
                        <span className="w-4 text-center text-sm font-bold text-slate-800">{applianceCounts[app.id] || 0}</span>
                        <button onClick={() => incrementAppliance(app.id)} className="w-8 h-8 rounded flex items-center justify-center hover:bg-blue-50 font-bold text-blue-600 transition-colors">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Potencia del Panel (Auto.)
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium transition-shadow"
                    >
                      <option value={400}>400W (Básico)</option>
                      <option value={450}>450W (Hogar Estándar)</option>
                      <option value={550}>550W (Empresa / Premium)</option>
                      <option value={600}>600W (Industrial / Minas)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Horas de Sol Pico / Día
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="10"
                      value={sunHours}
                      onChange={(e) => setSunHours(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-medium transition-shadow"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
              
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-extrabold text-slate-900">Resultados Estimados</h2>
              </div>

              <div className="space-y-8">
                {/* Main Result */}
                <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wide">Paneles Recomendados</div>
                  <div className="text-6xl font-black text-slate-900">
                    {panelsNeeded}
                  </div>
                  <div className="text-blue-700 text-sm font-bold mt-3 flex items-center justify-center gap-1.5">
                    <Battery className="w-4 h-4" />
                    Cubrirá el 100% de tu consumo
                  </div>
                </div>

                {/* Other Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600 font-medium">Capacidad del Sistema</span>
                    <span className="font-bold text-lg text-slate-900">{systemSizeKW} kW</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600 font-medium">Área de Instalación Aprox.</span>
                    <span className="font-bold text-lg text-slate-900">{requiredArea.toLocaleString()} m²</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-600 font-medium">Producción Anual</span>
                    <span className="font-bold text-lg text-blue-600">
                      {(systemSizeKW * sunHours * 365).toLocaleString('en-US', { maximumFractionDigits: 0 })} kWh
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md active:scale-[0.98]">
                    Obtener Cotización Formal
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                    * Este cálculo es aproximado e incluye una holgura técnica por eficiencia (80%).  
                    El factor final dependerá del lugar de instalación y de la inspección física.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
