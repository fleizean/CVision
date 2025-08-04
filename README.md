# 🎯 CVision - AI-Powered CV Analysis Platform

<p align="center">
   <img src="assets/logo.png" width="200px" height="200px" />

<div align="center">

[![CI/CD Pipeline](https://github.com/fleizean/cvision/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/fleizean/cvision/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![.NET](https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet)](https://dotnet.microsoft.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Issues](https://img.shields.io/github/issues/fleizean/cvision)](https://github.com/fleizean/cvision/issues)
[![Contributors](https://img.shields.io/github/contributors/fleizean/cvision)](https://github.com/fleizean/cvision/graphs/contributors)

**🚀 Transform your recruitment process with AI-powered CV analysis**

[Demo](https://cvision-demo.com) • [Documentation](https://docs.cvision.com) • [Community](https://github.com/fleizean/cvision/discussions) • [Report Bug](https://github.com/fleizean/cvision/issues) • [Request Feature](https://github.com/fleizean/cvision/issues)

</div>

---

## 📖 Table of Contents

- [About CVision](#-about-cvision)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Development Setup](#%EF%B8%8F-development-setup)
- [Contributing](#-contributing)
- [Community](#-community)
- [License](#-license)

## 🌟 About CVision

CVision is a **modern, open-source CV analysis platform** that revolutionizes recruitment processes through AI-powered analysis. Built with enterprise-grade microservices architecture, it provides comprehensive resume analysis, intelligent keyword matching, and automated candidate evaluation.

### Why CVision?

- **🤖 AI-Powered**: Advanced NLP algorithms for accurate CV analysis
- **🏗️ Microservices**: Scalable, maintainable architecture
- **🔒 Enterprise-Ready**: Security, compliance, and audit features
- **🌐 Open Source**: Community-driven development with MIT license
- **📊 Analytics**: Rich dashboards and reporting capabilities

## ✨ Features

### 🔍 **AI-Powered CV Analysis**
- Advanced text extraction from PDF and Word documents
- NLP-based keyword extraction and analysis
- Intelligent skill identification and categorization
- Experience level assessment
- Education background analysis

### 👥 **User Management**
- Role-based access control (Admin, HR, User)
- Secure authentication with JWT tokens
- User activity tracking and audit logs
- Password reset and email notifications

### 📊 **Dashboard & Analytics**
- Real-time analytics and statistics
- CV analysis history and results
- User activity monitoring
- System health and performance metrics

### 🎯 **Job Profile Matching**
- Create and manage job profiles
- Automatic CV-to-job matching
- Relevance scoring and ranking
- Batch processing capabilities

### 🛡️ **Security & Compliance**
- Secure file upload and storage
- Data encryption and protection
- GDPR compliance features
- Audit trail and logging

## 🏗️ Architecture

CVision follows a microservices architecture with the following components:

<p align="center">
<img src="assets/image.png" />
</p>

### Components

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend API**: .NET 8 Web API with Entity Framework Core
- **Analysis Service**: Python FastAPI with spaCy NLP
- **Database**: MSSQL
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx
- **Monitoring**: Health checks and logging

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cvision.git
cd cvision
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# Or for development with additional tools
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Analysis Service**: http://localhost:8000
- **PgAdmin** (dev): http://localhost:5050
- **Redis Commander** (dev): http://localhost:8081

### 5. Default Credentials

- **Admin User**: admin@cvision.com / Admin123!
- **PgAdmin**: admin@cvision.com / admin123
- **Redis Commander**: Accessible without authentication

## 🛠️ Development Setup

### Local Development Environment

1. **Prerequisites**
   - .NET 8.0 SDK
   - Node.js 20.x
   - Python 3.11+
   - MSSQL (or use Docker)

2. **Setup Script**
   ```bash
   chmod +x scripts/dev-setup.sh
   ./scripts/dev-setup.sh
   ```

3. **Manual Setup**

   **Backend (.NET)**
   ```bash
   cd cvision-backend
   dotnet restore
   dotnet ef database update --project Infrastructure/CVisionBackend.Persistence --startup-project Presentation/CVisionBackend.API
   dotnet run --project Presentation/CVisionBackend.API
   ```

   **Frontend (Next.js)**
   ```bash
   cd cvision-frontend
   npm install
   npm run dev
   ```

   **Analysis Service (Python)**
   ```bash
   cd cvision-analysis-service-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   uvicorn main:app --reload
   ```

## 📝 API Documentation

### Backend API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

#### CV Management
- `POST /api/cvfiles/upload` - Upload CV file
- `GET /api/cvfiles/user` - Get user's CV files
- `GET /api/cvfiles/{id}` - Get CV file details
- `DELETE /api/cvfiles/{id}` - Delete CV file

#### Analysis
- `POST /api/cvanalysis/analyze` - Analyze CV
- `GET /api/cvanalysis/{id}` - Get analysis results
- `GET /api/cvanalysis/history` - Get analysis history

#### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/cvfiles` - Get all CV files
- `GET /api/admin/activity` - Get system activity

### Analysis Service API

- `POST /analysis/cv` - Analyze CV content
- `POST /analysis/match` - Match CV with job profile
- `GET /analysis/health` - Health check

For detailed API documentation, visit:
- Backend API: http://localhost:8080/swagger
- Analysis Service: http://localhost:8000/docs

## 🐳 Docker Deployment

### Production Deployment

1. **Build Images**
   ```bash
   ./scripts/build.sh
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Environment Configuration**
   - Update `.env` file with production values
   - Configure SSL certificates in `nginx/ssl/`
   - Set up email SMTP settings
   - Configure external database if needed

### Docker Images

The application builds the following Docker images:
- `cvision-backend:latest` - .NET Core API
- `cvision-frontend:latest` - Next.js frontend
- `cvision-analysis-service:latest` - Python analysis service

## 🔧 Configuration

### Environment Variables

> ⚠️ **Security Warning**: The values shown below are examples only. **Never use these default values in production!** Always generate strong, unique passwords and keys for production environments.

#### 🗄️ Database Configuration (SQL Server)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ConnectionStrings__SQLServer` | SQL Server connection string | `Server=localhost,1433;Database=YourDbName;User Id=sa;Password=YourStrongPassword123!;Encrypt=False` | ✅ |

#### 🔐 Authentication & Security (JWT Token)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `Token__SecurityKey` | JWT signing key (min 32 chars) | `your-super-secret-jwt-key-here-change-in-production` | ✅ |
| `Token__Issuer` | JWT token issuer | `your-domain.com` | ✅ |
| `Token__Audience` | JWT token audience | `your-domain.com` | ✅ |
| `Token__Expiration` | JWT token expiry in minutes | `60` | ✅ |

#### 📧 Email Configuration (SMTP)
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MailSettings__Mail` | Sender email address | - | ✅ |
| `MailSettings__UserName` | SMTP username | - | ✅ |
| `MailSettings__Password` | SMTP password/app password | - | ✅ |
| `MailSettings__SmtpHost` | SMTP server host | - | ✅ |
| `MailSettings__SmtpPort` | SMTP port | `587` | ❌ |

#### 🌐 Frontend Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:7128` | ✅ |
| `NEXT_PUBLIC_ANALYSIS_SERVICE_URL` | Analysis service URL | `http://localhost:8000` | ✅ |
| `NODE_ENV` | Node environment | `production` | ❌ |

#### 🤖 Analysis Service Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection for analysis service | `mssql://sa:YourPassword@localhost:1433/YourDbName` | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for enhanced NLP | - | ❌ |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API key | - | ❌ |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI endpoint URL | - | ❌ |

#### 🛠️ System Configuration
| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ASPNETCORE_ENVIRONMENT` | ASP.NET Core environment | `Development` | ❌ |
| `AppInfo__Name` | Application name | `CVision` | ❌ |
| `AppInfo__Version` | Application version | `1.0.0` | ❌ |
| `AppInfo__Url` | Application URL | `http://localhost:7128` | ❌ |
| `AllowedHosts` | Allowed hosts for the application | `*` | ❌ |
| `MAX_FILE_SIZE_MB` | Maximum file upload size | `50` | ❌ |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `.pdf,.doc,.docx` | ❌ |

### File Upload Configuration

- Maximum file size: 50MB
- Supported formats: PDF, DOC, DOCX
- Upload directory: `/app/uploads/cvfiles`

### Security Configuration

- JWT token expiry: 60 minutes
- Password requirements: 8+ characters, mixed case, numbers
- Rate limiting: 100 requests/minute per IP
- CORS origins configurable via environment

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd cvision-backend
dotnet test

# Frontend tests
cd cvision-frontend
npm test

# Analysis service tests
cd cvision-analysis-service-backend
pytest tests/
```

### Test Coverage

- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for file processing

## 📊 Monitoring & Logging

### Health Checks

All services include health check endpoints:
- Backend: `/health`
- Frontend: `/api/health`
- Analysis Service: `/api/health`

### Logging

- Structured logging with JSON format
- Log levels: DEBUG, INFO, WARN, ERROR
- Log rotation and retention
- Centralized logging with Docker logs

### Metrics

- Application performance metrics
- Database query performance
- File processing statistics
- User activity analytics

## 🚀 CI/CD Pipeline

The project includes a comprehensive GitHub Actions pipeline:

1. **Continuous Integration**
   - Code quality checks
   - Unit and integration tests
   - Security vulnerability scanning
   - Docker image building

2. **Continuous Deployment**
   - Automated deployment to staging
   - Production deployment on releases
   - Health checks and rollback capabilities

### Deployment Environments

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 🤝 Contributing

We love your input! We want to make contributing to CVision as easy and transparent as possible, whether it's:

- 🐛 Reporting a bug
- 💡 Submitting a feature request
- 🔧 Proposing changes to code
- 📖 Improving documentation
- 🎨 Submitting design improvements

### Quick Start for Contributors

1. **🍴 Fork the repository** and clone your fork
2. **🔧 Set up development environment** using our [setup guide](#%EF%B8%8F-development-setup)
3. **🌿 Create a feature branch** from `develop`
4. **✨ Make your changes** following our [coding standards](#-coding-standards)
5. **🧪 Test your changes** thoroughly
6. **📝 Update documentation** if needed
7. **🚀 Submit a pull request**

### 📋 Before You Start

Please check our:
- **[Contributing Guidelines](CONTRIBUTING.md)** - Detailed contribution process
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards
- **[Issue Templates](.github/ISSUE_TEMPLATE/)** - Bug reports and feature requests
- **[Development Setup](#%EF%B8%8F-development-setup)** - Local environment setup

### 🎯 Good First Issues

New contributors should look for issues labeled with:
- `good first issue` - Perfect for newcomers
- `help wanted` - We need community help
- `documentation` - Improve our docs
- `bug` - Fix existing issues

### 💬 Get Help

- **💭 [Discussions](https://github.com/fleizean/cvision/discussions)** - Ask questions and share ideas
- **📧 Email**: contribute@cvision.com
- **💻 Discord**: [Join our community](https://discord.gg/cvision)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

### Common Issues

1. **Database Connection Issues**
   - Ensure MSSQL is running
   - Check connection string in `.env`
   - Verify database migrations

2. **File Upload Problems**
   - Check file size limits
   - Verify supported file formats
   - Ensure upload directory permissions

3. **Analysis Service Issues**
   - Verify spaCy model installation
   - Check Python dependencies
   - Review analysis service logs

## 🔮 Roadmap

### Upcoming Features

- [ ] Advanced AI models for analysis
- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with ATS systems
- [ ] Video interview analysis
- [ ] Skill gap analysis
- [ ] Candidate recommendation engine

## 🙏 Acknowledgments

- [spaCy](https://spacy.io/) for NLP capabilities
- [Next.js](https://nextjs.org/) for the frontend framework
- [.NET Core](https://dotnet.microsoft.com/) for the backend API
- [MSSQL](https://MSSQL.org/) for the database
- [Docker](https://docker.com/) for containerization

---

<div align="center">
  <p>Made with ❤️ by the CVision Team</p>
  <p>
    <a href="#-cvision---ai-powered-cv-analysis-platform">Back to top</a>
  </p>
</div>