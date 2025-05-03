namespace myApiProject.Models;

public class User
{
    public int Id { get; set;}
    public string? UserName { get; set;}
    public string? Password { get; set;}
    public Role Role { get; set;}
}

public class UserDto  
{
    public int Id { get; set;}
    public string? UserName { get; set;}
    public Role Role { get; set;}
}