from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

from ..models.insumo import InsumoTipo, InsumoUnidade


# Schema base para insumo
class InsumoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: InsumoTipo
    unidade: InsumoUnidade = InsumoUnidade.UNIDADE
    preco_referencia: Optional[Decimal] = None
    fornecedor: Optional[str] = None
    codigo_produto: Optional[str] = None
    observacoes: Optional[str] = None


# Schema para criação de insumo
class InsumoCreate(InsumoBase):
    pass


# Schema para atualização de insumo
class InsumoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    tipo: Optional[InsumoTipo] = None
    unidade: Optional[InsumoUnidade] = None
    preco_referencia: Optional[Decimal] = None
    fornecedor: Optional[str] = None
    codigo_produto: Optional[str] = None
    observacoes: Optional[str] = None
    is_active: Optional[bool] = None


# Schema para resposta de insumo
class InsumoResponse(InsumoBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema para adicionar insumo a procedimento
class ProcedimentoInsumoCreate(BaseModel):
    insumo_id: int
    quantidade: Decimal = 1.0
    custo_unitario: Optional[Decimal] = None
    observacoes: Optional[str] = None


# Schema para atualizar insumo em procedimento
class ProcedimentoInsumoUpdate(BaseModel):
    quantidade: Optional[Decimal] = None
    custo_unitario: Optional[Decimal] = None
    observacoes: Optional[str] = None
    is_active: Optional[bool] = None