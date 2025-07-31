from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship
from ..core.database import Base
from .base import TimestampMixin


class Empresa(Base, TimestampMixin):
    __tablename__ = "empresas"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False, index=True)
    razao_social = Column(String(255), nullable=True)
    cnpj = Column(String(18), nullable=True, unique=True)
    email = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    endereco = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamentos
    usuarios = relationship("User", secondary="usuario_empresas", back_populates="empresas")
    procedimentos = relationship("Procedimento", back_populates="empresa")
    
    def __repr__(self):
        return f"<Empresa(nome='{self.nome}', cnpj='{self.cnpj}')>"