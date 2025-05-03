using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using myApiProject.Interfaces;
using myApiProject.Models;
using myApiProject.Services;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]

public class UserController : ControllerBase
{
    private IUserService userService;
    private readonly IActiveUserService activeUser;

    public UserController(IActiveUserService _activeUser, IUserService _userService)
    {
        userService = _userService;
        activeUser = _activeUser;

    }

    [HttpPost("login")]
    public ActionResult Login([FromBody] User loginUser)
    {
        // קריאה לפעולה שמביאה משתמש לפי שם משתמש
        var existingUser = userService.Get(loginUser.UserName);

        if (existingUser == null)
        {
            return NotFound("User not found");
        }

        // בדיקת סיסמה - את יכולה גם להצפין ולהשוות ערכים מוצפנים
        if (existingUser.Password != loginUser.Password)
        {
            return Unauthorized("Invalid password");
        }
        else
        {
            // שמירת פרטי משתמש פעיל
            activeUser.SetActiveUser(existingUser.Id, existingUser.UserName, existingUser.Role);
        }

        // אם הכל תקין - יצירת טוקן
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, existingUser.Id.ToString()),
            new Claim(ClaimTypes.Name, existingUser.UserName),
            new Claim(ClaimTypes.Role,"User"),
        };

        if (existingUser.Role == Role.Admin)
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));

        var token = UserTokenService.GetToken(claims);

        // _logger.LogInformation("Login attempt for user '{UserName}'", loginUser.UserName);

        return Ok(new { Id = existingUser.Id , Token = UserTokenService.WriteToken(token)});
    }


    [HttpGet]
    [Route("[action]")]
    [Authorize]
    public ActionResult<IEnumerable<User>> Get()
    {
        if (activeUser.GetActiveUser().Role != Role.Admin)
        {
            return new List<User>{userService.Get(activeUser.GetActiveUser().Id)};
        }
        return userService.Get();
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<User> GetMyUser()
    {
        try
        {
            if (activeUser == null)
            throw new Exception("activeUser is null");
        var active = activeUser.GetActiveUser();
        if (active == null)
            throw new Exception("activeUser.GetActiveUser() returned null");
        var userId = activeUser.GetActiveUser().Id;
        var user = userService.Get(userId);
        return user == null ? NotFound() : Ok(user);
        }
        catch (System.Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("byId/{id}")]
    public ActionResult<User> Get(int id)
    {
        var user = userService.Get(id);
        if (user == null)
        {
            return NotFound();
        }
        return user;
    }

    [HttpGet("byName/{userName}")]
    public ActionResult<User> Get(string userName)
    {
        var user = userService.Get(userName);
        if (user == null)
        {
            return null;
        }
        return user;
    }

    [HttpPost]
    [Authorize(Policy = "Admin")]
    public ActionResult Post([FromBody] User newUser)
    {
        var newId = userService.Insert(newUser);
        if (newId == -1)
        {
            return BadRequest();
        }
        return CreatedAtAction(nameof(Post), new { Id = newId });
    }

    [HttpPut("{id}")]
    public ActionResult Put(int id, User newUser)
    {
        if (id != activeUser.GetActiveUser().Id && activeUser.GetActiveUser().Role != Role.Admin)
        {
            return Unauthorized();
        }
        if (userService.Update(id, newUser))
        {
            return NoContent();
        }
        return BadRequest();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Admin")]
    public ActionResult Delete(int id)
    {
        if (userService.Delete(id))
        {
            return Ok();
        }
        return NotFound();
    }
}