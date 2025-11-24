import React from 'react';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">Seguros de Salud Nacional</span>
                <span className="ml-2 text-xs text-slate-400 uppercase tracking-widest border-l border-slate-700 pl-2">Sistemas</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <span className="text-slate-300 text-sm px-3 py-2 rounded-md font-medium">Tesis Ingeniería de Sistemas</span>
                <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full border border-slate-700">v1.0.4 Release</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Seguros de Salud Nacional. Todos los derechos reservados.
            </p>
            <p className="text-slate-400 text-sm mt-2 md:mt-0 flex items-center gap-1">
              Desarrollado para fines académicos <span className="w-1 h-1 bg-slate-400 rounded-full mx-1"></span> Modelo de Detección Híbrido
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
