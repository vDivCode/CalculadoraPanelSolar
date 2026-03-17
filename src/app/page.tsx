import Link from 'next/link';
import { Zap, ChevronRight, LayoutDashboard, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-100 border border-blue-200 shadow-sm mb-4">
          <Zap className="w-10 h-10 text-blue-600" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Portal <span className="text-blue-600">HidroSolar</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-md mx-auto">
            Sistema interno de gestión de cotizaciones y dimensionamiento para asesores técnicos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-6">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-3 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98] group"
          >
            <LayoutDashboard className="w-5 h-5" />
            Ir al Dashboard
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link 
            href="/login" 
            className="flex items-center justify-center gap-3 p-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold transition-all shadow-sm active:scale-[0.98]"
          >
            <Lock className="w-5 h-5 text-slate-400" />
            Acceso Personal
          </Link>
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-12">
          Uso restringido a personal de HidroSolar S.A.C.
        </p>
      </div>
    </div>
  );
}
