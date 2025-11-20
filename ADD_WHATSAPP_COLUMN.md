# Add WhatsApp Column to Supabase

## The Issue
Your frontend newsletter form collects 3 fields: `name`, `email`, and `whatsapp`
But your Supabase `subscribers` table only has `name` and `email` columns.

## Solution: Add WhatsApp Column to Supabase

### Step 1: Go to Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"Table Editor"** in the left sidebar
4. Find and click on the **`subscribers`** table

### Step 2: Add the WhatsApp Column

Click **"+ New Column"** button (top right) and fill in:

```
Name: whatsapp
Type: text (or varchar)
Default value: (leave empty or set to NULL)
☐ Is nullable: CHECKED (allow empty values)
☐ Is unique: UNCHECKED
☐ Is primary key: UNCHECKED
```

Click **"Save"** or **"Confirm"**

### Alternative: Use SQL Editor

If you prefer SQL, go to **"SQL Editor"** and run:

```sql
ALTER TABLE subscribers 
ADD COLUMN whatsapp TEXT;
```

### Step 3: Verify the Column Was Added

1. Go back to **Table Editor**
2. Click on **`subscribers`** table
3. You should now see these columns:
   - `id` (probably)
   - `name`
   - `email`
   - `whatsapp` ← NEW!
   - `subscribed_at` (probably)
   - `created_at` (if you have it)

### Step 4: Test Your Form

1. Deploy your updated code to Vercel (or it will auto-deploy)
2. Go to your website
3. Fill out the newsletter form with all 3 fields
4. Submit
5. Go to Supabase → Table Editor → subscribers
6. You should see the WhatsApp number saved!

## Already Updated the Code

✅ I've already updated your API code to save the `whatsapp` field
✅ Your frontend already collects the `whatsapp` field
✅ You just need to add the column to Supabase

## Current Table Structure

**Before (what you probably have):**
```
subscribers
├── id (or similar)
├── name
├── email
└── subscribed_at
```

**After (what you need):**
```
subscribers
├── id (or similar)
├── name
├── email
├── whatsapp ← ADD THIS
└── subscribed_at
```

## If You Don't Have a Subscribers Table Yet

If the table doesn't exist at all, create it with this SQL:

```sql
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on email for faster lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);
```

---

**Questions?** After adding the column, commit and push the updated code, then test your form!

