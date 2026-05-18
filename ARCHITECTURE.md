# Architecture

## Why this stack (Node vs Python)
- Node.js + Express: small API surface, fast iteration, and easy JSON handling for React.
- Supabase Postgres: managed database with SQL schema, REST access, and simple setup.
- Gemini + OCR.space: AI parsing for text, OCR for images, both accessible via HTTP APIs.

## Data model (Supabase)
Tables live in the `public` schema.

- `groups`
  - `id` (uuid, pk)
  - `name` (text)
  - `created_at` (timestamptz)

- `members`
  - `id` (uuid, pk)
  - `group_id` (uuid, fk -> groups.id, cascade)
  - `name` (text)
  - `created_at` (timestamptz)

- `expenses`
  - `id` (uuid, pk)
  - `group_id` (uuid, fk -> groups.id, cascade)
  - `payer_member_id` (uuid, fk -> members.id)
  - `amount` (int, > 0)
  - `description` (text)
  - `split_among_member_ids` (uuid[])
  - `created_at` (timestamptz)

Schema SQL is in [server/schema.sql](server/schema.sql).

## API endpoints
Base URL: `/api`

Groups
- `GET /groups`
- `POST /groups`
- `GET /groups/:id`

Expenses
- `GET /expenses?groupId=...`
- `POST /expenses`

Balances / settle
- `GET /balances?groupId=...`
- `GET /settle?groupId=...`

AI
- `POST /ai/parse-expense`
- `POST /ai/parse-bill`
- `POST /ai/parse-bill-image`
- `GET /ai/models`

## Component structure (client)
- Pages: `client/src/pages`
  - `GroupsPage.jsx`
  - `GroupDetailPage.jsx`
  - `HistoryPage.jsx`
- Shared UI: `client/src/components`
  - `Sidebar`, `Header`, cards, forms, lists, `ExpenseChart`
- API wrapper: `client/src/api.js`
- Styles: `client/src/styles.css` (Tailwind + custom layers)

## Settle-up algorithm
- Compute per-member balance = total paid - total owed.
- Split each expense evenly across `splitAmongMemberIds`.
- Remainder cents go to the payer to keep totals consistent.
- Greedy matching:
  - Create a list of creditors (net > 0) and debtors (net < 0).
  - Pay from debtors to creditors until all nets are zero.
- Output: a minimal set of transactions (not necessarily globally minimal, but close).

## AI parsing and failure handling
- Primary path: Gemini parses text into JSON for expense/bill inputs.
- If Gemini fails (quota, error, or invalid JSON):
  - Expense text: regex fallback extracts amount, payer hints, and members.
  - Bill text: regex fallback extracts line items and total.
- OCR images:
  - OCR.space converts image to text, then the same bill parser is used.

## What to improve with more time
- Auth and per-user access control.
- More robust NLP (entity linking to members, better item parsing).
- Real-time updates and activity feed.
- Better settle-up optimization (min-cost flow).
- Upload storage for bill images.
