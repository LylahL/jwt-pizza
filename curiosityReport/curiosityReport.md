
# Curiosity Report: Understanding JSON Web Tokens (JWT)

## What Is JWT?
Imagine you go to a concert and they give you a wristband at the entrance. That wristband proves you’ve paid and are allowed to be there. You can show it to security at any time, and they’ll let you in because it has everything they need to trust you.

A **JSON Web Token (JWT)** plays the same role for websites and apps—a digital wristband that proves who you are after you log in.

## How a JWT Is Built
A JWT is a single string with three base‑64‑url–encoded parts separated by periods:

### Header
Declares the token type and the signing algorithm.

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
Contains the claims—information about the user and the token’s validity period.

```json
{
  "userId": "abc123",
  "name": "Alice",
  "admin": false,
  "exp": 1712750387
}
```

> **Important:** The payload is only encoded, not encrypted. Anyone who obtains the token can read these fields.

### Signature
The server signs the header and payload with a secret or private key. If either part is modified, the signature check will fail.

## Why JWT Was Created
Before JWTs, session data lived on the server (in memory or a database). That scales poorly because the server must track every user. A JWT moves the session data into the token itself, letting servers remain stateless: the token carries all the information needed to authenticate the request.

## Strengths
- **Stateless**: no server‑side session store required.
- **Fast**: no database lookup on each request.
- **Portable**: works across domains, services, and languages.
- **Compact**: easy to pass in headers, cookies, or URLs.

## Weaknesses
- **Hard to “log out”**: a token is valid until it expires unless extra logic is added.
- **Not encrypted**: anyone with the token can read its payload.
- **Token bloat**: large payloads increase request size.
- **Overuse**: sometimes simpler cookies or sessions are safer and easier.


## Questions

### What Happens During JWT Signature Verification?
- The server base‑64‑decodes the header and payload.
- It re‑creates the signing input (`header.payload`).
- Using the shared secret (HMAC) or public key (RSA), it computes its own signature.
- If the computed signature matches the token’s signature, the token is accepted; otherwise, it is rejected as tampered.

### HS256 vs. RS256

| Feature | HS256 (HMAC‑SHA‑256) | RS256 (RSA‑SHA‑256) |
|--------|----------------------|----------------------|
| **Keys** | One shared secret | Private key signs; public key verifies |
| **Deployment** | Simple, single service | Multiple services can verify without knowing the private key |
| **Risk** | Secret must be shared everywhere verification occurs | Larger keys, more CPU, but secret never leaves signing service |

- Choose **HS256** for simple single‑service architectures.
- Choose **RS256** when many services or third parties must verify tokens.

### Replay Attacks and Prevention
A replay attack occurs when an attacker captures a valid JWT and reuses it. Because JWTs are stateless, the server cannot know the difference unless you add safeguards:
- Short access‑token lifetimes.
- Pair access tokens with refresh tokens.
- Record context (IP, user‑agent) and reject changes.
- Maintain a server‑side blacklist of revoked tokens.

### Can JWTs Be Encrypted?
Yes. **JSON Web Encryption (JWE)** wraps the payload in encryption so only the intended recipient can read it.

- **Signed JWT**: anyone can read, no one can alter.
- **Encrypted JWE**: only the recipient can read; also optionally signed.

Use **JWE** when the payload contains confidential data that must stay hidden from clients or intermediaries.

### Invalidating a JWT Before Expiry
- **Token blacklist**: store revoked token IDs or hashes server‑side.
- **Short expiry + refresh tokens**: issue access tokens for minutes, refresh tokens for days.
- **Delete refresh token on logout**: remove it from the database so no new access tokens can be minted.

### Refresh Tokens
- **Access token**: short‑lived (5–15 minutes).
- **Refresh token**: long‑lived (days or weeks) and stored securely.

**Workflow:**
1. Client presents access token with each request.
2. When the access token expires, the client sends the refresh token to obtain a new access token.
3. If the user logs out or the account is compromised, revoke the refresh token in the database.

This limits the window of misuse if an access token is stolen and gives the server a handle to end sessions.