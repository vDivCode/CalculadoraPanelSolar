"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, RefreshCw, DollarSign, Sun, Zap, Percent, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    cost_per_panel: 150,
    cost_inverter: 1200,
    cost_structure_per_panel: 30,
    cost_labor: 800,
    tax_rate: 18
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) setSettings(data);
      } catch (err: any) {
        console.error('Error fetching settings:', err.message);
        setError('No se pudieron cargar los precios. ¿Ya ejecutaste el SQL en Supabase?');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() });

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err.message);
      setError('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 w-full">
        <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">Cargando configuración oficial...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Configuración de Precios</h2>
        <p className="text-slate-500 font-medium">Define los costos base que usará todo el equipo en la calculadora.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Panel Costs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" /> Equipos Principales
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Costo por Panel ($)</label>
              <input 
                type="number" 
                value={settings.cost_per_panel} 
                onChange={e => setSettings({...settings, cost_per_panel: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Costo Inversor / Hub ($)</label>
              <input 
                type="number" 
                value={settings.cost_inverter} 
                onChange={e => setSettings({...settings, cost_inverter: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        </section>

        {/* Other Costs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" /> Instalación y Otros
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Estructura por Panel ($)</label>
              <input 
                type="number" 
                value={settings.cost_structure_per_panel} 
                onChange={e => setSettings({...settings, cost_structure_per_panel: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mano de Obra ($)</label>
              <input 
                type="number" 
                value={settings.cost_labor} 
                onChange={e => setSettings({...settings, cost_labor: Number(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        </section>

        {/* Tax rate */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm md:col-span-2">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-2xl">
                  <Percent className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800">Impuestos (IGV)</h3>
                  <p className="text-xs text-slate-500 font-medium">Porcentaje aplicado al subtotal del proyecto.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  value={settings.tax_rate} 
                  onChange={e => setSettings({...settings, tax_rate: Number(e.target.value)})}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-xl p-3 text-center font-black text-slate-900 text-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                />
                <span className="text-xl font-black text-slate-400">%</span>
              </div>
           </div>
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-10 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 flex items-center gap-3 ${
            saveSuccess ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Guardando...' : saveSuccess ? '¡Cambios Aplicados!' : 'Guardar Precios Oficiales'}
        </button>
      </div>
    </div>
  );
}
