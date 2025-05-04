using System.Security.Claims;
using myApiProject.Services;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text;
using myApiProject.Interfaces;
using System.Text.Json.Serialization;
using Serilog;

// Log.Logger = new LoggerConfiguration()
//     .WriteTo.Console()
//     .WriteTo.File("logs/log.txt", rollingInterval: RollingInterval.Day)
//     .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

builder.Host.UseSerilog((context, services, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File(
            path: context.Configuration["Logging:FilePath"] ?? "logs/log.txt",
            rollingInterval: RollingInterval.Day,
            fileSizeLimitBytes: 104857600, // 100MB
            rollOnFileSizeLimit: true,
            outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        );
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IActiveUserService, ActiveUserService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddBookJson();
builder.Services.AddUserJson();

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = "https://library-demo.com",
        ValidateAudience = true,
        ValidAudience = "https://library-demo.com",
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SXkSqsKyNUyvGbnHs7ke2NCq8zQzNLW7mPmHbnZZ")),
        NameClaimType = ClaimTypes.Name,
        RoleClaimType = ClaimTypes.Role
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("User", policy => policy.RequireRole("User", "Admin"));
});

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "myApiProject", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


var app = builder.Build();

app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "Handled {RequestMethod} {RequestPath} in {Elapsed:0.0000} ms - User: {User} - Controller: {Controller} - Action: {Action} - TimeStarted: {StartTime}";

    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        var user = httpContext.User.Identity?.Name ?? "Anonymous";
        var endpoint = httpContext.GetEndpoint();
        var routePattern = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Routing.RouteNameMetadata>()?.RouteName;
        var routeValues = httpContext.Request.RouteValues;

        diagnosticContext.Set("User", user);
        diagnosticContext.Set("Controller", routeValues["controller"]?.ToString() ?? "Unknown");
        diagnosticContext.Set("Action", routeValues["action"]?.ToString() ?? "Unknown");
        diagnosticContext.Set("StartTime", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
    };
});

app.UseRouting();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
