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
