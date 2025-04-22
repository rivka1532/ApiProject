using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Interfaces;
using System.Text.Json;

namespace myApiProject.Services;

public class UserService : IUserService
{
   List<User>? users { get; }
    private static string fileName = "User.json";
    private static string filePath;
    public UserService(IHostEnvironment env)
    {
        filePath = Path.Combine(env.ContentRootPath, "Data", fileName);

        using (var jsonFile = File.OpenText(filePath))
        {
            users = JsonSerializer.Deserialize<List<User>>(jsonFile.ReadToEnd(),
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
    private void saveToFile()
    {
        File.WriteAllText(filePath, JsonSerializer.Serialize(users));
    }
    public List<User> Get() => users;
    public User Get(int id) => users.FirstOrDefault<User>(u => u.Id == id);    
    public int Insert(User newUser)
    {
        if(IsUserEmpty(newUser))
            return -1;        
        newUser.Id = users.Count()+1;
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
    public static void AddUserConst(this IServiceCollection services)
    {
        services.AddSingleton<IUserService, UserService>();

    }
}