from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Employee, EmployeeProject, EmployeeSkill, Project, Role, Skill

router = APIRouter(tags=["catalog"])


@router.get("/employees")
def get_employees(session: Session = Depends(get_db)) -> dict[str, list[dict[str, Any]]]:
    employees = session.scalars(
        select(Employee)
        .options(
            selectinload(Employee.skills).selectinload(EmployeeSkill.skill),
            selectinload(Employee.project_links).selectinload(EmployeeProject.project),
        )
        .order_by(Employee.name)
    ).all()
    return {
        "employees": [
            {
                "id": employee.id,
                "name": employee.name,
                "current_role": employee.current_role,
                "department": employee.department,
                "experience_years": employee.experience_years,
                "location": employee.location,
                "availability": employee.availability,
                "bio": employee.bio,
                "skills": [
                    {
                        "name": link.skill.name,
                        "category": link.skill.category,
                        "proficiency": link.proficiency,
                    }
                    for link in employee.skills
                ],
                "projects": [
                    {
                        "id": link.project.id,
                        "name": link.project.name,
                        "contribution": link.contribution,
                    }
                    for link in employee.project_links
                ],
            }
            for employee in employees
        ]
    }


@router.get("/skills")
def get_skills(session: Session = Depends(get_db)) -> dict[str, list[dict[str, Any]]]:
    skills = session.scalars(select(Skill).order_by(Skill.name)).all()
    return {"skills": [{"id": skill.id, "name": skill.name, "category": skill.category} for skill in skills]}


@router.get("/roles")
def get_roles(session: Session = Depends(get_db)) -> dict[str, list[dict[str, Any]]]:
    roles = session.scalars(select(Role).order_by(Role.title)).all()
    return {
        "roles": [
            {
                "id": role.id,
                "title": role.title,
                "department": role.department,
                "minimum_experience": role.minimum_experience,
                "required_skills": role.required_skills,
            }
            for role in roles
        ]
    }


@router.get("/projects")
def get_projects(session: Session = Depends(get_db)) -> dict[str, list[dict[str, Any]]]:
    projects = session.scalars(
        select(Project)
        .options(selectinload(Project.employee_links).selectinload(EmployeeProject.employee))
        .order_by(Project.name)
    ).all()
    return {
        "projects": [
            {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "department": project.department,
                "status": project.status,
                "required_skills": project.required_skills,
                "employees": [
                    {
                        "id": link.employee.id,
                        "name": link.employee.name,
                        "contribution": link.contribution,
                    }
                    for link in project.employee_links
                ],
            }
            for project in projects
        ]
    }