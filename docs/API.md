# Mail Tracking System — API Documentation

Base URL: `http://localhost:3000`

All authenticated endpoints require:

```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /auth/register

Register a new user account.

**Request Body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success Response — 201**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 409 | Email already registered |

---

### POST /auth/login

Authenticate and receive a JWT.

**Request Body**

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses**

| Status | Message |
|--------|---------|
| 401 | Invalid email or password |

---

## Google OAuth (Gmail)

### GET /google/connect

Returns the Google OAuth authorization URL. Requires JWT.

**Headers**

```
Authorization: Bearer <token>
```

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

Redirect the user to `authUrl` to connect their Gmail account.

---

### GET /google/callback

OAuth2 callback endpoint. Called by Google after user consent.

**Query Parameters**

| Param | Description |
|-------|-------------|
| code | Authorization code from Google |
| state | User ID passed during OAuth flow |

**Behavior**

- Exchanges code for access/refresh tokens
- Stores tokens in `gmail_accounts` table
- Redirects to `/dashboard?gmail=connected`

---

## Email

### POST /email/send

Send a tracked HTML email via the connected Gmail account.

**Headers**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**

```json
{
  "recipient": "client@example.com",
  "subject": "Project Update",
  "body": "<p>Hello, here is your update.</p>"
}
```

**Success Response — 201**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "trackingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "recipient": "client@example.com",
    "subject": "Project Update",
    "status": "sent",
    "sentAt": "2026-07-21T12:00:00.000Z"
  }
}
```

**Notes**

- `body` must be HTML. A 1×1 tracking pixel is injected automatically.
- Requires a connected Gmail account (`GET /google/connect` first).

**Error Responses**

| Status | Message |
|--------|---------|
| 400 | Gmail not connected / validation error |
| 502 | Gmail send failure |

---

### GET /email

List all tracked emails for the authenticated user.

**Success Response — 200**

```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "recipient": "client@example.com",
      "subject": "Project Update",
      "sentTime": "2026-07-21T12:00:00.000Z",
      "openStatus": "opened",
      "openCount": 3,
      "lastOpenTime": "2026-07-21T14:30:00.000Z",
      "status": "sent"
    }
  ]
}
```

**Dashboard Fields**

| Field | Description |
|-------|-------------|
| recipient | Email recipient address |
| subject | Email subject line |
| sentTime | When the email was sent |
| openStatus | `opened` or `not_opened` |
| openCount | Total number of opens |
| lastOpenTime | Most recent open timestamp |

---

### GET /email/:id

Get detailed email info including all open events.

**Success Response — 200**

```json
{
  "success": true,
  "data": {
    "id": 5,
    "recipient": "client@example.com",
    "subject": "Project Update",
    "sentTime": "2026-07-21T12:00:00.000Z",
    "openStatus": "opened",
    "openCount": 3,
    "lastOpenTime": "2026-07-21T14:30:00.000Z",
    "status": "sent",
    "trackingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "body": "<p>Hello, here is your update.</p>",
    "gmailMessageId": "18abc123",
    "opens": [
      {
        "id": 1,
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0 ...",
        "referer": null,
        "openedAt": "2026-07-21T14:30:00.000Z",
        "openCount": 2
      }
    ]
  }
}
```

---

## Tracking

### GET /track/:trackingId

Tracking pixel endpoint. Called automatically when a recipient opens an HTML email.

**Behavior**

1. Finds email by `trackingId` (UUID)
2. Records or updates an `email_opens` row with:
   - IP address (from `X-Forwarded-For` or socket)
   - User-Agent header
   - Referer header
   - Timestamp
   - Incremented open count
3. Returns a transparent 1×1 PNG image

**Response**

```
Content-Type: image/png
Cache-Control: no-store, no-cache, must-revalidate, private
```

**Example**

```html
<img src="http://localhost:3000/track/a1b2c3d4-e5f6-7890-abcd-ef1234567890" width="1" height="1" />
```

---

## Health Check

### GET /health

```json
{
  "success": true,
  "message": "Mail Tracking System is running"
}
```

---

## Error Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 3000) |
| APP_URL | Public URL for tracking pixel links |
| DB_HOST | MySQL host |
| DB_PORT | MySQL port |
| DB_USER | MySQL username |
| DB_PASSWORD | MySQL password |
| DB_NAME | MySQL database name |
| JWT_SECRET | Secret for signing JWTs |
| JWT_EXPIRES_IN | Token expiry (default: 7d) |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |
| GOOGLE_REDIRECT_URI | OAuth callback URL |
