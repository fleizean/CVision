namespace CVisionBackend.Application.DTOs.Analytics
{
    public class UserActivityDTO
    {
        public int ActiveUsers { get; set; }
        public int NewUsersThisMonth { get; set; }
        public int ReturningUsers { get; set; }
    }
}