"use client";

import React, { useState, useEffect } from 'react';
import { Home, Factory, HardHat, Zap, Sun, MapPin, Calculator, Battery, CheckCircle2 } from 'lucide-react';

type PropertyType = 'Hogar' | 'Empresa' | 'Minas';

const propertyOptions: { id: PropertyType; label: string; icon: React.ReactNode; defaultConsumption: number; desc: string }[] = [
  { id: 'Hogar', label: 'Hogar', icon: <Home className="w-8 h-8" />, defaultConsumption: 300, desc: 'Consumo residencial típico' },
  { id: 'Empresa', label: 'Empresa', icon: <Factory className="w-8 h-8" />, defaultConsumption: 2500, desc: 'Negocios y oficinas' },
  { id: 'Minas', label: 'Minería', icon: <HardHat className="w-8 h-8" />, defaultConsumption: 50000, desc: 'Procesos industriales' },
];

export default function SolarCalculator() {
  const [propertyType, setPropertyType] = useState<PropertyType>('Hogar');
  const [monthlyKwh, setMonthlyKwh] = useState<number>(300);
  const [panelWattage, setPanelWattage] = useState<number>(550);
  const [sunHours, setSunHours] = useState<number>(4.5);
  
  // Results
  const [panelsNeeded, setPanelsNeeded] = useState<number>(0);
  const [systemSizeKW, setSystemSizeKW] = useState<number>(0);
  const [requiredArea, setRequiredArea] = useState<number>(0);

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
    setMonthlyKwh(defaultVal);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium mb-4">
            <Sun className="w-4 h-4" />
            Empieza a ahorrar hoy
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Calculadora <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Solar</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Descubre exactamente cuántos paneles necesitas para potenciar tu {propertyType.toLowerCase()} con energía limpia y renovable.
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Section */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Property Type Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-sm">1</span>
                Tipo de Propiedad
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {propertyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handlePropertyChange(opt.id, opt.defaultConsumption)}
                    className={`relative p-6 rounded-2xl border text-left transition-all duration-300 group
                      ${propertyType === opt.id 
                        ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800'}`}
                  >
                    <div className={`${propertyType === opt.id ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      {opt.icon}
                    </div>
                    <h3 className="mt-4 font-semibold text-lg">{opt.label}</h3>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                    
                    {propertyType === opt.id && (
                      <div className="absolute top-4 right-4 text-emerald-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Consumption */}
            <div className="space-y-6 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-sm">2</span>
                  Consumo Mensual Averiguado
                </h2>
                <span className="text-2xl font-bold text-emerald-400">{monthlyKwh.toLocaleString()} <span className="text-sm font-medium text-slate-500">kWh</span></span>
              </div>
              
              <div className="p-1">
                <input 
                  type="range" 
                  min={100} 
                  max={propertyType === 'Minas' ? 1000000 : propertyType === 'Empresa' ? 20000 : 2000} 
                  step={propertyType === 'Minas' ? 10000 : 50}
                  value={monthlyKwh} 
                  onChange={(e) => setMonthlyKwh(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>Mínimo</span>
                  <span>Máximo</span>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Potencia del Panel (Watts)
                  </label>
                  <div className="relative">
                    <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select 
                      value={panelWattage}
                      onChange={(e) => setPanelWattage(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
                    >
                      <option value={400}>400W (Estándar)</option>
                      <option value={450}>450W (Medio)</option>
                      <option value={550}>550W (Premium)</option>
                      <option value={600}>600W (Industrial)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Horas de Sol Pico / Día
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="number" 
                      step="0.1"
                      min="1"
                      max="10"
                      value={sunHours}
                      onChange={(e) => setSunHours(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5">
              {/* Decorative elements behind results */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-8">
                <Calculator className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold">Resultados Estimados</h2>
              </div>

              <div className="space-y-8">
                {/* Main Result */}
                <div className="text-center p-6 rounded-2xl bg-slate-950/50 border border-slate-800/80">
                  <div className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Paneles Recomendados</div>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                    {panelsNeeded}
                  </div>
                  <div className="text-emerald-400 text-sm font-medium mt-2 flex items-center justify-center gap-1">
                    <Battery className="w-4 h-4" />
                    Cobrirá el 100% de tu consumo
                  </div>
                </div>

                {/* Other Metrics */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-400">Capacidad del Sistema</span>
                    <span className="font-semibold text-lg">{systemSizeKW} kW</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-400">Área de Techo Requerida</span>
                    <span className="font-semibold text-lg">{requiredArea.toLocaleString()} m²</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <span className="text-slate-400">Producción Anual Estimada</span>
                    <span className="font-semibold text-lg text-cyan-400">
                      {(systemSizeKW * sunHours * 365).toLocaleString('en-US', { maximumFractionDigits: 0 })} kWh
                    </span>
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all active:scale-[0.98] shadow-[0_0_30px_-5px_#34d399]">
                  Obtener Cotización Formal
                </button>

                <p className="text-xs text-center text-slate-500">
                  * Este es un cálculo estimado basado en eficiencia típica (80%). El requerimiento real puede variar según la orientación, sombras y clima local.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
