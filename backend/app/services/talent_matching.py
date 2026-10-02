from __future__ import annotations

from collections.abc import Sequence

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Employee, EmployeeProject, EmployeeSkill, Project, Role, Skill
from app.schemas.talent import (
    ProjectEvidence,
    ScoreBreakdown,
    SkillEvidence,
    TalentCandidate,
    TalentSearchRequest,
    TalentSearchResponse,
)

PROFICIENCY_LEVELS = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4}
WEIGHTS = {"skills": 50, "proficiency": 20, "experience": 15, "projects": 15}


def _join_words(values: Sequence[str]) -> str:
    if len(values) < 2:
        return values[0] if values else ""
    if len(values) == 2:
        return f"{values[0]} and {values[1]}"
    return f"{', '.join(values[:-1])}, and {values[-1]}"


def _round_score(value: float) -> int:
    return int(value + 0.5)


def _candidate_explanation(
    matched: list[SkillEvidence],
    relevant_projects: list[ProjectEvidence],
    match_percentage: int,
) -> str:
    skill_phrase = _join_words([f"{skill.proficiency.lower()} {skill.name}" for skill in matched])
    project_count = len(relevant_projects)
    project_phrase = f"{project_count} relevant project" + ("s" if project_count != 1 else "")
    strength = "Strong match" if match_percentage >= 80 else "Good match" if match_percentage >= 60 else "Potential match"
    if not matched:
        return f"{strength} because the candidate contributed to {project_phrase} aligned with the role."
    return f"{strength} because the candidate demonstrates {skill_phrase} and contributed to {project_phrase}."


def search_talent(payload: TalentSearchRequest, session: Session) -> TalentSearchResponse:
    role = session.scalar(select(Role).where(Role.title.ilike(payload.role.strip())))
    if role is None:
        raise HTTPException(status_code=404, detail=f"Role '{payload.role}' was not found.")

    all_skills = session.scalars(select(Skill)).all()
    skills_by_name = {skill.name.casefold(): skill.name for skill in all_skills}
    selected_skills = []
    unknown_skills = []
    for name in payload.skills:
        canonical = skills_by_name.get(name.strip().casefold())
        if canonical is None:
            unknown_skills.append(name)
        elif canonical not in selected_skills:
            selected_skills.append(canonical)
    if unknown_skills:
        raise HTTPException(status_code=422, detail=f"Unknown skills: {', '.join(unknown_skills)}")

    required_skills = list(dict.fromkeys([*role.required_skills, *selected_skills]))
    required_names = {name.casefold() for name in required_skills}
    role_experience_target = max(role.minimum_experience, payload.minimum_experience, 1)
    employees = session.scalars(
        select(Employee)
        .options(
            selectinload(Employee.skills).selectinload(EmployeeSkill.skill),
            selectinload(Employee.project_links).selectinload(EmployeeProject.project),
        )
        .where(Employee.experience_years >= payload.minimum_experience)
    ).all()

    candidates = []
    for employee in employees:
        employee_skills = {link.skill.name.casefold(): link.proficiency for link in employee.skills}
        matched = [
            SkillEvidence(name=name, proficiency=employee_skills[name.casefold()])
            for name in required_skills
            if name.casefold() in employee_skills
        ]
        matched_names = {skill.name.casefold() for skill in matched}
        missing = [name for name in required_skills if name.casefold() not in matched_names]

        relevant_project_records = [
            link.project
            for link in employee.project_links
            if required_names.intersection(name.casefold() for name in link.project.required_skills)
        ]
        relevant_projects = [
            ProjectEvidence(name=project.name, contribution=next(
                link.contribution for link in employee.project_links if link.project_id == project.id
            ))
            for project in relevant_project_records
        ]

        if not matched and not relevant_projects:
            continue

        skill_score = WEIGHTS["skills"] * len(matched) / len(required_skills)
        average_proficiency = (
            sum(PROFICIENCY_LEVELS.get(skill.proficiency, 1) for skill in matched) / len(matched)
            if matched else 0
        )
        proficiency_score = WEIGHTS["proficiency"] * average_proficiency / 4
        experience_score = WEIGHTS["experience"] * min(employee.experience_years / role_experience_target, 1)
        project_score = WEIGHTS["projects"] * min(len(relevant_projects) / 2, 1)
        score_breakdown = ScoreBreakdown(
            skills=_round_score(skill_score),
            proficiency=_round_score(proficiency_score),
            experience=_round_score(experience_score),
            projects=_round_score(project_score),
        )
        match_percentage = sum(score_breakdown.model_dump().values())

        candidates.append(TalentCandidate(
            employee_id=employee.id,
            name=employee.name,
            current_role=employee.current_role,
            department=employee.department,
            experience_years=employee.experience_years,
            location=employee.location,
            availability=employee.availability,
            bio=employee.bio,
            match_percentage=match_percentage,
            matched_skills=matched,
            missing_skills=missing,
            relevant_projects=[project.name for project in relevant_projects],
            skills=[SkillEvidence(name=link.skill.name, proficiency=link.proficiency) for link in employee.skills],
            projects=[ProjectEvidence(name=link.project.name, contribution=link.contribution) for link in employee.project_links],
            score_breakdown=score_breakdown,
            explanation=_candidate_explanation(matched, relevant_projects, match_percentage),
        ))

    candidates.sort(key=lambda candidate: (-candidate.match_percentage, -candidate.experience_years, candidate.name))
    return TalentSearchResponse(role=role.title, required_skills=required_skills, candidates=candidates)