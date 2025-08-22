'use client';

import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { CultureSelect } from '@/components/ui/CultureSelect';
import { Calculator, ArrowRight } from 'lucide-react';

export default function AreaCalculatorPage() {
  const [culture, setCulture] = useState('soja');
  const [base, setBase] = useState('');
  const [altura, setAltura] = useState('');
  const [result, setResult] = useState<{ m2: number; ha: number } | null>(null);

  const calculateArea = () => {
    const baseNum = parseFloat(base);
    const alturaNum = parseFloat(altura);
    
    if (isNaN(baseNum) || isNaN(alturaNum) || baseNum <= 0 || alturaNum <= 0) {
      return;
    }
    
    const m2 = baseNum * alturaNum;
    const ha = m2 / 10000;
    
    setResult({ m2, ha });
  };

  const reset = () => {
    setBase('');
    setAltura('');
    setResult(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
          <Calculator className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Cálculo de Área</h1>
        <p className="text-slate-300">Calcule a área de plantio por cultura</p>
      </div>

      <Panel title="Seleção de Cultura">
        <CultureSelect value={culture} onChange={setCulture} />
      </Panel>

      <Panel title="Dimensões do Terreno">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Base (metros)
              </label>
              <input
                type="number"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder="Largura do terreno"
                className="agroview-input w-full"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Altura (metros)
              </label>
              <input
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Comprimento do terreno"
                className="agroview-input w-full"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={calculateArea}
              disabled={!base || !altura}
              className="agroview-btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              <span>Calcular Área</span>
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </Panel>

      {result && (
        <Panel title="Resultado do Cálculo">
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-400 mb-2">
                {result.ha.toFixed(4)} ha
              </div>
              <div className="text-slate-300 text-lg">
                {result.m2.toFixed(2)} m²
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-white">Detalhes do Cálculo:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Cultura:</span>
                  <div className="font-medium text-white capitalize">{culture}</div>
                </div>
                <div>
                  <span className="text-slate-400">Dimensões:</span>
                  <div className="font-medium text-white">{base}m × {altura}m</div>
                </div>
                <div>
                  <span className="text-slate-400">Área Total:</span>
                  <div className="font-medium text-teal-400">{result.ha.toFixed(4)} ha</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-teal-200 font-medium mb-1">Próximo passo:</p>
                  <p className="text-sm text-slate-300">
                    Use essa área para calcular a quantidade de insumos necessários na seção de Manejo de Insumos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}