from sqlalchemy import Column, Integer, String, Boolean, Text, Enum, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base
from .base import TimestampMixin


class ProcedimentoCategoria(str, enum.Enum):
    FINANCEIRO = "financeiro"
    COMERCIAL = "comercial"
    ESTETICO = "estetico"
    DERMATOLOGICO = "dermatologico"
    OUTROS = "outros"


class Procedimento(Base, TimestampMixin):
    __tablename__ = "procedimentos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    descricao = Column(Text, nullable=True)
    categoria = Column(Enum(ProcedimentoCategoria), nullable=False, index=True)
    tipo = Column(String(100), nullable=True, index=True)  # Campo livre para classificação
    preco_base = Column(DECIMAL(10, 2), nullable=True)  # Preço sugerido
    tempo_estimado = Column(Integer, nullable=True)  # Tempo em minutos
    imagem_url = Column(String(500), nullable=True)
    observacoes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamento obrigatório com empresa
    empresa_id = Column(Integer, ForeignKey('empresas.id'), nullable=False, index=True)
    empresa = relationship("Empresa", back_populates="procedimentos")
    
    # Relacionamento com insumos
    insumos = relationship("ProcedimentoInsumo", back_populates="procedimento")
    
    def __repr__(self):
        return f"<Procedimento(nome='{self.nome}', categoria='{self.categoria}', empresa_id={self.empresa_id})>"