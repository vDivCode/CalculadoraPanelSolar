import { Zap, Lock, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-900">
      
      <Link href="/" className="absolute top-8 left-8 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 group">
        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Volver a la Calculadora
      </Link>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 mb-6 shadow-sm">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900">Portal <span className="text-blue-600">HidroSolar</span></h1>
          <p className="text-slate-600 font-medium">Panel de administración para asesores</p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="asesor@hidrosolar.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700">Contraseña</label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <Link 
              href="/dashboard"
              className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
            >
              Iniciar Sesión <ChevronRight className="w-4 h-4" />
            </Link>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs font-semibold text-slate-400 mt-8">
          Uso exclusivo para personal autorizado de HidroSolar.
        </p>
      </div>
    </div>
  );
}
