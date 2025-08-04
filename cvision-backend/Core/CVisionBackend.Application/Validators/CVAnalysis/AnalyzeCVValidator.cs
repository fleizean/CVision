using CVisionBackend.Application.DTOs.CVAnalysis;
using FluentValidation;

namespace CVisionBackend.Application.Validators.CVAnalysis
{
    public class AnalyzeCVValidator : AbstractValidator<AnalyzeCVDTO>
    {
        public AnalyzeCVValidator()
        {
            RuleFor(x => x.FileId)
                .NotEmpty()
                .WithMessage("File ID is required");

            RuleFor(x => x.TargetKeywords)
                .Must(keywords => keywords == null || keywords.Count <= 50)
                .WithMessage("Maximum 50 keywords are allowed");

            RuleForEach(x => x.TargetKeywords)
                .MaximumLength(100)
                .WithMessage("Each keyword cannot exceed 100 characters")
                .When(x => x.TargetKeywords != null && x.TargetKeywords.Count > 0);
        }
    }
}