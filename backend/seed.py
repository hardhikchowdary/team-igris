"""Create the local SQLite schema and populate repeatable HRM-03 demo data."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Employee, EmployeeProject, EmployeeSkill, Project, Role, Skill

SKILLS = [
    ("Python", "Programming"),
    ("Java", "Programming"),
    ("SQL", "Data"),
    ("Machine Learning", "Artificial Intelligence"),
    ("Artificial Intelligence", "Artificial Intelligence"),
    ("React", "Frontend"),
    ("FastAPI", "Backend"),
    ("AWS", "Cloud"),
    ("Docker", "Cloud"),
    ("Data Analysis", "Data"),
    ("NLP", "Artificial Intelligence"),
    ("Computer Vision", "Artificial Intelligence"),
]

EMPLOYEES = [
    {
        "name": "Ananya Sharma", "current_role": "ML Engineer", "department": "Applied AI",
        "experience_years": 2.0, "location": "Bengaluru, India", "availability": "Available",
        "bio": "Builds computer vision prototypes and production machine-learning services for retail and people operations.",
        "skills": [("Python", "Advanced"), ("Machine Learning", "Advanced"), ("SQL", "Intermediate"), ("Computer Vision", "Advanced"), ("Artificial Intelligence", "Intermediate"), ("FastAPI", "Intermediate")],
    },
    {
        "name": "Rohan Mehta", "current_role": "Senior Backend Engineer", "department": "Platform",
        "experience_years": 5.0, "location": "Pune, India", "availability": "Partially available",
        "bio": "Designs reliable Python and Java services, API integrations, and containerized platform components.",
        "skills": [("Python", "Advanced"), ("Java", "Advanced"), ("SQL", "Advanced"), ("FastAPI", "Expert"), ("AWS", "Intermediate"), ("Docker", "Advanced")],
    },
    {
        "name": "Meera Iyer", "current_role": "Data Analyst", "department": "Business Intelligence",
        "experience_years": 3.5, "location": "Chennai, India", "availability": "Available",
        "bio": "Turns customer and sales data into clear metrics, decision-ready analysis, and forecast inputs.",
        "skills": [("SQL", "Advanced"), ("Data Analysis", "Expert"), ("Python", "Intermediate"), ("Machine Learning", "Beginner")],
    },
    {
        "name": "Arjun Nair", "current_role": "Full Stack Developer", "department": "Digital Products",
        "experience_years": 4.0, "location": "Hyderabad, India", "availability": "Available",
        "bio": "Ships customer-facing web applications with accessible React interfaces and maintainable service integrations.",
        "skills": [("React", "Advanced"), ("Java", "Intermediate"), ("SQL", "Intermediate"), ("Python", "Intermediate"), ("Docker", "Intermediate")],
    },
    {
        "name": "Fatima Khan", "current_role": "Cloud Engineer", "department": "Infrastructure",
        "experience_years": 6.0, "location": "Mumbai, India", "availability": "Partially available",
        "bio": "Plans cloud foundations, production deployments, and migration work with a focus on secure operations.",
        "skills": [("AWS", "Expert"), ("Docker", "Advanced"), ("Python", "Intermediate"), ("Java", "Intermediate"), ("SQL", "Beginner")],
    },
    {
        "name": "Dev Patel", "current_role": "Data Scientist", "department": "Decision Science",
        "experience_years": 3.0, "location": "Ahmedabad, India", "availability": "Available",
        "bio": "Develops forecasting and language-model prototypes, then validates them against business outcomes.",
        "skills": [("Python", "Advanced"), ("Machine Learning", "Advanced"), ("SQL", "Intermediate"), ("Data Analysis", "Advanced"), ("NLP", "Intermediate"), ("Artificial Intelligence", "Intermediate")],
    },
    {
        "name": "Kavya Menon", "current_role": "Java Software Engineer", "department": "Payments",
        "experience_years": 2.5, "location": "Kochi, India", "availability": "Assigned",
        "bio": "Builds dependable payment services and improves data access patterns across Java applications.",
        "skills": [("Java", "Advanced"), ("SQL", "Intermediate"), ("AWS", "Beginner"), ("Docker", "Intermediate")],
    },
    {
        "name": "Vikram Desai", "current_role": "Frontend Engineer", "department": "Customer Experience",
        "experience_years": 4.5, "location": "Surat, India", "availability": "Available",
        "bio": "Creates polished React experiences and partners with design and computer vision teams on user workflows.",
        "skills": [("React", "Expert"), ("Python", "Beginner"), ("Computer Vision", "Intermediate"), ("Data Analysis", "Beginner")],
    },
    {
        "name": "Priyanka Bose", "current_role": "AI Engineer", "department": "Innovation Lab",
        "experience_years": 5.5, "location": "Kolkata, India", "availability": "Available",
        "bio": "Leads applied AI experiments in document understanding, image analysis, and internal workflow automation.",
        "skills": [("Python", "Expert"), ("Machine Learning", "Expert"), ("Artificial Intelligence", "Expert"), ("NLP", "Advanced"), ("Computer Vision", "Advanced"), ("AWS", "Intermediate")],
    },
    {
        "name": "Aditya Kulkarni", "current_role": "DevOps Engineer", "department": "Cloud Operations",
        "experience_years": 3.5, "location": "Pune, India", "availability": "Partially available",
        "bio": "Automates cloud deployments, container workflows, and service monitoring for product engineering teams.",
        "skills": [("AWS", "Advanced"), ("Docker", "Expert"), ("Python", "Intermediate"), ("Java", "Beginner"), ("SQL", "Beginner")],
    },
]

ROLES = [
    {"title": "AI Engineer", "department": "Applied AI", "minimum_experience": 3.0, "required_skills": ["Python", "Machine Learning", "SQL", "FastAPI", "AWS"]},
    {"title": "ML Engineer", "department": "Applied AI", "minimum_experience": 2.0, "required_skills": ["Python", "Machine Learning", "SQL", "Docker"]},
    {"title": "Full Stack Developer", "department": "Digital Products", "minimum_experience": 3.0, "required_skills": ["React", "Java", "SQL", "Docker"]},
    {"title": "Cloud Engineer", "department": "Infrastructure", "minimum_experience": 4.0, "required_skills": ["AWS", "Docker", "Python", "Java"]},
    {"title": "Data Analyst", "department": "Business Intelligence", "minimum_experience": 2.0, "required_skills": ["SQL", "Data Analysis", "Python", "Machine Learning"]},
]

PROJECTS = [
    {"name": "AI Recruitment Assistant", "description": "Prototype an internal assistant that helps recruiters organize role requirements and candidate evidence.", "department": "People Technology", "status": "In progress", "required_skills": ["Python", "Machine Learning", "FastAPI", "SQL", "NLP"]},
    {"name": "Customer Analytics Platform", "description": "Unify product and customer events into trusted reporting and reusable analytical datasets.", "department": "Business Intelligence", "status": "In progress", "required_skills": ["SQL", "Data Analysis", "Python", "React"]},
    {"name": "Cloud Migration Project", "description": "Move internal services to a managed cloud environment with repeatable container deployments.", "department": "Infrastructure", "status": "Planning", "required_skills": ["AWS", "Docker", "Python", "Java"]},
    {"name": "Computer Vision System", "description": "Build an image classification service and a review interface for quality operations.", "department": "Applied AI", "status": "In progress", "required_skills": ["Python", "Machine Learning", "Computer Vision", "FastAPI"]},
    {"name": "Sales Forecasting Platform", "description": "Combine historical sales and customer signals to improve planning and forecast review.", "department": "Decision Science", "status": "Active", "required_skills": ["Python", "SQL", "Data Analysis", "Machine Learning"]},
    {"name": "Internal HR Automation", "description": "Reduce manual HR operations with integrated web forms, service APIs, and cloud workflows.", "department": "People Technology", "status": "Planning", "required_skills": ["React", "Java", "FastAPI", "AWS", "Docker"]},
]

EMPLOYEE_PROJECTS = [
    ("Ananya Sharma", "AI Recruitment Assistant", "Built the initial document classification prototype and evaluation set."),
    ("Ananya Sharma", "Computer Vision System", "Trained image classification models and exposed inference through an API."),
    ("Rohan Mehta", "AI Recruitment Assistant", "Designed service endpoints and containerized the prototype."),
    ("Rohan Mehta", "Cloud Migration Project", "Reviewed service dependencies and prepared API deployment patterns."),
    ("Rohan Mehta", "Internal HR Automation", "Integrated backend endpoints with internal workflow services."),
    ("Meera Iyer", "Customer Analytics Platform", "Defined customer metrics and validated reporting datasets."),
    ("Meera Iyer", "Sales Forecasting Platform", "Prepared historical sales features and forecast review metrics."),
    ("Arjun Nair", "Customer Analytics Platform", "Built React views for customer metrics and analytics exploration."),
    ("Arjun Nair", "Internal HR Automation", "Implemented responsive internal workflow screens."),
    ("Fatima Khan", "Cloud Migration Project", "Planned secure cloud environments and reviewed migration readiness."),
    ("Dev Patel", "Customer Analytics Platform", "Analyzed customer patterns and contributed reusable data checks."),
    ("Dev Patel", "Sales Forecasting Platform", "Compared forecast models and documented performance trade-offs."),
    ("Kavya Menon", "Internal HR Automation", "Prototyped service integration with existing Java applications."),
    ("Vikram Desai", "Computer Vision System", "Created the image review experience with feedback from operations."),
    ("Priyanka Bose", "AI Recruitment Assistant", "Advised on language processing and evaluation for the assistant."),
    ("Priyanka Bose", "Computer Vision System", "Reviewed model approach and labeling quality for image categories."),
    ("Aditya Kulkarni", "Cloud Migration Project", "Created container build and cloud deployment automation."),
    ("Aditya Kulkarni", "Internal HR Automation", "Prepared cloud deployment templates for the workflow service."),
]


def get_or_create(session: Session, model: type, lookup: dict, values: dict):
    record = session.scalar(select(model).filter_by(**lookup))
    if record is None:
        record = model(**{**values, **lookup})
        session.add(record)
    else:
        for field, value in values.items():
            setattr(record, field, value)
    return record


def seed_database() -> dict[str, int]:
    Base.metadata.create_all(bind=engine)
    with SessionLocal.begin() as session:
        skill_records = {}
        for name, category in SKILLS:
            skill_records[name] = get_or_create(session, Skill, {"name": name}, {"category": category})

        employee_records = {}
        for employee_data in EMPLOYEES:
            values = {key: value for key, value in employee_data.items() if key != "skills"}
            employee_records[employee_data["name"]] = get_or_create(
                session, Employee, {"name": employee_data["name"]}, values
            )

        role_records = {}
        for role_data in ROLES:
            role_records[role_data["title"]] = get_or_create(
                session, Role, {"title": role_data["title"]},
                {key: value for key, value in role_data.items() if key != "title"},
            )

        project_records = {}
        for project_data in PROJECTS:
            project_records[project_data["name"]] = get_or_create(
                session, Project, {"name": project_data["name"]},
                {key: value for key, value in project_data.items() if key != "name"},
            )

        session.flush()

        for employee_data in EMPLOYEES:
            employee = employee_records[employee_data["name"]]
            for skill_name, proficiency in employee_data["skills"]:
                get_or_create(
                    session,
                    EmployeeSkill,
                    {"employee_id": employee.id, "skill_id": skill_records[skill_name].id},
                    {"proficiency": proficiency},
                )

        for employee_name, project_name, contribution in EMPLOYEE_PROJECTS:
            get_or_create(
                session,
                EmployeeProject,
                {"employee_id": employee_records[employee_name].id, "project_id": project_records[project_name].id},
                {"contribution": contribution},
            )

        session.flush()
        counts = {
            "employees": session.scalar(select(func.count()).select_from(Employee)) or 0,
            "skills": session.scalar(select(func.count()).select_from(Skill)) or 0,
            "employee_skills": session.scalar(select(func.count()).select_from(EmployeeSkill)) or 0,
            "roles": session.scalar(select(func.count()).select_from(Role)) or 0,
            "projects": session.scalar(select(func.count()).select_from(Project)) or 0,
            "employee_projects": session.scalar(select(func.count()).select_from(EmployeeProject)) or 0,
        }

    return counts


if __name__ == "__main__":
    seeded_counts = seed_database()
    print(
        "Seed complete: "
        f"{seeded_counts['employees']} employees, {seeded_counts['skills']} skills, "
        f"{seeded_counts['roles']} roles, {seeded_counts['projects']} projects, "
        f"{seeded_counts['employee_skills']} employee skills, "
        f"{seeded_counts['employee_projects']} project assignments."
    )