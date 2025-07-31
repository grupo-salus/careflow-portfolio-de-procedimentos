from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Schema base para empresa
class EmpresaBase(BaseModel):
    nome: str
    razao_social: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None


# Schema para criação de empresa
class EmpresaCreate(EmpresaBase):
    pass


# Schema para atualização de empresa
class EmpresaUpdate(BaseModel):
    nome: Optional[str] = None
    razao_social: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    is_active: Optional[bool] = None


# Schema para resposta de empresa
class EmpresaResponse(EmpresaBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema para empresa com contagem de usuários
class EmpresaWithStats(EmpresaResponse):
    total_usuarios: int = 0
    total_procedimentos: int = 0