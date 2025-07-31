import React, { useMemo } from "react";
import { Calculator } from "lucide-react";
import { Procedure } from "../types/procedure";
import { formatCurrency } from "../services/marginCalculator";

interface CostBreakdownProps {
  procedure: Procedure | null;
  simulationParams: {
    precoSessao: number;
    numeroSessoes: number;
    custoProfissional: number;
  };
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({
  procedure,
  simulationParams,
}) => {
  const totalInsumosCost = useMemo(() => {
    if (!procedure) return 0;
    return procedure.insumos.reduce((total, insumo) => total + insumo.valor, 0);
  }, [procedure]);

  if (!procedure) {
    return (
      <div className="bg-white p-4 rounded-xl min-h-96 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
        <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Breakdown de Custos
        </h3>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-center">Selecione um procedimento primeiro</p>
          <p className="text-xs text-gray-400 mt-1 text-center">Visualize os custos detalhados aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl h-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(120deg, #683fe7 15%, #ca2cb2 50%, #fd9010 100%) border-box', border: '2px solid transparent' }}>
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Calculator className="w-4 h-4" />
        Breakdown de Custos
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex justify-between items-start py-1 border-b border-gray-100">
          <span className="text-xs text-purple-600 flex-1 mr-2 font-medium">
            Custo Profissional
          </span>
          <span className="text-sm font-bold flex-shrink-0 text-purple-600">
            {formatCurrency(simulationParams.custoProfissional)}
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
        <span className="text-sm font-bold text-gray-900">Total sessão</span>
        <span
          className="text-sm font-bold bg-clip-text text-transparent"
          style={{
            background: "var(--careflow-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {formatCurrency(
            totalInsumosCost + simulationParams.custoProfissional
          )}
        </span>
      </div>
    </div>
  );
};

export default CostBreakdown;
