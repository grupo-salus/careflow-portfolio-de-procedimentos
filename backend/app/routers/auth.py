from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import create_access_token
from ..core.config import settings
from ..schemas.user import UserCreate, UserResponse, UserLogin, Token, UserPermissions, UserUpdate
from ..services.user_service import UserService
from ..services.permission_service import PermissionService
from ..core.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["autenticação"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    user_create: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Registrar novo usuário
    
    - **email**: Email válido (será usado para login)
    - **full_name**: Nome completo do usuário
    - **password**: Senha (mínimo recomendado 8 caracteres)
    """
    user_service = UserService(db)
    
    # Verificar se usuário já existe
    existing_user = user_service.get_user_by_email(user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Criar usuário
    user = user_service.create_user(user_create)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar usuário"
        )
    
    return user


@router.post("/login", response_model=Token)
def fazer_login(
    user_login: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Fazer login e obter token de acesso
    
    - **email**: Email cadastrado
    - **password**: Senha do usuário
    
    Retorna um token JWT que deve ser usado nas requisições autenticadas.
    """
    user_service = UserService(db)
    
    # Autenticar usuário
    user = user_service.authenticate_user(user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint compatível com OAuth2 para obter token
    (para uso com FastAPI docs e outros clientes OAuth2)
    """
    user_service = UserService(db)
    
    # Autenticar usuário (OAuth2 usa 'username' como campo de email)
    user = user_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def obter_usuario_atual(current_user: User = Depends(get_current_active_user)):
    """
    Obter informações do usuário atual
    
    Requer token de autenticação válido.
    """
    return current_user


@router.get("/me/permissions", response_model=UserPermissions)
def obter_minhas_permissoes(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obter permissões do usuário atual
    
    Retorna empresas, módulos e níveis de acesso do usuário.
    """
    permission_service = PermissionService(db)
    permissions = permission_service.get_user_permissions(current_user)
    return permissions


@router.put("/me", response_model=UserResponse)
def atualizar_meu_perfil(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Atualizar dados do próprio perfil
    
    Usuários não podem alterar o próprio role.
    """
    user_service = UserService(db)
    
    # Remover role do update para evitar auto-promoção
    if user_update.role is not None:
        user_update.role = None
    
    updated_user = user_service.update_user(current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao atualizar perfil"
        )
    
    return updated_user