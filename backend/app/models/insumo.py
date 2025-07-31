from sqlalchemy import Column, Integer, String, Boolean, Text, Enum, DECIMAL
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base
from .base import TimestampMixin


class InsumoTipo(str, enum.Enum):
    CONSUMIVEL = "consumivel"
    EQUIPAMENTO = "equipamento"
    MEDICAMENTO = "medicamento"
    MATERIAL = "material"
    OUTROS = "outros"


class InsumoUnidade(str, enum.Enum):
    UNIDADE = "unidade"
    GRAMA = "grama"
    MILILITRO = "mililitro"
    METRO = "metro"
    CENTIMETRO = "centimetro"
    OUTROS = "outros"


class Insumo(Base, TimestampMixin):
    __tablename__ = "insumos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    descricao = Column(Text, nullable=True)
    tipo = Column(Enum(InsumoTipo), nullable=False, index=True)
    unidade = Column(Enum(InsumoUnidade), default=InsumoUnidade.UNIDADE)
    preco_referencia = Column(DECIMAL(10, 2), nullable=True)  # Preço base de referência
    fornecedor = Column(String(255), nullable=True)
    codigo_produto = Column(String(100), nullable=True)
    observacoes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamento com procedimentos
    procedimentos = relationship("ProcedimentoInsumo", back_populates="insumo")
    
    def __repr__(self):
        return f"<Insumo(nome='{self.nome}', tipo='{self.tipo}', unidade='{self.unidade}')>"