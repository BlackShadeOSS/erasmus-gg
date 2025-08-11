This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## User-facing API Endpoints

These endpoints require a logged-in user (auth-token cookie).

-   GET `/api/user/profile` – current user with selected profession
-   PUT `/api/user/profile` – update full_name and/or selected_profession_id
-   GET `/api/user/profession` – selected profession details
-   PUT `/api/user/profession` – set selected profession
-   GET `/api/user/vocabulary` – vocabulary for user's profession with difficulty and personal mastery
    -   Query: professionId?, categoryId?, level?, search?, page?, limit?
-   PATCH `/api/user/vocabulary` – update mastery progress
    -   Body: { vocabulary_id, mastery_level } or { vocabulary_id, delta }
-   GET `/api/user/vocabulary/categories` – categories for a profession
-   GET `/api/user/vocabulary/progress` – progress for a vocabularyId or summary for current profession
-   GET `/api/user/professions` – list active professions (for selection)
-   GET `/api/user/videos` – list active videos for user's profession (filter: difficulty, search, pagination)
-   GET `/api/user/vocabulary/by-category` – list vocabulary within a specific category
-   GET `/api/user/vocabulary/by-level` – list vocabulary at a specific difficulty level
-   GET `/api/user/vocabulary/search` – search vocabulary by term within a profession
-   GET `/api/user/vocabulary/recommended` – simple recommendation (lowest mastery first)

Debug page `/testing/user` now also:

-   Search vocabulary and update mastery inline
