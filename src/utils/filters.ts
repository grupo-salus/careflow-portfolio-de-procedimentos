import { Procedure, FilterState } from '../types/procedure';

export const filterProcedures = (procedures: Procedure[], filters: FilterState): Procedure[] => {
  return procedures.filter(procedure => {
    // Filtro por termo de busca
    const matchesSearch = procedure.nome.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      procedure.descricao.toLowerCase().includes(filters.searchTerm.toLowerCase());

    // Filtro por labels
    const matchesLabels = filters.selectedLabels.length === 0 ||
      filters.selectedLabels.some(label => procedure.labels.includes(label));

    // Filtro por tempo
    const matchesTempo = procedure.tempoSessaoMin >= filters.tempoMin &&
      procedure.tempoSessaoMin <= filters.tempoMax;

    // Filtro por preço
    const matchesPreco = procedure.precoSugerido >= filters.precoMin &&
      procedure.precoSugerido <= filters.precoMax;

    return matchesSearch && matchesLabels && matchesTempo && matchesPreco;
  });
};

export const groupProceduresByType = (procedures: Procedure[], viewType: 'financeiro' | 'comercial') => {
  const groups: { [key: string]: Procedure[] } = {};

  procedures.forEach(procedure => {
    const key = viewType === 'financeiro' ? procedure.tipoFinanceiro : procedure.tipoComercial;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(procedure);
  });

  return groups;
};

export const getAllLabels = (procedures: Procedure[]): string[] => {
  const allLabels = procedures.flatMap(p => p.labels);
  return [...new Set(allLabels)].sort();
};

export const getPriceRange = (procedures: Procedure[]): [number, number] => {
  if (procedures.length === 0) return [0, 1000];
  const prices = procedures.map(p => p.precoSugerido);
  return [Math.min(...prices), Math.max(...prices)];
};

export const getTimeRange = (procedures: Procedure[]): [number, number] => {
  if (procedures.length === 0) return [0, 120];
  const times = procedures.map(p => p.tempoSessaoMin);
  return [Math.min(...times), Math.max(...times)];
};