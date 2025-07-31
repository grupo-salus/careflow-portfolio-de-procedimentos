"""
Configurações e fixtures para testes
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import get_db, Base
from app.main import app
from app.models.user import User, UserRole
from app.models.empresa import Empresa
from app.models.modulo import Modulo
from app.services.user_service import UserService
from app.services.empresa_service import EmpresaService
from app.services.modulo_service import ModuloService
from app.schemas.user import UserCreate
from app.schemas.empresa import EmpresaCreate
from app.schemas.modulo import ModuloCreate

# Usar SQLite em memória para testes (mais rápido)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override da função get_db para usar banco de teste"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override da dependência de banco
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db_session():
    """Fixture que cria e limpa o banco para cada teste"""
    # Limpar tabelas antes de criar
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Limpar após o teste
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Fixture do cliente de teste FastAPI"""
    with TestClient(app) as test_client:
        yield test_client


# Dados de exemplo
@pytest.fixture
def sample_user_data():
    """Dados de exemplo para criar usuário comum"""
    return {
        "email": "teste@exemplo.com",
        "full_name": "Usuário de Teste",
        "password": "senha123456",
        "role": "comum"
    }


@pytest.fixture
def sample_admin_data():
    """Dados de exemplo para criar usuário admin"""
    return {
        "email": "admin@exemplo.com",
        "full_name": "Admin de Teste",
        "password": "admin123456",
        "role": "admin"
    }


@pytest.fixture
def sample_user_data_2():
    """Segundo conjunto de dados de usuário para testes"""
    return {
        "email": "teste2@exemplo.com", 
        "full_name": "Segundo Usuário",
        "password": "outrasenha123",
        "role": "comum"
    }


@pytest.fixture
def sample_empresa_data():
    """Dados de exemplo para empresa"""
    return {
        "nome": "Empresa Teste LTDA",
        "razao_social": "Empresa Teste Sociedade LTDA",
        "cnpj": "12.345.678/0001-90",
        "email": "contato@empresateste.com.br",
        "telefone": "(11) 99999-9999"
    }


@pytest.fixture
def sample_empresa_data_2():
    """Segundo conjunto de dados de empresa"""
    return {
        "nome": "Segunda Empresa LTDA",
        "razao_social": "Segunda Empresa Sociedade LTDA", 
        "cnpj": "98.765.432/0001-10",
        "email": "contato@segundaempresa.com.br",
        "telefone": "(11) 88888-8888"
    }


@pytest.fixture
def sample_modulo_data():
    """Dados de exemplo para módulo"""
    return {
        "nome": "Módulo Teste",
        "slug": "modulo_teste",
        "descricao": "Módulo para testes",
        "icone": "test",
        "ordem": 1,
        "is_admin_only": False
    }


@pytest.fixture
def sample_modulo_admin_data():
    """Dados de exemplo para módulo admin"""
    return {
        "nome": "Módulo Admin Teste",
        "slug": "modulo_admin_teste",
        "descricao": "Módulo admin para testes",
        "icone": "admin-test",
        "ordem": 10,
        "is_admin_only": True
    }


@pytest.fixture
def sample_modulo_data_2():
    """Segundo conjunto de dados de módulo"""
    return {
        "nome": "Segundo Módulo Teste",
        "slug": "segundo_modulo_teste",
        "descricao": "Segundo módulo para testes",
        "icone": "test-2",
        "ordem": 2,
        "is_admin_only": False
    }


# Fixtures para criar entidades
@pytest.fixture
def created_user(client, sample_user_data):
    """Fixture que cria um usuário comum e retorna os dados"""
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def created_admin(client, sample_admin_data):
    """Fixture que cria um usuário admin e retorna os dados"""
    response = client.post("/api/v1/auth/register", json=sample_admin_data)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def created_empresa(client, sample_empresa_data, admin_headers):
    """Fixture que cria uma empresa e retorna os dados"""
    response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=admin_headers)
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def created_modulo(client, sample_modulo_data, admin_headers):
    """Fixture que cria um módulo e retorna os dados"""
    response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
    assert response.status_code == 201
    return response.json()


# Fixtures para autenticação
@pytest.fixture
def auth_headers(client, sample_user_data):
    """Fixture que cria usuário comum, faz login e retorna headers de autenticação"""
    # Registrar usuário
    client.post("/api/v1/auth/register", json=sample_user_data)
    
    # Fazer login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": sample_user_data["email"],
            "password": sample_user_data["password"]
        }
    )
    assert login_response.status_code == 200
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(client, sample_admin_data):
    """Fixture que cria usuário admin, faz login e retorna headers de autenticação"""
    # Registrar admin
    client.post("/api/v1/auth/register", json=sample_admin_data)
    
    # Fazer login
    login_response = client.post(
        "/api/v1/auth/login",
        json={
            "email": sample_admin_data["email"],
            "password": sample_admin_data["password"]
        }
    )
    assert login_response.status_code == 200
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Fixtures para setup de dados relacionais
@pytest.fixture
def user_with_empresa_access(db_session, client, created_user, created_empresa):
    """Fixture que cria usuário com acesso a uma empresa"""
    user_service = UserService(db_session)
    empresa_service = EmpresaService(db_session)
    
    # Adicionar usuário à empresa
    empresa_service.add_user_to_empresa(created_user["id"], created_empresa["id"], is_admin=False)
    
    return {
        "user": created_user,
        "empresa": created_empresa
    }


@pytest.fixture
def user_with_modulo_access(db_session, client, created_user, created_modulo):
    """Fixture que cria usuário com acesso a um módulo"""
    modulo_service = ModuloService(db_session)
    
    # Adicionar usuário ao módulo
    modulo_service.add_user_to_modulo(created_user["id"], created_modulo["id"])
    
    return {
        "user": created_user,
        "modulo": created_modulo
    }


@pytest.fixture
def complete_setup(db_session, client, sample_user_data, sample_admin_data, sample_empresa_data, sample_modulo_data):
    """Fixture que cria setup completo: admin, usuário, empresa, módulo com associações"""
    # Criar admin
    admin_response = client.post("/api/v1/auth/register", json=sample_admin_data)
    admin_data = admin_response.json()
    
    # Login admin
    admin_login = client.post("/api/v1/auth/login", json={
        "email": sample_admin_data["email"],
        "password": sample_admin_data["password"]
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Criar empresa
    empresa_response = client.post("/api/v1/empresas/", json=sample_empresa_data, headers=admin_headers)
    empresa_data = empresa_response.json()
    
    # Criar módulo
    modulo_response = client.post("/api/v1/modulos/", json=sample_modulo_data, headers=admin_headers)
    modulo_data = modulo_response.json()
    
    # Criar usuário comum
    user_response = client.post("/api/v1/auth/register", json=sample_user_data)
    if user_response.status_code != 201:
        raise Exception(f"Failed to register user: {user_response.status_code} - {user_response.text}")
    user_data = user_response.json()
    
    # Login usuário comum
    user_login = client.post("/api/v1/auth/login", json={
        "email": sample_user_data["email"],
        "password": sample_user_data["password"]
    })
    user_token = user_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    
    # Associar usuário à empresa
    client.post(f"/api/v1/admin/users/{user_data['id']}/empresas", json={
        "user_id": user_data["id"],
        "empresa_id": empresa_data["id"],
        "is_admin_empresa": False
    }, headers=admin_headers)
    
    # Associar usuário ao módulo
    client.post(f"/api/v1/admin/users/{user_data['id']}/modulos", json={
        "user_id": user_data["id"],
        "modulo_id": modulo_data["id"]
    }, headers=admin_headers)
    
    return {
        "admin": {"data": admin_data, "headers": admin_headers},
        "user": {"data": user_data, "headers": user_headers},
        "empresa": empresa_data,
        "modulo": modulo_data
    }