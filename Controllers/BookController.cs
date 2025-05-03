using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]
public class BookController : ControllerBase
{
    private IBookService bookService;

    private readonly IActiveUserService activeUser;

    public BookController(IBookService _bookService, IActiveUserService _activeUser)
    {
        bookService = _bookService;
        activeUser = _activeUser;
    }

    [HttpGet]
    [Authorize]
    public ActionResult<IEnumerable<Book>> Get()
    {
        var currentUser = activeUser.GetActiveUser();
        if (currentUser == null || string.IsNullOrEmpty(currentUser.UserName))
            return Unauthorized();

        var books = bookService.Get();
        if (books == null)
            return Ok(new List<Book>());
        return Ok(bookService.Get().Where(b => b.UserName == activeUser.GetActiveUser().UserName));    
    }

    [HttpGet("{id}")]
    [Authorize]
    public ActionResult<Book> Get(int id)
    {
        var book = bookService.Get(id);
        if (book == null)
            return NotFound();
        if (book.UserName != activeUser.GetActiveUser().UserName)
            return Unauthorized();
        return book;
    }
    
    [HttpPost]
    [Authorize]
    public ActionResult Post(Book newBook)
    {
        newBook.UserName = activeUser.GetActiveUser().UserName;
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
        newBook.UserName = activeUser.GetActiveUser().UserName;
        if (newBook.UserName != activeUser.GetActiveUser().UserName)
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
        Book book = bookService.Get(id);
        if (book.UserName != activeUser.GetActiveUser().UserName   )
            return Forbid();

        if (bookService.Delete(id))
            return Ok();
            
        return NotFound();
    }   
   
}