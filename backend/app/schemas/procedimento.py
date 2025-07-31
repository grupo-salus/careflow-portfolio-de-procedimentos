from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict

from ..models.procedimento import ProcedimentoCategoria


# Schema base para procedimento
class ProcedimentoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    categoria: ProcedimentoCategoria
    tipo: Optional[str] = None
    preco_base: Optional[Decimal] = None
    tempo_estimado: Optional[int] = None
    imagem_url: Optional[str] = None
    observacoes: Optional[str] = None


# Schema para criação de procedimento
class ProcedimentoCreate(ProcedimentoBase):
    empresa_id: int


# Schema para atualização de procedimento
class ProcedimentoUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    categoria: Optional[ProcedimentoCategoria] = None
    tipo: Optional[str] = None
    preco_base: Optional[Decimal] = None
    tempo_estimado: Optional[int] = None
    imagem_url: Optional[str] = None
    observacoes: Optional[str] = None
    is_active: Optional[bool] = None


# Schema para resposta de procedimento
class ProcedimentoResponse(ProcedimentoBase):
    id: int
    empresa_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema para procedimento com empresa
class ProcedimentoWithEmpresa(ProcedimentoResponse):
    empresa_nome: str


# Schema para insumo em procedimento
class ProcedimentoInsumoResponse(BaseModel):
    id: int
    insumo_id: int
    insumo_nome: str
    quantidade: Decimal
    custo_unitario: Optional[Decimal] = None
    custo_total: float
    observacoes: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema para procedimento com insumos
class ProcedimentoCompleto(ProcedimentoResponse):
    insumos: List[ProcedimentoInsumoResponse] = []
    custo_total_insumos: float = 0.0