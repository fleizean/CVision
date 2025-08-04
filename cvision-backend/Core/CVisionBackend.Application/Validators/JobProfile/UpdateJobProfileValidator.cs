using CVisionBackend.Application.DTOs.JobProfile;
using FluentValidation;

namespace CVisionBackend.Application.Validators.JobProfile
{
    public class UpdateJobProfileValidator : AbstractValidator<UpdateJobProfileDTO>
    {
        public UpdateJobProfileValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty()
                .WithMessage("Job profile ID is required");

            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Job title is required")
                .MaximumLength(200)
                .WithMessage("Job title cannot exceed 200 characters");

            RuleFor(x => x.SuggestedKeywords)
                .NotNull()
                .WithMessage("Suggested keywords are required")
                .Must(keywords => keywords.Count > 0)
                .WithMessage("At least one keyword is required")
                .Must(keywords => keywords.Count <= 100)
                .WithMessage("Maximum 100 keywords are allowed");

            RuleForEach(x => x.SuggestedKeywords)
                .NotEmpty()
                .WithMessage("Keywords cannot be empty")
                .MaximumLength(100)
                .WithMessage("Each keyword cannot exceed 100 characters");
        }
    }
}