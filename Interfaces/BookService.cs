using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;

namespace myApiProject.Interfaces;

public interface IBookService 
{
    List<Book> Get();

    Book Get(int id);

    int Insert(Book newBook);

    bool Update(int id, Book newBook);

    bool Delete(int id); 
   
}
