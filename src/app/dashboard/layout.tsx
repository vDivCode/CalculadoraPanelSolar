"use client";

import { Zap, LayoutDashboard, FileText, Settings, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard General', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calculadora Pro', href: '/dashboard/calculator', icon: Zap },
    { name: 'Config. Precios', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xl tracking-tight">
            <Zap className="w-6 h-6" />
            <span>HidroSolar <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded ml-1 border border-blue-100">PRO</span></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button 
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 relative">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white z-10 shadow-sm shrink-0">
          <h1 className="text-xl font-bold text-slate-800">
            {pathname === '/dashboard' ? 'Dashboard de Ventas' : 'Nueva Cotización'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-right hidden sm:block">
              <span className="block font-bold text-slate-900">Equipo HidroSolar</span>
              <span className="text-slate-500 text-xs">Asesor Autorizado</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-white">
              HS
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 h-full">
          <div className="max-w-7xl mx-auto h-full space-y-6 lg:space-y-0 lg:flex lg:gap-8 justify-center">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
