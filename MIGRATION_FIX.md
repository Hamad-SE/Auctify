# Admin Dashboard User Visibility Fix

## Problem
Registered users are not showing up on the admin dashboard because of Row Level Security (RLS) policies on the `profiles` table. The existing RLS policy only allows users to view their own profile, but the admin dashboard needs to view all profiles.

## Solution
Add a public read policy to the `profiles` table to allow the admin dashboard to query all users.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to https://app.supabase.com
2. Select your project "Auctify" (Project ID: dzgxxaoygscfbggpfmsz)
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Add public select policy to profiles table to allow admin dashboard to view all users
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);
```

6. Click **Run** (or press Ctrl+Enter)
7. You should see "SUCCESS" message
8. Go back to the admin dashboard in your app and refresh the page - users should now appear!

### Option 2: Using Supabase CLI (If Installed)

```bash
supabase db push
```

This will push the migration file `supabase/migrations/20260601000000_fix_admin_profiles_visibility.sql` to your Supabase project.

### Option 3: Using Node.js Script

1. First, get your Supabase service role key:
   - Go to https://app.supabase.com
   - Select your project
   - Click **Settings** > **API**
   - Copy the **Service Role Key** (not the public one)

2. Create a `.env.local` file in the project root with:
   ```
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

3. Run:
   ```bash
   node apply-migration.js
   ```

## Verification

After applying the fix:

1. Create a new user account on the app (sign up with any @gmail.com email)
2. Login to the admin dashboard (`/admin`)
3. Click the **Users** tab
4. You should now see the newly registered user in the list

## Technical Details

The fix adds a Row Level Security policy that allows:
- **Policy Name**: "Profiles are publicly readable"
- **Operation**: SELECT
- **Scope**: All rows (using `true` in the `using` clause)

This policy coexists with the existing policies:
- "Users can view their own profile" (for authenticated users)
- "Users can update their own profile" (for authenticated users)

The new policy enables public read access while maintaining security for updates and deletes (which remain user-restricted).
