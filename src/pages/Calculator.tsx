import React, { useState } from "react";
import { Procedure } from "../types/procedure";
import proceduresData from "../data/procedures.json";
import HeaderToggle from "../components/HeaderToggle";
import ProcedureSelector from "../components/ProcedureSelector";
import SimulationParameters from "../components/SimulationParameters";
import CostBreakdown from "../components/CostBreakdown";
import SimulationResults from "../components/SimulationResults";

const Calculator: React.FC = () => {
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(
    null
  );
  const [simulationParams, setSimulationParams] = useState({
    precoSessao: 0,
    numeroSessoes: 1,
    custoProfissional: 0,
  });

  const procedures = proceduresData as Procedure[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderToggle
        currentView="financeiro"
        onViewChange={() => {}}
        onToggleSidebar={() => {}}
        isSidebarOpen={false}
      />

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Simulador de Margem de Contribuição
            </h1>
            <p className="text-gray-600">
              Calcule a margem de contribuição dos seus procedimentos de forma
              dinâmica
            </p>
          </div>

          {/* Grid com 4 colunas - altura ainda menor */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-400px)]">
            {/* Coluna 1: Selecione o Procedimento */}
            <div className="lg:col-span-1">
              <ProcedureSelector
                procedures={procedures}
                selectedProcedure={selectedProcedure}
                onProcedureSelect={setSelectedProcedure}
              />
            </div>

            {/* Coluna 2: Parâmetros da Simulação */}
            <div className="lg:col-span-1">
              <SimulationParameters
                procedure={selectedProcedure}
                simulationParams={simulationParams}
                onParamsChange={setSimulationParams}
              />
            </div>

            {/* Coluna 3: Breakdown de Custos */}
            <div className="lg:col-span-1">
              <CostBreakdown
                procedure={selectedProcedure}
                simulationParams={simulationParams}
              />
            </div>

            {/* Coluna 4: Resultados */}
            <div className="lg:col-span-1">
              <SimulationResults
                procedure={selectedProcedure}
                simulationParams={simulationParams}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
