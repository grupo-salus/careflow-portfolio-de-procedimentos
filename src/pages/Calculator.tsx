import React, { useState } from "react";
import { Calculator as CalculatorIcon } from "lucide-react";
import { Procedure } from "../types/procedure";
import proceduresData from "../data/procedures.json";
import SidebarCalculator from "../components/SidebarCalculator";
import SimulationParameters from "../components/SimulationParameters";
import CostBreakdown from "../components/CostBreakdown";
import SimulationResults from "../components/SimulationResults";

interface CalculatorProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ isSidebarOpen = true, onToggleSidebar }) => {
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
    <div className="flex flex-1 h-full overflow-hidden">
      <SidebarCalculator
        procedures={procedures}
        selectedProcedure={selectedProcedure}
        onProcedureSelect={setSelectedProcedure}
        isOpen={isSidebarOpen}
        onToggle={onToggleSidebar || (() => {})}
      />

      <main
        className={`transition-all duration-300 p-6 overflow-y-auto flex-1`}
        style={{ height: "100%", maxHeight: "100vh" }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 min-w-8 min-h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center flex-shrink-0">
              <CalculatorIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Simulador de Margem de Contribuição
            </h1>
          </div>
        </div>

        {/* Grid responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Parâmetros da Simulação */}
          <div className="md:col-span-1">
            <SimulationParameters
              procedure={selectedProcedure}
              simulationParams={simulationParams}
              onParamsChange={setSimulationParams}
            />
          </div>

          {/* Coluna 2: Breakdown de Custos */}
          <div className="md:col-span-1">
            <CostBreakdown
              procedure={selectedProcedure}
              simulationParams={simulationParams}
            />
          </div>

          {/* Coluna 3: Resultados */}
          <div className="md:col-span-2 lg:col-span-1">
            <SimulationResults
              procedure={selectedProcedure}
              simulationParams={simulationParams}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calculator;
