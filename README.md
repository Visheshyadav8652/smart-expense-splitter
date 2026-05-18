# Smart Expense Splitter

A simple Splitwise-style app with React, Express, Supabase, and Gemini-powered parsing.

## Features
- Create groups and members
- Add expenses and split among members
- Balance overview and settle-up suggestions
- Expense history page
- AI: natural language expense parsing
- AI: bill text parsing
- REST API with validation
- Seed data

## Tech Stack
- Frontend: React + CSS
- Backend: Node.js + Express
- Database: Supabase Postgres
- AI: Gemini API

## Getting Started

### 1) Backend
1. Go to the server folder:
   - `cd server`
2. Create a `.env` file based on `.env.example`.
3. Create Supabase tables using the SQL below in the Supabase SQL editor.
4. Install dependencies:
   - `npm install`
5. Seed sample data:
   - `npm run seed`
6. Start the API server:
   - `npm run dev`

### 2) Frontend
1. Go to the client folder:
   - `cd client`
2. Create a `.env` file based on `.env.example`.
3. Install dependencies:
   - `npm install`
4. Start the React app:
   - `npm run dev`

### Single-command setup (not automated)
Run backend and frontend in two terminals. A single combined command is not included yet.

## Notes
- Amounts are stored as integers (smallest currency unit).
- Update `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`.
- Update `GEMINI_API_KEY` and `GEMINI_MODEL` in `server/.env`.
- Add `OCR_SPACE_API_KEY` in `server/.env` to enable bill image parsing.
- Update `VITE_API_URL` if your backend runs elsewhere.

## What works
- Groups and members
- Expenses, balances, and settle-up
- AI parsing with fallback NLP
- OCR bill parsing (requires OCR.space key)
- Seed data for quick testing

## What is incomplete or limited
- No authentication or user accounts
- AI parsing depends on API quota
- Bill item extraction is heuristic
- No file storage for uploaded bill images

## Docs
- See [ARCHITECTURE.md](ARCHITECTURE.md)
- See [PROMPTS.md](PROMPTS.md)

## Supabase Schema (SQL)
```sql
create extension if not exists "pgcrypto";

create table if not exists groups (
   id uuid primary key default gen_random_uuid(),
   name text not null,
   created_at timestamptz not null default now()
);

create table if not exists members (
   id uuid primary key default gen_random_uuid(),
   group_id uuid not null references groups(id) on delete cascade,
   name text not null,
   created_at timestamptz not null default now()
);

create table if not exists expenses (
   id uuid primary key default gen_random_uuid(),
   group_id uuid not null references groups(id) on delete cascade,
   payer_member_id uuid not null references members(id) on delete restrict,
   amount integer not null check (amount > 0),
   description text not null,
   split_among_member_ids uuid[] not null,
   created_at timestamptz not null default now()
);

create index if not exists idx_members_group_id on members(group_id);
create index if not exists idx_expenses_group_id on expenses(group_id);
```

## API Overview
- `GET /api/groups`
- `POST /api/groups`
- `GET /api/groups/:id`
- `GET /api/expenses?groupId=...`
- `POST /api/expenses`
- `GET /api/balances?groupId=...`
- `GET /api/settle?groupId=...`
- `POST /api/ai/parse-expense`
- `POST /api/ai/parse-bill`
