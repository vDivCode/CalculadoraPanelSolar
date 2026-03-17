"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, User, Phone, MapPin, Zap, Sun, DollarSign, Calendar, FileText, Printer } from 'lucide-react';

export default function QuoteDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuote() {
      const { data, error } = await supabase
        .from('formal_quotes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching quote:', error);
        router.push('/dashboard');
      } else {
        setQuote(data);
      }
      setLoading(false);
    }
    fetchQuote();
  }, [id, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 w-full space-y-4">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold">Cargando detalles...</p>
    </div>
  );

  if (!quote) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group"
        >
          <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Volver al Listado
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Printer className="w-4 h-4" /> Imprimir Propuesta
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Client & Main Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">{quote.client_name}</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
              <Calendar className="w-4 h-4" /> {new Date(quote.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Teléfono</span>
                  <span className="text-slate-900 font-bold">{quote.client_phone || 'No registrado'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                  <MapPin className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ubicación</span>
                  <span className="text-slate-900 font-bold text-sm leading-tight">{quote.client_address || 'No registrada'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10 text-center space-y-2">
                <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Inversión Total Estimada</span>
                <div className="text-4xl font-black">${Number(quote.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="text-xs font-medium text-blue-100 pt-2 border-t border-blue-500">Incluye IGV (18%) e Instalación</div>
             </div>
             <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/20" />
          </div>
        </div>

        {/* Right Column: Technical Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
                    <Sun className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-extrabold text-slate-800">Parámetros de Diseño</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">HSP Local</span>
                    <span className="text-xl font-black text-slate-900">{quote.sun_hours} <span className="text-xs text-slate-400 font-bold">h/día</span></span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Consumo</span>
                    <span className="text-xl font-black text-slate-900">{quote.monthly_kwh} <span className="text-xs text-slate-400 font-bold">kWh/mes</span></span>
                  </div>
                </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-extrabold text-slate-800">Hardware Propuesto</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cant. Paneles</span>
                    <span className="text-xl font-black text-blue-700">{quote.panels_needed} <span className="text-xs text-slate-400 font-bold">und</span></span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Capacidad</span>
                    <span className="text-xl font-black text-slate-900">{quote.system_size_kw} <span className="text-xs text-slate-400 font-bold">kWp</span></span>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Detalle Económico de la Propuesta
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 text-sm border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Concepto</span>
                <span className="font-bold text-slate-500 uppercase tracking-wider text-right">Monto Estimado</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                     <span className="font-bold text-slate-700">Equipamiento Fotovoltaico</span>
                  </div>
                  <span className="font-black text-slate-900 text-lg">${(quote.total_price * 0.7).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                     <span className="font-bold text-slate-700">Materiales y Estructuras</span>
                  </div>
                  <span className="font-black text-slate-900 text-lg">${(quote.total_price * 0.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                     <span className="font-bold text-slate-700">Instalación y Puesta en Marcha</span>
                  </div>
                  <span className="font-black text-slate-900 text-lg">${(quote.total_price * 0.15).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-400 italic">
                  * Esta cotización es válida por 15 días calendario. Los precios están sujetos a cambios según la visita técnica definitiva. 
                  Todos los materiales son de primera calidad bajo normativa vigente de HidroSolar Perú.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
