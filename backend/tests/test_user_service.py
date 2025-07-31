"""
Testes para o UserService
"""
import pytest
from sqlalchemy.orm import Session

from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User, UserRole


class TestUserService:
    """Testes para a classe UserService"""

    def test_create_user(self, db_session: Session, sample_user_data):
        """Testar criação de usuário"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        user = user_service.create_user(user_create)
        
        assert user is not None
        assert user.email == sample_user_data["email"]
        assert user.full_name == sample_user_data["full_name"]
        assert user.role.value == sample_user_data["role"]  # Verificar role
        assert user.is_active is True
        assert user.is_verified is False
        assert user.hashed_password != sample_user_data["password"]  # Deve estar hasheada
        assert len(user.hashed_password) > 50  # Hash bcrypt é longo

    def test_create_duplicate_user(self, db_session: Session, sample_user_data):
        """Testar erro ao criar usuário com email duplicado"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar primeiro usuário
        user1 = user_service.create_user(user_create)
        assert user1 is not None
        
        # Tentar criar segundo usuário com mesmo email
        user2 = user_service.create_user(user_create)
        assert user2 is None  # Deve retornar None por conta do email duplicado

    def test_get_user_by_email(self, db_session: Session, sample_user_data):
        """Testar busca de usuário por email"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Buscar por email
        found_user = user_service.get_user_by_email(sample_user_data["email"])
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == sample_user_data["email"]

    def test_get_user_by_email_not_found(self, db_session: Session):
        """Testar busca de usuário inexistente"""
        user_service = UserService(db_session)
        
        user = user_service.get_user_by_email("inexistente@exemplo.com")
        
        assert user is None

    def test_get_user_by_id(self, db_session: Session, sample_user_data):
        """Testar busca de usuário por ID"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Buscar por ID
        found_user = user_service.get_user_by_id(created_user.id)
        
        assert found_user is not None
        assert found_user.id == created_user.id
        assert found_user.email == sample_user_data["email"]

    def test_authenticate_user_success(self, db_session: Session, sample_user_data):
        """Testar autenticação de usuário com sucesso"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Autenticar
        authenticated_user = user_service.authenticate_user(
            sample_user_data["email"],
            sample_user_data["password"]
        )
        
        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id
        assert authenticated_user.email == sample_user_data["email"]

    def test_authenticate_user_wrong_password(self, db_session: Session, sample_user_data):
        """Testar falha na autenticação com senha errada"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Tentar autenticar com senha errada
        authenticated_user = user_service.authenticate_user(
            sample_user_data["email"],
            "senha_errada"
        )
        
        assert authenticated_user is None

    def test_authenticate_user_not_found(self, db_session: Session):
        """Testar falha na autenticação com usuário inexistente"""
        user_service = UserService(db_session)
        
        authenticated_user = user_service.authenticate_user(
            "inexistente@exemplo.com",
            "qualquer_senha"
        )
        
        assert authenticated_user is None

    def test_authenticate_inactive_user(self, db_session: Session, sample_user_data):
        """Testar falha na autenticação de usuário inativo"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Desativar usuário
        created_user.is_active = False
        db_session.commit()
        
        # Tentar autenticar usuário inativo
        authenticated_user = user_service.authenticate_user(
            sample_user_data["email"],
            sample_user_data["password"]
        )
        
        assert authenticated_user is None

    def test_update_user(self, db_session: Session, sample_user_data):
        """Testar atualização de dados do usuário"""
        user_service = UserService(db_session)
        user_create = UserCreate(**sample_user_data)
        
        # Criar usuário
        created_user = user_service.create_user(user_create)
        assert created_user is not None
        
        # Atualizar dados
        update_data = UserUpdate(
            full_name="Nome Atualizado",
            password="nova_senha_123"
        )
        
        updated_user = user_service.update_user(created_user.id, update_data)
        
        assert updated_user is not None
        assert updated_user.full_name == "Nome Atualizado"
        assert updated_user.email == sample_user_data["email"]  # Email não mudou
        
        # Verificar se nova senha funciona
        auth_user = user_service.authenticate_user(
            sample_user_data["email"],
            "nova_senha_123"
        )
        assert auth_user is not None

    def test_update_nonexistent_user(self, db_session: Session):
        """Testar erro ao atualizar usuário inexistente"""
        user_service = UserService(db_session)
        
        update_data = UserUpdate(full_name="Teste")
        updated_user = user_service.update_user(999, update_data)
        
        assert updated_user is None