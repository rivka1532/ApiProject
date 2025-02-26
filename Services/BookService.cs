using Microsoft.AspNetCore.Mvc;
using myApiProject.Models;

namespace myApiProject.Services;

public static class BookService 
{
    private static List<Book> list;

    static BookService()
    {
        list = new List<Book>
        {
            new Book { Id = 1, Name = "Lo Efsacty Lachlom", Author = "Chani Leiser" },
            new Book { Id = 2, Name = "Isterak", Author = "Maya Keinan" },
        };
    }

    public static List<Book> Get()
    {
        return list;
    }

    public static Book Get(int id)
    {
        var book = list.FirstOrDefault(b => b.Id == id);
        return book;
    }
    
    public static int Insert(Book newBook)
    {
        if (newBook == null 
            || string.IsNullOrWhiteSpace(newBook.Name))
            return -1;

        int maxId = list.Max(b => b.Id);
        newBook.Id = maxId + 1;
        list.Add(newBook);

        return newBook.Id;
    }

     
    public static bool Update(int id, Book newBook)
    {
        if (newBook == null 
            || string.IsNullOrWhiteSpace(newBook.Name)
            || newBook.Id != id)
        {
            return false;
        }
        
        var book = list.FirstOrDefault(b => b.Id == id);
        if (book == null)
            return false;

        book.Name = newBook.Name;
        book.Author = newBook.Author;
        
        /*var index = list.IndexOf(pizza);
        list[index] = newPizza;*/

        return true;
    }

    public static bool Delete(int id)
    {
        var book = list.FirstOrDefault(b => b.Id == id);
        if (book == null)
            return false;

        var index = list.IndexOf(book);
        list.RemoveAt(index);

        return true;
    }   
   
}
