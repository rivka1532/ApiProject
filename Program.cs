// using myApiProject.Services;

// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.

// builder.Services.AddControllers();
// builder.Services.AddBookConst();

// // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();

// app.UseAuthorization();

// app.MapControllers();

// app.Run();

using Middleware.Middlewares;
using myApiProject.Middlewares;
using myApiProject.Services;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddBookConst();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Map("/favicon.ico", (a) => a.Run(async c => await Task.CompletedTask));

app.UseLog();
app.UseError();
app.Use(async (context, next) => 
{
    await context.Response.WriteAsync("1st Middleware start!\n");
    await next();
    await Task.Delay(1000);
    await context.Response.WriteAsync("1st Middleware end!\n");
});

app.Map("/test1", (a) =>
    a.Run(async context =>
    await context.Response.WriteAsync("test1-map terminal Middleware!\n")));
app.Map("/test2", (a) => 
    a.Run(async context => 
    await context.Response.WriteAsync("test2-map terminal Middleware!\n")));

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
