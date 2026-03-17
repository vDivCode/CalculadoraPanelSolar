"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, Calendar, User, DollarSign, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardSummary() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('formal_quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
      } else {
        setQuotes(data || []);
      }
      setLoading(false);
    }
    fetchQuotes();
  }, []);

  return (
    <div className="w-full space-y-8">
      {/* Header with quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Cotizaciones Formales</h2>
          <p className="text-slate-500 font-medium text-sm">Gestiona y revisa todas las propuestas enviadas.</p>
        </div>
        <Link 
          href="/dashboard/calculator"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> Nueva Cotización
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Cargando propuestas...</p>
        </div>
      ) : quotes.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No hay cotizaciones aún</h3>
          <p className="text-slate-500 mb-8 max-w-xs mx-auto">Empieza creando tu primera cotización profesional para un cliente.</p>
          <Link href="/dashboard/calculator" className="text-blue-600 font-bold hover:underline">Ir a la Calculadora Pro</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                       {quote.client_name}
                       {quote.status === 'PENDIENTE' && (
                         <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-widest">Pendiente</span>
                       )}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" /> {new Date(quote.created_at).toLocaleDateString()} • {quote.system_size_kw}kW Instalación
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Monto Total</span>
                    <span className="text-lg font-black text-slate-900">${Number(quote.total_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all group-hover:translate-x-1">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
