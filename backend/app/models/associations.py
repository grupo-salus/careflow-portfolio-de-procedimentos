"""
Tabelas de associação (many-to-many) e relacionamentos complexos
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, DECIMAL, Table, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin
from ..core.timezone_utils import now_with_timezone


# Tabela de associação: usuário <-> empresas (many-to-many)
usuario_empresas = Table(
    'usuario_empresas',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), nullable=False),
    Column('empresa_id', Integer, ForeignKey('empresas.id'), nullable=False),
    Column('is_admin_empresa', Boolean, default=False),  # Se é admin desta empresa específica
    Column('created_at', DateTime(timezone=True), default=now_with_timezone, server_default=func.now()),
    # Índice único para evitar duplicatas
    schema=None
)

# Tabela de associação: usuário <-> módulos (many-to-many)
usuario_modulos = Table(
    'usuario_modulos',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('users.id'), nullable=False),
    Column('modulo_id', Integer, ForeignKey('modulos.id'), nullable=False),
    Column('created_at', DateTime(timezone=True), default=now_with_timezone, server_default=func.now()),
    # Índice único para evitar duplicatas
    schema=None
)


# Tabela de relacionamento: procedimento <-> insumos (com informações adicionais)
class ProcedimentoInsumo(Base, TimestampMixin):
    __tablename__ = "procedimento_insumos"
    
    id = Column(Integer, primary_key=True, index=True)
    procedimento_id = Column(Integer, ForeignKey('procedimentos.id'), nullable=False)
    insumo_id = Column(Integer, ForeignKey('insumos.id'), nullable=False)
    quantidade = Column(DECIMAL(10, 3), nullable=False, default=1.0)  # Quantidade usada
    custo_unitario = Column(DECIMAL(10, 2), nullable=True)  # Custo específico para este uso
    observacoes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamentos
    procedimento = relationship("Procedimento", back_populates="insumos")
    insumo = relationship("Insumo", back_populates="procedimentos")
    
    def __repr__(self):
        return f"<ProcedimentoInsumo(procedimento_id={self.procedimento_id}, insumo_id={self.insumo_id}, qtd={self.quantidade})>"
    
    @property
    def custo_total(self):
        """Calcula o custo total (quantidade × custo unitário)"""
        if self.custo_unitario and self.quantidade:
            return float(self.quantidade) * float(self.custo_unitario)
        return 0.0