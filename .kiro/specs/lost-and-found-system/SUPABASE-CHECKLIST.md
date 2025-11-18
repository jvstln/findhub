# Supabase Storage Configuration Checklist

Use this checklist to track your Supabase storage bucket configuration progress.

## Configuration Steps

### 1. Supabase Project
- [x] Supabase project exists: `bgkxokciawqwmbocnwgc`
- [x] Project URL: `https://bgkxokciawqwmbocnwgc.supabase.co`

### 2. Storage Bucket Creation
- [ ] Navigate to Storage in Supabase Dashboard
- [ ] Create new bucket named `lost-items`
- [ ] Enable "Public bucket" option
- [ ] Set file size limit to `5242880` bytes (5 MB)
- [ ] Add allowed MIME types:
  - [ ] `image/jpeg`
  - [ ] `image/png`
  - [ ] `image/webp`

### 3. Bucket Policies (Optional)
- [ ] Create public read access policy
- [ ] Create authenticated upload policy (if using direct frontend upload)
- [ ] Create authenticated delete policy (if using direct frontend delete)

### 4. API Keys
- [ ] Copy service_role key from Project Settings > API
- [ ] Copy anon key from Project Settings > API
- [ ] Update `apps/server/.env` with service_role key
- [ ] Update `apps/web/.env` with anon key

### 5. Environment Variables
Backend (`apps/server/.env`):
- [x] `SUPABASE_URL` configured
- [ ] `SUPABASE_SERVICE_KEY` updated with actual service_role key

Frontend (`apps/web/.env`):
- [x] `NEXT_PUBLIC_SUPABASE_URL` configured
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` updated with actual anon key

### 6. Verification
- [ ] Restart development servers (`bun run dev`)
- [ ] Test file upload functionality (after Task 5 is complete)
- [ ] Verify images appear in Supabase Storage dashboard
- [ ] Confirm images display correctly in frontend

## Quick Access Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/bgkxokciawqwmbocnwgc
- **Storage**: https://supabase.com/dashboard/project/bgkxokciawqwmbocnwgc/storage/buckets
- **API Settings**: https://supabase.com/dashboard/project/bgkxokciawqwmbocnwgc/settings/api

## Important Notes

⚠️ **Security Reminders**:
- Service role key should ONLY be used in backend
- Never commit service role key to version control
- Anon key is safe for frontend use
- Public bucket allows read access to all files

## Next Task

After completing this checklist, proceed to:
- **Task 5**: Set up Supabase Storage infrastructure (implement upload service)

---

**Status**: Configuration in progress
**Last Updated**: Task 4 implementation
