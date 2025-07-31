from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Schema base para módulo
class ModuloBase(BaseModel):
    nome: str
    slug: str
    descricao: Optional[str] = None
    icone: Optional[str] = None
    ordem: int = 0
    is_admin_only: bool = False


# Schema para criação de módulo
class ModuloCreate(ModuloBase):
    pass


# Schema para atualização de módulo
class ModuloUpdate(BaseModel):
    nome: Optional[str] = None
    slug: Optional[str] = None
    descricao: Optional[str] = None
    icone: Optional[str] = None
    ordem: Optional[int] = None
    is_admin_only: Optional[bool] = None
    is_active: Optional[bool] = None


# Schema para resposta de módulo
class ModuloResponse(ModuloBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema para módulo com permissão do usuário
class ModuloWithPermission(ModuloResponse):
    has_access: bool = False