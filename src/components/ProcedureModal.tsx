import React, { useState, useEffect } from "react";
import { X, Tag } from "lucide-react";
import { Procedure } from "../types/procedure";
import LabelIcon from "./LabelIcon";
import { getTipoColors } from "../utils/typeColors";
import { getProcedureImageUrl } from "../utils/imageUtils";
import SimulationParameters from "./SimulationParameters";
import CostBreakdown from "./CostBreakdown";
import SimulationResults from "./SimulationResults";

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
    custoProfissional: procedure?.custoProfissionalPorSessao || 0,
  });

  // Atualizar parâmetros quando o procedimento mudar
  useEffect(() => {
    if (procedure) {
      setSimulationParams({
        precoSessao: procedure.precoSugerido,
        numeroSessoes: procedure.numeroSessoes,
        custoProfissional: procedure.custoProfissionalPorSessao,
      });
    }
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
            <SimulationParameters
              procedure={procedure}
              simulationParams={simulationParams}
              onParamsChange={setSimulationParams}
            />

            {/* Column 2: Cost Breakdown */}
            <CostBreakdown
              procedure={procedure}
              simulationParams={simulationParams}
            />

            {/* Column 3: Simulation Results */}
            <SimulationResults
              procedure={procedure}
              simulationParams={simulationParams}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureModal;
