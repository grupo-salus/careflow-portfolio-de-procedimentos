# CareFlow Authentication API

API de autenticação com FastAPI e MySQL para o sistema CareFlow Portfolio de Procedimentos.

## Recursos

- ✅ Autenticação JWT
- ✅ Hash seguro de senhas com bcrypt
- ✅ Registro e login de usuários
- ✅ Proteção de rotas com middleware
- ✅ Validação de dados com Pydantic
- ✅ Documentação automática com Swagger/OpenAPI
- ✅ CORS configurado para frontend
- ✅ Estrutura organizada e escalável

## Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **MySQL** - Banco de dados relacional
- **PyMySQL** - Driver MySQL para Python
- **Pydantic** - Validação de dados
- **JWT** - Tokens de autenticação
- **Bcrypt** - Hash de senhas
- **Uvicorn** - Servidor ASGI

## Instalação

### 1. Configurar ambiente Python

```bash
cd backend
python -m venv venv

# Windows
venv\\Scripts\\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependências

```bash
pip install -r requirements.txt
```

### 3. Configurar MySQL

Crie um banco de dados MySQL:

```sql
CREATE DATABASE careflow_procedimentos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
# Configurações do Banco de Dados MySQL
DATABASE_URL=mysql+pymysql://seu_usuario:sua_senha@localhost:3306/careflow_procedimentos

# Configurações JWT
SECRET_KEY=sua-chave-secreta-super-forte-aqui-mude-em-producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configurações da Aplicação
APP_NAME=CareFlow Auth API
DEBUG=True
```

### 5. Executar o servidor

```bash
# Opção 1: Usando o script run.py
python run.py

# Opção 2: Usando uvicorn diretamente
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

A API estará disponível em: http://localhost:8000

## Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints

### Autenticação

#### POST `/api/v1/auth/register`
Registrar novo usuário

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "password": "senha123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T12:00:00",
  "updated_at": null
}
```

#### POST `/api/v1/auth/login`
Fazer login

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### GET `/api/v1/auth/me`
Obter dados do usuário atual (requer autenticação)

**Headers:**
```
Authorization: Bearer <seu_token_aqui>
```

**Response:**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T12:00:00",
  "updated_at": null
}
```

## Estrutura do Projeto

```
backend/
├── app/
│   ├── core/           # Configurações principais
│   │   ├── config.py   # Configurações da aplicação
│   │   ├── database.py # Configuração do banco
│   │   ├── security.py # Funções de segurança/JWT
│   │   └── dependencies.py # Dependências comuns
│   ├── models/         # Modelos SQLAlchemy
│   │   └── user.py     # Modelo de usuário
│   ├── schemas/        # Schemas Pydantic
│   │   └── user.py     # Schemas de usuário
│   ├── services/       # Lógica de negócio
│   │   └── user_service.py # Serviço de usuário
│   ├── routers/        # Endpoints da API
│   │   └── auth.py     # Rotas de autenticação
│   └── main.py         # Aplicação principal
├── requirements.txt    # Dependências Python
├── run.py             # Script para executar
└── README.md          # Esta documentação
```

## Desenvolvimento

### Testando a API

1. Registre um usuário:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"teste@exemplo.com","full_name":"Usuário Teste","password":"senha123"}'
```

2. Faça login:
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"teste@exemplo.com","password":"senha123"}'
```

3. Use o token retornado:
```bash
curl -X GET "http://localhost:8000/api/v1/auth/me" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Integração com Frontend

Para usar no seu frontend React, você pode fazer requisições assim:

```javascript
// Registro
const registro = await fetch('http://localhost:8000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    full_name: 'Nome Completo',
    password: 'senha123'
  })
});

// Login
const login = await fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123'
  })
});

const { access_token } = await login.json();

// Usar token em requisições autenticadas
const dadosUsuario = await fetch('http://localhost:8000/api/v1/auth/me', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```

## Próximos Passos

- [ ] Implementar verificação de email
- [ ] Adicionar roles/permissões de usuário
- [ ] Implementar recuperação de senha
- [ ] Adicionar rate limiting
- [ ] Configurar logs estruturados
- [ ] Adicionar testes automatizados

## Produção

Para produção, certifique-se de:

1. Alterar `SECRET_KEY` para uma chave forte e única
2. Configurar `DEBUG=False`
3. Usar banco de dados em servidor dedicado
4. Configurar HTTPS
5. Implementar backup do banco de dados
6. Monitorar logs e métricas