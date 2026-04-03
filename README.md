# StudyFlow — AI-Powered Study Platform

> Create notes, generate AI flashcards & quizzes, and master content with spaced repetition.
Live Preview : (https://studyflow-l9t4.vercel.app/)

## Features

- **Notes Management** — Create, edit, organize rich-text study notes by subject
- **AI Flashcard Generation** — AI reads your notes and creates flashcards automatically
- **AI Quiz Generation** — Generate multiple-choice quizzes from any note
- **AI Study Chat** — Ask questions about your notes and get instant answers
- **Spaced Repetition** — SM-2 algorithm schedules reviews for optimal retention
- **Analytics Dashboard** — Track study streaks, time, and performance trends

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | MongoDB (Mongoose) |
| Auth | NextAuth v5 (Google, GitHub, Email) |
| AI | Groq (Llama 3.3 70B) via Vercel AI SDK |
| UI | Tailwind CSS v4, shadcn/ui |
| Editor | TipTap |
| Charts | Recharts |
| Testing | Playwright |

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd studyflow
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` — MongoDB connection string
- `NEXTAUTH_SECRET` — Random secret (`openssl rand -base64 32`)
- `GROQ_API_KEY` — Get from [console.groq.com](https://console.groq.com)

Optional (for OAuth):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`

### Development

```bash
pnpm dev
```

**Dev Login**: In development mode, use `dev@studyflow.local` / `devpassword` to sign in without OAuth setup.

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | TypeScript check |
| `pnpm check:loc` | Verify no file exceeds 200 LOC |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm test:e2e:ui` | Playwright UI mode |

## Project Structure

```
src/
  app/           # Next.js App Router pages and API routes
  components/    # React components organized by feature
  lib/           # Utilities, DB connection, auth config, AI setup
  models/        # Mongoose schemas
  actions/       # Server Actions
  hooks/         # Custom React hooks
  providers/     # Context providers
  types/         # TypeScript types
tests/e2e/       # Playwright end-to-end tests
```

## Architecture Decisions

- **SM-2 Spaced Repetition**: Real learning science algorithm for optimal card scheduling
- **Structured AI Output**: Zod schemas enforce type-safe AI responses via `generateObject()`
- **Streaming Chat**: AI responses stream in real-time via Server-Sent Events
- **Server Components**: Data fetching in RSC, client components only where interactivity is needed
- **Early Return Pattern**: No if-else chains — guard clauses for clean control flow

## Dev Guide

### Adding a New Feature

1. Define types in `src/types/index.ts`
2. Create Mongoose model in `src/models/`
3. Add Zod validation in `src/lib/validations/`
4. Create API route in `src/app/api/`
5. Build UI components in `src/components/`
6. Add page in `src/app/(app)/`
7. Run `pnpm check:loc` to verify file size limits

### Code Style

- Arrow functions only
- Early return pattern (no if-else)
- No ternary operators
- Object params for all functions
- Max 200 LOC per file (shadcn/ui excluded)
- In-code docs for non-obvious logic

## Footer

Built by [Your Name] | [GitHub](https://github.com/yourprofile) | [LinkedIn](https://linkedin.com/in/yourprofile)
