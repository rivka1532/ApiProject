using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Interfaces;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]
public class BookController : ControllerBase
{
    private IBookService bookService;

    public BookController(IBookService bookService)
    {
        this.bookService = bookService;
    }

    [HttpGet]
    public ActionResult<IEnumerable<Book>> Get()
    {
        return bookService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Book> Get(int id)
    {
        var book = bookService.Get(id);
        if (book == null)
            return NotFound();

        return book;
    }
    
    [HttpPost]
    public ActionResult Post(Book newBook)
    {
        var newId = bookService.Insert(newBook);
        if (newId == -1)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Post), new { Id= newId});
    }

     
    [HttpPut("{id}")]
    public ActionResult Put(int id, Book newBook)
    {
        if (bookService.Update(id, newBook))
        {
            return NoContent();
        }
        return BadRequest();
        
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        if (bookService.Delete(id))
            return Ok();
            
        return NotFound();
    }   
   
}