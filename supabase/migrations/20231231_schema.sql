-- Create entities table
create table public.entities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  status text default 'active' check (status in ('active', 'inactive', 'pending')),
  monite_entity_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.entities enable row level security;

-- Create policies
create policy "Users can view their own entities"
  on public.entities for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entities"
  on public.entities for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entities"
  on public.entities for update
  using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for updated_at
create trigger handle_updated_at
  before update on public.entities
  for each row
  execute procedure public.handle_updated_at();
