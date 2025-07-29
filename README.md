# Careflow - Portfolio de Procedimentos

Portfolio de procedimentos médicos desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Deploy

### Deploy Manual

Para fazer deploy manualmente:

```bash
npm run deploy
```

Este comando irá:
1. Fazer o build do projeto (`npm run build`)
2. Publicar na branch `gh-pages` do GitHub
3. Disponibilizar o site em: https://luisgfonseca.github.io/careflow-portfolio-de-procedimentos

### Deploy Automático

O projeto está configurado com GitHub Actions para deploy automático. Sempre que houver um push para a branch `main`, o site será automaticamente atualizado.

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura do Projeto

- `src/components/` - Componentes React
- `src/data/` - Dados dos procedimentos
- `src/pages/` - Páginas da aplicação
- `src/services/` - Serviços e utilitários
- `src/types/` - Definições de tipos TypeScript
- `src/utils/` - Funções utilitárias

## 🎨 Tecnologias

- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (ícones)
