export interface Insumo {
  nome: string;
  valor: number;
}

export interface Procedure {
  id: number;
  nome: string;
  precoSugerido: number;
  numeroSessoes: number;
  tempoSessaoMin: number;
  descricao: string;
  tipo: 'Alto Ticket' | 'Entrada' | 'Recorrência' | 'Pacote';
  insumos: Insumo[];
  custoProfissionalPorSessao: number;
  labels: string[];
}

export type ViewType = 'financeiro' | 'comercial';

export interface FilterState {
  searchTerm: string;
  selectedLabels: string[];
  tempoMin: number;
  tempoMax: number;
  precoMin: number;
  precoMax: number;
}

export interface SimulationInput {
  precoSessao: number;
  numeroSessoes: number;
  insumos: Insumo[];
  tempoSessaoMin: number;
  custoProfissionalPorSessao: number;
}

export interface SimulationResult {
  receitaTotal: number;
  custoTotalVariavel: number;
  margemContribuicao: number;
  margemPercentual: number;
  margemPorSessao: number;
  tempoTotalHoras: number;
  lucroPorHora: number;
  custoVariavelPorSessao: number;
}