"use client";

import React, { useState, useEffect } from 'react';
import { Download, Save, DollarSign, Plug, Sun, Zap, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardCalculator() {
  // UI States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Client Data
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  
  // Consumption & Target
  const [monthlyKwh, setMonthlyKwh] = useState(300);
  const [sunHours, setSunHours] = useState(4.5);
  const [panelWattage, setPanelWattage] = useState(550);

  // Costs (Editable by Admin setup, but local here for the demo)
  const [costPerPanel, setCostPerPanel] = useState(150);
  const [costInverter, setCostInverter] = useState(1200);
  const [costStructurePerPanel, setCostStructurePerPanel] = useState(30);
  const [costLabor, setCostLabor] = useState(800);
  const [taxRate, setTaxRate] = useState(18); // Example: 18% IGV

  // Results
  const [panelsNeeded, setPanelsNeeded] = useState(0);
  const [systemSizeKW, setSystemSizeKW] = useState(0);
  
  // Financials
  const [subtotalPanels, setSubtotalPanels] = useState(0);
  const [subtotalStructure, setSubtotalStructure] = useState(0);
  const [subtotalMaterials, setSubtotalMaterials] = useState(0);
  const [subtotalProject, setSubtotalProject] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    async function fetchGlobalSettings() {
      const { data } = await supabase.from('system_settings').select('*').eq('id', 1).single();
      if (data) {
        setCostPerPanel(data.cost_per_panel);
        setCostInverter(data.cost_inverter);
        setCostStructurePerPanel(data.cost_structure_per_panel);
        setCostLabor(data.cost_labor);
        setTaxRate(data.tax_rate);
      }
    }
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    const dailyKwh = monthlyKwh / 30;
    const efficiency = 0.8;
    const panelDailyProduction = (panelWattage * sunHours / 1000) * efficiency;
    
    let panels = 0;
    if (panelDailyProduction > 0) {
      panels = Math.ceil(dailyKwh / panelDailyProduction);
    }
    
    setPanelsNeeded(panels);
    setSystemSizeKW(Number((panels * panelWattage / 1000).toFixed(2)));

    // Financial calculations
    const panelsCost = panels * costPerPanel;
    const structureCost = panels * costStructurePerPanel;
    const totalMaterials = panelsCost + costInverter + structureCost;
    const subtotal = totalMaterials + costLabor;
    const calculatedTax = subtotal * (taxRate / 100);
    const finalPrice = subtotal + calculatedTax;

    setSubtotalPanels(panelsCost);
    setSubtotalStructure(structureCost);
    setSubtotalMaterials(totalMaterials);
    setSubtotalProject(subtotal);
    setTaxes(calculatedTax);
    setTotalPrice(finalPrice);
  }, [monthlyKwh, sunHours, panelWattage, costPerPanel, costInverter, costStructurePerPanel, costLabor, taxRate]);

  const handleSave = async () => {
    if (!clientName.trim()) {
      alert("Por favor ingrese el Nombre Completo del cliente.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('formal_quotes')
        .insert([
          {
            client_name: clientName,
            client_phone: clientPhone,
            client_address: clientAddress,
            monthly_kwh: monthlyKwh,
            sun_hours: sunHours,
            panel_wattage: panelWattage,
            panels_needed: panelsNeeded,
            system_size_kw: systemSizeKW,
            total_price: totalPrice,
          }
        ]);

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Reset success message after 3 seconds
    } catch (error: any) {
      console.error('Error al guardar la cotización:', error);
      alert(`Error de Supabase: ${error.message || 'Verifica la consola para más detalles.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="w-full lg:w-3/5 space-y-6 md:pb-10">
        
        {/* Client Module */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-slate-800">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><Zap className="w-5 h-5"/></span>
            Datos del Cliente
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nombre Completo</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ej. Empresa SA" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-slate-900 font-medium" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Teléfono / WhatsApp</label>
              <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+51 987 654 321" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-slate-900 font-medium" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Dirección de Instalación</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Av. Principal 123, Distrito" className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-slate-900 font-medium" />
              </div>
            </div>
          </div>
        </section>

        {/* Technical Data */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-slate-800">
            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-lg"><Sun className="w-5 h-5"/></span>
            Datos Técnicos (Parámetros)
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Consumo Mensual</label>
              <div className="flex items-center gap-2">
                <input type="number" value={monthlyKwh} onChange={e => setMonthlyKwh(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold" />
                <span className="text-slate-500 font-bold">kWh</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">HSP (Horas de Sol)</label>
              <input type="number" step="0.1" value={sunHours} onChange={e => setSunHours(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Potencia Panel</label>
              <div className="flex items-center gap-2">
                <input type="number" step="10" value={panelWattage} onChange={e => setPanelWattage(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 font-bold" />
                <span className="text-slate-500 font-bold">W</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Adjustments */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-extrabold flex items-center gap-2 mb-4 text-slate-800">
            <span className="bg-green-100 text-green-700 p-1.5 rounded-lg"><DollarSign className="w-5 h-5"/></span>
            Costos Operativos ($)
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Costo x Panel</label>
              <input type="number" readOnly value={costPerPanel} title="Cambia esto en Configuración de Precios" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Inversor / Hub</label>
              <input type="number" readOnly value={costInverter} title="Cambia esto en Configuración de Precios" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Estruct. x Panel</label>
              <input type="number" readOnly value={costStructurePerPanel} title="Cambia esto en Configuración de Precios" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase tracking-wider">Mano de Obra</label>
              <input type="number" readOnly value={costLabor} title="Cambia esto en Configuración de Precios" className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none text-slate-500 font-bold cursor-not-allowed" />
            </div>
          </div>
        </section>

      </div>
      
      {/* Dynamic Quotation Panel */}
      <div className="w-full lg:w-2/5 flex flex-col gap-6">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          
          <h2 className="text-xl font-extrabold mb-6 text-slate-900 flex items-center justify-between">
            Resumen de Propuesta
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200">Cotización</span>
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Paneles Válidos</span>
              <span className="text-3xl font-black text-blue-700">{panelsNeeded}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Potencia Total</span>
              <span className="text-3xl font-black text-slate-800">{systemSizeKW} <span className="text-lg">kW</span></span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Desglose Financiero (USD)</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 cursor-help font-medium" title={`${panelsNeeded} paneles x $${costPerPanel}`}>Costo Paneles</span>
              <span className="font-bold text-slate-900">${subtotalPanels.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Inversores y Electrónica</span>
              <span className="font-bold text-slate-900">${costInverter.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">Estructuras y Cables</span>
              <span className="font-bold text-slate-900">${subtotalStructure.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-dashed border-slate-300 pb-3">
              <span className="text-slate-600 font-medium">Mano de Obra / Instalación</span>
              <span className="font-bold text-slate-900">${costLabor.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
              <span className="font-bold text-slate-700">Subtotal Operativo</span>
              <span className="font-extrabold text-slate-900">${subtotalProject.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-slate-500 flex items-center gap-2">
                Impuestos (IGV/IVA)
                <input type="number" readOnly value={taxRate} className="w-12 bg-slate-100 border border-slate-200 text-center rounded text-xs py-0.5 outline-none font-bold text-slate-500 cursor-not-allowed" />%
              </span>
              <span className="text-slate-600 font-bold">+ ${taxes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-blue-600 rounded-2xl p-5 border border-blue-700 shadow-md">
            <span className="block text-sm font-bold text-blue-100 mb-1 tracking-wide">Precio Total al Cliente</span>
            <div className="text-4xl font-black text-white flex items-baseline gap-1">
              <span className="text-2xl text-blue-100">$</span>
              {totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 py-4 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border shadow-sm ${
              saveSuccess 
                ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' 
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Save className="w-5 h-5 text-slate-400" />
            )}
            {isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar'}
          </button>
          <button 
            onClick={() => window.print()}
            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.98]">
            <Download className="w-5 h-5 text-blue-100" /> Exportar a PDF
          </button>
        </div>

      </div>
    </>
  );
}
