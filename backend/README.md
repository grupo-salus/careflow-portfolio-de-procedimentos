# CareFlow Backend

Backend do sistema CareFlow - Portfolio de Procedimentos para clínicas estéticas, desenvolvido em Python/FastAPI.

## 🚀 Início Rápido

### Pré-requisitos
- Python 3.8+
- pip (gerenciador de pacotes Python)

### Instalação

1. **Clone o repositório** (se ainda não fez)
2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

4. **Configure o banco de dados:**
   ```bash
   python scripts/setup_complete_database.py
   ```

5. **Execute a aplicação:**
   ```bash
   python run.py
   ```

6. **Acesse a API:**
   - API: http://localhost:8000
   - Documentação: http://localhost:8000/docs
   - Redoc: http://localhost:8000/redoc

## Estrutura do Projeto

```
backend/
├── app/                    # Código principal da aplicação
│   ├── core/              # Configurações centrais (database, security)
│   ├── models/            # Modelos SQLAlchemy
│   ├── routers/           # Endpoints da API
│   ├── schemas/           # Schemas Pydantic
│   └── services/          # Lógica de negócio
├── config/                # Arquivos de configuração
│   ├── alembic.ini        # Configuração do Alembic (migrações)
│   └── pytest.ini        # Configuração dos testes
├── docs/                  # Documentação do projeto
│   ├── README.md          # Documentação detalhada
│   ├── SISTEMA_COMPLETO.md # Visão geral do sistema
│   └── TESTE_API.md       # Guia de testes da API
├── scripts/               # Scripts utilitários
│   ├── migrate_from_excel.py     # Migração de dados do Excel
│   ├── migrate_procedures.py     # Migração de procedimentos
│   ├── run_tests.py              # Execução completa de testes
│   ├── run_tests_simple.py       # Execução simples de testes
│   └── setup_complete_database.py # Setup completo do banco
├── tests/                 # Testes automatizados
├── .gitignore            # Arquivos ignorados pelo Git
├── requirements.txt      # Dependências Python
├── run.py               # Script principal para executar a aplicação
└── test.db              # Banco de dados de teste SQLite
```
um arquivo 
## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
# Executar a aplicação
python run.py

# Setup completo do banco (⚠️ APAGA TODOS OS DADOS)
python scripts/setup_complete_database.py
```

### Testes
```bash
# Testes completos com relatório detalhado
python scripts/run_tests.py

# Testes simples e rápidos
python scripts/run_tests_simple.py
```

### Migração de Dados
```bash
# Migrar/atualizar procedimentos do JSON
python scripts/migrate_procedures.py

# Migrar dados de planilha Excel
python scripts/migrate_from_excel.py
```

## 📡 API Endpoints

A API oferece os seguintes recursos principais:

### Autenticação
- `POST /auth/register` - Registro de usuários
- `POST /auth/login` - Login e obtenção de token
- `POST /auth/refresh` - Renovação de token

### Usuários
- `GET /users/me` - Perfil do usuário logado
- `PUT /users/me` - Atualizar perfil
- `GET /users/` - Listar usuários (admin)

### Empresas
- `GET /empresas/` - Listar empresas
- `POST /empresas/` - Criar empresa
- `GET /empresas/{id}` - Detalhes da empresa
- `PUT /empresas/{id}` - Atualizar empresa
- `DELETE /empresas/{id}` - Excluir empresa

### Procedimentos
- `GET /procedimentos/` - Listar procedimentos
- `POST /procedimentos/` - Criar procedimento
- `GET /procedimentos/{id}` - Detalhes do procedimento
- `PUT /procedimentos/{id}` - Atualizar procedimento
- `DELETE /procedimentos/{id}` - Excluir procedimento

### Insumos
- `GET /insumos/` - Listar insumos
- `POST /insumos/` - Criar insumo
- `GET /insumos/{id}` - Detalhes do insumo
- `PUT /insumos/{id}` - Atualizar insumo
- `DELETE /insumos/{id}` - Excluir insumo

### Módulos
- `GET /modulos/` - Listar módulos do sistema
- `POST /modulos/` - Criar módulo (admin)

> 📖 **Documentação completa:** Acesse http://localhost:8000/docs após executar a aplicação

## 🔐 Autenticação

O sistema utiliza autenticação JWT (JSON Web Tokens) com os seguintes recursos:

- **Registro de usuários** com validação de email
- **Login** com email e senha
- **Tokens de acesso** com expiração configurável
- **Refresh tokens** para renovação automática
- **Controle de permissões** baseado em roles (admin, user)
- **Middleware de segurança** para proteção de rotas

### Credenciais Padrão (após setup)
```
Email: admin@careflow.com
Senha: admin123456
```

> ⚠️ **Importante:** Altere a senha padrão em produção!

## ⚙️ Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```bash
# Banco de Dados
DATABASE_URL=sqlite:///./test.db

# Segurança
SECRET_KEY=sua_chave_secreta_super_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Aplicação
APP_NAME=CareFlow API
APP_VERSION=1.0.0
DEBUG=True

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 📚 Documentação

Para documentação detalhada, consulte os arquivos na pasta `docs/`:
- [Documentação Completa](docs/README.md)
- [Visão Geral do Sistema](docs/SISTEMA_COMPLETO.md)
- [Guia de Testes da API](docs/TESTE_API.md)

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validação e serialização de dados
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Hash de senhas

### Banco de Dados
- **SQLite** - Banco de dados (desenvolvimento)
- **Alembic** - Sistema de migrações

### Testes e Qualidade
- **Pytest** - Framework de testes
- **Coverage** - Cobertura de testes
- **Black** - Formatação de código
- **Flake8** - Linting

### DevOps
- **Docker** - Containerização (futuro)
- **GitHub Actions** - CI/CD

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**CareFlow** - Sistema de Portfolio de Procedimentos para Clínicas Estéticas 💉✨