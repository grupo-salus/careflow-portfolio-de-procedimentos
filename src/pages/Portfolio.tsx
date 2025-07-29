import React, { useState, useMemo } from "react";
import { Menu } from "lucide-react";
import { ViewType, FilterState, Procedure } from "../types/procedure";
import {
  filterProcedures,
  groupProceduresByType,
  getAllLabels,
  getPriceRange,
  getTimeRange,
} from "../utils/filters";
import HeaderToggle from "../components/HeaderToggle";
import SidebarFilters from "../components/SidebarFilters";
import AccordionGroup from "../components/AccordionGroup";
import ProcedureModal from "../components/ProcedureModal";
import proceduresData from "../data/procedures.json";

const Portfolio: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>("financeiro");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const totalProcedures = filteredProcedures.length;

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <HeaderToggle
        currentView={currentView}
        onViewChange={setCurrentView}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <SidebarFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableLabels={availableLabels}
          priceRange={priceRange}
          timeRange={timeRange}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={`transition-all duration-300 p-6 overflow-y-auto ${
            isSidebarOpen ? "lg:ml-80" : "ml-0"
          } flex-1`}
        >
          <div className="mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Visão{" "}
                {currentView === "financeiro" ? "Financeira" : "Comercial"}
              </h2>
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
            <div className="space-y-6">
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
    </div>
  );
};

export default Portfolio;
