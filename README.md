# Undercover

A Spyfall-style party game — Movies, TV Shows, Celebrities, Locations,
Nepal Politicians, Nepal Districts, Countries, and Anime Characters.
Built with Next.js and Supabase.

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste this, and run it:

```sql
create table if not exists rooms (
  code text primary key,
  host_id text not null,
  players jsonb not null default '[]',
  categories jsonb not null default '[]',
  status text not null default 'lobby',
  item jsonb,
  spy_id text,
  turn_order jsonb not null default '[]',
  turn_index int not null default 0,
  votes jsonb not null default '{}',
  round int not null default 0,
  updated_at timestamptz not null default now()
);

alter table rooms enable row level security;

create policy "rooms are publicly readable" on rooms
  for select using (true);

create policy "rooms are publicly insertable" on rooms
  for insert with check (true);

create policy "rooms are publicly updatable" on rooms
  for update using (true) with check (true);
```

3. Go to **Settings → API** and copy the **Project URL** and **anon public key**.

> Already created the table before this update? Run this migration instead of
> the block above — it just adds the new columns for scoring, the round
> timer, and the end-round vote:
>
> ```sql
> alter table rooms add column if not exists round_started_at bigint;
> alter table rooms add column if not exists round_duration_sec int not null default 480;
> alter table rooms add column if not exists end_round_votes jsonb not null default '{}';
> alter table rooms add column if not exists majority_caught boolean;
> alter table rooms add column if not exists spy_guess_correct boolean;
> alter table rooms add column if not exists spy_guess_value text;
> ```

## 2. Run it locally

```bash
npm install
cp .env.local.example .env.local
# paste your Project URL and anon key into .env.local
npm run dev
```

Open http://localhost:3000, open a second tab (or ask a friend to open the
same URL), and try creating/joining a room.

## 3. Deploy to Vercel

```bash
npx vercel
```

Or connect the repo in the Vercel dashboard. Either way, add the two
environment variables in **Project Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy after adding them.

## Notes

- Multiplayer sync is done by polling the `rooms` table over Supabase's
  REST API every ~1.8s — no websockets/server needed, works well for a
  casual party game.
- The RLS policies above are intentionally open (no auth) so any player
  can create/join a room with just the anon key. Don't store anything
  sensitive in this table.
- Real photos of celebrities, politicians, or movie/anime artwork aren't
  included for copyright reasons — players and items get colour-coded
  initial badges instead.
