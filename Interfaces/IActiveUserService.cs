using myApiProject.Models;

public interface IActiveUserService
{
    UserDto GetActiveUser();
    void SetActiveUser(int Id, string userName, Role role);
}
