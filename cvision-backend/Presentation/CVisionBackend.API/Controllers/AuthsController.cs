using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CVisionBackend.Application.Abstractions.Services;
using CVisionBackend.Application.DTOs.Common;
using CVisionBackend.Application.DTOs.TokenDTO;
using CVisionBackend.Application.DTOs.User;
using CVisionBackend.Application.DTOs.Auth;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace CVisionBackend.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthsController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthsController> _logger;

        public AuthsController(IAuthService authService, ILogger<AuthsController> logger)
        {
            _authService = authService;
            _logger = logger;
        }
        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(LoginDTO login)
        {
            CommonResponseMessage<TokenDTO> commonResponse = await _authService.LoginAsync(login);
            return Ok(commonResponse);
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(CreateUserDTO createUserDTO)
        {
            CommonResponseMessage<object> commonResponse = await _authService.RegisterAsync(createUserDTO);
            return Ok(commonResponse);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshTokenLoginAsync([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.RefreshToken))
                {
                    return BadRequest(new { Message = "Refresh token boş olamaz.", Status = false });
                }

                _logger.LogInformation("Refresh token login attempt");

                var response = await _authService.RefreshTokenLoginAsync(request.RefreshToken);
                return response.StatusCode == System.Net.HttpStatusCode.OK ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during refresh token login");
                return StatusCode(500, new { Message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", Status = false });
            }
        }

        [HttpGet("me")]
        [Authorize(AuthenticationSchemes = "admin")]
        public async Task<IActionResult> GetCurrentUserAsync()
        {
            try
            {
                CommonResponseMessage<object> commonResponse = await _authService.GetCurrentUserAsync();
                return Ok(commonResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");
                return StatusCode(500, new { Message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.", Status = false });
            }
        }
    }
}
