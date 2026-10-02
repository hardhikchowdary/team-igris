from __future__ import annotations

from sqlalchemy import Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    current_role: Mapped[str] = mapped_column(String(120))
    department: Mapped[str] = mapped_column(String(120), index=True)
    experience_years: Mapped[float] = mapped_column(Float)
    location: Mapped[str] = mapped_column(String(120))
    availability: Mapped[str] = mapped_column(String(40))
    bio: Mapped[str] = mapped_column(Text)

    skills: Mapped[list[EmployeeSkill]] = relationship(back_populates="employee", cascade="all, delete-orphan")
    project_links: Mapped[list[EmployeeProject]] = relationship(back_populates="employee", cascade="all, delete-orphan")


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"
    __table_args__ = (UniqueConstraint("employee_id", "skill_id", name="uq_employee_skill"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"), index=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), index=True)
    proficiency: Mapped[str] = mapped_column(String(20))

    employee: Mapped[Employee] = relationship(back_populates="skills")
    skill: Mapped[Skill] = relationship(back_populates="employees")