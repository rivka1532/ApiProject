using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MimeKit;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]
public class BookController : ControllerBase
{
    private IBookService bookService;

    private readonly IActiveUserService activeUser;

    private readonly IUserService userService;

    public BookController(IBookService _bookService, IActiveUserService _activeUser, IUserService _userService)
    {
        bookService = _bookService;
        activeUser = _activeUser;
        userService = _userService;
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IEnumerable<Book>> Get()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var currentUser = userService.Get().FirstOrDefault(u => u.Id.ToString() == userId);
        if (currentUser == null || string.IsNullOrEmpty(currentUser.UserName))
            return Unauthorized();

        var books = bookService.Get();
        if (books == null)
            return Ok(new List<Book>());
        return Ok(bookService.Get().Where(b => b.UserName == currentUser.UserName));    
    }

    [HttpGet("{id}")]
    [Authorize]
    public ActionResult<Book> Get(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var book = bookService.Get(id);
        if (book == null)
            return NotFound();
        if (book.UserName != userService.Get(userId).UserName)
            return Unauthorized();
        return book;
    }
    
    [HttpPost]
    [Authorize]
    public ActionResult Post(Book newBook)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = userService.Get().FirstOrDefault(u => u.Id.ToString() == userId);
        newBook.UserName = user.UserName;
        var newId = bookService.Insert(newBook);
        if (newId == -1)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Post), new { Id= newId});
    }

     
    [HttpPut("{id}")]
    [Authorize]
    public ActionResult Put(int id, Book newBook)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = userService.Get().FirstOrDefault(u => u.Id.ToString() == userId);
        newBook.UserName = user.UserName;
        if (newBook.UserName != userService.Get(userId).UserName)
            return Forbid();
            
        if (bookService.Update(id, newBook))
        {
            return NoContent();
        }
        return BadRequest();
        
    }

    [HttpDelete("{id}")]
    [Authorize]
    public ActionResult Delete(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = userService.Get().FirstOrDefault(u => u.Id.ToString() == userId);
        Book book = bookService.Get(id);
        if (book.UserName != user.UserName )
            return Forbid();

        if (bookService.Delete(id))
            return Ok();
            
        return NotFound();
    }   
   
}