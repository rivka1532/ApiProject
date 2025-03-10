using myApiProject.Models;

namespace myApiProject.Middlewares;

public class LogMiddleware
{
    private RequestDelegate next;

    public LogMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task Invoke(HttpContext c)
    {
        await c.Response.WriteAsync($"Log MiddleWare start\n");
        //var sw = new Stopwatch();
        //sw.Start();
        await next(c);
        Console.WriteLine($"{c.Request.Path}.{c.Request.Method}"
            + $"Success: {c.Items["success"]}"
            + $"User: {c.User?.FindFirst("userId")?.Value ?? "unKnown"}");
        await c.Response.WriteAsync("Log MiddleWare end\n");

    }
}

public static class LogMiddlewareHelper
{
    public static void UseLog(this IApplicationBuilder a)
    {
        System.Console.WriteLine("jfdhfkjsdnf,ms");
        a.UseMiddleware<LogMiddleware>();
    }
}