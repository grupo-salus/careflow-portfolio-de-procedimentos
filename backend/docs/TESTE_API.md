# 🧪 **GUIA DE TESTE DA API CAREFLOW**

## 🚀 **Como Testar o Sistema Completo**

### **1. Iniciar o Sistema**
```bash
cd backend
python run.py
```

### **2. Acessar Documentação Interativa**
```
http://localhost:8000/docs
```

---

## 🔐 **FLUXO DE TESTE RECOMENDADO**

### **PASSO 1: Login como Admin**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@careflow.com",
  "password": "admin123456"
}

# Resposta esperada:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**💡 Copie o `access_token` para usar nos próximos requests!**

### **PASSO 2: Verificar Permissões**
```http
GET /api/v1/auth/me/permissions
Authorization: Bearer SEU_TOKEN_AQUI

# Resposta esperada (admin):
{
  "is_admin": true,
  "empresas_ids": [1, 2],
  "modulos_slugs": ["portfolio", "calculadora", "admin_usuarios", "financeiro", "comercial"],
  "empresas_admin": []
}
```

### **PASSO 3: Listar Procedimentos (Admin vê todos)**
```http
GET /api/v1/procedimentos/
Authorization: Bearer SEU_TOKEN_AQUI

# Deve retornar 9 procedimentos distribuídos entre empresas
```

### **PASSO 4: Login como Usuário Comum**
```http
POST /api/v1/auth/login
{
  "email": "demo@careflow.com",  
  "password": "demo123456"
}
```

### **PASSO 5: Testar Isolamento de Dados**
```http
GET /api/v1/procedimentos/
Authorization: Bearer TOKEN_DO_DEMO

# Usuário demo deve ver apenas procedimentos da sua empresa
```

---

## 📋 **TESTES ESPECÍFICOS POR FUNCIONALIDADE**

### **🔐 Autenticação**
```http
# Registrar novo usuário
POST /api/v1/auth/register
{
  "email": "teste@exemplo.com",
  "full_name": "Usuário Teste",
  "password": "senha123",
  "role": "comum"
}

# Obter dados atuais
GET /api/v1/auth/me
Authorization: Bearer TOKEN

# Atualizar perfil
PUT /api/v1/auth/me
Authorization: Bearer TOKEN
{
  "full_name": "Nome Atualizado"
}
```

### **🏢 Empresas**
```http
# Listar empresas (filtrado por permissão)
GET /api/v1/empresas/
Authorization: Bearer TOKEN

# Criar empresa (apenas admin)
POST /api/v1/empresas/
Authorization: Bearer ADMIN_TOKEN
{
  "nome": "Nova Empresa",
  "razao_social": "Nova Empresa LTDA",
  "cnpj": "12.345.678/0001-99",
  "email": "contato@novaempresa.com"
}

# Obter empresa específica
GET /api/v1/empresas/1
Authorization: Bearer TOKEN
```

### **📊 Procedimentos**
```http
# Listar procedimentos (filtrado por empresa)
GET /api/v1/procedimentos/?categoria=FINANCEIRO
Authorization: Bearer TOKEN

# Obter procedimento completo com insumos
GET /api/v1/procedimentos/1
Authorization: Bearer TOKEN

# Criar procedimento (requer permissão empresa)
POST /api/v1/procedimentos/
Authorization: Bearer TOKEN
{
  "nome": "Novo Procedimento",
  "descricao": "Descrição do procedimento",
  "categoria": "COMERCIAL",
  "tipo": "Entrada",
  "preco_base": 150.00,
  "tempo_estimado": 60,
  "empresa_id": 1
}

# Resumo dos procedimentos do usuário
GET /api/v1/procedimentos/me/resumo
Authorization: Bearer TOKEN
```

### **📦 Insumos (Admin Only)**
```http
# Listar insumos
GET /api/v1/insumos/
Authorization: Bearer ADMIN_TOKEN

# Criar insumo
POST /api/v1/insumos/
Authorization: Bearer ADMIN_TOKEN
{
  "nome": "Novo Insumo",
  "tipo": "CONSUMIVEL",
  "unidade": "UNIDADE",
  "preco_referencia": 5.50,
  "descricao": "Descrição do insumo"
}

# Adicionar insumo a procedimento
POST /api/v1/insumos/procedimento/1/insumos
Authorization: Bearer TOKEN
{
  "insumo_id": 1,
  "quantidade": 2.0,
  "custo_unitario": 1.50,
  "observacoes": "Observação da associação"
}
```

### **👑 Administração**
```http
# Listar usuários (admin only)
GET /api/v1/admin/users
Authorization: Bearer ADMIN_TOKEN

# Obter estatísticas do sistema
GET /api/v1/admin/stats
Authorization: Bearer ADMIN_TOKEN

# Promover usuário a admin
POST /api/v1/admin/users/3/promote
Authorization: Bearer ADMIN_TOKEN

# Associar usuário a empresa
POST /api/v1/admin/users/3/empresas
Authorization: Bearer ADMIN_TOKEN
{
  "user_id": 3,
  "empresa_id": 1,
  "is_admin_empresa": false
}
```

---

## 🧪 **TESTES DE SEGURANÇA**

### **❌ Testes que DEVEM Falhar:**

```http
# 1. Acesso sem token (401)
GET /api/v1/procedimentos/

# 2. Token inválido (401)  
GET /api/v1/procedimentos/
Authorization: Bearer token_invalido

# 3. Usuário comum acessando admin (403)
GET /api/v1/admin/users
Authorization: Bearer TOKEN_COMUM

# 4. Usuário acessando empresa que não pertence (403)
GET /api/v1/empresas/999
Authorization: Bearer TOKEN_COMUM

# 5. Usuário comum criando empresa (403)
POST /api/v1/empresas/
Authorization: Bearer TOKEN_COMUM
{...}
```

### **✅ Testes que DEVEM Funcionar:**

```http
# 1. Admin vendo todas empresas
GET /api/v1/empresas/
Authorization: Bearer ADMIN_TOKEN

# 2. Usuário vendo apenas suas empresas
GET /api/v1/empresas/
Authorization: Bearer USER_TOKEN

# 3. Admin gerenciando qualquer procedimento
PUT /api/v1/procedimentos/1
Authorization: Bearer ADMIN_TOKEN
{...}

# 4. Usuário gerenciando procedimento da sua empresa
PUT /api/v1/procedimentos/1
Authorization: Bearer USER_TOKEN
{...}
```

---

## 📊 **DADOS DE TESTE DISPONÍVEIS**

### **👥 Usuários Criados:**
```
admin@careflow.com / admin123456    (ADMIN)
demo@careflow.com / demo123456      (COMUM)
```

### **🏢 Empresas:**
```
1. Gio Estética Avançada
2. Sorridents
```

### **📋 Módulos:**
```
- Portfolio (comum)
- Calculadora (comum) 
- Admin Usuários (admin only)
- Financeiro (comum)
- Comercial (comum)
```

### **📊 Procedimentos Migrados:**
```
9 procedimentos reais do seu JSON:
- Depilação Laser Virilha
- Depilação Laser Pernas  
- Preenchimento Facial
- Toxina Bot 50 UI Allergan
- Toxina Bot 100 UI Allergan
- Toxina Botulínica XEOMIN (100ui)
- Toxina Bot 200 UI Allergan
- Toxina Botulínica DYSPORT (300ui)
- Toxina Botulínica DYSPORT (500ui)
```

---

## 🎯 **VALIDAÇÕES ESPERADAS**

### **✅ Funcionamento Correto:**
- [ ] Admin pode ver todas empresas
- [ ] Usuário comum vê apenas suas empresas
- [ ] Procedimentos são filtrados por empresa
- [ ] Insumos são gerenciados apenas por admins
- [ ] Associações funcionam corretamente
- [ ] Tokens expiram após 30 minutos
- [ ] Senhas são criptografadas
- [ ] Dados são isolados por empresa

### **❌ Rejeições Corretas:**
- [ ] Acesso sem token é negado
- [ ] Tokens inválidos são rejeitados
- [ ] Usuário comum não acessa admin
- [ ] Empresas alheias são bloqueadas
- [ ] Escalação de privilégios é impedida

---

## 🚀 **TESTE RÁPIDO (5 MINUTOS)**

1. **Abra**: `http://localhost:8000/docs`
2. **Login Admin**: Use `admin@careflow.com` / `admin123456`
3. **Copie o token** da resposta
4. **Clique em "Authorize"** no Swagger e cole o token
5. **Teste GET** `/api/v1/procedimentos/` - deve ver 9 procedimentos
6. **Teste GET** `/api/v1/admin/stats` - deve ver estatísticas
7. **Login Demo**: Use `demo@careflow.com` / `demo123456`  
8. **Authorize** com o novo token
9. **Teste GET** `/api/v1/procedimentos/` - deve ver menos procedimentos
10. **Teste GET** `/api/v1/admin/users` - deve retornar 403 Forbidden

**✅ Se todos funcionarem = Sistema 100% operacional!**