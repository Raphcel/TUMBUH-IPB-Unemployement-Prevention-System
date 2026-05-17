import unittest
from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.dependencies import get_current_user, get_db
from app.main import app as fastapi_app
import app.domain.models  # noqa: F401
from app.config.database import Base
from app.domain.models.application import Application, ApplicationStatus
from app.domain.models.company import Company
from app.domain.models.company_follow import CompanyFollow
from app.domain.models.opportunity import Opportunity, OpportunityType
from app.domain.models.user import User, UserRole
from app.repositories.application_repository import ApplicationRepository
from app.repositories.company_follow_repository import CompanyFollowRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.opportunity_repository import OpportunityRepository
from app.repositories.user_repository import UserRepository
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate
from app.schemas.opportunity import OpportunityCreate
from app.schemas.user import UserCreate
from app.services.application_service import ApplicationService
from app.services.auth_service import AuthService
from app.services.company_follow_service import CompanyFollowService
from app.services.notification_service import NotificationService
from app.services.opportunity_matcher import score_opportunity_fit
from app.services.opportunity_service import OpportunityService


class OpportunityMatcherTests(unittest.TestCase):
    def _student(self, major=None, skills=None):
        return User(
            id=1,
            email="match@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Match",
            last_name="Student",
            role=UserRole.STUDENT,
            major=major,
            skills=skills or [],
        )

    def _opportunity(self, target_majors=None, skill_tags=None):
        return Opportunity(
            id=1,
            title="Fit Role",
            company_id=1,
            type=OpportunityType.INTERNSHIP,
            location="Bogor",
            target_majors=target_majors or [],
            skill_tags=skill_tags or [],
        )

    def test_major_match_qualifies(self):
        fit = score_opportunity_fit(
            self._student(major="Computer Science"),
            self._opportunity(target_majors=["computer science"]),
        )

        self.assertIsNotNone(fit)
        self.assertEqual(fit.score, 60)
        self.assertEqual(fit.matched_major, "computer science")

    def test_three_skill_matches_qualify(self):
        fit = score_opportunity_fit(
            self._student(skills=["Python", "React", "SQL", "Writing"]),
            self._opportunity(skill_tags=["python", "react", "sql"]),
        )

        self.assertIsNotNone(fit)
        self.assertEqual(fit.score, 60)
        self.assertEqual(fit.matched_skills, ["python", "react", "sql"])

    def test_two_skill_matches_do_not_qualify(self):
        fit = score_opportunity_fit(
            self._student(skills=["Python", "React"]),
            self._opportunity(skill_tags=["python", "react", "sql"]),
        )

        self.assertIsNone(fit)

    def test_empty_targeting_fields_do_not_match(self):
        fit = score_opportunity_fit(
            self._student(major="Computer Science", skills=["Python", "React", "SQL"]),
            self._opportunity(),
        )

        self.assertIsNone(fit)


class NotificationWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.db = self.SessionLocal()

        self.audit_patchers = [
            patch("app.services.application_service.audit_log"),
            patch("app.services.opportunity_service.audit_log"),
            patch("app.services.auth_service.audit_log"),
        ]
        for patcher in self.audit_patchers:
            patcher.start()

        self._seed_base_data()
        self.user_repo = UserRepository(self.db)
        self.opportunity_repo = OpportunityRepository(self.db)
        self.application_repo = ApplicationRepository(self.db)
        self.notification_repo = NotificationRepository(self.db)
        self.company_follow_repo = CompanyFollowRepository(self.db)

    def tearDown(self):
        fastapi_app.dependency_overrides.clear()
        for patcher in self.audit_patchers:
            patcher.stop()
        self.db.close()
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def _seed_base_data(self):
        company = Company(
            id=1,
            name="Tumbuh Labs",
            industry="Technology",
            location="Bogor",
        )
        student = User(
            id=1,
            email="student@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Student",
            last_name="One",
            role=UserRole.STUDENT,
            major="Computer Science",
            skills=["Python", "React", "SQL"],
            is_active=True,
        )
        inactive_student = User(
            id=2,
            email="inactive@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Inactive",
            last_name="Student",
            role=UserRole.STUDENT,
            major="Computer Science",
            skills=["Python", "React", "SQL"],
            is_active=False,
        )
        hr = User(
            id=3,
            email="hr@tumbuh.test",
            hashed_password="x",
            first_name="HR",
            last_name="One",
            role=UserRole.HR,
            company_id=1,
            is_active=True,
        )
        opportunity = Opportunity(
            id=1,
            title="Frontend Intern",
            company_id=1,
            type=OpportunityType.INTERNSHIP,
            location="Bogor",
            is_active=True,
            posted_at=datetime.now(timezone.utc),
        )

        self.db.add_all([company, student, inactive_student, hr, opportunity])
        self.db.commit()

    def _application_service(self):
        return ApplicationService(
            self.application_repo,
            self.opportunity_repo,
            self.notification_repo,
            self.user_repo,
        )

    def _opportunity_service(self):
        return OpportunityService(
            self.opportunity_repo,
            self.application_repo,
            self.notification_repo,
            self.user_repo,
            self.company_follow_repo,
        )

    def _auth_service(self):
        return AuthService(
            self.user_repo,
            self.notification_repo,
        )

    def _company_follow_service(self):
        return CompanyFollowService(
            self.company_follow_repo,
            CompanyRepository(self.db),
        )

    def _client_for_user(self, user_id: int):
        def override_get_db():
            try:
                yield self.db
            finally:
                pass

        def override_get_current_user():
            return self.user_repo.get_by_id(user_id)

        fastapi_app.dependency_overrides[get_db] = override_get_db
        fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
        return TestClient(fastapi_app)

    def test_student_application_notifies_company_hr(self):
        result = self._application_service().apply(
            student_id=1,
            data=ApplicationCreate(opportunity_id=1, cover_letter="I am interested."),
        )

        notifications = self.notification_repo.get_by_user(3)
        self.assertEqual(result.cover_letter, "I am interested.")
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].title, "New applicants for Frontend Intern")
        self.assertIn("1 new application for Frontend Intern", notifications[0].message)
        self.assertFalse(notifications[0].is_read)

    def test_student_can_follow_unfollow_company_without_duplicates(self):
        service = self._company_follow_service()

        first = service.follow_company(1, 1)
        second = service.follow_company(1, 1)

        self.assertEqual(first.company_id, 1)
        self.assertEqual(second.id, first.id)
        self.assertTrue(service.is_following(1, 1))
        self.assertEqual(service.followed_company_ids(1), [1])
        self.assertEqual(service.list_followed_companies(1).total, 1)

        service.unfollow_company(1, 1)
        self.assertFalse(service.is_following(1, 1))

    def test_company_follow_endpoint_is_student_only(self):
        hr_client = self._client_for_user(3)
        response = hr_client.post("/api/v1/company-follows/1")
        self.assertEqual(response.status_code, 403)

        student_client = self._client_for_user(1)
        response = student_client.post("/api/v1/company-follows/1")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["company_id"], 1)

    def test_student_application_rolls_up_hr_notification_same_day(self):
        second_student = User(
            id=4,
            email="student2@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Student",
            last_name="Two",
            role=UserRole.STUDENT,
            is_active=True,
        )
        self.db.add(second_student)
        self.db.commit()

        service = self._application_service()
        service.apply(student_id=1, data=ApplicationCreate(opportunity_id=1))
        service.apply(student_id=4, data=ApplicationCreate(opportunity_id=1))

        notifications = self.notification_repo.get_by_user(3)
        self.assertEqual(len(notifications), 1)
        self.assertIn("2 new applications for Frontend Intern", notifications[0].message)
        self.assertIn("Latest applicant: Student Two", notifications[0].message)

    def test_status_update_notifies_student(self):
        application = Application(
            student_id=1,
            opportunity_id=1,
            status=ApplicationStatus.APPLIED,
        )
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)

        self._application_service().update_status(
            application.id,
            ApplicationStatusUpdate(status=ApplicationStatus.INTERVIEW),
            company_id=1,
        )

        notifications = self.notification_repo.get_by_user(1)
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].title, "Application status updated")
        self.assertIn("Frontend Intern", notifications[0].message)
        self.assertIn("Interview", notifications[0].message)

    def test_new_active_opportunity_notifies_matching_active_students_only(self):
        non_matching_student = User(
            id=4,
            email="nonmatch@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Nonmatch",
            last_name="Student",
            role=UserRole.STUDENT,
            major="Agribusiness",
            skills=["Marketing"],
            is_active=True,
        )
        self.db.add(non_matching_student)
        self.db.commit()

        created = self._opportunity_service().create_opportunity(
            OpportunityCreate(
                title="Data Intern",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                target_majors=["Computer Science"],
                is_active=True,
            )
        )

        active_student_notifications = self.notification_repo.get_by_user(1)
        inactive_student_notifications = self.notification_repo.get_by_user(2)
        non_matching_student_notifications = self.notification_repo.get_by_user(4)
        self.assertEqual(created.title, "Data Intern")
        self.assertEqual(len(active_student_notifications), 1)
        self.assertEqual(active_student_notifications[0].title, "Recommended opportunities for you")
        self.assertIn("1 new opportunity matches your profile", active_student_notifications[0].message)
        self.assertEqual(active_student_notifications[0].action_label, "View latest match")
        self.assertEqual(active_student_notifications[0].action_url, f"/lowongan/{created.id}")
        self.assertEqual(len(inactive_student_notifications), 0)
        self.assertEqual(len(non_matching_student_notifications), 0)

    def test_followed_company_opportunity_notifies_matching_major_follower_only(self):
        non_matching_follower = User(
            id=4,
            email="agri@apps.ipb.ac.id",
            hashed_password="x",
            first_name="Agri",
            last_name="Student",
            role=UserRole.STUDENT,
            major="Agribusiness",
            skills=["Marketing"],
            is_active=True,
        )
        self.db.add_all([
            non_matching_follower,
            CompanyFollow(student_id=1, company_id=1),
            CompanyFollow(student_id=4, company_id=1),
        ])
        self.db.commit()

        created = self._opportunity_service().create_opportunity(
            OpportunityCreate(
                title="Major Match Role",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                target_majors=["Computer Science"],
                skill_tags=["Python"],
                is_active=True,
            )
        )

        matching_notifications = self.notification_repo.get_by_user(1)
        non_matching_notifications = self.notification_repo.get_by_user(4)
        self.assertEqual(len(matching_notifications), 1)
        self.assertEqual(matching_notifications[0].title, "New opportunity from Tumbuh Labs")
        self.assertIn("matches your major", matching_notifications[0].message)
        self.assertEqual(matching_notifications[0].action_url, f"/lowongan/{created.id}")
        self.assertEqual(len(non_matching_notifications), 0)

    def test_followed_company_notification_suppresses_duplicate_fit_digest(self):
        self.db.add(CompanyFollow(student_id=1, company_id=1))
        self.db.commit()

        self._opportunity_service().create_opportunity(
            OpportunityCreate(
                title="Followed Fit Role",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                target_majors=["Computer Science"],
                skill_tags=["Python", "React", "SQL"],
                is_active=True,
            )
        )

        notifications = self.notification_repo.get_by_user(1)
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].title, "New opportunity from Tumbuh Labs")

    def test_followed_company_skips_already_applied_student(self):
        opportunity = Opportunity(
            id=2,
            title="Already Applied Role",
            company_id=1,
            type=OpportunityType.INTERNSHIP,
            location="Bogor",
            target_majors=["Computer Science"],
            is_active=True,
        )
        self.db.add_all([
            CompanyFollow(student_id=1, company_id=1),
            opportunity,
            Application(student_id=1, opportunity_id=2, status=ApplicationStatus.APPLIED),
        ])
        self.db.commit()

        service = self._opportunity_service()
        service._notify_students_new_opportunity(self.opportunity_repo.get_by_id_with_company(2))

        self.assertEqual(len(self.notification_repo.get_by_user(1)), 0)

    def test_matching_opportunities_roll_up_student_digest_same_day(self):
        service = self._opportunity_service()
        first = service.create_opportunity(
            OpportunityCreate(
                title="Backend Intern",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                target_majors=["Computer Science"],
                skill_tags=["Python"],
                is_active=True,
            )
        )
        second = service.create_opportunity(
            OpportunityCreate(
                title="Frontend Intern",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                skill_tags=["Python", "React", "SQL"],
                is_active=True,
            )
        )

        notifications = self.notification_repo.get_by_user(1)
        self.assertEqual(len(notifications), 1)
        self.assertIn("2 new opportunities match your profile today", notifications[0].message)
        self.assertIn("Latest: Frontend Intern", notifications[0].message)
        self.assertEqual(notifications[0].action_url, f"/lowongan/{second.id}")
        self.assertNotEqual(first.id, second.id)

    def test_unmatched_active_opportunity_creates_no_student_notifications(self):
        self._opportunity_service().create_opportunity(
            OpportunityCreate(
                title="Agribusiness Intern",
                company_id=1,
                type=OpportunityType.INTERNSHIP,
                location="Bogor",
                target_majors=["Agribusiness"],
                skill_tags=["Marketing"],
                is_active=True,
            )
        )

        self.assertEqual(len(self.notification_repo.get_by_user(1)), 0)

    def test_company_opportunity_list_tolerates_malformed_requirements_json(self):
        malformed = Opportunity(
            id=9,
            title="Malformed Requirements Role",
            company_id=1,
            type=OpportunityType.INTERNSHIP,
            location="Bogor",
            requirements="{}",
            is_active=True,
        )
        self.db.add(malformed)
        self.db.commit()

        result = self._opportunity_service().get_by_company(1)
        item = next(opp for opp in result.items if opp.id == 9)
        self.assertEqual(item.requirements, [])

    def test_notification_service_marks_read_state(self):
        service = NotificationService(self.notification_repo)
        first = service.create_notification(1, "First", "Message", "info")
        second = service.create_notification(1, "Second", "Message", "warning")

        service.mark_as_read(1, first.id)
        list_result = service.get_user_notifications(1)
        self.assertEqual(list_result.total, 2)
        self.assertEqual(list_result.unread_count, 1)

        mark_all_result = service.mark_all_read(1)
        list_result = service.get_user_notifications(1)
        self.assertEqual(mark_all_result["message"], "Marked 1 notifications as read")
        self.assertEqual(list_result.unread_count, 0)
        self.assertEqual({item.id for item in list_result.items}, {first.id, second.id})

    def test_student_registration_creates_onboarding_notification(self):
        result = self._auth_service().register(
            UserCreate(
                email="new.student@apps.ipb.ac.id",
                password="password123",
                first_name="New",
                last_name="Student",
                role=UserRole.STUDENT,
            )
        )

        notifications = self.notification_repo.get_by_user(result.user.id)
        self.assertEqual(len(notifications), 1)
        self.assertEqual(notifications[0].title, "Welcome to TUMBUH")
        self.assertIn("Complete your profile", notifications[0].message)
        self.assertEqual(notifications[0].action_label, "Open profile")
        self.assertEqual(notifications[0].action_url, "/student/profile")


if __name__ == "__main__":
    unittest.main()
