import React, { useEffect } from "react";
import { Settings } from "lucide-react";
import { IMaskInput } from "react-imask";
import { Procedure } from "../types/procedure";

interface SimulationParametersProps {
  procedure: Procedure | null;
  simulationParams: {
    precoSessao: number;
    numeroSessoes: number;
    custoProfissional: number;
  };
  onParamsChange: (params: {
    precoSessao: number;
    numeroSessoes: number;
    custoProfissional: number;
  }) => void;
}

const SimulationParameters: React.FC<SimulationParametersProps> = ({
  procedure,
  simulationParams,
  onParamsChange,
}) => {
  const setSimulationParams = (updater: any) => {
    const newParams =
      typeof updater === "function" ? updater(simulationParams) : updater;
    onParamsChange(newParams);
  };

  // Preencher automaticamente os parâmetros quando um procedimento é selecionado
  useEffect(() => {
    if (procedure) {
      setSimulationParams({
        precoSessao: procedure.precoSugerido,
        numeroSessoes: procedure.numeroSessoes,
        custoProfissional: procedure.custoProfissionalPorSessao,
      });
    }
  }, [procedure]);

  if (!procedure) {
    return (
      <div className="bg-white border border-gray-200 p-4 rounded-xl h-full flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Parâmetros da Simulação
        </h3>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p className="text-sm">Selecione um procedimento primeiro</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Parâmetros da Simulação
      </h3>
      <div className="space-y-3 flex-1">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Preço por Sessão
          </label>
          <IMaskInput
            mask={Number}
            scale={2}
            radix=","
            thousandsSeparator="."
            padFractionalZeros={true}
            prefix="R$ "
            unmask={true}
            value={String(simulationParams.precoSessao)}
            onAccept={(value) =>
              setSimulationParams((prev) => ({
                ...prev,
                precoSessao: Number(value) || 0,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="0,00"
          />
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
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Custo Profissional por Sessão
          </label>
          <IMaskInput
            mask={Number}
            scale={2}
            radix=","
            thousandsSeparator="."
            padFractionalZeros={true}
            prefix="R$ "
            unmask={true}
            value={String(simulationParams.custoProfissional)}
            onAccept={(value) =>
              setSimulationParams((prev) => ({
                ...prev,
                custoProfissional: Number(value) || 0,
              }))
            }
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 transition-all duration-200 hover:bg-white hover:border-gray-300 focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="0,00"
          />
        </div>
        <button
          onClick={() =>
            setSimulationParams({
              precoSessao: procedure.precoSugerido,
              numeroSessoes: procedure.numeroSessoes,
              custoProfissional: procedure.custoProfissionalPorSessao,
            })
          }
          className="w-full px-3 py-2 text-xs bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          Restaurar Valores
        </button>
      </div>
      <div className="flex justify-between items-center py-2 pt-3 border-t border-gray-200 mt-2 bg-white sticky bottom-0">
        <span className="text-sm font-bold text-gray-900">
          Tempo por sessão:
        </span>
        <span
          className="text-sm font-bold bg-clip-text text-transparent"
          style={{
            background: "var(--careflow-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {procedure.tempoSessaoMin} min
        </span>
      </div>
    </div>
  );
};

export default SimulationParameters;
