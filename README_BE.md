#### List Recipes (Public)
`GET /recipes?page=0&size=10&sort=createdAt,desc`

Returns a Spring Data page.

**Sample Response:**
```json
{
  "content": [
    {
      "id": "uuid",
      "title": "Pasta",
      "ingredientMd": "* 200g pasta",
      "processMd": "Boil...",
      "photoUrl": "/uploads/<file>.png",
      "userId": "user-uuid",
      "authorName": "Alice",
      "createdAt": "2025-08-15T10:10:10Z",
      "updatedAt": "2025-08-15T10:10:10Z"
    }
  ],
  "pageable": { ... },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "size": 10,
  "number": 0,
  "sort": { ... },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

#### Get Recipe By ID (Public)
`GET /recipes/{id}`

**Response 200 OK:**
```json
{
  "id": "uuid",
  "title": "Pasta",
  "ingredientMd": "* 200g pasta",
  "processMd": "Boil...",
  "photoUrl": "/uploads/<file>.png",
  "userId": "user-uuid",
  "authorName": "Alice",
  "createdAt": "2025-08-15T10:10:10Z",
  "updatedAt": "2025-08-15T10:10:10Z"
}
```

**Errors:**
- 404 if not found.

#### Create Recipe (Authenticated)
`POST /recipes`

Content-Type: `multipart/form-data`

**Parts:**
- title (text)
- ingredientMd (text, Markdown)
- processMd (text, Markdown)
- photo (file, optional)

**Response 201 Created:**

RecipeResponse JSON (same shape as above).

**Example curl:**
```sh
curl -X POST http://localhost:6969/api/recipes \
  -H "Authorization: Bearer <JWT>" \
  -F title="Best Pasta" \
  -F ingredientMd="* 200g pasta" \
  -F processMd="Boil water..." \
  -F photo=@/path/to/photo.png
```

**Errors:**
- 401 / 403 if missing or invalid token.

#### Update Recipe (Authenticated, Owner Only)
`PUT /recipes/{id}`

Content-Type: `multipart/form-data`

Behavior: Only non-empty provided parts overwrite existing fields (acts like a partial update for provided fields).

**Parts (all optional but at least one must be provided):**
- title
- ingredientMd
- processMd
- photo (file)

**Response 200 OK:** Updated RecipeResponse.

**Errors:**
- 403 if not owner
- 404 if recipe not found

#### Delete Recipe (Authenticated, Owner Only)
`DELETE /recipes/{id}`

**Response 204 No Content.**

**Errors:**
- 403 if not owner
- 404 if not found

### File Access
`GET /uploads/{filename}`

Serves the stored image (public). `photoUrl` in recipe responses points here.

### Authentication Summary
1. Register -> receive token.
2. Store token client-side (memory / secure storage).
3. Send token on protected operations:
   ```
   Authorization: Bearer <token>
   ```
4. Tokens currently expire after 24h (config in `JwtService`). No refresh endpoint yet.

### Error Handling (Current)
Responses may return Spring default error JSON or plain messages (to be standardized):
```json
{
  "timestamp": "2025-08-15T10:11:12.123+00:00",
  "status": 404,
  "error": "Not Found",
  "path": "/api/recipes/unknown-id"
}
```
Future improvement: unify into a consistent error envelope.

### Error Handling
The project includes centralized error handling using `ErrorHandler` and `GlobalExceptionHandler`. These ensure consistent error responses across the application.

### Status Codes Overview
- 200 OK: Successful GET / login / update.
- 201 Created: Recipe created.
- 204 No Content: Recipe deleted.
- 400 Bad Request: (Potential validation errors once added).
- 401 Unauthorized: Missing/invalid token (future improvement; currently may appear as 403 or generic error).
- 403 Forbidden: Not owner attempting to modify/delete.
- 404 Not Found: Missing recipe.
- 409 Conflict: (Planned) duplicate email.

### Pagination Notes
List recipes supports standard Spring Data pageable parameters:
- page (0-based)
- size (default 10)
- sort (e.g. `sort=createdAt,desc`)

### DTOs (Simplified)
**UserResponse:**
```json
{
  "email": "string",
  "name": "string"
}
```
**AuthResponse:**
```json
{
  "token": "string",
  "email": "string",
  "name": "string"
}
```
**RecipeResponse:**
```json
{
  "id": "uuid",
  "title": "string",
  "ingredientMd": "string",
  "processMd": "string",
  "photoUrl": "string|null",
  "userId": "uuid",
  "authorName": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### Entities
- **AppUser**: Represents a user in the system.
- **Recipe**: Represents a recipe with fields for title, ingredients, process, and photo.
- **RecipeTag**: Represents tags associated with recipes. Includes a custom converter `RecipeTagListConverter` for database storage.

### Configurations
- **JwtAuthFilter**: Filters requests to enforce JWT-based authentication.
- **SecurityConfig**: Configures application security settings.
- **UploadDirConfig**: Manages the directory for file uploads.
- **WebConfig**: General web configurations.

---
## Future Improvements
- Standardized error responses
- Refresh tokens / logout
- Flyway migrations (replace ddl-auto)
- Comments / ratings
- Advanced search & filtering
- User profile pictures

---
This project is for private family use. Contributions and suggestions are welcome.
# Ofek Recipes Web App

Ofek Recipes is a family-oriented web application for sharing and managing recipes. Each family member can create an account, add their own recipes (including a title, ingredients, process, and a photo), and edit or delete only their own recipes. The app is designed to be simple, secure, and user-friendly, making it easy for everyone in the family to contribute and enjoy the family cookbook.

## Features

- **User Registration & Authentication**: Each family member can register and log in securely.
- **Recipe Management**:
  - Add new recipes with a title, ingredients (in Markdown), process (in Markdown), and an optional photo.
  - Edit or delete only your own recipes.
  - View all recipes added by family members.
- **Photo Upload**: Attach a photo to each recipe for a more visual experience.
- **Responsive Design**: Usable on desktop and mobile devices.

## Tech Stack

- **Backend**: Java, Spring Boot
- **Frontend**: (To be determined, e.g., React / Vue / Angular / etc.)
- **Database**: PostgreSQL (initial schema via `schema.sql` / migrations)
- **File Storage**: Local file system for photo uploads (`uploads/` directory)
- **Auth**: Stateless JWT (HS256)

## Project Structure

- `src/main/java/com/example/ofek_recipes/`
  - `controllers/` - REST controllers
  - `entities/` - JPA entities
  - `repositories/` - Spring Data repositories
  - `services/` - Business services (JWT, file storage, etc.)
  - `configurations/` - Security + app config
- `src/main/resources/` - Config, schema, static
- `uploads/` - Uploaded images (served as `/uploads/**`)

## Running Locally

1. Ensure PostgreSQL running locally on `localhost:5432` with DB `recipes` (adjust `application.yaml` if needed).
2. Build & run:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Base URL (due to context path + custom port):
   ```
   http://localhost:6969/api
   ```

---
## API Reference

### Conventions
- All request/response bodies are JSON unless noted (file upload = multipart/form-data).
- Authentication (for protected endpoints):
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- Public endpoints: 
  - POST `/users/register`
  - POST `/users/login`
  - GET `/recipes/**`
  - GET `/uploads/**`
- All other endpoints require a valid JWT.

### Authentication & Users

#### Register
`POST /users/register`

Registers a new user and returns an auth token.

**Request Body:**
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "plainPassword"
}
```

**Response 200 OK:**
```json
{
  "token": "<jwt>",
  "email": "alice@example.com",
  "name": "Alice"
}
```

**Errors:**
- 500 (currently) if email already exists (future: 409).

#### Login
`POST /users/login`

Validates credentials, returns token.

**Request Body (same DTO as register):**
```json
{
  "email": "alice@example.com",
  "password": "plainPassword"
}
```

**Response 200 OK:**
```json
{
  "token": "<jwt>",
  "email": "alice@example.com",
  "name": "Alice"
}
```

**Errors:**
- 500 (currently) on invalid credentials (future: 401).

### Recipes

