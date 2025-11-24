import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  FileText, 
  Search, 
  BrainCircuit, 
  Upload,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InsuranceClaim, ClaimStatus } from '../types';
import { generateDataset, calculateMetrics, processCSV } from '../utils/dataGenerator';
import { MetricsCard } from './MetricsCard';
import { analyzeClaimRisk } from '../services/geminiService';

const COLORS = ['#10b981', '#ef4444']; // Verde (Normal), Rojo (Fraude)

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, text: string} | null>(null);
  const [filter, setFilter] = useState<'all' | 'fraud' | 'normal'>('all');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicialización con datos simulados
  useEffect(() => {
    const timer = setTimeout(() => {
      const mockData = generateDataset(850);
      setData(mockData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => calculateMetrics(data), [data]);

  const filteredData = useMemo(() => {
    if (filter === 'all') return data;
    return data.filter(d => 
      filter === 'fraud' ? d.status === ClaimStatus.Fraud : d.status === ClaimStatus.Normal
    );
  }, [data, filter]);

  const chartData = [
    { name: 'Flujos Normales', value: metrics.totalNormal },
    { name: 'Fraudes Detectados (Ground Truth)', value: metrics.totalFraud },
  ];

  const handleAnalyze = async (claim: InsuranceClaim) => {
    setAnalyzingId(claim.id);
    setAnalysisResult(null);
    const result = await analyzeClaimRisk(claim);
    setAnalysisResult({ id: claim.id, text: result });
    setAnalyzingId(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const processedData = processCSV(text);
        if (processedData.length === 0) {
          throw new Error("No se pudieron extraer registros válidos del archivo CSV.");
        }
        setData(processedData);
      } catch (err) {
        console.error(err);
        setUploadError("Error al procesar el archivo. Asegúrese de que sea un CSV válido.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setUploadError("Error de lectura de archivo.");
      setLoading(false);
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const DistributionChart = () => (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Procesando Dataset...</h2>
        <p className="text-slate-500">Normalizando datos y ejecutando métricas de validación</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tablero de Control: Detección de Fraude</h2>
          <p className="text-slate-500">Análisis estadístico y algorítmico de reclamaciones de seguros médicos.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          
          <button 
             onClick={triggerFileUpload}
             className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Upload size={16} />
            Cargar Dataset (CSV)
          </button>

          <button 
             onClick={() => { setLoading(true); setTimeout(() => { setData(generateDataset(850)); setLoading(false); }, 1000); }}
             className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium border border-slate-200"
          >
            <RefreshCw size={16} />
            Generar Simulación
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard 
          title="Exactitud (Accuracy)" 
          value={`${(metrics.accuracy * 100).toFixed(2)}%`} 
          icon={ShieldCheck} 
          color="bg-blue-500" 
          description="Eficacia global del clasificador"
        />
        <MetricsCard 
          title="Precisión (Precision)" 
          value={`${(metrics.precision * 100).toFixed(2)}%`} 
          icon={Activity} 
          color="bg-indigo-500" 
          description="Veracidad de los positivos detectados"
        />
        <MetricsCard 
          title="Sensibilidad (Recall)" 
          value={`${(metrics.recall * 100).toFixed(2)}%`} 
          icon={Search} 
          color="bg-violet-500" 
          description="Cobertura de fraudes reales"
        />
        <MetricsCard 
          title="Puntaje F1 (F1-Score)" 
          value={(metrics.f1Score).toFixed(4)} 
          icon={BarChart3} 
          color="bg-emerald-500" 
          description="Balance armónico de rendimiento"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visualizations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              Distribución de Clases
            </h3>
            <DistributionChart />
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-sm font-medium text-green-800">Flujos Normales</span>
                <span className="font-bold text-green-900">{metrics.totalNormal}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="text-sm font-medium text-red-800">Fraudes Confirmados</span>
                <span className="font-bold text-red-900">{metrics.totalFraud}</span>
              </div>
              <div className="text-xs text-center text-slate-400 mt-2">
                Total de Muestras Procesadas: {metrics.totalSamples}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700">
             <div className="flex items-center gap-3 mb-4">
               <BrainCircuit className="text-blue-400" />
               <h3 className="text-lg font-bold">Análisis Heurístico (LLM)</h3>
             </div>
             <p className="text-slate-300 text-sm mb-4 leading-relaxed">
               El sistema integra un módulo de IA Generativa para la explicabilidad de las decisiones. Seleccione un registro fraudulento para generar una auditoría automatizada.
             </p>
             {analysisResult ? (
               <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-fade-in">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-blue-300 font-mono">ID: {analysisResult.id}</span>
                    <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded">Generado por Gemini</span>
                 </div>
                 <p className="text-sm leading-relaxed text-slate-200 italic">"{analysisResult.text}"</p>
               </div>
             ) : (
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 border-dashed text-center text-slate-500 text-sm">
                  Esperando selección de registro...
                </div>
             )}
          </div>
        </div>

        {/* Right Column: Data Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-slate-500" />
              Matriz de Datos Procesada
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors uppercase tracking-wide ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('fraud')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors uppercase tracking-wide ${filter === 'fraud' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'}`}
              >
                Fraudes
              </button>
              <button 
                onClick={() => setFilter('normal')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors uppercase tracking-wide ${filter === 'normal' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}
              >
                Normales
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID Transacción</th>
                  <th className="px-6 py-4">Código CIE-10</th>
                  <th className="px-6 py-4 text-right">Monto Facturado</th>
                  <th className="px-6 py-4 text-center">Score de Riesgo</th>
                  <th className="px-6 py-4">Clasificación</th>
                  <th className="px-6 py-4 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.length > 0 ? (
                  filteredData.slice(0, 100).map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-3 font-mono text-xs font-medium text-slate-500">{claim.id}</td>
                      <td className="px-6 py-3">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-700 border border-slate-200">{claim.diagnosisCode}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">${claim.claimAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-700 mb-1">{claim.riskScore.toFixed(3)}</span>
                          <div className="w-20 bg-slate-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${claim.riskScore > 0.65 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(claim.riskScore * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          claim.status === ClaimStatus.Fraud 
                            ? 'bg-red-50 text-red-700 border border-red-100' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {claim.status === ClaimStatus.Fraud ? <AlertTriangle size={12}/> : <ShieldCheck size={12}/>}
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button 
                          onClick={() => handleAnalyze(claim)}
                          disabled={analyzingId === claim.id}
                          className="text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                          title="Generar análisis detallado con IA"
                        >
                          <Search size={18} className={analyzingId === claim.id ? 'animate-pulse text-blue-600' : ''} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No hay datos disponibles para el filtro seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
            <span>Mostrando {Math.min(filteredData.length, 100)} de {filteredData.length} registros</span>
            <span>Sistema de Detección v1.0 &bull; Seguros de Salud Nacional</span>
          </div>
        </div>
      </div>
    </div>
  );
};