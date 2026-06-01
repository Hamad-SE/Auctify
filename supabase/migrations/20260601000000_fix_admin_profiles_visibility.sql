-- Add public select policy to profiles table to allow admin dashboard to view all users
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);
