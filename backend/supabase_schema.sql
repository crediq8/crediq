create table if not exists public.user_memory (
  session_id text primary key,
  income numeric,
  savings numeric,
  goals text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.interaction_history (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_text text not null,
  ai_text text,
  intent text,
  created_at timestamptz default now()
);

create index if not exists idx_interaction_history_session_id
  on public.interaction_history (session_id);

create index if not exists idx_interaction_history_created_at
  on public.interaction_history (created_at desc);
