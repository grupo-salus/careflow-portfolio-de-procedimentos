import React from "react";
import { DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { ViewType } from "../types/procedure";

interface HeaderToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const HeaderToggle: React.FC<HeaderToggleProps> = ({
  currentView,
  onViewChange,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  return (
    <div
      className={`bg-white border-b border-gray-200 px-1 py-3 transition-all duration-300 ${
        isSidebarOpen ? "lg:ml-80" : "ml-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Menu Burger */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                isSidebarOpen ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="url(#careflowGradient)"
              viewBox="0 0 24 24"
            >
              <defs>
                <linearGradient
                  id="careflowGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="15%" stopColor="#683fe7" />
                  <stop offset="50%" stopColor="#ca2cb2" />
                  <stop offset="100%" stopColor="#fd9010" />
                </linearGradient>
              </defs>
              {isSidebarOpen ? (
                // X icon
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </>
              ) : (
                // Hamburger icon
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </>
              )}
            </svg>
          </button>

          {/* Title with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[var(--careflow-primary)] to-[var(--careflow-secondary)] rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Portfólio de Procedimentos
            </h1>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewChange("financeiro")}
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
            onClick={() => onViewChange("comercial")}
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
    </div>
  );
};

export default HeaderToggle;
