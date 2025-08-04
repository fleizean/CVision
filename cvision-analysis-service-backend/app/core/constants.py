# ================================
# app/core/constants.py
# ================================

# CV Analysis Status
class CVStatus:
    PENDING = "Pending"
    PROCESSING = "Processing"
    COMPLETED = "Completed"
    FAILED = "Failed"

# File Types
class FileTypes:
    PDF = "pdf"
    DOCX = "docx"
    DOC = "doc"

# CV Sections
class CVSections:
    PERSONAL_INFO = "personal_info"
    SUMMARY = "summary"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    SKILLS = "skills"
    CERTIFICATIONS = "certifications"
    LANGUAGES = "languages"
    PROJECTS = "projects"
    REFERENCES = "references"

# Keyword Match Types
class MatchTypes:
    EXACT = "exact"
    FUZZY = "fuzzy"
    SEMANTIC = "semantic"

# Analysis Metrics
class AnalysisMetrics:
    MIN_SCORE = 0
    MAX_SCORE = 100
    
    # Score thresholds
    EXCELLENT_THRESHOLD = 90
    GOOD_THRESHOLD = 75
    AVERAGE_THRESHOLD = 60
    POOR_THRESHOLD = 40

# Common CV Keywords and Skills
COMMON_SKILLS = [
    # .NET & Microsoft Tech
    ".net", ".net core", "c#", "asp.net", "entity framework", "linq", "mvc", "webapi", "blazor", "xamarin",
    "azure", "azure devops", "mssql", "sql server", "signalr", "wcf", "wpf", "winforms",
    
    # Web Technologies
    "javascript", "typescript", "html", "css", "react", "angular", "vue", "nodejs", "next.js",
    "tailwind", "bootstrap", "jquery", "ajax", "json", "xml", "rest", "restful", "api",
    
    # Backend Technologies  
    "python", "django", "fastapi", "flask", "java", "spring", "php", "laravel", "ruby", "rails",
    "c++", "c", "go", "rust", "kotlin", "swift", "scala",
    
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "supabase", "sqlite",
    "oracle", "cassandra", "dynamodb",
    
    # DevOps & Tools
    "docker", "docker compose", "kubernetes", "jenkins", "git", "github", "gitlab", "ci/cd",
    "linux", "ubuntu", "centos", "nginx", "apache", "rabbitmq", "kafka", "microservices",
    
    # Cloud & Infrastructure
    "aws", "azure", "gcp", "heroku", "vercel", "netlify", "cloudflare", "terraform", "ansible",
    
    # Mobile Development
    "android", "ios", "react native", "flutter", "dart", "objective-c", "swift",
    
    # Data & Analytics
    "machine learning", "ai", "data science", "pandas", "numpy", "tensorflow", "pytorch",
    "power bi", "tableau", "excel", "r", "matlab",
    
    # Testing & Quality
    "unit testing", "integration testing", "tdd", "bdd", "selenium", "jest", "cypress",
    "postman", "swagger", "testing", "qa", "quality assurance",
    
    # Architecture & Patterns
    "microservices", "mvc", "mvvm", "solid", "design patterns", "clean architecture",
    "domain driven design", "event sourcing", "cqrs", "onion architecture",
    
    # Soft Skills
    "leadership", "communication", "teamwork", "problem solving", "analytical thinking",
    "project management", "time management", "adaptability", "creativity", "initiative",
    "mentoring", "collaboration", "critical thinking", "innovation",
    
    # Business Skills
    "strategic planning", "business analysis", "data analysis", "market research",
    "customer service", "sales", "marketing", "finance", "accounting", "hr", "agile", "scrum",
    "kanban", "jira", "confluence", "product management"
]

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "degree", "university", "college", "certification",
    "diploma", "gpa", "magna cum laude", "summa cum laude", "honors"
]

EXPERIENCE_KEYWORDS = [
    "years", "experience", "worked", "developed", "managed", "led", "created",
    "implemented", "designed", "coordinated", "supervised", "achieved", "improved"
]