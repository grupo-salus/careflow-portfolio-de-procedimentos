from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

from ..models.user import UserRole


# Schema base para usuário
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.COMUM


# Schema para criação de usuário
class UserCreate(UserBase):
    password: str


# Schema para atualização de usuário
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None


# Schema para resposta básica do usuário (sem senha)
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    empresas: List["EmpresaResponse"] = []
    modulos: List["ModuloResponse"] = []
    
    model_config = ConfigDict(from_attributes=True)


# Schema para usuário com empresas e módulos
class UserCompleto(UserResponse):
    empresas: List["EmpresaResponse"] = []
    modulos: List["ModuloResponse"] = []


# Schema para associar usuário a empresa
class UserEmpresaAssociation(BaseModel):
    user_id: int
    empresa_id: int
    is_admin_empresa: bool = False


# Schema para associar usuário a módulo
class UserModuloAssociation(BaseModel):
    user_id: int
    modulo_id: int


# Schema para login
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema para token de acesso
class Token(BaseModel):
    access_token: str
    token_type: str


# Schema para dados do token
class TokenData(BaseModel):
    email: Optional[str] = None


# Schema para permissões do usuário
class UserPermissions(BaseModel):
    is_admin: bool
    empresas_ids: List[int] = []
    modulos_slugs: List[str] = []
    empresas_admin: List[int] = []  # IDs das empresas onde é admin


# Imports para resolver referências circulares
from .empresa import EmpresaResponse
from .modulo import ModuloResponse

UserResponse.model_rebuild()
UserCompleto.model_rebuild()