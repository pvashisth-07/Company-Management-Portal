import sys
import os
import hashlib
from datetime import datetime, timedelta

# Ensure backend root is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.database import engine, Base, SessionLocal
from app.models import User, Company, Contact, Visit, VisitAttendee, RecruitmentActivity, Approval, EngagementRecord

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()

def seed_database():
    # Re-create all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[*] Seeding Users...")
        # Users
        u_coord1 = User(
            name="Hitesh Jain",
            email="hitesh.coordinator@lnmiit.ac.in",
            password_hash=hash_pw("password123"),
            role="COORDINATOR",
            account_status="ACTIVE",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        u_approver = User(
            name="Dr. Anand Patidar",
            email="anand.approver@lnmiit.ac.in",
            password_hash=hash_pw("password123"),
            role="APPROVER",
            account_status="ACTIVE",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        u_admin = User(
            name="Pranav Vashisth",
            email="pranav.admin@lnmiit.ac.in",
            password_hash=hash_pw("password123"),
            role="ADMIN",
            account_status="ACTIVE",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        u_coord2 = User(
            name="Avesh Khan",
            email="avesh.coordinator@lnmiit.ac.in",
            password_hash=hash_pw("password123"),
            role="COORDINATOR",
            account_status="ACTIVE",
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        u_mgmt = User(
            name="Prof. Subrat Kar",
            email="director.mgmt@lnmiit.ac.in",
            password_hash=hash_pw("password123"),
            role="MANAGEMENT",
            account_status="ACTIVE",
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        db.add_all([u_coord1, u_approver, u_admin, u_coord2, u_mgmt])
        db.commit()

        print("🏢 Seeding Companies...")
        # Companies
        c_msft = Company(
            name="Microsoft India",
            industry="Software & IT",
            address="Microsoft Campus, Gachibowli, Hyderabad, Telangana",
            website="https://careers.microsoft.com",
            status="ACTIVE",
            notes="Tier-1 placement partner. Prefers hands-on coding and distributed systems background.",
            created_at=datetime.utcnow() - timedelta(days=80)
        )
        c_gs = Company(
            name="Goldman Sachs",
            industry="FinTech & Banking",
            address="Helios Business Park, Kadubeesanahalli, Bengaluru, Karnataka",
            website="https://www.goldmansachs.com/careers",
            status="ACTIVE",
            notes="Regular participant in campus placement. Focuses on DSA, quant math, and systems design.",
            created_at=datetime.utcnow() - timedelta(days=75)
        )
        c_amzn = Company(
            name="Amazon India",
            industry="E-Commerce & Cloud",
            address="Ambience Corporate Tower II, Gurugram, Haryana",
            website="https://amazon.jobs",
            status="ACTIVE",
            notes="Hires across AWS, Prime Video, and Alexa engineering teams.",
            created_at=datetime.utcnow() - timedelta(days=70)
        )
        c_cisco = Company(
            name="Cisco Systems",
            industry="Networking & Cybersecurity",
            address="Cessna Business Park, Sarjapur Outer Ring Road, Bengaluru",
            website="https://jobs.cisco.com",
            status="ACTIVE",
            notes="Key partner for networking lab sponsorship and summer internships.",
            created_at=datetime.utcnow() - timedelta(days=65)
        )
        c_adobe = Company(
            name="Adobe Systems",
            industry="Digital Media & Software",
            address="Sector 132, Noida, Uttar Pradesh",
            website="https://adobe.com/careers",
            status="ACTIVE",
            notes="Offers high package FTE and Product Management roles.",
            created_at=datetime.utcnow() - timedelta(days=50)
        )
        c_tcs = Company(
            name="Tata Consultancy Services",
            industry="IT Consulting & Services",
            address="TCS House, Raveline Street, Fort, Mumbai",
            website="https://www.tcs.com/careers",
            status="ACTIVE",
            notes="Digital & Prime roles mass recruitment partner.",
            created_at=datetime.utcnow() - timedelta(days=45)
        )
        c_ti = Company(
            name="Texas Instruments",
            industry="Hardware & Semiconductors",
            address="Bagmane Tech Park, CV Raman Nagar, Bengaluru",
            website="https://careers.ti.com",
            status="ACTIVE",
            notes="Core electronics recruiting firm. Requires Embedded Systems and VLSI expertise.",
            created_at=datetime.utcnow() - timedelta(days=40)
        )
        c_zomato = Company(
            name="Zomato Technologies",
            industry="FoodTech & Logistics",
            address="Eldeco Centre, Malviya Nagar, New Delhi",
            website="https://zomato.com/careers",
            status="ACTIVE",
            notes="Fast-paced product team looking for full-stack developers.",
            created_at=datetime.utcnow() - timedelta(days=30)
        )

        db.add_all([c_msft, c_gs, c_amzn, c_cisco, c_adobe, c_tcs, c_ti, c_zomato])
        db.commit()

        print("👤 Seeding Contacts...")
        # Contacts
        contacts = [
            Contact(company_id=c_msft.company_id, name="Rohit Sharma", designation="University Relations Director", email="rohit.sharma@microsoft.com", phone="+91 98112 34567", department="Campus Talent Acquisition"),
            Contact(company_id=c_msft.company_id, name="Pooja Sen", designation="Lead Technical Recruiter", email="pooja.sen@microsoft.com", phone="+91 98223 45678", department="Engineering Hiring"),
            Contact(company_id=c_gs.company_id, name="Vikram Singhania", designation="Executive Director - Campus Strategy", email="vikram.singhania@gs.com", phone="+91 98334 56789", department="Human Capital Management"),
            Contact(company_id=c_gs.company_id, name="Ananya Rao", designation="VP Engineering", email="ananya.rao@gs.com", phone="+91 98445 67890", department="Global Investment Research"),
            Contact(company_id=c_amzn.company_id, name="Arun George", designation="Principal Recruiter", email="arung@amazon.com", phone="+91 98556 78901", department="AWS Talent Acquisition"),
            Contact(company_id=c_cisco.company_id, name="Sunita Menon", designation="Head of University Programs", email="sumenon@cisco.com", phone="+91 98667 89012", department="India HR Operations"),
            Contact(company_id=c_adobe.company_id, name="Devendra Saxena", designation="Staff Talent Partner", email="dsaxena@adobe.com", phone="+91 98778 90123", department="Creative Cloud Hiring"),
            Contact(company_id=c_ti.company_id, name="Karthik Narayan", designation="Campus Talent Lead", email="knarayan@ti.com", phone="+91 98889 01234", department="Silicon Design Team")
        ]
        db.add_all(contacts)
        db.commit()

        print("🚗 Seeding Visits (UC-006)...")
        # Visits
        v1 = Visit(
            company_id=c_msft.company_id,
            recorded_by=u_coord1.user_id,
            visit_date="2026-09-15",
            purpose="Annual Placement Drive Planning & Academic Curriculum Consultation",
            outcome="Agreed to conduct 3 rounds of on-campus coding interviews; confirmed 25 FTE slots and 15 6-month internships.",
            notes="Delegation was very impressed with LNMIIT competitive coding club achievements.",
            created_at=datetime.utcnow() - timedelta(days=42)
        )
        v2 = Visit(
            company_id=c_cisco.company_id,
            recorded_by=u_coord1.user_id,
            visit_date="2026-09-28",
            purpose="MoU Signing for Advanced Networking Center of Excellence and Student Mentorship",
            outcome="Signed 3-year MoU; sponsored 10 high-end routing switches for the telecom lab.",
            notes="Follow up with Department of ECE for equipment installation schedule.",
            created_at=datetime.utcnow() - timedelta(days=29)
        )
        v3 = Visit(
            company_id=c_gs.company_id,
            recorded_by=u_coord2.user_id,
            visit_date="2026-10-10",
            purpose="Pre-Placement Engagement & Women in Tech Hackathon Launch",
            outcome="Launched GS Engineering Campus Hiring Program; scheduled online test for late October.",
            notes="Organized an auditorium tech talk attended by 250+ 3rd and 4th year students.",
            created_at=datetime.utcnow() - timedelta(days=17)
        )
        db.add_all([v1, v2, v3])
        db.commit()

        # Visit attendees
        att1 = [VisitAttendee(visit_id=v1.visit_id, attendee_name=n) for n in ["Rohit Sharma (Director)", "Pooja Sen (Lead Recruiter)", "Dr. K. S. Sharma (Dean Academics)"]]
        att2 = [VisitAttendee(visit_id=v2.visit_id, attendee_name=n) for n in ["Sunita Menon (Head University Programs)", "Rajeev Verma (Director Networking)", "Dr. O. P. Rishi (HOD CSE)"]]
        att3 = [VisitAttendee(visit_id=v3.visit_id, attendee_name=n) for n in ["Vikram Singhania (ED HCM)", "Ananya Rao (VP Engg)", "Hitesh Jain (T&P Coordinator)"]]
        db.add_all(att1 + att2 + att3)
        db.commit()

        print("📝 Seeding Recruitment Activities (UC-008 & UC-009)...")
        # Activities
        act_msft = RecruitmentActivity(
            company_id=c_msft.company_id,
            created_by=u_coord1.user_id,
            title="Microsoft Campus Drive 2026-27 (SDE-1 & SWE Interns)",
            type="ON_CAMPUS",
            activity_date="2026-11-15",
            eligibility_criteria="B.Tech CSE/CCE/ECE with CGPA >= 8.0, 10th & 12th >= 80%, No active backlogs",
            positions_offered="Software Development Engineer 1 (SDE-1), Software Engineering Intern",
            package_details="CTC 44.5 LPA (FTE) | Stipend INR 1,25,000/month",
            status="APPROVED",
            created_at=datetime.utcnow() - timedelta(days=35)
        )
        act_cisco = RecruitmentActivity(
            company_id=c_cisco.company_id,
            created_by=u_coord1.user_id,
            title="Cisco Consulting Engineer & Network Software Drive",
            type="ON_CAMPUS",
            activity_date="2026-11-20",
            eligibility_criteria="B.Tech All Branches with CGPA >= 7.5, Good networking & Linux fundamentals",
            positions_offered="Technical Consulting Engineer, Network Software Engineer",
            package_details="CTC 18.0 LPA | Stipend INR 75,000/month",
            status="SCHEDULED",
            created_at=datetime.utcnow() - timedelta(days=25)
        )
        act_gs = RecruitmentActivity(
            company_id=c_gs.company_id,
            created_by=u_coord2.user_id,
            title="Goldman Sachs Engineering Campus Hiring 2027",
            type="ON_CAMPUS",
            activity_date="2026-12-05",
            eligibility_criteria="B.Tech CSE/CCE/ECE/MME with CGPA >= 7.0, Strong quantitative and algorithmic aptitude",
            positions_offered="Summer Analyst, Full-Time Quantitative Strategist",
            package_details="CTC 26.0 LPA | Stipend INR 1,00,000/month",
            status="SUBMITTED",  # In review queue!
            created_at=datetime.utcnow() - timedelta(days=5)
        )
        act_amzn = RecruitmentActivity(
            company_id=c_amzn.company_id,
            created_by=u_coord1.user_id,
            title="Amazon AWS Cloud Associate & SDE Virtual Assessment",
            type="VIRTUAL",
            activity_date="2026-12-12",
            eligibility_criteria="B.Tech CSE/CCE with CGPA >= 7.5, No active backlogs",
            positions_offered="SDE-1, Cloud Support Associate",
            package_details="CTC 32.0 LPA | Stipend INR 85,000/month",
            status="SUBMITTED",  # In review queue!
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        act_adobe = RecruitmentActivity(
            company_id=c_adobe.company_id,
            created_by=u_coord1.user_id,
            title="Adobe SheCodes & Product Intern Drive",
            type="ON_CAMPUS",
            activity_date="2027-01-10",
            eligibility_criteria="B.Tech 3rd & 4th Year, Female Candidates, CGPA >= 8.0",
            positions_offered="Member of Technical Staff (MTS-1), Research Intern",
            package_details="CTC 42.0 LPA | Stipend INR 1,10,000/month",
            status="DRAFT",  # Draft to demonstrate UC-008 submission
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        act_ti = RecruitmentActivity(
            company_id=c_ti.company_id,
            created_by=u_coord2.user_id,
            title="Texas Instruments Analog & Digital VLSI Drive",
            type="ON_CAMPUS",
            activity_date="2027-01-22",
            eligibility_criteria="B.Tech ECE/CCE with CGPA >= 7.5, Analog circuits and Verilog knowledge",
            positions_offered="Analog Design Engineer, Embedded Firmware Engineer",
            package_details="CTC 22.5 LPA | Stipend INR 65,000/month",
            status="REJECTED",  # Demonstrates rejection workflow with reason
            created_at=datetime.utcnow() - timedelta(days=15)
        )

        db.add_all([act_msft, act_cisco, act_gs, act_amzn, act_adobe, act_ti])
        db.commit()

        print("⚖️ Seeding Approvals (UC-009)...")
        # Approvals
        app1 = Approval(
            activity_id=act_msft.activity_id,
            approver_id=u_approver.user_id,
            decision="APPROVED",
            comments="Drive terms, CTC breakdown, and eligibility verified with institute placement policy. Approved for scheduling.",
            decision_date=datetime.utcnow() - timedelta(days=30)
        )
        app2 = Approval(
            activity_id=act_cisco.activity_id,
            approver_id=u_approver.user_id,
            decision="APPROVED",
            comments="Verified alignment with Cisco MoU commitments. Slots confirmed for Lab 3 and Auditorium.",
            decision_date=datetime.utcnow() - timedelta(days=20)
        )
        app3 = Approval(
            activity_id=act_ti.activity_id,
            approver_id=u_approver.user_id,
            decision="REJECTED",
            comments="Date clashes with institute mid-term examinations. Please coordinate with TI HR to reschedule to February 2027.",
            decision_date=datetime.utcnow() - timedelta(days=12)
        )
        db.add_all([app1, app2, app3])
        db.commit()

        print("📜 Seeding Engagement Records (FR-030)...")
        # Engagement records
        engagements = [
            EngagementRecord(company_id=c_msft.company_id, type="STATUS_CHANGE", description="Company profile initialized in portal for Microsoft India.", record_date=datetime.utcnow() - timedelta(days=80), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_msft.company_id, type="CONTACT_UPDATE", description="Added Rohit Sharma (University Relations Director) and Pooja Sen.", record_date=datetime.utcnow() - timedelta(days=78), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_msft.company_id, type="VISIT", description=f"Institutional Visit on 2026-09-15. Purpose: {v1.purpose}. Outcome: {v1.outcome}", record_date=datetime.utcnow() - timedelta(days=42), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_msft.company_id, type="ACTIVITY", description=f"Submitted recruitment activity '{act_msft.title}' for approval.", record_date=datetime.utcnow() - timedelta(days=35), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_msft.company_id, type="APPROVAL", description=f"Recruitment activity approved by Dr. Anand Patidar.", record_date=datetime.utcnow() - timedelta(days=30), recorded_by=u_approver.user_id),

            EngagementRecord(company_id=c_cisco.company_id, type="STATUS_CHANGE", description="Company profile initialized for Cisco Systems.", record_date=datetime.utcnow() - timedelta(days=65), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_cisco.company_id, type="VISIT", description=f"Institutional Visit on 2026-09-28. Outcome: Signed 3-year MoU for Center of Excellence.", record_date=datetime.utcnow() - timedelta(days=29), recorded_by=u_coord1.user_id),
            EngagementRecord(company_id=c_cisco.company_id, type="APPROVAL", description="Approved Cisco Consulting Engineer Drive.", record_date=datetime.utcnow() - timedelta(days=20), recorded_by=u_approver.user_id),

            EngagementRecord(company_id=c_gs.company_id, type="STATUS_CHANGE", description="Company profile initialized for Goldman Sachs.", record_date=datetime.utcnow() - timedelta(days=75), recorded_by=u_coord2.user_id),
            EngagementRecord(company_id=c_gs.company_id, type="VISIT", description=f"Institutional Visit on 2026-10-10. Pre-Placement Engagement & Tech Talk.", record_date=datetime.utcnow() - timedelta(days=17), recorded_by=u_coord2.user_id),
            EngagementRecord(company_id=c_gs.company_id, type="ACTIVITY", description=f"Submitted '{act_gs.title}' for institutional review.", record_date=datetime.utcnow() - timedelta(days=5), recorded_by=u_coord2.user_id),

            EngagementRecord(company_id=c_ti.company_id, type="APPROVAL", description="Recruitment activity was REJECTED by Dr. Anand Patidar. Reason: Exam schedule conflict.", record_date=datetime.utcnow() - timedelta(days=12), recorded_by=u_approver.user_id),
        ]
        db.add_all(engagements)
        db.commit()

        print("✅ Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
