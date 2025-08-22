'use client';

import { useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { CultureSelect } from '@/components/ui/CultureSelect';
import { Leaf, ArrowRight, Droplets } from 'lucide-react';

export default function InsumosCalculatorPage() {
  const [culture, setCulture] = useState('soja');
  const [produto, setProduto] = useState('');
  
  // Campos para Soja/Milho
  const [area, setArea] = useState('');
  const [dose, setDose] = useState('');
  
  // Campos específicos para Café
  const [ruas, setRuas] = useState('');
  const [comprimentoRua, setComprimentoRua] = useState('');
  const [doseMlM, setDoseMlM] = useState('');
  
  const [result, setResult] = useState<{ litros: number; details: string } | null>(null);

  const calculateInsumos = () => {
    let litros = 0;
    let details = '';

    if (culture === 'cafe') {
      const ruasNum = parseInt(ruas);
      const compNum = parseFloat(comprimentoRua);
      const doseNum = parseFloat(doseMlM);
      
      if (isNaN(ruasNum) || isNaN(compNum) || isNaN(doseNum) || ruasNum <= 0 || compNum <= 0 || doseNum <= 0) {
        return;
      }
      
      litros = (ruasNum * compNum * doseNum) / 1000;
      details = `${ruasNum} ruas × ${compNum}m × ${doseNum} mL/m ÷ 1000`;
    } else {
      const areaNum = parseFloat(area);
      const doseNum = parseFloat(dose);
      
      if (isNaN(areaNum) || isNaN(doseNum) || areaNum <= 0 || doseNum <= 0) {
        return;
      }
      
      litros = areaNum * doseNum;
      details = `${areaNum} ha × ${doseNum} L/ha`;
    }
    
    setResult({ litros, details });
  };

  const reset = () => {
    setProduto('');
    setArea('');
    setDose('');
    setRuas('');
    setComprimentoRua('');
    setDoseMlM('');
    setResult(null);
  };

  const isCafe = culture === 'cafe';
  const canCalculate = isCafe 
    ? (ruas && comprimentoRua && doseMlM && produto)
    : (area && dose && produto);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
          <Leaf className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Manejo de Insumos</h1>
        <p className="text-slate-300">Calcule a quantidade necessária por cultura</p>
      </div>

      <Panel title="Seleção de Cultura">
        <CultureSelect value={culture} onChange={setCulture} />
      </Panel>

      <Panel title="Dados do Produto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Produto/Insumo
            </label>
            <input
              type="text"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              placeholder={`Ex: ${isCafe ? 'Fosfato' : culture === 'soja' ? 'Herbicida' : 'Inseticida'}`}
              className="agroview-input w-full"
            />
          </div>

          {isCafe ? (
            // Campos específicos para Café
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Número de Ruas
                </label>
                <input
                  type="number"
                  value={ruas}
                  onChange={(e) => setRuas(e.target.value)}
                  placeholder="120"
                  className="agroview-input w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Comprimento (m)
                </label>
                <input
                  type="number"
                  value={comprimentoRua}
                  onChange={(e) => setComprimentoRua(e.target.value)}
                  placeholder="80"
                  className="agroview-input w-full"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dose (mL/m)
                </label>
                <input
                  type="number"
                  value={doseMlM}
                  onChange={(e) => setDoseMlM(e.target.value)}
                  placeholder="500"
                  className="agroview-input w-full"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          ) : (
            // Campos para Soja e Milho
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Área (hectares)
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="12.0"
                  className="agroview-input w-full"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dose (L/ha)
                </label>
                <input
                  type="number"
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder={culture === 'soja' ? '2.5' : '2.0'}
                  className="agroview-input w-full"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={calculateInsumos}
              disabled={!canCalculate}
              className="agroview-btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Droplets className="w-4 h-4" />
              <span>Calcular Insumos</span>
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
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {result.litros.toFixed(2)} L
              </div>
              <div className="text-slate-300 text-lg">
                {produto} necessário
              </div>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-white">Detalhes do Cálculo:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cultura:</span>
                  <span className="font-medium text-white capitalize">{culture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Produto:</span>
                  <span className="font-medium text-white">{produto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cálculo:</span>
                  <span className="font-medium text-slate-300">{result.details}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400">Total:</span>
                  <span className="font-semibold text-emerald-400">{result.litros.toFixed(2)} L</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-sm text-emerald-200 font-medium mb-1">Recomendação:</p>
                  <p className="text-sm text-slate-300">
                    {isCafe 
                      ? 'Para aplicação em café, distribua uniformemente ao longo das ruas, considerando as condições climáticas.'
                      : `Para ${culture}, aplique a dose recomendada por hectare seguindo as orientações técnicas do produto.`
                    }
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