-- Create profiles table for user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Users can view their own profile" 
  on public.profiles 
  for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles 
  for update 
  using (auth.uid() = id);

-- Create function to handle new user signups
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public 
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create blog_posts table
create table public.blog_posts (
  id uuid not null default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  read_time text not null,
  image_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS for blog_posts
alter table public.blog_posts enable row level security;

-- Anyone can read blog posts
create policy "Blog posts are publicly readable"
  on public.blog_posts
  for select
  using (true);

-- Create newsletter_subscribers table
create table public.newsletter_subscribers (
  id uuid not null default gen_random_uuid() primary key,
  email text not null unique,
  subscribed_at timestamp with time zone not null default now()
);

-- Enable RLS for newsletter
alter table public.newsletter_subscribers enable row level security;

-- Allow public inserts for newsletter subscriptions
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers
  for insert
  with check (true);

-- Create updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger for profiles
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Add trigger for blog_posts
create trigger update_blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute function public.update_updated_at_column();