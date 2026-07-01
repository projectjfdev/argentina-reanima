# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project using TypeScript, React 19, Tailwind CSS 4, and Prisma. Routes live in `src/app`; public pages are grouped under `src/app/(front)`, while API handlers are under `src/app/api`. Reusable UI and feature components live in `src/components`, with shared primitives in `src/components/ui`. Context providers are in `src/context`, hooks in `src/hooks`, interfaces in `src/interfaces`, and shared helpers in `src/libs`. Prisma schema and migrations are in `prisma`; generated Prisma client files are under `src/generated/prisma`. Static images, PDFs, audio, and logos belong in `public`.

## Build, Test, and Development Commands

- `npm install`: install dependencies and run `prisma generate` through the `postinstall` hook.
- `npm run dev`: start the local Next.js development server with Turbopack at `http://localhost:3000`.
- `npm run build`: create a production build and catch TypeScript/Next.js compile issues.
- `npm run start`: serve the production build after `npm run build`.
- `npx prisma migrate dev`: apply local schema changes and create a migration when database changes are intentional.
- `npx prisma generate`: refresh the Prisma client after schema changes.

## Coding Style & Naming Conventions

Use TypeScript for new source files and `.tsx` for React components. Keep component names in PascalCase, hooks in camelCase beginning with `use`, and shared type/interface files in `src/interfaces`. Follow the `@/*` import alias from `src`. Keep route folders lowercase and descriptive, matching current Spanish page names where applicable. `eslint.config.mjs` exists but is commented out, and no lint script is defined; use `npm run build` as the minimum pre-commit check.

## Testing Guidelines

No project test runner is configured yet. When adding tests, colocate them near the feature or create a top-level `tests` folder, using names like `CourseSection.test.tsx` or `news-api.test.ts`. Until a test script exists, verify affected routes in `npm run dev` and run `npm run build`.

## Commit & Pull Request Guidelines

Recent commits use short Spanish summaries such as `logo nuevo`, `sergio marcos`, and `fix bug CVE-2025-66478`. Keep commits concise and focused on one change. Pull requests should include a brief description, affected routes or APIs, migration notes if `prisma` changed, and screenshots for UI changes.

## Security & Configuration Tips

Do not commit secrets from `.env`. Review changes touching auth, uploads, Cloudinary, Prisma queries, or API routes carefully. After dependency security fixes, run `npm install` and `npm run build` to confirm the lockfile and generated Prisma client remain consistent.
