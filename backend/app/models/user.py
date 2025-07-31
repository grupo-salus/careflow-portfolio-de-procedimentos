from sqlalchemy import Column, Integer, String, Boolean, Enum
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base
from .base import TimestampMixin


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    COMUM = "comum"


class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.COMUM, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    # Campos de timestamp herdados do TimestampMixin
    
    # Relacionamentos
    empresas = relationship("Empresa", secondary="usuario_empresas", back_populates="usuarios")
    modulos = relationship("Modulo", secondary="usuario_modulos", back_populates="usuarios")
    
    def __repr__(self):
        return f"<User(email='{self.email}', full_name='{self.full_name}', role='{self.role}')>"
    
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN