namespace  Middleware.Middlewares;

public class ErrorMiddleware
{
    private RequestDelegate next;

    public ErrorMiddleware(RequestDelegate next)
    {
        this.next = next;
    }

    public async Task Invoke(HttpContext c)
    {
        c.Items["success"] = false;
        bool success = false;
        try
        {
            await next(c);
            c.Items["success"] = true;
        }
        catch (ApplicationException ex)
        {
            if (!c.Response.HasStarted)
            {
                c.Response.StatusCode = 400; // או קוד אחר שמתאים
            }
            else
            {
                // ניתן לרשום Log שמזהיר שהתגובה כבר התחילה
                Console.WriteLine("Warning: Attempted to set StatusCode after response started.");
            }
            await c.Response.WriteAsync(ex.Message);
        }
        catch (Exception e)
        {
            if (!c.Response.HasStarted)
            {
                c.Response.StatusCode = 500; // או קוד אחר שמתאים
            }
            else
            {
                // ניתן לרשום Log שמזהיר שהתגובה כבר התחילה
                Console.WriteLine("Warning: Attempted to set StatusCode after response started.");
            }
            await c.Response.WriteAsync("פנה לתמיכה טכנית");
        }
    }

}

public static partial class MiddlewareExtensions
{
    public static WebApplication UseError(this WebApplication app)
    {
        app.UseMiddleware<ErrorMiddleware>();
        return app;
    }
}