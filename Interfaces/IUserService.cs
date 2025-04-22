using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;

namespace myApiProject.Interfaces;

public interface IUserService 
{
    List<User> Get();

    User Get(int id);

    int Insert(User newUser);

    bool Update(int id, User newUser);

    bool Delete(int id); 
   
}
