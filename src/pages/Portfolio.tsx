import React, { useState, useMemo } from "react";
import { Menu, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { ViewType, FilterState, Procedure } from "../types/procedure";
import {
  filterProcedures,
  groupProceduresByType,
  getAllLabels,
  getPriceRange,
  getTimeRange,
} from "../utils/filters";
import SidebarFilters from "../components/SidebarFilters";
import AccordionGroup from "../components/AccordionGroup";
import ProcedureModal from "../components/ProcedureModal";
import proceduresData from "../data/procedures.json";

interface PortfolioProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ isSidebarOpen = true, onToggleSidebar }) => {
  const [currentView, setCurrentView] = useState<ViewType>("financeiro");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const procedures = proceduresData as Procedure[];

  const priceRange = useMemo(() => getPriceRange(procedures), [procedures]);
  const timeRange = useMemo(() => getTimeRange(procedures), [procedures]);
  const availableLabels = useMemo(() => getAllLabels(procedures), [procedures]);

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    selectedLabels: [],
    tempoMin: timeRange[0],
    tempoMax: timeRange[1],
    precoMin: priceRange[0],
    precoMax: priceRange[1],
  });

  const filteredProcedures = useMemo(
    () => filterProcedures(procedures, filters),
    [procedures, filters]
  );

  const groupedProcedures = useMemo(
    () => groupProceduresByType(filteredProcedures, currentView),
    [filteredProcedures, currentView]
  );

  const handleProcedureClick = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProcedure(null);
  };

  const totalProcedures = Object.values(groupedProcedures).reduce(
    (total, procedures) => total + procedures.length,
    0
  );

  return (
    <>
      <div className="flex flex-1 h-full overflow-hidden">
        <SidebarFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableLabels={availableLabels}
          priceRange={priceRange}
          timeRange={timeRange}
          isOpen={isSidebarOpen}
          onToggle={onToggleSidebar || (() => {})}
        />

        <main
          className={`transition-all duration-300 p-6 overflow-y-auto flex-1`}
          style={{ height: "100%", maxHeight: "100vh" }}
        >
          {/* Header with Title and Toggle */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6">
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Portfólio de Procedimentos
                </h1>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView("financeiro")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden hover:bg-gray-50 ${
                    currentView === "financeiro"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {currentView === "financeiro" && (
                    <div
                      className="absolute inset-0 opacity-100 transition-opacity duration-200"
                      style={{
                        background: "var(--careflow-gradient)",
                      }}
                    />
                  )}
                  <DollarSign className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Financeiro</span>
                </button>
                <button
                  onClick={() => setCurrentView("comercial")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden hover:bg-gray-50 ${
                    currentView === "comercial"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {currentView === "comercial" && (
                    <div
                      className="absolute inset-0 opacity-100 transition-opacity duration-200"
                      style={{
                        background: "var(--careflow-gradient)",
                      }}
                    />
                  )}
                  <TrendingUp className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Comercial</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mt-1">
                {totalProcedures} procedimento{totalProcedures !== 1 ? "s" : ""}{" "}
                encontrado{totalProcedures !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {totalProcedures === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Menu className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum procedimento encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros para encontrar procedimentos.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {Object.entries(groupedProcedures).map(
                ([groupTitle, groupProcedures], index) => (
                  <AccordionGroup
                    key={groupTitle}
                    title={groupTitle}
                    procedures={groupProcedures}
                    onProcedureClick={handleProcedureClick}
                    defaultOpen={index === 0}
                  />
                )
              )}
            </div>
          )}
        </main>
      </div>

      <ProcedureModal
        procedure={selectedProcedure}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default Portfolio;
