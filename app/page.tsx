'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Panel } from '@/components/ui/Panel';
import { BarChart3, Droplets, Thermometer, Target, CloudRain } from 'lucide-react';
import { apiService, StatsResponse, WeatherResponse } from '@/services/apiService';
// import { mockRecords, mockStatsValues } from '@/lib/mockData'; // <- REMOVIDO
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/firebase/client'; // <- ajuste o caminho

type FireRegistro = {
  id: string;
  culture: string;          // 'soja' | 'milho' | 'cafe' (string)
  produto: string;
  area: number | null;      // ha (para soja/milho)
  dose: number | null;      // L/ha (para soja/milho)
  ruas: number | null;      // (café)
  comprimentoRua: number | null; // m (café)
  doseMlM: number | null;   // mL/m (café)
  litros: number;           // total calculado
  details: string;
  createdAt?: any;          // Firestore Timestamp
};

export default function Dashboard() {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Registros do Firestore
  const [records, setRecords] = useState<FireRegistro[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // ---------- Carrega Stats/Weather (mantive como estava) ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, weather] = await Promise.all([
          // Se quiser, substitua mockStatsValues por valores reais depois
          apiService.getStats({ valores: [12, 20, 18, 5, 40, 22, 15] }),
          apiService.getWeatherSummary({ lat: -23.5505, lon: -46.6333, dias: 7 })
        ]);
        setStatsData(stats);
        setWeatherData(weather);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ---------- Carrega registros do Firestore ----------
  useEffect(() => {
    const fetchRecords = async () => {
      setRecordsLoading(true);
      setRecordsError(null);
      try {
        // coleção informada por você: 'insumos_calculos' (sem "a")
        const q = query(collection(db, 'insumos_calculos'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const list: FireRegistro[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            culture: data.culture ?? '',
            produto: data.produto ?? '',
            area: data.area ?? null,
            dose: data.dose ?? null,
            ruas: data.ruas ?? null,
            comprimentoRua: data.comprimentoRua ?? null,
            doseMlM: data.doseMlM ?? null,
            litros: Number(data.litros ?? 0),
            details: data.details ?? '',
            createdAt: data.createdAt,
          };
        });
        setRecords(list);
      } catch (e: any) {
        console.error(e);
        setRecordsError(e?.message || 'Falha ao carregar registros.');
      } finally {
        setRecordsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // ---------- KPIs a partir do Firestore ----------
  const totalArea = useMemo(
    () => records.reduce((sum, r) => sum + (r.area ?? 0), 0),
    [records]
  );

  const totalLiters = useMemo(
    () => records.reduce((sum, r) => sum + (r.litros ?? 0), 0),
    [records]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <img src="/logo.png" alt="AgroVision Logo" className='w-64 h-64' style={{ display: 'block', margin: '0 auto' }} />
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Dashboard Agrícola</h1>
        <p className="text-slate-300">Gestão inteligente de culturas</p>
      </div>

      {/* KPIs (usando Firestore) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Área Total"
          value={`${totalArea.toFixed(1)} ha`}
          icon={Target}
          subtitle="Todas as culturas"
        />
        <StatCard
          title="Insumos Necessários"
          value={`${totalLiters.toFixed(1)} L`}
          icon={Droplets}
          subtitle="Total calculado"
        />
        <StatCard
          title="Registros Ativos"
          value={recordsLoading ? '...' : records.length}
          icon={BarChart3}
          subtitle="Coletados do Firebase"
        />
        <StatCard
          title="Status Sincronização"
          value={apiService.isMockMode() ? "Mock" : "Online"}
          icon={CloudRain}
          subtitle={apiService.isMockMode() ? "Dados de teste" : "API conectada"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas */}
        <Panel title="Estatísticas (R)" className="h-fit">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
            </div>
          ) : statsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Amostras</p>
                  <p className="text-xl font-semibold text-white">{statsData.n}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Média</p>
                  <p className="text-xl font-semibold text-teal-400">{statsData.media.toFixed(2)} mm</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Desvio Padrão</p>
                  <p className="text-xl font-semibold text-white">{statsData.desvio.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Min/Max</p>
                  <p className="text-xl font-semibold text-white">{statsData.min}/{statsData.max} mm</p>
                </div>
              </div>
              {/* Você pode trocar essa linha para listar valores reais do Firestore quando tiver um campo de chuva */}
              <div className="text-xs text-slate-500 mt-4">
                Análise de precipitação (demo)
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Erro ao carregar dados</p>
          )}
        </Panel>

        {/* Clima */}
        <Panel title="Resumo Climático (R)" className="h-fit">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2"></div>
            </div>
          ) : weatherData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CloudRain className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300">Precipitação Total</span>
                  </div>
                  <span className="text-xl font-semibold text-blue-400">{weatherData.precipitacao_total_mm} mm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                    <span className="text-slate-300">Temperatura Média</span>
                  </div>
                  <span className="text-xl font-semibold text-orange-400">{weatherData.temperatura_media_c}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-teal-400" />
                    <span className="text-slate-300">Umidade Média</span>
                  </div>
                  <span className="text-xl font-semibold text-teal-400">{weatherData.umidade_media_pct}%</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-4">
                Dados dos últimos {weatherData.dias} dias
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Erro ao carregar dados</p>
          )}
        </Panel>
      </div>

      {/* Registros (Firebase) */}
      <Panel title="Registros Recentes">
        {recordsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-800/80 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recordsError ? (
          <p className="text-slate-400">{recordsError}</p>
        ) : records.length === 0 ? (
          <p className="text-slate-400">Sem registros no momento.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          record.culture?.toLowerCase() === 'soja'
                            ? 'bg-green-500'
                            : record.culture?.toLowerCase() === 'milho'
                            ? 'bg-yellow-500'
                            : 'bg-amber-600'
                        }`}
                      />
                      <span className="font-medium text-white capitalize">
                        {record.culture || '—'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300">{record.produto || '—'}</span>
                    </div>

                    <div className="mt-2 text-sm text-slate-400 space-y-1">
                      {/* Área / Dose (soja/milho) */}
                      {record.area != null && record.dose != null && (
                        <p>Área: {record.area} ha • Dose: {record.dose} L/ha</p>
                      )}

                      {/* Café */}
                      {record.ruas != null && record.comprimentoRua != null && record.doseMlM != null && (
                        <p>
                          Ruas: {record.ruas} • Comp: {record.comprimentoRua} m • Dose: {record.doseMlM} mL/m
                        </p>
                      )}

                      {/* Detalhes */}
                      {record.details && <p>Fórmula: {record.details}</p>}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold text-teal-400">
                      {record.litros != null ? `${record.litros.toFixed(1)} L` : 'N/A'}
                    </div>
                    <div className="text-xs text-slate-400">Total necessário</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
