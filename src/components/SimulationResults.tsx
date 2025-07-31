import React, { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Procedure } from "../types/procedure";
import {
  calcularMargemContribuicao,
  formatCurrency,
  formatPercentage,
  formatHours,
} from "../services/marginCalculator";

interface SimulationResultsProps {
  procedure: Procedure | null;
  simulationParams: {
    precoSessao: number;
    numeroSessoes: number;
    custoProfissional: number;
  };
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  procedure,
  simulationParams,
}) => {
  const algumParametroZerado =
    !simulationParams.precoSessao || !simulationParams.numeroSessoes;

  const simulationResult = useMemo(() => {
    if (!procedure || algumParametroZerado) return null;
    try {
      return calcularMargemContribuicao({
        precoSessao: simulationParams.precoSessao,
        numeroSessoes: simulationParams.numeroSessoes,
        insumos: procedure.insumos,
        tempoSessaoMin: procedure.tempoSessaoMin,
        custoProfissionalPorSessao: simulationParams.custoProfissional,
      });
    } catch {
      return "error";
    }
  }, [simulationParams, procedure, algumParametroZerado]);

  if (!procedure) {
    return (
      <div className="bg-white p-4 rounded-xl min-h-96 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Resultados
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-center">Selecione um procedimento primeiro</p>
          <p className="text-xs text-gray-400 mt-1 text-center">Veja a margem de contribuição calculada</p>
        </div>
      </div>
    );
  }

  if (algumParametroZerado) {
    return (
      <div className="bg-white p-4 rounded-xl h-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Resultados
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">
            Preencha os parâmetros para ver os resultados da simulação.
          </p>
        </div>
      </div>
    );
  }

  if (simulationResult === "error" || !simulationResult) {
    return (
      <div className="bg-white p-4 rounded-xl h-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Resultados
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">Erro no cálculo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl h-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Resultados
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
          <span className="text-xs text-gray-600">Custo Total Variável</span>
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
  );
};

export default SimulationResults;
