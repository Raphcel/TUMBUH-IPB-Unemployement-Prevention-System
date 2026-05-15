"""
Seed script — populates the database with realistic mock data
matching the frontend mockData.js for the IPB Career Tracker platform.

Usage:
    cd be-web
    .\\myenv\\Scripts\\activate
    python -m scripts.seed
"""

import json
import sys
import os
from datetime import datetime

# Ensure project root is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt

from sqlalchemy.orm import Session

from app.config.database import SessionLocal
from app.domain.models.user import User, UserRole
from app.domain.models.company import Company
from app.domain.models.opportunity import Opportunity, OpportunityType
from app.domain.models.application import Application, ApplicationStatus
from app.domain.models.bookmark import Bookmark
from app.domain.models.externship import Externship, ExternshipStatus, ExternshipType

def hash_pw(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed():
    db: Session = SessionLocal()

    try:
        # ── Clear existing data (in dependency order) ────────────
        db.query(Bookmark).delete()
        db.query(Externship).delete()
        db.query(Application).delete()
        db.query(Opportunity).delete()
        db.query(User).delete()
        db.query(Company).delete()
        db.commit()
        print("✓ Cleared existing data")

        # ── Companies ────────────────────────────────────────────
        companies = [
            Company(
                id=101,
                name="Tokopedia",
                industry="E-Commerce",
                location="Jakarta Selatan",
                logo="https://upload.wikimedia.org/wikipedia/commons/a/a7/Tokopedia.svg",
                description="Tokopedia is an Indonesian technology company specializing in e-commerce. "
                            "Founded in 2009, Tokopedia has transformed the way Indonesians shop online.",
                website="https://www.tokopedia.com",
                rating=4.8,
                employee_count=5000,
                founded_year=2009,
                linkedin_url="https://linkedin.com/company/tokopedia",
                instagram_url="https://instagram.com/tokopedia",
                tagline="Mulai Aja Dulu",
            ),
            Company(
                id=102,
                name="Gojek",
                industry="Technology",
                location="Jakarta Selatan",
                logo="https://upload.wikimedia.org/wikipedia/commons/8/86/Gojek_logo_2019.svg",
                description="Gojek is a Super App. It's one app for ordering food, commuting, "
                            "digital payments, shopping, hyper-local delivery, and dozen other products.",
                website="https://www.gojek.com",
                rating=4.7,
                employee_count=3000,
                founded_year=2010,
                linkedin_url="https://linkedin.com/company/gojek",
                instagram_url="https://instagram.com/gojekindonesia",
                tagline="Pasti Ada Jalan",
            ),
            Company(
                id=103,
                name="Bank Indonesia",
                industry="Finance",
                location="Jakarta Pusat",
                logo="https://upload.wikimedia.org/wikipedia/commons/c/c4/Bank_Indonesia_logo.svg",
                description="Bank Indonesia is the central bank of the Republic of Indonesia. "
                            "It is an independent state institution responsible for monetary policy.",
                website="https://www.bi.go.id",
                rating=4.9,
                employee_count=6500,
                founded_year=1953,
                linkedin_url="https://linkedin.com/company/bank-indonesia",
                instagram_url="https://instagram.com/bank_indonesia",
                tagline="Menjaga Stabilitas, Mendorong Pertumbuhan",
            ),
            Company(
                id=104,
                name="Bukalapak",
                industry="E-Commerce",
                location="Jakarta Selatan",
                logo="https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Bukalapak.svg",
                description="Bukalapak is one of the largest e-commerce platforms in Indonesia, "
                            "empowering MSMEs across the country.",
                website="https://www.bukalapak.com",
                rating=4.5,
                employee_count=2500,
                founded_year=2010,
                linkedin_url="https://linkedin.com/company/bukalapak",
                instagram_url="https://instagram.com/bukalapak",
                tagline="Jual Beli Online Mudah & Terpercaya",
            ),
            Company(
                id=105,
                name="Telkom Indonesia",
                industry="Telecommunications",
                location="Bandung",
                logo="https://upload.wikimedia.org/wikipedia/commons/b/b1/Telkom_Indonesia_2013.svg",
                description="Telkom Indonesia is the largest telecommunications and network provider in Indonesia.",
                website="https://www.telkom.co.id",
                rating=4.6,
                employee_count=25000,
                founded_year=1965,
                linkedin_url="https://linkedin.com/company/telkom-indonesia",
                instagram_url="https://instagram.com/telaborasi",
                tagline="The World in Your Hand",
            ),
        ]
        db.add_all(companies)
        db.flush()
        print(f"✓ Seeded {len(companies)} companies")

        # ── Users ────────────────────────────────────────────────
        default_pw = hash_pw("password123")

        users = [
            # Students
            User(
                id=1,
                email="budi.santoso@apps.ipb.ac.id",
                hashed_password=default_pw,
                first_name="Budi",
                last_name="Santoso",
                role=UserRole.STUDENT,
                avatar="https://ui-avatars.com/api/?name=Budi+Santoso&background=10B981&color=fff",
                phone="081234567890",
                bio="Mahasiswa Ilmu Komputer semester 8, passionate about software engineering and AI.",
                nim="G6401201001",
                major="Ilmu Komputer",
                university="IPB University",
                gpa=3.85,
                cv_url=None,
                is_active=True,
            ),
            User(
                id=3,
                email="dewi.lestari@apps.ipb.ac.id",
                hashed_password=default_pw,
                first_name="Dewi",
                last_name="Lestari",
                role=UserRole.STUDENT,
                avatar="https://ui-avatars.com/api/?name=Dewi+Lestari&background=8B5CF6&color=fff",
                phone="081298765432",
                bio="Statistika IPB, data enthusiast with experience in machine learning projects.",
                nim="G1501211045",
                major="Statistika dan Sains Data",
                university="IPB University",
                gpa=3.72,
                is_active=True,
            ),
            User(
                id=4,
                email="andi.pratama@apps.ipb.ac.id",
                hashed_password=default_pw,
                first_name="Andi",
                last_name="Pratama",
                role=UserRole.STUDENT,
                avatar="https://ui-avatars.com/api/?name=Andi+Pratama&background=F59E0B&color=fff",
                phone="082112345678",
                bio="Teknik Komputer IPB, interested in embedded systems and IoT.",
                nim="J0310201021",
                major="Teknik Komputer",
                university="IPB University",
                gpa=3.60,
                is_active=True,
            ),
            # HR Users
            User(
                id=2,
                email="hr@tokopedia.com",
                hashed_password=default_pw,
                first_name="Siti",
                last_name="Aminah",
                role=UserRole.HR,
                avatar="https://ui-avatars.com/api/?name=Siti+Aminah&background=3B82F6&color=fff",
                company_id=101,
                is_active=True,
            ),
            User(
                id=5,
                email="hr@gojek.com",
                hashed_password=default_pw,
                first_name="Rina",
                last_name="Wulandari",
                role=UserRole.HR,
                avatar="https://ui-avatars.com/api/?name=Rina+Wulandari&background=00AA13&color=fff",
                company_id=102,
                is_active=True,
            ),
            User(
                id=6,
                email="hr@bi.go.id",
                hashed_password=default_pw,
                first_name="Ahmad",
                last_name="Fauzi",
                role=UserRole.HR,
                avatar="https://ui-avatars.com/api/?name=Ahmad+Fauzi&background=003D79&color=fff",
                company_id=103,
                is_active=True,
            ),
            # Admin User
            User(
                id=100,
                email="admin@tumbuh.id",
                hashed_password=default_pw,
                first_name="Admin",
                last_name="Tumbuh",
                role=UserRole.ADMIN,
                avatar="https://ui-avatars.com/api/?name=Admin+Tumbuh&background=DC2626&color=fff",
                is_active=True,
            ),
        ]
        db.add_all(users)
        db.flush()
        print(f"✓ Seeded {len(users)} users (password: password123)")

        # ── Opportunities ────────────────────────────────────────
        opportunities = [
            Opportunity(
                id=1,
                title="Software Engineer Intern",
                company_id=101,
                type=OpportunityType.INTERNSHIP,
                location="Jakarta (Hybrid)",
                salary="Rp 6.000.000",
                description="We are looking for a passionate Software Engineer Intern to join our team. "
                            "You will work on real products used by millions of users across Indonesia.",
                requirements=json.dumps([
                    "Final year student in Computer Science or related field",
                    "Familiar with React and Go",
                    "Strong problem solving skills",
                ]),
                is_active=True,
                posted_at=datetime(2026, 2, 1),
                deadline=datetime(2026, 3, 1),
            ),
            Opportunity(
                id=2,
                title="Data Analyst Associate",
                company_id=102,
                type=OpportunityType.FULL_TIME,
                location="Jakarta (On-site)",
                salary="Rp 12.000.000",
                description="Join our Data team to help drive business decisions through analytics. "
                            "Work with massive datasets and state-of-the-art tools.",
                requirements=json.dumps([
                    "Bachelor degree in Statistics, Math, or CS",
                    "Proficient in SQL and Python",
                    "Experience with Tableau/PowerBI",
                ]),
                is_active=True,
                posted_at=datetime(2026, 1, 28),
                deadline=datetime(2026, 2, 28),
            ),
            Opportunity(
                id=3,
                title="Beasiswa Bank Indonesia",
                company_id=103,
                type=OpportunityType.SCHOLARSHIP,
                location="N/A",
                salary="Rp 1.500.000 / month",
                description="Scholarship program for high achieving students with leadership potential. "
                            "Includes mentoring sessions and networking events.",
                requirements=json.dumps([
                    "Active student at IPB University",
                    "Min GPA 3.50",
                    "Active in student organizations",
                ]),
                is_active=True,
                posted_at=datetime(2026, 2, 2),
                deadline=datetime(2026, 3, 15),
            ),
            Opportunity(
                id=4,
                title="Backend Developer",
                company_id=104,
                type=OpportunityType.FULL_TIME,
                location="Jakarta (Remote)",
                salary="Rp 15.000.000",
                description="Develop and maintain scalable backend services for Bukalapak's e-commerce platform.",
                requirements=json.dumps([
                    "Min 1 year experience in backend development",
                    "Proficient in Go or Python",
                    "Familiar with PostgreSQL and Redis",
                    "Understanding of microservices architecture",
                ]),
                is_active=True,
                posted_at=datetime(2026, 1, 15),
                deadline=datetime(2026, 3, 10),
            ),
            Opportunity(
                id=5,
                title="UI/UX Design Intern",
                company_id=101,
                type=OpportunityType.INTERNSHIP,
                location="Jakarta (Hybrid)",
                salary="Rp 4.500.000",
                description="Join Tokopedia's Design team and contribute to creating delightful user experiences.",
                requirements=json.dumps([
                    "Final year student in Design, HCI, or related field",
                    "Proficient in Figma",
                    "Portfolio showcasing UI/UX projects",
                ]),
                is_active=True,
                posted_at=datetime(2026, 2, 5),
                deadline=datetime(2026, 3, 5),
            ),
            Opportunity(
                id=6,
                title="Network Engineer Intern",
                company_id=105,
                type=OpportunityType.INTERNSHIP,
                location="Bandung (On-site)",
                salary="Rp 5.000.000",
                description="Learn about Indonesia's largest telecommunications network infrastructure.",
                requirements=json.dumps([
                    "Student in Electrical Engineering or Computer Science",
                    "Knowledge of TCP/IP, routing protocols",
                    "CCNA certification is a plus",
                ]),
                is_active=True,
                posted_at=datetime(2026, 2, 10),
                deadline=datetime(2026, 3, 20),
            ),
        ]
        db.add_all(opportunities)
        db.flush()
        print(f"✓ Seeded {len(opportunities)} opportunities")

        # ── Applications (matching frontend mockData) ────────────
        applications = [
            Application(
                id=501,
                student_id=1,
                opportunity_id=1,
                status=ApplicationStatus.INTERVIEW,
                applied_at=datetime(2026, 2, 2),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-02"},
                    {"status": "Screening", "date": "2026-02-03"},
                    {"status": "Interview", "date": "2026-02-05"},
                ]),
            ),
            Application(
                id=502,
                student_id=1,
                opportunity_id=2,
                status=ApplicationStatus.REJECTED,
                applied_at=datetime(2026, 1, 30),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-01-30"},
                    {"status": "Rejected", "date": "2026-02-01"},
                ]),
            ),
            Application(
                id=503,
                student_id=1,
                opportunity_id=3,
                status=ApplicationStatus.APPLIED,
                applied_at=datetime(2026, 2, 3),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-03"},
                ]),
            ),
            # Extra applications from other students
            Application(
                student_id=3,
                opportunity_id=1,
                status=ApplicationStatus.SCREENING,
                applied_at=datetime(2026, 2, 3),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-03"},
                    {"status": "Screening", "date": "2026-02-06"},
                ]),
            ),
            Application(
                student_id=3,
                opportunity_id=2,
                status=ApplicationStatus.APPLIED,
                applied_at=datetime(2026, 2, 5),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-05"},
                ]),
            ),
            Application(
                student_id=4,
                opportunity_id=4,
                status=ApplicationStatus.APPLIED,
                applied_at=datetime(2026, 2, 6),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-06"},
                ]),
            ),
            Application(
                student_id=4,
                opportunity_id=6,
                status=ApplicationStatus.INTERVIEW,
                applied_at=datetime(2026, 2, 11),
                history=json.dumps([
                    {"status": "Applied", "date": "2026-02-11"},
                    {"status": "Interview", "date": "2026-02-15"},
                ]),
            ),
        ]
        db.add_all(applications)
        db.flush()
        print(f"✓ Seeded {len(applications)} applications")

        # ── Bookmarks ───────────────────────────────────────────
        bookmarks = [
            Bookmark(user_id=1, opportunity_id=2),
            Bookmark(user_id=1, opportunity_id=4),
            Bookmark(user_id=3, opportunity_id=1),
            Bookmark(user_id=3, opportunity_id=5),
            Bookmark(user_id=4, opportunity_id=3),
        ]
        db.add_all(bookmarks)
        db.flush()
        print(f"✓ Seeded {len(bookmarks)} bookmarks")

        # ── Externships ──────────────────────────────────────────
        externships = [
            Externship(
                student_id=1,
                title="Web Development Project",
                company="Tokopedia (Independent Study)",
                duration="6 months",
                description="Built a full-stack e-commerce dashboard using React and FastAPI.",
                entry_type=ExternshipType.PROJECT,
                status=ExternshipStatus.COMPLETED,
            ),
            Externship(
                student_id=1,
                title="Machine Learning Research",
                company="IPB Lab AI",
                duration="3 months",
                description="Researched NLP models for Indonesian language processing.",
                entry_type=ExternshipType.EXPERIENCE,
                status=ExternshipStatus.ONGOING,
            ),
            Externship(
                student_id=3,
                title="Data Analytics Bootcamp",
                company="Gojek (Bangkit Academy)",
                duration="5 months",
                description="Intensive bootcamp on data analytics with real industry datasets.",
                entry_type=ExternshipType.EXPERIENCE,
                status=ExternshipStatus.COMPLETED,
            ),
        ]
        db.add_all(externships)
        db.flush()
        print(f"✓ Seeded {len(externships)} externships")

        db.commit()
        print("\n✅ Database seeded successfully!")
        print("   Login credentials:  any email above / password123")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
