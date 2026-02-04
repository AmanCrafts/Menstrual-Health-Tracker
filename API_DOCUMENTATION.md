# 📡 FlowSync API Documentation

Complete reference for the FlowSync REST API.

**Base URL**: `http://localhost:5000/api` (development)

**Version**: 1.0.0

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Auth](#auth-endpoints)
  - [Periods](#period-endpoints)
  - [Symptoms](#symptom-endpoints)
  - [Moods](#mood-endpoints)
  - [Health](#health-endpoints)
- [Response Formats](#response-formats)
- [Status Codes](#status-codes)

---

## 🔐 Authentication

FlowSync uses **JWT (JSON Web Tokens)** for authentication.

### Authentication Flow

1. **Login/Register** → Receive access token & refresh token
2. **Include Token** → Send access token in subsequent requests
3. **Token Expires** → Use refresh token to get new access token
4. **Logout** → Invalidate refresh token

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Structure

**Access Token**: Short-lived (7 days), used for API requests
**Refresh Token**: Long-lived (30 days), used to get new access tokens

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Messages

| Error               | Description                        |
| ------------------- | ---------------------------------- |
| User not found      | User doesn't exist                 |
| Invalid credentials | Wrong password                     |
| Token expired       | Access token has expired           |
| Unauthorized        | No token provided or invalid token |
| Validation error    | Invalid input data                 |
| Resource not found  | Requested resource doesn't exist   |

---

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Other endpoints**: 100 requests per 15 minutes per user

Exceeded limits return `429 Too Many Requests`.

---

## 🔗 Endpoints

### Auth Endpoints

#### Register User

```http
POST /api/auth/register
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "Jane Doe",
  "birthDate": "1995-06-15",
  "cycleLength": 28,
  "periodLength": 5,
  "lastPeriodDate": "2026-01-15"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "displayName": "Jane Doe",
      "cycleLength": 28,
      "periodLength": 5
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login User

```http
POST /api/auth/login
```

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "displayName": "Jane Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get Current User

```http
GET /api/auth/me
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "displayName": "Jane Doe",
    "birthDate": "1995-06-15",
    "cycleLength": 28,
    "periodLength": 5,
    "lastPeriodDate": "2026-01-15",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### Refresh Token

```http
POST /api/auth/refresh-token
```

**Request Body**:

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Update Profile

```http
PUT /api/auth/update-profile
```

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):

```json
{
  "displayName": "Jane Smith",
  "birthDate": "1995-06-15",
  "cycleLength": 30,
  "periodLength": 6,
  "lastPeriodDate": "2026-02-01"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "email": "user@example.com",
    "displayName": "Jane Smith",
    "cycleLength": 30,
    "periodLength": 6
  }
}
```

---

#### Update Password

```http
PUT /api/auth/update-password
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

#### Logout

```http
POST /api/auth/logout
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Period Endpoints

#### Get All Periods

```http
GET /api/periods
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `startDate` (optional): Filter periods after this date (ISO 8601)
- `endDate` (optional): Filter periods before this date (ISO 8601)
- `limit` (optional): Number of results (default: 100)
- `sort` (optional): Sort order, e.g., `-startDate` (default: newest first)

**Response** (200 OK):

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
      "startDate": "2026-02-01T00:00:00.000Z",
      "endDate": "2026-02-06T00:00:00.000Z",
      "flow": "medium",
      "notes": "Normal flow",
      "createdAt": "2026-02-01T10:30:00.000Z"
    }
  ]
}
```

---

#### Create Period Log

```http
POST /api/periods
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "startDate": "2026-02-01",
  "endDate": "2026-02-06",
  "flow": "medium",
  "notes": "Normal flow"
}
```

**Validation Rules**:

- `startDate`: Required, must be valid date
- `endDate`: Optional, must be after startDate
- `flow`: Optional, one of: `light`, `medium`, `heavy`
- `notes`: Optional, max 500 characters

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-06T00:00:00.000Z",
    "flow": "medium",
    "notes": "Normal flow",
    "createdAt": "2026-02-01T10:30:00.000Z"
  }
}
```

---

#### Get Single Period

```http
GET /api/periods/:id
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-06T00:00:00.000Z",
    "flow": "medium",
    "notes": "Normal flow"
  }
}
```

---

#### Update Period

```http
PUT /api/periods/:id
```

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):

```json
{
  "endDate": "2026-02-07",
  "flow": "heavy",
  "notes": "Heavier than usual"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "startDate": "2026-02-01T00:00:00.000Z",
    "endDate": "2026-02-07T00:00:00.000Z",
    "flow": "heavy",
    "notes": "Heavier than usual"
  }
}
```

---

#### Delete Period

```http
DELETE /api/periods/:id
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Period log deleted successfully"
}
```

---

### Symptom Endpoints

#### Get All Symptoms

```http
GET /api/symptoms
```

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**: Same as periods

**Response** (200 OK):

```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
      "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
      "date": "2026-02-03T00:00:00.000Z",
      "symptoms": {
        "cramps": true,
        "headache": true,
        "fatigue": true,
        "bloating": false
      },
      "severity": "moderate",
      "notes": "Cramps in the morning",
      "createdAt": "2026-02-03T10:00:00.000Z"
    }
  ]
}
```

---

#### Create Symptom Log

```http
POST /api/symptoms
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "date": "2026-02-03",
  "symptoms": {
    "cramps": true,
    "headache": true,
    "backache": false,
    "fatigue": true,
    "bloating": false,
    "breastTenderness": false,
    "nausea": false,
    "acne": false,
    "moodSwings": true,
    "irritability": false,
    "anxiety": false,
    "depression": false,
    "foodCravings": true,
    "insomnia": false,
    "hotFlashes": false
  },
  "severity": "moderate",
  "notes": "Cramps in the morning"
}
```

**Available Symptoms**:

- cramps
- headache
- backache
- fatigue
- bloating
- breastTenderness
- nausea
- acne
- moodSwings
- irritability
- anxiety
- depression
- foodCravings
- insomnia
- hotFlashes

**Severity Levels**: `mild`, `moderate`, `severe`

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j2",
    "date": "2026-02-03T00:00:00.000Z",
    "symptoms": {
      "cramps": true,
      "headache": true,
      "fatigue": true
    },
    "severity": "moderate",
    "notes": "Cramps in the morning"
  }
}
```

---

### Mood Endpoints

#### Get All Moods

```http
GET /api/moods
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "count": 30,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
      "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
      "date": "2026-02-03T00:00:00.000Z",
      "mood": "calm",
      "notes": "Feeling relaxed today",
      "createdAt": "2026-02-03T14:00:00.000Z"
    }
  ]
}
```

---

#### Create Mood Log

```http
POST /api/moods
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "date": "2026-02-03",
  "mood": "calm",
  "notes": "Feeling relaxed today"
}
```

**Available Moods**:

- happy
- calm
- energetic
- content
- tired
- stressed
- anxious
- irritable
- sad
- angry
- emotional
- depressed

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "date": "2026-02-03T00:00:00.000Z",
    "mood": "calm",
    "notes": "Feeling relaxed today"
  }
}
```

---

### Health Endpoints

#### Get All Health Logs

```http
GET /api/health
```

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):

```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
      "userId": "65f1a2b3c4d5e6f7g8h9i0j0",
      "date": "2026-02-03T00:00:00.000Z",
      "temperature": 36.7,
      "weight": 62.5,
      "notes": "Normal temperature",
      "createdAt": "2026-02-03T08:00:00.000Z"
    }
  ]
}
```

---

#### Create Health Log

```http
POST /api/health
```

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "date": "2026-02-03",
  "temperature": 36.7,
  "weight": 62.5,
  "notes": "Normal temperature"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j4",
    "date": "2026-02-03T00:00:00.000Z",
    "temperature": 36.7,
    "weight": 62.5,
    "notes": "Normal temperature"
  }
}
```

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "count": 10 // For list endpoints
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    // For validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📊 Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data      |
| 401  | Unauthorized - Authentication required  |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error - Server error    |

---

## 🧪 Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "displayName": "Test User",
    "cycleLength": 28
  }'

# Login and save token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.data.accessToken')

# Get current user
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Create period log
curl -X POST http://localhost:5000/api/periods \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startDate":"2026-02-01","endDate":"2026-02-06","flow":"medium"}'
```

### Using Postman

1. Import the [Postman Collection](#) (coming soon)
2. Set environment variable `baseUrl` to `http://localhost:5000/api`
3. After login, set `accessToken` variable
4. All authenticated requests will automatically use the token

---

## 🔗 Additional Resources

- [Setup Guide](SETUP_GUIDE.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Main README](README.md)

---

<div align="center">

**API Version 1.0.0** • [Report Issues](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) • [Request Features](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues/new?template=feature_request.md)

</div>
