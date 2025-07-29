import React, { useState, useMemo } from 'react';
import { X, Clock, DollarSign, Users, Tag, Calculator, TrendingUp, Settings } from 'lucide-react';
import { Procedure } from '../types/procedure';
import { calcularMargemContribuicao, formatCurrency, formatPercentage, formatHours } from '../services/marginCalculator';
import LabelIcon from './LabelIcon';

interface ProcedureModalProps {
  procedure: Procedure | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({ procedure, isOpen, onClose }) => {
  if (!isOpen || !procedure) return null;

  const [simulationParams, setSimulationParams] = useState({
    precoSessao: procedure.precoSugerido,
    numeroSessoes: procedure.numeroSessoes
  });

  const simulationResult = useMemo(() => {
    try {
      return calcularMargemContribuicao({
        precoSessao: simulationParams.precoSessao,
        numeroSessoes: simulationParams.numeroSessoes,
        insumos: procedure.insumos,
        tempoSessaoMin: procedure.tempoSessaoMin,
        custoProfissionalPorSessao: procedure.custoProfissionalPorSessao
      });
    } catch (error) {
      return null;
    }
  }, [simulationParams, procedure]);

  const totalInsumosCost = procedure.insumos.reduce((total, insumo) => total + insumo.valor, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{procedure.nome}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${procedure.tipoFinanceiro === 'Alto Ticket' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-green-100 text-green-800'
                  }`}>
                  {procedure.tipoFinanceiro}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${procedure.tipoComercial === 'Recorrência' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                  }`}>
                  {procedure.tipoComercial}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="xl:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed">{procedure.descricao}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mx-auto mb-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{procedure.tempoSessaoMin}</div>
                  <div className="text-xs text-gray-500">minutos</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full mx-auto mb-2">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">R$ {procedure.precoSugerido.toFixed(0)}</div>
                  <div className="text-xs text-gray-500">preço sugerido</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full mx-auto mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{procedure.numeroSessoes}</div>
                  <div className="text-xs text-gray-500">sessões</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full mx-auto mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {simulationResult ? simulationResult.margemPercentual.toFixed(0) : '0'}%
                  </div>
                  <div className="text-xs text-gray-500">margem</div>
                </div>
              </div>

              {/* Labels */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {procedure.labels.map((label, index) => (
                    <div 
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      <LabelIcon label={label} size="sm" className="text-blue-600" />
                      <span className="capitalize">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulation and Financial Info */}
            <div className="space-y-6">
              {/* Simulation Parameters */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Parâmetros de Simulação
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preço por Sessão
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={simulationParams.precoSessao}
                        onChange={(e) => setSimulationParams(prev => ({
                          ...prev,
                          precoSessao: Number(e.target.value) || 0
                        }))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Sessões
                    </label>
                    <input
                      type="number"
                      value={simulationParams.numeroSessoes}
                      onChange={(e) => setSimulationParams(prev => ({
                        ...prev,
                        numeroSessoes: Number(e.target.value) || 0
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      step="1"
                    />
                  </div>
                  <button
                    onClick={() => setSimulationParams({
                      precoSessao: procedure.precoSugerido,
                      numeroSessoes: procedure.numeroSessoes
                    })}
                    className="w-full px-4 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Restaurar Valores Originais
                  </button>
                </div>
              </div>

              {/* Simulation Results */}
              {simulationResult && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Resultados
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Custo/Sessão</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(simulationResult.custoVariavelPorSessao)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Receita Total</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(simulationResult.receitaTotal)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Custo Total Variável</div>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(simulationResult.custoTotalVariavel)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Margem Total</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(simulationResult.margemContribuicao)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Margem/Sessão</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(simulationResult.margemPorSessao)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Margem %</div>
                      <div className="text-lg font-bold text-purple-600">
                        {formatPercentage(simulationResult.margemPercentual)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Lucro/Hora</div>
                      <div className="text-lg font-bold text-orange-600">
                        {formatCurrency(simulationResult.lucroPorHora)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Tempo Total</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatHours(simulationResult.tempoTotalHoras)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Original Financial Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Dados Originais
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Preço Sugerido</span>
                    <span className="font-semibold text-green-600">{formatCurrency(procedure.precoSugerido)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sessões Originais</span>
                    <span className="font-semibold text-blue-600">{procedure.numeroSessoes}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Custo Insumos</span>
                      <span className="font-bold text-gray-600">
                        {formatCurrency(totalInsumosCost)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custos por Sessão</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Profissional</span>
                    <span className="font-semibold">{formatCurrency(procedure.custoProfissionalPorSessao)}</span>
                  </div>
                  {procedure.insumos.map((insumo, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{insumo.nome}</span>
                      <span className="font-semibold">{formatCurrency(insumo.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 pt-3 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total por Sessão</span>
                    <span className="font-bold text-blue-600">{formatCurrency(totalInsumosCost + procedure.custoProfissionalPorSessao)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureModal;