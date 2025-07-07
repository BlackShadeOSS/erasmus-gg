# VocEnglish Platform Setup

## Features Implemented

✅ **1. Supabase Connection**

-   Connected to Supabase database using environment variables from `.env.local`
-   Full database schema support with TypeScript types

✅ **2. Admin Login (NO REGISTER)**

-   Admin-only login at `/login`
-   Protected admin panel at `/admin-panel`
-   Default admin user: `admin` / `admin123`

✅ **3. CMS System for Admins**

-   Full admin dashboard with sidebar navigation
-   Users management
-   Activation codes management (create/view)
-   Professions management (create/view)
-   Vocabulary, Videos, Games sections (ready for expansion)
-   Protected admin API endpoints at `/api/admin/*`

✅ **4. User Login and Registration**

-   User login at `/login`
-   User registration at `/register` with:
    -   Username and password only
    -   Two password fields for confirmation
    -   Valid activation code requirement
-   User dashboard at `/dashboard`

✅ **5. Cloudflare Turnstile CAPTCHA**

-   Integrated on both login and registration forms
-   Server-side verification using `TURNSTILE_SECRET_KEY`
-   Dark theme styling to match the app design

## Additional Features

-   **JWT Authentication**: Secure token-based authentication with 30-day expiration
-   **Route Protection**: Middleware protecting admin routes and user dashboard
-   **Responsive Design**: Modern dark theme with glowing effects matching the main page style
-   **TypeScript Support**: Full type safety throughout the application
-   **Error Handling**: Comprehensive error handling in all API endpoints

## Environment Variables

The following variables are already configured in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://192.168.1.174
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAABkO_NWVvRbDiaEt
TURNSTILE_SECRET_KEY=0x4AAAAAABkO_H-ZU3_aN7Sa3FTPZVOlvrw

# Session Secret
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

## Quick Start

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Start development server:**

    ```bash
    bun run dev
    ```

3. **Access the application:**
    - Main page: http://localhost:3000
    - Login: http://localhost:3000/login
    - Register: http://localhost:3000/register
    - Admin Panel: http://localhost:3000/admin-panel (admin only)
    - User Dashboard: http://localhost:3000/dashboard (logged-in users)

## Default Admin Account

-   **Username:** `admin`
-   **Password:** `admin123`

## API Endpoints

### Authentication

-   `POST /api/auth/login` - User/Admin login with Turnstile
-   `POST /api/auth/register` - User registration with activation code
-   `POST /api/auth/logout` - Logout (clears auth cookie)

### Admin CMS APIs

-   `GET /api/admin/users` - List all users
-   `GET /api/admin/activation-codes` - List activation codes
-   `POST /api/admin/activation-codes` - Create new activation code
-   `GET /api/admin/professions` - List professions
-   `POST /api/admin/professions` - Create new profession

## Project Structure

```
src/
├── app/
│   ├── (main-page)/page.tsx        # Home page
│   ├── login/page.tsx              # Login form
│   ├── register/page.tsx           # Registration form
│   ├── admin-panel/page.tsx        # Admin dashboard
│   ├── dashboard/page.tsx          # User dashboard
│   └── api/
│       ├── auth/                   # Authentication endpoints
│       └── admin/                  # Admin CMS endpoints
├── components/
│   ├── admin/                      # Admin dashboard components
│   ├── user/                       # User dashboard components
│   └── ui/                         # Shared UI components
├── lib/
│   ├── auth.ts                     # Authentication utilities
│   └── supabase.ts                 # Supabase client and types
└── middleware.ts                   # Route protection
```

## Database Schema

The application uses the complete schema from `supabase-schema.sql` including:

-   Users and authentication
-   Activation codes system
-   Professions and vocabulary categories
-   Educational content (videos, games, exercises)
-   User progress tracking

## Next Steps

The foundation is complete and ready for:

1. **Content Management**: Expand vocabulary, videos, and games managers
2. **User Learning Features**: Implement vocabulary learning, video watching, games
3. **Progress Tracking**: Add user progress visualization
4. **File Uploads**: Add support for images, audio, and video files
5. **Advanced Features**: Search, filtering, user profiles, etc.

All components follow the established design patterns and dark theme styling to maintain consistency with the main page.
