from pydantic import BaseModel, Field


class TalentSearchRequest(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    skills: list[str] = Field(default_factory=list)
    minimum_experience: float = Field(default=0, ge=0, le=60)


class SkillEvidence(BaseModel):
    name: str
    proficiency: str


class ProjectEvidence(BaseModel):
    name: str
    contribution: str


class ScoreBreakdown(BaseModel):
    skills: int
    proficiency: int
    experience: int
    projects: int


class TalentCandidate(BaseModel):
    employee_id: int
    name: str
    current_role: str
    department: str
    experience_years: float
    location: str
    availability: str
    bio: str
    match_percentage: int
    matched_skills: list[SkillEvidence]
    missing_skills: list[str]
    relevant_projects: list[str]
    skills: list[SkillEvidence]
    projects: list[ProjectEvidence]
    score_breakdown: ScoreBreakdown
    explanation: str


class TalentSearchResponse(BaseModel):
    role: str
    required_skills: list[str]
    candidates: list[TalentCandidate]