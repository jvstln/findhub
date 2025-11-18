# Supabase Storage Setup Guide for FindHub

This guide will help you configure the Supabase Storage bucket for the FindHub lost-and-found system.

## Prerequisites

- Existing Supabase project: `https://bgkxokciawqwmbocnwgc.supabase.co`
- Access to Supabase dashboard

## Step-by-Step Configuration

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `bgkxokciawqwmbocnwgc`

### 2. Create Storage Bucket

1. In the left sidebar, click on **Storage**
2. Click **New bucket** button
3. Configure the bucket with these settings:
   - **Name**: `lost-items`
   - **Public bucket**: ✅ **Enable** (allows public read access)
   - **File size limit**: `5242880` bytes (5 MB)
   - **Allowed MIME types**: Add these three types:
     - `image/jpeg`
     - `image/png`
     - `image/webp`
4. Click **Create bucket**

### 3. Configure Bucket Policies (Optional but Recommended)

If you want additional security with Row Level Security (RLS):

1. Click on the `lost-items` bucket
2. Go to **Policies** tab
3. Click **New policy**
4. Create the following policies:

#### Policy 1: Public Read Access
```sql
-- Allow anyone to read files
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'lost-items');
```

#### Policy 2: Authenticated Upload (if using direct frontend upload)
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lost-items' 
  AND auth.role() = 'authenticated'
);
```

#### Policy 3: Authenticated Delete (if using direct frontend delete)
```sql
-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lost-items' 
  AND auth.role() = 'authenticated'
);
```

**Note**: For this project, we're using backend-only uploads with the service role key, so these RLS policies are optional. The backend will handle all upload/delete operations.

### 4. Get API Keys

You need two types of keys:

#### Service Role Key (Backend - Secret!)
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** tab
3. Find **Project API keys** section
4. Copy the **service_role** key (NOT the anon key)
5. ⚠️ **IMPORTANT**: This key bypasses RLS and should NEVER be exposed to the frontend

#### Anon Key (Frontend - Public)
1. In the same **API** tab
2. Copy the **anon** key (public key)
3. This key is safe to use in frontend code

### 5. Update Environment Variables

The environment files have been updated with placeholders. You need to:

#### Backend (`apps/server/.env`)
Replace the `SUPABASE_SERVICE_KEY` with your actual **service_role** key:
```env
SUPABASE_SERVICE_KEY=your_actual_service_role_key_here
```

#### Frontend (`apps/web/.env`)
Add the Supabase configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://bgkxokciawqwmbocnwgc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 6. Verify Configuration

After setting up the bucket and updating environment variables:

1. Restart your development servers:
   ```bash
   bun run dev
   ```

2. Test the configuration by:
   - Creating a new lost item with an image upload
   - Verifying the image appears in the Supabase Storage bucket
   - Checking that the image displays correctly in the frontend

### 7. Bucket Settings Summary

Your `lost-items` bucket should have:
- ✅ Public bucket enabled (for read access)
- ✅ File size limit: 5 MB (5242880 bytes)
- ✅ Allowed MIME types: image/jpeg, image/png, image/webp
- ✅ CORS configured (automatic for public buckets)

## Troubleshooting

### Images not uploading
- Verify the service role key is correct in `apps/server/.env`
- Check that the bucket name is exactly `lost-items`
- Ensure file size is under 5 MB
- Verify MIME type is one of the allowed types

### Images not displaying
- Check that the bucket is set to public
- Verify the public URL format: `https://bgkxokciawqwmbocnwgc.supabase.co/storage/v1/object/public/lost-items/{filename}`
- Ensure CORS is properly configured

### Permission errors
- Verify you're using the service role key (not anon key) in the backend
- Check that RLS policies (if configured) allow the operations you're attempting

## Security Notes

1. **Never commit the service role key** to version control
2. The service role key should only be used in the backend
3. The anon key is safe to expose in frontend code
4. Consider implementing additional RLS policies for production
5. Monitor storage usage in the Supabase dashboard

## Next Steps

After completing this setup:
1. Proceed to Task 5: Set up Supabase Storage infrastructure
2. Implement the upload service in the backend
3. Test file uploads end-to-end

---

**Current Status**: ✅ Supabase project exists | ⏳ Storage bucket needs configuration
