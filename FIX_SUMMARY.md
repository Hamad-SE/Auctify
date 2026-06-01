# 🔧 Admin Dashboard User Visibility Issue - QUICK FIX

## Root Cause
The `profiles` table has Row Level Security (RLS) policies that restrict read access to only the current user's own profile. When the admin dashboard tries to query all profiles, the RLS policy blocks it.

**Current RLS Policies on profiles table:**
- ✅ Users can view their own profile (restricted to self)
- ✅ Users can update their own profile (restricted to self)
- ❌ **MISSING:** Public/Admin read access

## Quick Fix (1 minute)

### Go to Supabase Dashboard SQL Editor:
1. Open: https://app.supabase.com
2. Click your Auctify project (dzgxxaoygscfbggpfmsz)
3. Left sidebar → **SQL Editor**
4. **New Query** button
5. Paste this SQL:

```sql
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);
```

6. Click **Run** button
7. Refresh the admin dashboard in your app

**Done!** Registered users should now appear in the admin dashboard.

---

## What This Does
- Adds a policy allowing public SELECT on the profiles table
- Keeps UPDATE/DELETE restricted to users (existing policies remain)
- Admin dashboard can now fetch all user profiles
- All registered users will now be visible in `/admin` dashboard

## Files Changed
- ✅ Created: `supabase/migrations/20260601000000_fix_admin_profiles_visibility.sql` (the migration)
- ✅ Created: `MIGRATION_FIX.md` (detailed guide)
- ✅ Created: `apply-migration.js` (Node.js helper script)

## Testing
1. Signup a new user at `/signup`
2. Login to admin at `/admin`
3. Go to **Users** tab
4. Your new user should appear in the list

---

## Alternative Methods (if above doesn't work)

### Method 2: Using apply-migration.js script
```bash
# 1. Get your Supabase service role key from https://app.supabase.com
#    Settings > API > Service Role Key

# 2. Create .env.local with:
#    SUPABASE_SERVICE_KEY=your_key_here

# 3. Run:
node apply-migration.js
```

### Method 3: Using Supabase CLI
```bash
supabase db push
```

---

## Verification Checklist
- [ ] Migration applied (see "Run" button result was successful)
- [ ] Refreshed admin dashboard
- [ ] Users tab shows registered users
- [ ] Count matches expected registrations

---

## Support
If users still don't appear:
1. Check browser console for errors (F12)
2. Verify admin credentials: admin@gmail.com / admin123
3. Check Supabase project settings are correct
4. Ensure migration SQL ran without errors
