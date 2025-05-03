using System.Security.Claims;
using myApiProject.Models;

namespace myApiProject.Services;

public class ActiveUserService : IActiveUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ISession _session;

    public ActiveUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        _session = _httpContextAccessor.HttpContext?.Session 
                   ?? throw new InvalidOperationException("Session is not available");
    }

    public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);
    public string UserId => _session.GetString("UserId") ?? "";
    public string Name => _session.GetString("UserName") ?? "";
    public string Role => _session.GetString("UserRole") ?? "User";

    public void SetActiveUser(int userId, string name, Role role)
    {
        _session.SetString("UserId", userId.ToString());
        _session.SetString("UserName", name);
        _session.SetString("UserRole", role.ToString());
    }

    public void ClearUser()
    {
        _session.Remove("UserId");
        _session.Remove("UserName");
        _session.Remove("UserRole");

    }
    public UserDto GetActiveUser()
    {
        if (!IsAuthenticated) return null;
        
        Role Role;
        Enum.TryParse(_httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value, out Role);
        return new UserDto
        {
            Id = int.Parse(UserId),
            UserName = Name,
            Role = Role
        };
    }
}