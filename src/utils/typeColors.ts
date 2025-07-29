import React from 'react';

// Utilitário para cores dos tipos
export const getTipoColors = (tipo: string): React.CSSProperties => {
  switch (tipo) {
    case "Alto Ticket":
      return {
        backgroundColor: "var(--tipo-alto-ticket-bg)",
        color: "var(--tipo-alto-ticket-text)"
      };
    case "Entrada":
      return {
        backgroundColor: "var(--tipo-entrada-bg)",
        color: "var(--tipo-entrada-text)"
      };
    case "Recorrência":
      return {
        backgroundColor: "var(--tipo-recorrencia-bg)",
        color: "var(--tipo-recorrencia-text)"
      };
    case "Pacote":
      return {
        backgroundColor: "var(--tipo-pacote-bg)",
        color: "var(--tipo-pacote-text)"
      };
    default:
      return {
        backgroundColor: "var(--tipo-entrada-bg)",
        color: "var(--tipo-entrada-text)"
      };
  }
}; 