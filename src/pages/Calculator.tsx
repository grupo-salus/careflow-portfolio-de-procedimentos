import React, { useState } from "react";
import { Calculator as CalculatorIcon } from "lucide-react";
import { Procedure } from "../types/procedure";
import proceduresData from "../data/procedures.json";
import HeaderToggle from "../components/HeaderToggle";
import SidebarCalculator from "../components/SidebarCalculator";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const procedures = proceduresData as Procedure[];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeaderToggle
        currentView="financeiro"
        onViewChange={() => {}}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        <SidebarCalculator
          procedures={procedures}
          selectedProcedure={selectedProcedure}
          onProcedureSelect={setSelectedProcedure}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={`transition-all duration-300 p-6 overflow-y-auto ${
            isSidebarOpen ? "lg:ml-80" : "ml-0"
          } flex-1`}
          style={{ height: "calc(100vh - 64px)" }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center">
                <CalculatorIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Simulador de Margem de Contribuição
              </h1>
            </div>
          </div>

          {/* Grid com 3 colunas agora */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Parâmetros da Simulação */}
            <div className="lg:col-span-1">
              <SimulationParameters
                procedure={selectedProcedure}
                simulationParams={simulationParams}
                onParamsChange={setSimulationParams}
              />
            </div>

            {/* Coluna 2: Breakdown de Custos */}
            <div className="lg:col-span-1">
              <CostBreakdown
                procedure={selectedProcedure}
                simulationParams={simulationParams}
              />
            </div>

            {/* Coluna 3: Resultados */}
            <div className="lg:col-span-1">
              <SimulationResults
                procedure={selectedProcedure}
                simulationParams={simulationParams}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Calculator;
