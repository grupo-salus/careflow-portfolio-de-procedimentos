import React, { useState, useMemo, useEffect } from "react";
import { X, Tag, Calculator, TrendingUp, Settings } from "lucide-react";
import { Procedure } from "../types/procedure";
import {
  calcularMargemContribuicao,
  formatCurrency,
  formatPercentage,
  formatHours,
} from "../services/marginCalculator";
import LabelIcon from "./LabelIcon";
import { getTipoColors } from "../utils/typeColors";
import { getProcedureImageUrl } from "../utils/imageUtils";

interface ProcedureModalProps {
  procedure: Procedure | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProcedureModal: React.FC<ProcedureModalProps> = ({
  procedure,
  isOpen,
  onClose,
}) => {
  const [simulationParams, setSimulationParams] = useState({
    precoSessao: procedure?.precoSugerido || 0,
    numeroSessoes: procedure?.numeroSessoes || 1,
  });

  // Atualizar parâmetros quando o procedimento mudar
  useEffect(() => {
    if (procedure) {
      setSimulationParams({
        precoSessao: procedure.precoSugerido,
        numeroSessoes: procedure.numeroSessoes,
      });
    }
  }, [procedure]);

  const simulationResult = useMemo(() => {
    if (!procedure) return null;
    try {
      return calcularMargemContribuicao({
        precoSessao: simulationParams.precoSessao,
        numeroSessoes: simulationParams.numeroSessoes,
        insumos: procedure.insumos,
        tempoSessaoMin: procedure.tempoSessaoMin,
        custoProfissionalPorSessao: procedure.custoProfissionalPorSessao,
      });
    } catch (error) {
      return null;
    }
  }, [simulationParams, procedure]);

  const totalInsumosCost = useMemo(() => {
    if (!procedure) return 0;
    return procedure.insumos.reduce((total, insumo) => total + insumo.valor, 0);
  }, [procedure]);

  if (!isOpen || !procedure) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {procedure.nome}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  style={getTipoColors(procedure.tipo)}
                >
                  {procedure.tipo}
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

          {/* Top Content - Description and Image */}
          <div className="mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Description */}
              <div className="max-h-[250px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Descrição
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {procedure.descricao}
                </p>
              </div>

              {/* Image */}
              <div className="bg-gray-100 rounded-lg overflow-hidden h-[250px] flex items-center justify-center">
                {procedure.imagem ? (
                  <img
                    src={getProcedureImageUrl(procedure.imagem)}
                    alt={procedure.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para placeholder se a imagem não carregar
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                {/* Fallback placeholder */}
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    procedure.imagem ? "hidden" : ""
                  }`}
                >
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">Imagem do Procedimento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Labels
              </h3>
              <div className="flex flex-wrap gap-2">
                {procedure.labels.map((label, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium"
                  >
                    <LabelIcon label={label} size="sm" />
                    <span className="capitalize">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Three Columns Layout - Parameters, Breakdown, Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Simulation Parameters */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Parâmetros
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Preço por Sessão
                  </label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      R$
                    </span>
                    <input
                      type="number"
                      value={simulationParams.precoSessao}
                      onChange={(e) =>
                        setSimulationParams((prev) => ({
                          ...prev,
                          precoSessao: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número de Sessões
                  </label>
                  <input
                    type="number"
                    value={simulationParams.numeroSessoes}
                    onChange={(e) =>
                      setSimulationParams((prev) => ({
                        ...prev,
                        numeroSessoes: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
                    min="1"
                    step="1"
                  />
                </div>
                <button
                  onClick={() =>
                    setSimulationParams({
                      precoSessao: procedure.precoSugerido,
                      numeroSessoes: procedure.numeroSessoes,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  Restaurar Valores
                </button>
              </div>
            </div>

            {/* Column 2: Cost Breakdown */}
            <div className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Breakdown de Custos
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="flex justify-between items-start py-1 border-b border-gray-100">
                  <span className="text-xs text-gray-600 flex-1 mr-2">
                    Profissional
                  </span>
                  <span className="text-sm font-bold flex-shrink-0">
                    {formatCurrency(procedure.custoProfissionalPorSessao)}
                  </span>
                </div>
                {procedure.insumos.map((insumo, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start py-1 border-b border-gray-100"
                  >
                    <span className="text-xs text-gray-600 flex-1 mr-2 break-words">
                      {insumo.nome}
                    </span>
                    <span className="text-sm font-bold flex-shrink-0">
                      {formatCurrency(insumo.valor)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center py-2 pt-3 border-t border-gray-200 mt-2 bg-white sticky bottom-0">
                <span className="text-sm font-bold text-gray-900">
                  Total/Sessão
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatCurrency(
                    totalInsumosCost + procedure.custoProfissionalPorSessao
                  )}
                </span>
              </div>
            </div>

            {/* Column 3: Simulation Results */}
            {simulationResult && (
              <div className="bg-white border border-gray-200 p-4 rounded-xl">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Resultados
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Custo/Sessão</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.custoVariavelPorSessao < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(simulationResult.custoVariavelPorSessao)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Receita Total</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.receitaTotal < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(simulationResult.receitaTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">
                      Custo Total Variável
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.custoTotalVariavel < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(simulationResult.custoTotalVariavel)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Margem Total</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.margemContribuicao < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(simulationResult.margemContribuicao)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Margem/Sessão</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.margemPorSessao < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(simulationResult.margemPorSessao)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Margem %</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.margemPercentual < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatPercentage(simulationResult.margemPercentual)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-xs text-gray-600">Lucro/Hora</span>
                    <span
                      className={`text-sm font-bold ${
                        simulationResult.lucroPorHora < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(simulationResult.lucroPorHora)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-xs text-gray-600">Tempo Total</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatHours(simulationResult.tempoTotalHoras)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureModal;
