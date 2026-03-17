import { Zap, LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xl tracking-tight">
            <Zap className="w-6 h-6" />
            <span>HidroSolar</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-50 text-blue-700 font-semibold transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Calculadora Pro
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <FileText className="w-5 h-5" />
            Cotizaciones Guardadas
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Users className="w-5 h-5" />
            Directorio Clientes
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Settings className="w-5 h-5" />
            Config. Precios
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white z-10 shadow-sm shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Generador de Cotizaciones</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right">
              <span className="block font-bold text-slate-900">Asesor de Ventas</span>
              <span className="text-slate-500">asesor@hidrosolar.com</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              AS
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 h-full">
          <div className="max-w-7xl mx-auto h-full space-y-6 lg:space-y-0 lg:flex lg:gap-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
