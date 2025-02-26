using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;
using myApiProject.Services;

namespace myApiProject.Controllers;

[ApiController]
[Route("[controller]")]
public class BookController : ControllerBase
{

    [HttpGet]
    public ActionResult<IEnumerable<Book>> Get()
    {
        return BookService.Get();
    }

    [HttpGet("{id}")]
    public ActionResult<Book> Get(int id)
    {
        var book = BookService.Get(id);
        if (book == null)
            return NotFound();

        return book;
    }
    
    [HttpPost]
    public ActionResult Post(Book newBook)
    {
        var newId = BookService.Insert(newBook);
        if (newId == -1)
        {
            return BadRequest();
        }

        return CreatedAtAction(nameof(Post), new { Id= newId});
    }

     
    [HttpPut("{id}")]
    public ActionResult Put(int id, Book newBook)
    {
        if (BookService.Update(id, newBook))
        {
            return NoContent();
        }
        return BadRequest();
        
    }

    [HttpDelete("{id}")]
    public ActionResult Delete(int id)
    {
        if (BookService.Delete(id))
            return Ok();
            
        return NotFound();
    }   
   
}