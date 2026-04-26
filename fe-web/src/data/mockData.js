export const USERS = {
  student: {
    id: 1,
    name: "Budi Santoso",
    role: "student",
    major: "Ilmu Komputer",
    university: "IPB University",
    email: "budi.santoso@apps.ipb.ac.id",
    avatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=10B981&color=fff",
    gpa: 3.85
  },
  hr: {
    id: 2,
    name: "Siti Aminah",
    role: "hr",
    companyId: 101,
    email: "hr@tokopedia.com",
    avatar: "https://ui-avatars.com/api/?name=Siti+Aminah&background=3B82F6&color=fff"
  }
};

export const COMPANIES = [
  {
    id: 101,
    name: "Tokopedia",
    industry: "E-Commerce",
    location: "Jakarta Selatan",
    logo: "https://ui-avatars.com/api/?name=Tokopedia&background=42B549&color=fff&length=1",
    description: "Tokopedia is an Indonesian technology company specializing in e-commerce.",
    website: "https://www.tokopedia.com",
    rating: 4.8
  },
  {
    id: 102,
    name: "Gojek",
    industry: "Technology",
    location: "Jakarta Selatan",
    logo: "https://ui-avatars.com/api/?name=Gojek&background=00AA13&color=fff&length=1",
    description: "Gojek is a Super App. It’s one app for ordering food, commuting, digital payments, shopping, hyper-local delivery, and dozen other products.",
    website: "https://www.gojek.com",
    rating: 4.7
  },
  {
    id: 103,
    name: "Bank Indonesia",
    industry: "Finance",
    location: "Jakarta Pusat",
    logo: "https://ui-avatars.com/api/?name=Bank+Indonesia&background=003D79&color=fff&length=2",
    description: "Bank Indonesia is the central bank of the Republic of Indonesia.",
    website: "https://www.bi.go.id",
    rating: 4.9
  }
];

export const OPPORTUNITIES = [
  {
    id: 1,
    title: "Software Engineer Intern",
    companyId: 101,
    type: "Internship",
    location: "Jakarta (Hybrid)",
    salary: "Rp 6.000.000",
    description: "We are looking for a passionate Software Engineer Intern to join our team...",
    requirements: [
      "Final year student in Computer Science or related field",
      "Familiar with React and Go",
      "Strong problem solving skills"
    ],
    postedAt: "2026-02-01",
    deadline: "2026-03-01",
    applicants_count: 45
  },
  {
    id: 2,
    title: "Data Analyst Associate",
    companyId: 102,
    type: "Full-time",
    location: "Jakarta (On-site)",
    salary: "Rp 12.000.000",
    description: "Join our Data team to help drive business decisions...",
    requirements: [
      "Bachelor degree in Statistics, Math, or CS",
      "Proficient in SQL and Python",
      "Experience with Tableau/PowerBI"
    ],
    postedAt: "2026-01-28",
    deadline: "2026-02-28",
    applicants_count: 120
  },
  {
    id: 3,
    title: "Beasiswa Bank Indonesia",
    companyId: 103,
    type: "Scholarship",
    location: "N/A",
    salary: "Rp 1.500.000 / month",
    description: "Scholarship program for high achieving students...",
    requirements: [
      "Active student at IPB University",
      "Min GPA 3.50",
      "Active in student organizations"
    ],
    postedAt: "2026-02-02",
    deadline: "2026-03-15",
    applicants_count: 300
  }
];

export const APPLICATIONS = [
  {
    id: 501,
    studentId: 1,
    opportunityId: 1,
    status: "Interview",
    appliedAt: "2026-02-02",
    history: [
      { status: "Applied", date: "2026-02-02" },
      { status: "Screening", date: "2026-02-03" },
      { status: "Interview", date: "2026-02-05" }
    ]
  },
  {
    id: 502,
    studentId: 1,
    opportunityId: 2,
    status: "Rejected",
    appliedAt: "2026-01-30",
    history: [
      { status: "Applied", date: "2026-01-30" },
      { status: "Rejected", date: "2026-02-01" }
    ]
  },
  {
    id: 503,
    studentId: 1,
    opportunityId: 3,
    status: "Applied",
    appliedAt: "2026-02-03",
    history: [
      { status: "Applied", date: "2026-02-03" }
    ]
  }
];
