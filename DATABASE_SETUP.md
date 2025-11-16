# Database Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be provisioned

## 2. Get Your Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** → Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Add to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Run the SQL Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste and run it in the SQL Editor
4. Verify all tables were created successfully

## 4. Configure Storage

The schema automatically creates a `resumes` storage bucket. Verify it exists:
1. Go to Storage in your Supabase dashboard
2. You should see a bucket named `resumes`

## 5. Update Your Environment Variables

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

## Database Schema Overview

### Tables

- **profiles** - User profile information (extends auth.users)
- **keyword_profiles** - Stores extracted keywords for each user
- **journals** - User journal entries with extracted keywords
- **matches** - Calculated compatibility scores between users

### Storage

- **resumes** - Secure storage for uploaded resume PDFs

All tables have Row Level Security (RLS) enabled for data protection.
