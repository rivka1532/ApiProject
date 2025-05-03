using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace myApiProject.Services;

public static class UserTokenService
{
    private static SymmetricSecurityKey key
            = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    "SXkSqsKyNUyvGbnHs7ke2NCq8zQzNLW7mPmHbnZZ"));

    private static string issuer = "https://library-demo.com";
    public static SecurityToken GetToken(List<Claim> claims) =>
        new JwtSecurityToken(
            issuer,
            issuer,
            claims,
            expires: DateTime.Now.AddDays(30.0),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

    public static TokenValidationParameters 
            GetTokenValidationParameters() =>
            new TokenValidationParameters
            {
                ValidIssuer = issuer,
                ValidAudience = issuer,
                IssuerSigningKey = key,
                ClockSkew = TimeSpan.Zero, // remove delay of token when expire
                NameClaimType = ClaimTypes.Name,
                RoleClaimType = ClaimTypes.Role,
            };

        public static string WriteToken(SecurityToken token) =>
            new JwtSecurityTokenHandler().WriteToken(token);
}