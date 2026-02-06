# Supabase Database Setup

This directory contains SQL migration files for setting up the ShiKaraKa database schema.

## 📋 Overview

ShiKaraKa uses Supabase for:
- **Authentication** - User registration and login via Supabase Auth
- **Database** - PostgreSQL database for user profiles and favorites
- **Row Level Security** - Automatic data protection at the database level

## 🗄️ Database Schema

### Tables

1. **profiles** - Extended user profile information
   - Automatically created when a user signs up
   - Stores username and avatar URL
   - Protected by RLS policies

2. **favorites** - User's favorite anime list
   - Links users to their favorite anime via shikimori_id
   - Unique constraint prevents duplicates
   - Optimized with indexes for fast queries

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account (free tier available)
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `shikaraka-anime-portal` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (sufficient for production)
5. Click **"Create new project"**
6. Wait for setup to complete (~1-2 minutes)

### 2. Run Migrations

Execute the SQL files **in order** in the Supabase SQL Editor:

#### Step 2.1: Open SQL Editor

1. In your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

#### Step 2.2: Create profiles table

Copy and paste the contents of `001_create_profiles_table.sql`:

```sql
-- This creates the profiles table and sets up automatic profile creation
-- when a new user signs up via Supabase Auth
```

Click **"Run"** (or press Ctrl+Enter)

✅ You should see: "Success. No rows returned"

#### Step 2.3: Create favorites table

Create a new query and paste the contents of `002_create_favorites_table.sql`:

```sql
-- This creates the favorites table with RLS policies and performance indexes
```

Click **"Run"**

✅ You should see: "Success. No rows returned"

#### Step 2.4: Verify Tables

1. Go to **"Table Editor"** in the left sidebar
2. You should see two tables:
   - ✅ `profiles`
   - ✅ `favorites`
3. Click each table to inspect its structure

### 3. Configure Authentication

#### 3.1: Email Provider Settings

1. Go to **"Authentication"** → **"Providers"**
2. Ensure **Email** provider is enabled (enabled by default)
3. Configure settings:
   - **Enable email confirmations**: 
     - ❌ Disable for easier development
     - ✅ Enable for production security
   - **Secure email change**: ✅ Keep enabled

#### 3.2: URL Configuration (CRITICAL!)

1. Go to **"Authentication"** → **"URL Configuration"**
2. Set **Site URL**:
   - For local development: `http://localhost:5173`
   - After Vercel deployment: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - `https://your-app.vercel.app/**` (after deployment)

> ⚠️ **Important**: You must update these URLs after deploying to Vercel, or authentication will fail!

### 4. Get API Credentials

1. Go to **"Settings"** → **"API"**
2. Copy these values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key** (in "Project API keys" section):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save these values - you'll need them next

> 🔒 **Security Note**: The `anon` key is safe for client-side use. Row Level Security (RLS) protects your data.

### 5. Configure Local Environment

1. In the project root, create `.env` from the example:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

### 6. Test the Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Try to register a new account:
   - Click "Войти" in the header
   - Switch to "Регистрация" tab
   - Enter email and password
   - Click "Зарегистрироваться"

4. Check Supabase:
   - Go to **"Authentication"** → **"Users"**
   - You should see your new user
   - Go to **"Table Editor"** → **"profiles"**
   - You should see a profile automatically created

✅ If you see the user and profile, setup is complete!

## 📊 Database Schema Details

### profiles table

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns**:
- `id` - UUID, foreign key to auth.users (primary key)
- `username` - User's display name (nullable)
- `avatar_url` - URL to user's avatar image (nullable)
- `created_at` - Timestamp of profile creation
- `updated_at` - Timestamp of last update

**RLS Policies**:
- Users can view their own profile
- Users can update their own profile
- Users can insert their own profile

**Trigger**:
- Automatically creates a profile when a user signs up

### favorites table

```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shikimori_id INTEGER NOT NULL,
  anime_name TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, shikimori_id)
);
```

**Columns**:
- `id` - UUID, auto-generated primary key
- `user_id` - UUID, foreign key to auth.users
- `shikimori_id` - Integer, ID of anime in Shikimori API
- `anime_name` - Text, name of the anime
- `added_at` - Timestamp when anime was added to favorites

**Constraints**:
- `UNIQUE(user_id, shikimori_id)` - Prevents duplicate favorites

**RLS Policies**:
- Users can view their own favorites
- Users can insert their own favorites
- Users can delete their own favorites

**Indexes** (for performance):
- `idx_favorites_user_id` - Fast lookup by user
- `idx_favorites_shikimori_id` - Fast lookup by anime
- `idx_favorites_added_at` - Fast sorting by date

## 🔒 Row Level Security (RLS)

RLS ensures that users can only access their own data, even if they try to manipulate API requests.

**How it works**:
1. All tables have RLS enabled
2. Policies check `auth.uid()` (current user's ID)
3. Queries automatically filter to only show user's own data
4. Attempts to access other users' data are blocked at the database level

**Example**:
```sql
-- This policy ensures users can only see their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);
```

## 🧪 Testing the Setup

### Test Authentication

```bash
# Start the dev server
npm run dev

# Open http://localhost:5173
# Try to register and login
```

### Test Database Queries

In Supabase SQL Editor:

```sql
-- View all profiles (you should only see your own)
SELECT * FROM profiles;

-- View all favorites (you should only see your own)
SELECT * FROM favorites;

-- Try to insert a favorite
INSERT INTO favorites (user_id, shikimori_id, anime_name)
VALUES (auth.uid(), 1, 'Test Anime');

-- Verify it was inserted
SELECT * FROM favorites;
```

## 🐛 Troubleshooting

### Problem: "relation 'profiles' does not exist"

**Solution**: You haven't run the migrations yet.
- Go to SQL Editor and run `001_create_profiles_table.sql`

### Problem: "new row violates row-level security policy"

**Solution**: You're not authenticated or trying to insert data for another user.
- Make sure you're logged in
- Check that `user_id` matches `auth.uid()`

### Problem: Profile not created automatically

**Solution**: The trigger might not be set up correctly.
- Re-run `001_create_profiles_table.sql`
- Check **"Database"** → **"Functions"** for `handle_new_user`
- Check **"Database"** → **"Triggers"** for `on_auth_user_created`

### Problem: Can't connect from app

**Solution**: Check environment variables.
- Verify `.env` file exists and has correct values
- Restart dev server after changing `.env`
- Check browser console for connection errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🔄 Updating the Schema

If you need to modify the schema later:

1. Create a new migration file: `003_your_change.sql`
2. Write the SQL to modify tables
3. Test locally first
4. Run in production Supabase project
5. Document the change in this README

**Example migration**:
```sql
-- 003_add_bio_to_profiles.sql
ALTER TABLE profiles ADD COLUMN bio TEXT;
```

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment-specific issues
3. Check [Supabase Discord](https://discord.supabase.com) for community help
4. Open an issue in the GitHub repository

---

**Setup complete! 🎉** Your Supabase backend is ready for ShiKaraKa.
