using CVisionBackend.Application.DTOs.CVFile;
using FluentValidation;

namespace CVisionBackend.Application.Validators.CVFile
{
    public class UploadCVFileValidator : AbstractValidator<UploadCVFileDTO>
    {
        public UploadCVFileValidator()
        {
            RuleFor(x => x.File)
                .NotNull()
                .WithMessage("File is required");

            RuleFor(x => x.File.Length)
                .LessThanOrEqualTo(10 * 1024 * 1024) // 10MB
                .WithMessage("File size must be less than 10MB")
                .When(x => x.File != null);

            RuleFor(x => x.File.ContentType)
                .Must(contentType => contentType == "application/pdf" || 
                                   contentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                                   contentType == "application/msword")
                .WithMessage("Only PDF and Word documents are allowed")
                .When(x => x.File != null);

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .WithMessage("Description cannot exceed 500 characters");
        }
    }
}