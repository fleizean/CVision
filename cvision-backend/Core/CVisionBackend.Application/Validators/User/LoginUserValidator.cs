using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CVisionBackend.Application.DTOs.User;
using FluentValidation;

namespace CVisionBackend.Application.Validators.User
{
    public class LoginUserValidator : AbstractValidator<LoginDTO>
    {
        public LoginUserValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters long.");
        }
    }
}