# Contributing to CVision

First off, thank you for considering contributing to CVision! 🎉 It's people like you that make CVision such a great tool for the HR and recruitment community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@cvision.com](mailto:conduct@cvision.com).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Git** - Version control
- **Docker** & **Docker Compose** - For containerized development
- **.NET 8.0 SDK** - For backend development
- **Node.js 20.x** - For frontend development
- **Python 3.11+** - For analysis service development

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/cvision.git
   cd cvision
   ```

3. **Add the original repository as upstream**:
   ```bash
   git remote add upstream https://github.com/fleizean/cvision.git
   ```

4. **Run the setup script**:
   ```bash
   chmod +x scripts/dev-setup.sh
   ./scripts/dev-setup.sh
   ```

5. **Start the development services**:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

6. **Verify everything is working**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080/swagger
   - Analysis Service: http://localhost:8000/docs

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the [existing issues](https://github.com/fleizean/cvision/issues) to avoid duplicates.

When you create a bug report, please use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Clear description** of what happened
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Screenshots** if applicable
- **Environment details** (OS, browser, versions)
- **Additional context** or logs

### 💡 Suggesting Features

Feature suggestions are tracked as [GitHub issues](https://github.com/fleizean/cvision/issues). When creating a feature request, please use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Clear description** of the feature
- **Problem it solves** or **value it adds**
- **Proposed solution** or implementation approach
- **Alternatives considered**
- **Additional context** or mockups

### 🔧 Contributing Code

We welcome code contributions! Here are some areas where you can help:

#### Good First Issues
Look for issues labeled `good first issue` - these are perfect for newcomers:
- Documentation improvements
- UI/UX enhancements
- Bug fixes
- Test coverage improvements

#### Areas We Need Help With
- **Frontend**: React components, UI improvements, accessibility
- **Backend**: API endpoints, business logic, performance
- **Analysis Service**: NLP algorithms, ML models, data processing
- **DevOps**: CI/CD improvements, Docker optimizations
- **Documentation**: Guides, tutorials, API documentation
- **Testing**: Unit tests, integration tests, e2e tests

## Development Process

### Branch Strategy

We use **Git Flow** branching model:

- `main` - Production-ready code
- `develop` - Development branch where features are integrated
- `feature/feature-name` - Feature branches
- `hotfix/fix-name` - Hotfix branches
- `release/version` - Release preparation branches

### Workflow

1. **Create a feature branch** from `develop`:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [coding standards](#coding-standards)

3. **Test your changes** thoroughly:
   ```bash
   # Backend tests
   cd cvision-backend && dotnet test
   
   # Frontend tests
   cd cvision-frontend && npm test
   
   # Analysis service tests
   cd cvision-analysis-service-backend && pytest
   ```

4. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "feat: add CV similarity comparison feature
   
   - Implement cosine similarity algorithm
   - Add comparison API endpoint
   - Update frontend to display similarity scores
   
   Closes #123"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** following our [PR template](.github/pull_request_template.md)

## Pull Request Process

### Before Submitting

- [ ] **Rebase** your branch on the latest `develop`
- [ ] **Run all tests** and ensure they pass
- [ ] **Run linting** and fix any issues
- [ ] **Update documentation** if needed
- [ ] **Add/update tests** for your changes
- [ ] **Verify** the application works locally

### PR Requirements

1. **Use our PR template** - It will be automatically populated
2. **Write a clear description** of what your PR does
3. **Reference related issues** using keywords like "Closes #123"
4. **Include screenshots** for UI changes
5. **Ensure all checks pass** (CI/CD pipeline)
6. **Request review** from maintainers

### Review Process

1. **Automated checks** must pass (tests, linting, security scans)
2. **Code review** by at least one maintainer
3. **Testing** by reviewers if needed
4. **Approval** and merge by maintainers

## Coding Standards

### General Principles

- **Clean Code**: Write readable, maintainable code
- **SOLID Principles**: Follow object-oriented design principles
- **DRY**: Don't Repeat Yourself
- **YAGNI**: You Ain't Gonna Need It
- **Boy Scout Rule**: Leave code better than you found it

### Backend (.NET)

```csharp
// ✅ Good
public async Task<CommonResponseMessage<List<GetCVFileDTO>>> GetUserFilesAsync(Guid userId)
{
    try
    {
        var files = await _repository.GetFilesByUserIdAsync(userId);
        return new CommonResponseMessage<List<GetCVFileDTO>>
        {
            Data = files.Select(MapToDTO).ToList(),
            StatusCode = HttpStatusCode.OK
        };
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error retrieving files for user {UserId}", userId);
        throw;
    }
}
```

**Standards:**
- Use `async/await` for asynchronous operations
- Implement proper error handling and logging
- Follow naming conventions (PascalCase for public members)
- Use dependency injection
- Add XML documentation for public APIs

### Frontend (Next.js/React)

```typescript
// ✅ Good
interface CVFileProps {
  file: CVFile
  onDelete: (id: string) => void
}

export const CVFileCard: React.FC<CVFileProps> = ({ file, onDelete }) => {
  const handleDelete = useCallback(() => {
    onDelete(file.id)
  }, [file.id, onDelete])

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold">{file.fileName}</h3>
      <button 
        onClick={handleDelete}
        className="mt-2 text-red-600 hover:text-red-800"
      >
        Delete
      </button>
    </div>
  )
}
```

**Standards:**
- Use TypeScript for type safety
- Follow React hooks best practices
- Use meaningful component and prop names
- Implement proper error boundaries
- Use Tailwind CSS for styling

### Analysis Service (Python)

```python
# ✅ Good
async def analyze_cv_content(cv_text: str) -> CVAnalysisResult:
    """
    Analyze CV content using NLP techniques.
    
    Args:
        cv_text: The extracted text from CV
        
    Returns:
        CVAnalysisResult with analysis data
        
    Raises:
        AnalysisError: If analysis fails
    """
    try:
        doc = nlp(cv_text)
        skills = extract_skills(doc)
        experience = calculate_experience(doc)
        
        return CVAnalysisResult(
            skills=skills,
            experience_years=experience,
            confidence_score=calculate_confidence(doc)
        )
    except Exception as e:
        logger.error(f"CV analysis failed: {e}")
        raise AnalysisError(f"Failed to analyze CV: {e}")
```

**Standards:**
- Use type hints for all functions
- Follow PEP 8 style guide
- Use async/await for I/O operations
- Add comprehensive docstrings
- Implement proper error handling

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add social login support

- Implement Google OAuth integration
- Add login button to auth page
- Update user model to store provider info

Closes #45

fix(api): handle null values in CV analysis

The analysis service was throwing errors when processing
CVs with missing sections. Added null checks and default
values to prevent crashes.

Fixes #123
```

## Testing Guidelines

### Test Coverage Requirements

- **Minimum 80% coverage** for new code
- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **End-to-end tests** for critical user flows

### Backend Testing

```csharp
[Test]
public async Task GetUserFiles_WithValidUserId_ReturnsFiles()
{
    // Arrange
    var userId = Guid.NewGuid();
    var expectedFiles = CreateTestFiles(userId);
    _mockRepository.Setup(r => r.GetFilesByUserIdAsync(userId))
                   .ReturnsAsync(expectedFiles);

    // Act
    var result = await _service.GetUserFilesAsync(userId);

    // Assert
    Assert.That(result.StatusCode, Is.EqualTo(HttpStatusCode.OK));
    Assert.That(result.Data.Count, Is.EqualTo(expectedFiles.Count));
}
```

### Frontend Testing

```typescript
describe('CVFileCard', () => {
  it('should call onDelete with correct file id when delete button is clicked', () => {
    const mockOnDelete = jest.fn()
    const file = { id: '123', fileName: 'test.pdf' }
    
    render(<CVFileCard file={file} onDelete={mockOnDelete} />)
    
    fireEvent.click(screen.getByText('Delete'))
    
    expect(mockOnDelete).toHaveBeenCalledWith('123')
  })
})
```

### Analysis Service Testing

```python
@pytest.mark.asyncio
async def test_analyze_cv_content_returns_valid_result():
    # Arrange
    cv_text = "Software Engineer with 5 years experience in Python"
    
    # Act
    result = await analyze_cv_content(cv_text)
    
    # Assert
    assert result.experience_years == 5
    assert "Python" in result.skills
    assert result.confidence_score > 0.5
```

## Documentation Guidelines

### Code Documentation

- **Public APIs** must have comprehensive documentation
- **Complex algorithms** should include explanations
- **Configuration options** must be documented
- **Examples** should be provided for non-trivial usage

### Documentation Types

1. **API Documentation** - Auto-generated from code comments
2. **User Guides** - Step-by-step instructions
3. **Developer Guides** - Technical implementation details
4. **Troubleshooting** - Common issues and solutions

### Writing Style

- Use **clear, concise language**
- Include **practical examples**
- Keep **screenshots up to date**
- Use **consistent formatting**

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat with community
- **Email** - contribute@cvision.com for private matters

### Getting Help

Don't hesitate to ask for help! Our community is friendly and welcoming:

1. **Check existing documentation** first
2. **Search GitHub issues** for similar problems
3. **Ask in GitHub Discussions** for general questions
4. **Join our Discord** for real-time help
5. **Email maintainers** for sensitive issues

### Recognition

We value all contributions and recognize contributors:

- **Contributors page** on our website
- **Monthly contributor highlights** in our newsletter
- **Special GitHub badges** for significant contributions
- **Conference speaking opportunities** for major contributors

## Questions?

If you have any questions about contributing, please:

1. Check our [FAQ](FAQ.md)
2. Search [existing discussions](https://github.com/fleizean/cvision/discussions)
3. Create a new discussion
4. Email us at contribute@cvision.com

Thank you for contributing to CVision! 🚀