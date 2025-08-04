using System.ComponentModel.DataAnnotations;

namespace CVisionBackend.Application.DTOs.Auth
{
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "Refresh token boş olamaz")]
        public string RefreshToken { get; set; }
    }
}