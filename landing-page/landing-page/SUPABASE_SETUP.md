# Supabase Setup Guide

This guide will walk you through setting up Supabase to store newsletter subscriber data.

---

## 📋 Overview

When a user enters their name and email and clicks "Subscribe", their information will be automatically stored in a Supabase database table with the following columns:
- **id** (UUID, auto-generated)
- **name** (text): Subscriber's name
- **email** (text, unique): Subscriber's email address
- **subscribed_at** (timestamp): When they subscribed

---

## ✅ Prerequisites

- Supabase account (free tier available)
- Access to Supabase dashboard

---

## 🚀 Step-by-Step Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Click **"Start your project"** or **"Sign In"**
3. Sign up/login with your GitHub account (or email)
4. Click **"New Project"**
5. Fill in the details:
   - **Name:** `OneSig Newsletter` (or any name you prefer)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is sufficient for Phase 1
6. Click **"Create new project"**
7. Wait 2-3 minutes for the project to be provisioned

---

### Step 2: Create the Subscribers Table

1. In your Supabase project dashboard, go to **"Table Editor"** (left sidebar)
2. Click **"New Table"**
3. Configure the table:
   - **Name:** `subscribers`
   - **Description:** `Newsletter subscribers`
4. Add columns:

   **Column 1: id**
   - Name: `id`
   - Type: `uuid`
   - Default value: `gen_random_uuid()`
   - Is Primary Key: ✅ Yes
   - Is Nullable: ❌ No

   **Column 2: name**
   - Name: `name`
   - Type: `text`
   - Is Nullable: ❌ No

   **Column 3: email**
   - Name: `email`
   - Type: `text`
   - Is Nullable: ❌ No
   - Is Unique: ✅ Yes

   **Column 4: subscribed_at**
   - Name: `subscribed_at`
   - Type: `timestamptz`
   - Default value: `now()`
   - Is Nullable: ❌ No

5. Click **"Save"** to create the table

---

### Step 3: Set Up Row Level Security (RLS)

1. Go to **"Authentication"** → **"Policies"** (or **"Table Editor"** → Click on `subscribers` table → **"Policies"** tab)
2. Click **"Enable RLS"** if not already enabled
3. Create a policy for inserting (subscribing):

   **Policy Name:** `Allow public inserts`
   - **Policy Type:** `INSERT`
   - **Target roles:** `public` (or `anon`)
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`

4. Create a policy for reading (optional, for admin access):

   **Policy Name:** `Allow service role reads`
   - **Policy Type:** `SELECT`
   - **Target roles:** `service_role`
   - **USING expression:** `true`

5. Click **"Save"** for each policy

---

### Step 4: Get Your Supabase Credentials

1. Go to **"Settings"** → **"API"** (left sidebar)
2. Find your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy the **Project URL**
4. Scroll down to **"Project API keys"**
5. Copy the **`service_role` key** (⚠️ Keep this secret! It bypasses RLS)
   - This is different from the `anon` key
   - Use `service_role` for server-side operations

---

### Step 5: Configure Environment Variables

1. In your project, navigate to `landing-page/.env.local`
2. Add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important Notes:**
- Replace `NEXT_PUBLIC_SUPABASE_URL` with your Project URL from Step 4
- Replace `SUPABASE_SERVICE_ROLE_KEY` with your service_role key
- The `NEXT_PUBLIC_` prefix makes the URL available to client-side code (if needed)
- Never expose the `service_role` key in client-side code!

---

### Step 6: Test the Integration

1. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   cd landing-page
   npm run dev
   ```

2. Open your browser and go to `http://localhost:3000`

3. Fill out the newsletter signup form with a test name and email

4. Click "Subscribe"

5. Check your Supabase dashboard:
   - Go to **"Table Editor"** → **"subscribers"** table
   - You should see a new row with your test data

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control (already in `.gitignore`)
2. **Never expose `service_role` key** in client-side code
3. **Use RLS policies** to control access
4. **Rotate keys periodically** if compromised
5. **Use environment variables** in production deployments

---

## 🐛 Troubleshooting

### Error: "relation 'subscribers' does not exist"

**Solution:** Make sure you've created the `subscribers` table in Supabase. Check:
1. Table Editor → Verify table exists
2. Table name is exactly `subscribers` (lowercase)
3. You're connected to the correct project

### Error: "new row violates row-level security policy"

**Solution:** Enable RLS and create an INSERT policy:
1. Go to Table Editor → subscribers → Policies tab
2. Enable RLS
3. Create INSERT policy for `anon` or `public` role

### Error: "Invalid API key"

**Solution:** 
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
2. Make sure you're using the `service_role` key, not the `anon` key
3. Check for extra spaces or quotes in `.env.local`
4. Restart your dev server after adding environment variables

### Data not appearing in Supabase

1. Check server console for error messages
2. Verify environment variables are set correctly
3. Check Supabase dashboard → Table Editor → subscribers
4. Verify RLS policies allow inserts

---

## 📊 Viewing Subscribers

### In Supabase Dashboard

1. Go to **"Table Editor"** → **"subscribers"**
2. View all subscribers in the table
3. Use filters and sorting as needed

### Using SQL Editor

1. Go to **"SQL Editor"** (left sidebar)
2. Run queries like:

```sql
-- View all subscribers
SELECT * FROM subscribers ORDER BY subscribed_at DESC;

-- Count total subscribers
SELECT COUNT(*) FROM subscribers;

-- Find subscribers by email
SELECT * FROM subscribers WHERE email = 'user@example.com';
```

---

## 🚀 Production Deployment

When deploying to production (e.g., Vercel):

1. Go to your hosting platform's environment variables settings
2. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Make sure to use the **production Supabase project** (or same project)
4. Redeploy your application

**For Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable
4. Redeploy your application

---

## 📝 Database Schema

The `subscribers` table structure:

```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert
CREATE POLICY "Allow public inserts" ON subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow service role to read
CREATE POLICY "Allow service role reads" ON subscribers
  FOR SELECT
  TO service_role
  USING (true);
```

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] `subscribers` table created with correct columns
- [ ] RLS enabled with INSERT policy
- [ ] Environment variables added to `.env.local`
- [ ] Development server restarted
- [ ] Test subscription successful
- [ ] Data appears in Supabase dashboard

---

## 🔄 Migration from Google Sheets

If you were previously using Google Sheets:

1. **Export existing data** (if any) from Google Sheets
2. **Import to Supabase:**
   - Go to Table Editor → subscribers
   - Click "Insert row" → "Import data via CSV"
   - Upload your CSV file
3. **Remove Google Sheets environment variables** from `.env.local`:
   - `GOOGLE_SERVICE_ACCOUNT_CREDENTIALS`
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_SHEET_NAME`
4. **Remove `googleapis` package** (optional):
   ```bash
   npm uninstall googleapis
   ```

---

**You're ready to use Supabase for newsletter subscriptions! 🚀**

---

**Need Help?** Check the [Supabase Documentation](https://supabase.com/docs) or [Supabase Discord](https://discord.supabase.com/)

