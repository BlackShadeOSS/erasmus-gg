# User API Documentation

This document describes the user-facing API for Erasmus GG.

-   Base path: `/api/user`
-   Auth: cookie `auth-token` (JWT). All endpoints require a logged-in user.
-   Content-Type: `application/json`

## Conventions

-   Pagination: `page` (1-based), `limit` (default varies). Response includes `pagination: { page, limit, total, totalPages }`.
-   Difficulty to CEFR mapping: 1→A1, 2→A2, 3→B1, 4→B2, 5→C1.
-   Mastery level: integer 0..5 stored in `user_vocabulary_progress`.
-   Profession context: If `professionId` is not provided, we use the user’s `selected_profession_id`. Endpoints fall back to DB when token lacks it.

## Profile

### GET /api/user/profile

Returns the current user and their selected profession details.

Response

```json
{
    "success": true,
    "user": {
        "id": "...",
        "username": "...",
        "email": "...",
        "full_name": "...",
        "role": "student|teacher|admin",
        "selected_profession_id": "...|null",
        "is_active": true,
        "created_at": "...",
        "updated_at": "...",
        "profession": {
            "id": "...",
            "name": "...",
            "name_en": "...",
            "description": "...",
            "icon_url": null,
            "is_active": true
        }
    }
}
```

### PUT /api/user/profile

Update profile fields.

Body

```json
{ "full_name": "Tomek", "selected_profession_id": "<uuid>|null" }
```

## Profession

### GET /api/user/profession

Returns `{ selected_profession_id, profession }`.

### PUT /api/user/profession

Set the user’s profession (must exist and be active).

Body

```json
{ "profession_id": "<uuid>" }
```

### GET /api/user/professions

List active professions for selection.

Response

```json
{
    "success": true,
    "items": [
        {
            "id": "...",
            "name": "...",
            "name_en": "...",
            "description": "...",
            "icon_url": null
        }
    ]
}
```

## Vocabulary

### GET /api/user/vocabulary

List vocabulary for the user’s profession with category and personal mastery.

Query

-   professionId? string
-   categoryId? string
-   level? 1..5
-   search? string (matches term_en/term_pl)
-   page?, limit?

Response

```json
{
    "success": true,
    "items": [
        {
            "id": "...",
            "term_en": "...",
            "term_pl": "...",
            "definition_en": "...",
            "definition_pl": "...",
            "difficulty_level": 3,
            "level_name": "B1",
            "category": { "id": "...", "name": "...", "name_en": "..." },
            "mastery_level": 2
        }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### PATCH /api/user/vocabulary

Create/update mastery progress.

Body

```json
{ "vocabulary_id": "<uuid>", "mastery_level": 3 }
```

OR

```json
{ "vocabulary_id": "<uuid>", "delta": 1 }
```

Response

```json
{
    "success": true,
    "progress": {
        "user_id": "<uuid>",
        "vocabulary_id": "<uuid>",
        "mastery_level": 3
    }
}
```

### GET /api/user/vocabulary/categories

Categories for a profession (defaults to user’s selection).

Response

```json
{
    "success": true,
    "items": [
        {
            "id": "...",
            "name": "...",
            "name_en": "...",
            "description": "...",
            "order_index": 0
        }
    ]
}
```

### GET /api/user/vocabulary/progress

-   If `vocabularyId` provided: returns that item’s progress.
-   Else: returns `{ level, count }[]` summary for user’s profession.

### GET /api/user/vocabulary/by-category

Vocabulary for a specific category.

Query: `categoryId`, `page`, `limit`

### GET /api/user/vocabulary/by-level

Vocabulary at a given difficulty for the user’s profession.

Query: `level`, `professionId?`, `page`, `limit`

### GET /api/user/vocabulary/search

Search vocabulary by term within the user’s profession.

Query: `q`, `professionId?`, `page`, `limit`

### GET /api/user/vocabulary/recommended

Simple recommendations: lowest mastery first, then difficulty ascending.

Query: `limit?` (default 20)

## Videos

### GET /api/user/videos

Active videos for the user’s profession.

Query

-   professionId? string
-   difficulty? 1..5
-   search? string (matches title/title_en)
-   page?, limit?

Response

```json
{
    "success": true,
    "items": [
        {
            "id": "...",
            "title": "...",
            "title_en": "...",
            "video_url": "...",
            "thumbnail_url": null,
            "duration": 120,
            "difficulty_level": 2,
            "created_at": "..."
        }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 0, "totalPages": 0 }
}
```

## Errors

-   401 Unauthorized: no or invalid auth cookie.
-   400 Bad Request: missing required inputs (some endpoints now return empty results instead for better UX).
-   500 Internal Server Error: unexpected server error.

## Examples

```bash
# Get profile
curl -s --cookie "auth-token=<JWT>" http://localhost:3000/api/user/profile | jq

# Set profession
curl -s -X PUT --cookie "auth-token=<JWT>" -H 'Content-Type: application/json' \
  -d '{"profession_id":"<uuid>"}' http://localhost:3000/api/user/profession | jq

# List vocabulary page 1
curl -s --cookie "auth-token=<JWT>" 'http://localhost:3000/api/user/vocabulary?limit=20&page=1' | jq

# Update mastery
curl -s -X PATCH --cookie "auth-token=<JWT>" -H 'Content-Type: application/json' \
  -d '{"vocabulary_id":"<uuid>","delta":1}' http://localhost:3000/api/user/vocabulary | jq
```
