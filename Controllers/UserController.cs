using Microsoft.AspNetCore.Mvc;
using myApiProject.Interfaces;
using myApiProject.Models;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]

public class UserController: ControllerBase
{
    private IUserService userService;
    public UserController(IUserService userService)
    {
        this.userService = userService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<User>> Get()
    {
        return userService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<User> Get(int id)
    {
        var user = userService.Get(id);
        if (user == null)
        {
            return NotFound();
        }
        return user;
    }

    [HttpPost]
    public ActionResult Post(User newUser)
    {
        var newId = userService.Insert(newUser);
        if(newId == -1)
        {
            return BadRequest();
        }
        return CreatedAtAction(nameof(Post), new{Id = newId});
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, User newUser)
    {
        if(userService.Update(id, newUser))
        {
            return NoContent();
        }
        return BadRequest();
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        if(userService.Delete(id))
        {
            return Ok();
        }
        return NotFound();
    }
}