# 🔧 Fix: "new row violates row-level security policy"

## The Problem
Supabase Storage has Row Level Security (RLS) enabled, but no policies are set to allow uploads.

## ✅ Quick Fix (2 minutes)

### Step 1: Create Storage Bucket (if not done)

1. Go to https://supabase.com
2. Open your project
3. Click **Storage** in the left sidebar
4. Click **New bucket**
5. Name: `uploads`
6. **Make it Public** (toggle ON)
7. Click **Create bucket**

### Step 2: Set Up Storage Policies

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Open `SUPABASE_STORAGE_POLICIES.sql` from your project
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This will create policies that allow:
- ✅ Public read access (images can be viewed)
- ✅ Anyone can upload (for simplicity - you can restrict this later)
- ✅ Anyone can update/delete files

**Note:** For production, you may want to restrict uploads to authenticated users only. See the SQL file for more secure options.

### Step 3: Verify Policies

1. Go to **Storage** → **Policies**
2. Click on the `uploads` bucket
3. You should see 4 policies:
   - Public Access for Reading
   - Anyone can upload
   - Anyone can update
   - Anyone can delete

### Step 4: Test Upload

Try uploading an image again - it should work now! 🎉

---

## 🔍 Alternative: Disable RLS (Not Recommended)

If you want to disable RLS entirely (less secure):

1. Go to **Storage** → **Policies**
2. Click on `uploads` bucket
3. Toggle **Enable RLS** OFF

**Note:** This is less secure. The policies above are better.

---

## ⚠️ If Policies Already Exist

If you get an error saying policies already exist:

1. Go to **Storage** → **Policies**
2. Delete existing policies for `uploads` bucket
3. Run the SQL again

Or modify the SQL to drop existing policies first (see comments in the SQL file).

---

## 🔐 Alternative: Use Service Role Key (More Secure)

Instead of allowing anonymous uploads, you can use the service role key which bypasses RLS:

1. Go to Supabase → **Settings** → **API**
2. Copy the **service_role** key (keep it secret!)
3. Add to your `.env`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Add to Vercel environment variables
5. Update `lib/supabase.ts` to use this key (already done in the code)

**Note:** Service role key has full access - keep it secret and never expose it to the client!

---

**After running the SQL, uploads should work!** 🚀

