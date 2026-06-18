package com.kaya.agri.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;

@ApplicationScoped
public class JwtProvider {

    private final SecretKey key = Keys.hmacShaKeyFor(
        System.getenv().getOrDefault("JWT_SECRET", "kaya-agri-secret-key-change-in-production-32chars!")
            .getBytes(StandardCharsets.UTF_8)
    );

    private final long expirationMs = 86400000L;

    public String generateToken(String username, Set<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
            .subject(username)
            .claim("roles", String.join(",", roles))
            .issuedAt(now)
            .expiration(expiry)
            .signWith(key)
            .compact();
    }

    public Claims validateToken(String token) {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String getUsername(String token) {
        return validateToken(token).getSubject();
    }

    public Set<String> getRoles(String token) {
        String rolesStr = validateToken(token).get("roles", String.class);
        if (rolesStr == null || rolesStr.isBlank()) return Set.of();
        return Set.of(rolesStr.split(","));
    }
}
