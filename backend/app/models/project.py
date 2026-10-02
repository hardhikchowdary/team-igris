from __future__ import annotations

from sqlalchemy import JSON, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    department: Mapped[str] = mapped_column(String(120), index=True)
    status: Mapped[str] = mapped_column(String(40))
    required_skills: Mapped[list[str]] = mapped_column(JSON)

    employee_links: Mapped[list[EmployeeProject]] = relationship(back_populates="project", cascade="all, delete-orphan")


class EmployeeProject(Base):
    __tablename__ = "employee_projects"
    __table_args__ = (UniqueConstraint("employee_id", "project_id", name="uq_employee_project"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True)
    contribution: Mapped[str] = mapped_column(Text)

    employee: Mapped[Employee] = relationship(back_populates="project_links")
    project: Mapped[Project] = relationship(back_populates="employee_links")