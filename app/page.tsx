'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/StatCard';
import { Panel } from '@/components/ui/Panel';
import { BarChart3, Droplets, Thermometer, Target, CloudRain } from 'lucide-react';
import { apiService, StatsResponse, WeatherResponse } from '@/services/apiService';
import { mockRecords, mockStatsValues } from '@/lib/mockData';

export default function Dashboard() {
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, weather] = await Promise.all([
          apiService.getStats({ valores: mockStatsValues }),
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

  const totalArea = mockRecords.reduce((sum, record) => sum + record.area_ha, 0);
  const totalLiters = mockRecords.reduce((sum, record) => {
    if (record.cultura === 'Café' && record.ruas && record.comp_rua_m && record.dose_ml_m) {
      return sum + (record.ruas * record.comp_rua_m * record.dose_ml_m) / 1000;
    }
    if (record.dose_l_ha) {
      return sum + (record.dose_l_ha * record.area_ha);
    }
    return sum;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold text-white">Dashboard Agrícola</h1>
        <p className="text-slate-300">Gestão inteligente de culturas</p>
      </div>

      {/* KPIs */}
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
          value={mockRecords.length}
          icon={BarChart3}
          subtitle="Culturas monitoradas"
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
              <div className="text-xs text-slate-500 mt-4">
                Análise de precipitação dos registros: {mockStatsValues.join(', ')} mm
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

      {/* Registros */}
      <Panel title="Registros Recentes">
        <div className="space-y-4">
          {mockRecords.map((record) => (
            <div key={record.id} className="bg-slate-800 p-4 rounded-lg border border-slate-600">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      record.cultura === 'Soja' ? 'bg-green-500' :
                      record.cultura === 'Milho' ? 'bg-yellow-500' : 'bg-amber-600'
                    }`}></div>
                    <span className="font-medium text-white">{record.cultura}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-300">{record.produto}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-400 space-y-1">
                    <p>Área: {record.area_ha} ha • Chuva: {record.chuva_mm} mm</p>
                    {record.ruas && (
                      <p>Ruas: {record.ruas} • Comp: {record.comp_rua_m}m • Dose: {record.dose_ml_m} mL/m</p>
                    )}
                    {record.dose_l_ha && (
                      <p>Dose: {record.dose_l_ha} L/ha</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-teal-400">
                    {record.cultura === 'Café' && record.ruas && record.comp_rua_m && record.dose_ml_m 
                      ? `${((record.ruas * record.comp_rua_m * record.dose_ml_m) / 1000).toFixed(1)} L`
                      : record.dose_l_ha ? `${(record.dose_l_ha * record.area_ha).toFixed(1)} L` : 'N/A'
                    }
                  </div>
                  <div className="text-xs text-slate-400">Total necessário</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}