import { SimulationInput, SimulationResult } from '../types/procedure';

export function calcularMargemContribuicao(input: SimulationInput): SimulationResult {
  const { precoSessao, numeroSessoes, insumos, tempoSessaoMin, custoProfissionalPorSessao } = input;
  
  // Validação básica
  if (precoSessao <= 0 || numeroSessoes <= 0 || tempoSessaoMin <= 0 || custoProfissionalPorSessao < 0) {
    throw new Error('Todos os valores devem ser maiores que zero');
  }

  // Cálculo do custo de insumos por sessão
  const custoInsumosPorSessao = insumos.reduce((total, insumo) => total + insumo.valor, 0);
  
  // Cálculo do custo total por sessão (insumos + profissional)
  const custoTotalPorSessao = custoInsumosPorSessao + custoProfissionalPorSessao;
  
  // Cálculos principais seguindo a planilha
  const receitaTotal = precoSessao * numeroSessoes;
  const custoTotalVariavel = custoTotalPorSessao * numeroSessoes;
  const margemContribuicao = receitaTotal - custoTotalVariavel;
  const margemPorSessao = numeroSessoes > 0 ? margemContribuicao / numeroSessoes : 0;
  const margemPercentual = precoSessao > 0 ? (margemPorSessao / precoSessao) * 100 : 0;
  const tempoTotalHoras = (numeroSessoes * tempoSessaoMin) / 60;
  const lucroPorHora = tempoTotalHoras > 0 ? margemContribuicao / tempoTotalHoras : 0;

  return {
    receitaTotal,
    custoTotalVariavel,
    margemContribuicao,
    margemPercentual,
    margemPorSessao,
    tempoTotalHoras,
    lucroPorHora,
    custoVariavelPorSessao: custoTotalPorSessao
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatHours(hours: number): string {
  return `${hours.toFixed(1)}h`;
}