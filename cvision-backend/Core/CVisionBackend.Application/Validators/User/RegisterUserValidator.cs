using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CVisionBackend.Application.DTOs.User;
using FluentValidation;

namespace CVisionBackend.Application.Validators.User
{
    public class RegisterUserValidator : AbstractValidator<CreateUserDTO>
    {
        public RegisterUserValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"\d").WithMessage("Password must contain at least one digit.")
                .Matches(@"[\!\?\*\.@#\$%\^&\+=]").WithMessage("Password must contain at least one special character (! ? * . @ # $ % ^ & + =).");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("First name is required.")
                .Matches(@"^[a-zA-Z]+$").WithMessage("First name must contain only letters.");

            RuleFor(x => x.Surname)
                .NotEmpty().WithMessage("Last name is required.")
                .Matches(@"^[a-zA-Z]+$").WithMessage("Last name must contain only letters.");
        }
    }
}