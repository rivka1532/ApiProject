using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Interfaces;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace myApiProject.Services;

public class UserService : IUserService
{
    List<User>? users { get; }
    private static string fileName = "User.json";
    private static string filePath;
    private readonly IBookService _bookService;
    public UserService(IHostEnvironment env, IBookService bookService)
    {
        _bookService = bookService;

        filePath = Path.Combine(env.ContentRootPath, "Data", fileName);

        using (var jsonFile = File.OpenText(filePath))
        {
            users = JsonSerializer.Deserialize<List<User>>(jsonFile.ReadToEnd(),
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }

            });
        }
    }
    private void saveToFile()
    {
        File.WriteAllText(filePath, JsonSerializer.Serialize(users));
    }
    public List<User> Get() => users;
    public User Get(int id) => users.FirstOrDefault<User>(u => u.Id == id);   
    public User Get(string name) => users.FirstOrDefault<User>(u => u.UserName == name);
    public User GetByEmail(string email) => users.FirstOrDefault<User>(u => u.Email == email);    


    public int Insert(User newUser)
    {
        int nextId = users.Any() ? users.Max(u => u.Id) + 1 : 1;
        if(IsUserEmpty(newUser))
            return -1;    
        // if(users.Any(u => u.UserName == newUser.UserName))
        //     return -1;
        // if(users.Any(u => u.Email == newUser.Email))
        //     return -1;    
        newUser.Id = nextId;
        users.Add(newUser);
        saveToFile();
        return newUser.Id;
    }

    public bool Update(int id, User newUser)
    {
        if(IsUserEmpty(newUser) || newUser.Id != id)
            return false;
        var index = users.FindIndex(b => b.Id == id);
        if(index == -1)
            return false;
        users[index] = newUser;
        saveToFile();
        return true;
    }

    public bool Delete(int id)
    {
        var user = Get(id);
        if(user == null)
            return false;
        
        var userBooks = _bookService.Get().Where(b => b.UserId == user.Id).ToList();
        foreach (var book in userBooks)
        {
            _bookService.Delete(book.Id);
        }

        users.Remove(user);
        saveToFile();
        return true;
    }

    
    public bool IsUserEmpty(User user)
    {
        return user == null;
    }

}

public static class UserUtilities
{
    public static void AddUserJson(this IServiceCollection services)
    {
        services.AddSingleton<IUserService, UserService>();

    }
}