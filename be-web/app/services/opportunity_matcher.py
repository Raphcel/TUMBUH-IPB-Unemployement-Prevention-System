from dataclasses import dataclass
from collections.abc import Iterable
import re


MATCH_THRESHOLD = 60
MAJOR_MATCH_SCORE = 60
SKILL_MATCH_SCORE = 20
MAX_SKILL_SCORE = 60


@dataclass(frozen=True)
class OpportunityFit:
    student: object
    score: int
    matched_major: str | None
    matched_skills: list[str]

    @property
    def reason(self) -> str:
        parts = []
        if self.matched_major:
            parts.append(f"major: {self.matched_major}")
        if self.matched_skills:
            parts.append(f"skills: {', '.join(self.matched_skills[:3])}")
        return "; ".join(parts)


def normalize_text(value: object) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def normalize_list(values: object) -> list[str]:
    if not isinstance(values, Iterable) or isinstance(values, (str, bytes, dict)):
        return []

    seen = set()
    normalized = []
    for value in values:
        item = normalize_text(value)
        if item and item not in seen:
            seen.add(item)
            normalized.append(item)
    return normalized


def score_opportunity_fit(student: object, opportunity: object) -> OpportunityFit | None:
    target_majors = normalize_list(getattr(opportunity, "target_majors", []))
    skill_tags = normalize_list(getattr(opportunity, "skill_tags", []))
    if not target_majors and not skill_tags:
        return None

    student_major = normalize_text(getattr(student, "major", None))
    student_skills = normalize_list(getattr(student, "skills", []))

    matched_major = student_major if student_major and student_major in target_majors else None
    matched_skills = [skill for skill in student_skills if skill in skill_tags]

    score = 0
    if matched_major:
        score += MAJOR_MATCH_SCORE
    score += min(len(matched_skills) * SKILL_MATCH_SCORE, MAX_SKILL_SCORE)

    if score < MATCH_THRESHOLD:
        return None

    return OpportunityFit(
        student=student,
        score=score,
        matched_major=matched_major,
        matched_skills=matched_skills,
    )


def find_matching_students(
    students: Iterable[object],
    opportunity: object,
    excluded_student_ids: set[int] | None = None,
) -> list[OpportunityFit]:
    excluded = excluded_student_ids or set()
    matches = []
    for student in students:
        if getattr(student, "id", None) in excluded:
            continue
        fit = score_opportunity_fit(student, opportunity)
        if fit:
            matches.append(fit)
    return sorted(matches, key=lambda item: (-item.score, getattr(item.student, "id", 0)))
