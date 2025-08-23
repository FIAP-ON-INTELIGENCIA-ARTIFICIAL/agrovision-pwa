'use client';

import { useEffect, useMemo, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Panel } from '@/components/ui/Panel';
import { BarChart3, Droplets, Thermometer, Target, CloudRain } from 'lucide-react';
import { apiService, StatsResponse, WeatherResponse } from '@/services/apiService';
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/firebase/client';

type FireRegistro = {
  id: string;
  culture: string;               // 'soja' | 'milho' | 'cafe'
  produto: string;
  area: number | null;           // ha (soja/milho)
  dose: number | null;           // L/ha (soja/milho)
  ruas: number | null;           // café
  comprimentoRua: number | null; // m (café)
  doseMlM: number | null;        // mL/m (café)
  litros: number;                // total calculado
  details: string;
  createdAt?: any;               // Firestore Timestamp
};

const PAGE_SIZE = 50;

export default function Dashboard() {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore
  const [records, setRecords] = useState<FireRegistro[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Paginação
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Filtros
  const [cultureFilter, setCultureFilter] =
    useState<'todos' | 'soja' | 'milho' | 'cafe'>('todos');
  const [productFilter, setProductFilter] = useState('');
  const [daysFilter, setDaysFilter] = useState<'7' | '30' | '90' | 'all'>('30');

  // -------- Stats/Weather (mantido) --------
  useEffect(() => {
    (async () => {
      try {
        const [stats, weather] = await Promise.all([
          apiService.getStats({ valores: [12, 20, 18, 5, 40, 22, 15] }),
          apiService.getWeatherSummary({ lat: -23.5505, lon: -46.6333, dias: 7 }),
        ]);
        setStatsData(stats);
        setWeatherData(weather);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------- Fetch inicial (50) --------
  useEffect(() => {
    (async () => {
      setRecordsLoading(true);
      setRecordsError(null);
      try {
        const q = query(
          collection(db, 'insumos_calculos'),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
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
        const last = snap.docs[snap.docs.length - 1] || null;
        setLastDoc(last);
        setHasMore(snap.docs.length === PAGE_SIZE);
      } catch (e: any) {
        console.error(e);
        setRecordsError(e?.message || 'Falha ao carregar registros.');
      } finally {
        setRecordsLoading(false);
      }
    })();
  }, []);

  // -------- Load more (próximos 50) --------
  const loadMore = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'insumos_calculos'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
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

      setRecords((prev) => [...prev, ...list]);
      const last = snap.docs[snap.docs.length - 1] || null;
      setLastDoc(last);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (e: any) {
      console.error(e);
      setRecordsError(e?.message || 'Falha ao carregar mais registros.');
    } finally {
      setLoadingMore(false);
    }
  };

  // -------- Helpers de filtro --------
  const cutoffDate = useMemo(() => {
    if (daysFilter === 'all') return null;
    const days = Number(daysFilter);
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }, [daysFilter]);

  const filteredRecords = useMemo(() => {
    const term = productFilter.trim().toLowerCase();
    return records.filter((r) => {
      if (cultureFilter !== 'todos' && r.culture?.toLowerCase() !== cultureFilter) return false;
      if (term && !String(r.produto || '').toLowerCase().includes(term)) return false;
      if (cutoffDate) {
        const created = r.createdAt?.toDate
          ? r.createdAt.toDate()
          : (r.createdAt instanceof Date ? r.createdAt : null);
        if (!created || created < cutoffDate) return false;
      }
      return true;
    });
  }, [records, cultureFilter, productFilter, cutoffDate]);

  // KPIs (sobre o conjunto carregado)
  const totalArea = useMemo(() => records.reduce((sum, r) => sum + (r.area ?? 0), 0), [records]);
  const totalLiters = useMemo(() => records.reduce((sum, r) => sum + (r.litros ?? 0), 0), [records]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <img src="/logo.png" alt="AgroVision Logo" className="w-64 h-64 block mx-auto" />
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Dashboard Agrícola</h1>
        <p className="text-slate-300">Gestão inteligente de culturas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Área Total" value={`${totalArea.toFixed(1)} ha`} icon={Target} subtitle="Todas as culturas (carregadas)" />
        <StatCard title="Insumos Necessários" value={`${totalLiters.toFixed(1)} L`} icon={Droplets} subtitle="Total calculado (carregado)" />
        <StatCard title="Registros Carregados" value={recordsLoading ? '...' : records.length} icon={BarChart3} subtitle="Do Firebase" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas */}
        <Panel title="Estatísticas (R)" className="h-fit">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          ) : statsData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-slate-400">Amostras</p><p className="text-xl font-semibold text-white">{statsData.n}</p></div>
                <div><p className="text-sm text-slate-400">Média</p><p className="text-xl font-semibold text-teal-400">{statsData.media.toFixed(2)} mm</p></div>
                <div><p className="text-sm text-slate-400">Desvio Padrão</p><p className="text-xl font-semibold text-white">{statsData.desvio.toFixed(2)}</p></div>
                <div><p className="text-sm text-slate-400">Min/Max</p><p className="text-xl font-semibold text-white">{statsData.min}/{statsData.max} mm</p></div>
              </div>
              <div className="text-xs text-slate-500 mt-4">Análise de precipitação (demo)</div>
            </div>
          ) : (
            <p className="text-slate-400">Erro ao carregar dados</p>
          )}
        </Panel>

        {/* Clima */}
        <Panel title="Resumo Climático (R)" className="h-fit">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          ) : weatherData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3"><CloudRain className="w-5 h-5 text-blue-400" /><span className="text-slate-300">Precipitação Total</span></div>
                  <span className="text-xl font-semibold text-blue-400">{weatherData.precipitacao_total_mm} mm</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3"><Thermometer className="w-5 h-5 text-orange-400" /><span className="text-slate-300">Temperatura Média</span></div>
                  <span className="text-xl font-semibold text-orange-400">{weatherData.temperatura_media_c}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3"><Droplets className="w-5 h-5 text-teal-400" /><span className="text-slate-300">Umidade Média</span></div>
                  <span className="text-xl font-semibold text-teal-400">{weatherData.umidade_media_pct}%</span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-4">Dados dos últimos {weatherData.dias} dias</div>
            </div>
          ) : (
            <p className="text-slate-400">Erro ao carregar dados</p>
          )}
        </Panel>
      </div>

      {/* Registros (Firebase) */}
      <Panel title="Registros Recentes">
        {/* Contador + Filtros */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400">
            Exibindo {filteredRecords.length} de {records.length} carregados
          </span>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <select
            value={cultureFilter}
            onChange={(e) => setCultureFilter(e.target.value as any)}
            className="agroview-input"
          >
            <option value="todos">Todas as culturas</option>
            <option value="soja">Soja</option>
            <option value="milho">Milho</option>
            <option value="cafe">Café</option>
          </select>

          <input
            type="text"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            placeholder="Filtrar por produto..."
            className="agroview-input"
          />

          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(e.target.value as any)}
            className="agroview-input"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todos</option>
          </select>

          <button
            onClick={() => {
              setCultureFilter('todos');
              setProductFilter('');
              setDaysFilter('30');
            }}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            Limpar filtros
          </button>
        </div>

        {recordsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-800/80 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recordsError ? (
          <p className="text-slate-400">{recordsError}</p>
        ) : filteredRecords.length === 0 ? (
          <p className="text-slate-400">Nenhum registro encontrado com os filtros atuais.</p>
        ) : (
          <>
            <div className="space-y-4">
              {filteredRecords.map((record) => (
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
                        <span className="font-medium text-white capitalize">{record.culture || '—'}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-300">{record.produto || '—'}</span>
                      </div>

                      <div className="mt-2 text-sm text-slate-400 space-y-1">
                        {record.area != null && record.dose != null && (
                          <p>Área: {record.area} ha • Dose: {record.dose} L/ha</p>
                        )}
                        {record.ruas != null && record.comprimentoRua != null && record.doseMlM != null && (
                          <p>Ruas: {record.ruas} • Comp: {record.comprimentoRua} m • Dose: {record.doseMlM} mL/m</p>
                        )}
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

            {/* Botão de paginação */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadMore}
                disabled={!hasMore || loadingMore}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
              >
                {loadingMore ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Tudo carregado'}
              </button>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
